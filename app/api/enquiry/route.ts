import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { enquirySchema, fieldErrorsOf, type EnquiryPayload } from "@/lib/enquiry";
import { sendEnquiryNotification } from "@/lib/email";
import { getPublicClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "";
}

/** Salted hash — the raw IP never reaches the database. */
function ipHash(ip: string): string {
  return createHash("sha256")
    .update(ip + (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.ENQUIRY_HASH_SALT ?? "aditya-polymers"))
    .digest("hex");
}

function rateLimit(ip: string): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || !ip) return Promise.resolve(true);
  const ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, "10 m"),
  });
  return ratelimit.limit(`enquiry:${ipHash(ip)}`).then((r) => r.success);
}

async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured — form is open (dev/preview)
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, code: "bad_json" }, { status: 400 });
  }

  // Honeypot first: bots fill `website`, humans never see the field.
  // Accept silently so the bot believes it succeeded.
  const honeypot = (body as { website?: unknown } | null)?.website;
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, code: "invalid", errors: fieldErrorsOf(parsed.error) },
      { status: 400 },
    );
  }
  const data = parsed.data as EnquiryPayload;

  const ip = clientIp(req);
  const allowed = await rateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
  }

  if (!(await verifyTurnstile(data.turnstileToken))) {
    return NextResponse.json({ ok: false, code: "captcha_failed" }, { status: 403 });
  }

  const db = getPublicClient();
  if (!db) {
    // Fail loudly, never silently — the lead has nowhere to go.
    return NextResponse.json({ ok: false, code: "not_configured" }, { status: 503 });
  }

  // Resolve the product reference: form options carry slugs, the table wants uuid.
  let productId: string | null = null;
  let productLabel: string | undefined;
  if (data.productId) {
    if (UUID_RE.test(data.productId)) {
      productId = data.productId;
      const { data: row } = await db
        .from("products")
        .select("name")
        .eq("id", data.productId)
        .maybeSingle();
      productLabel = (row?.name as string | undefined) ?? undefined;
    } else {
      const { data: row } = await db
        .from("products")
        .select("id, name")
        .eq("slug", data.productId)
        .maybeSingle();
      if (row) {
        productId = row.id as string;
        productLabel = row.name as string;
      } else {
        productLabel = data.productId; // unknown slug — keep the text, not the id
      }
    }
  }

  const { error } = await db.from("enquiries").insert({
    name: data.name,
    email: data.email,
    phone: data.phone,
    company: data.company ?? null,
    country: data.country ?? null,
    product_id: productId,
    enquiry_type: data.enquiryType,
    message: data.message ?? "",
    quantity_note: data.quantityNote ?? null,
    source_page: data.sourcePage ?? null,
    utm: data.utm ?? {},
    ip_hash: ipHash(ip),
    user_agent: req.headers.get("user-agent") ?? null,
  });
  if (error) {
    console.error("[enquiry] insert failed:", error.message);
    return NextResponse.json({ ok: false, code: "insert_failed" }, { status: 500 });
  }

  await sendEnquiryNotification({
    name: data.name,
    email: data.email,
    phone: data.phone,
    company: data.company,
    country: data.country,
    enquiryType: data.enquiryType,
    productLabel: productLabel ?? data.productId,
    quantityNote: data.quantityNote,
    message: data.message,
    sourcePage: data.sourcePage,
  });

  return NextResponse.json({ ok: true });
}
