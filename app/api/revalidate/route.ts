import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * On-demand ISR revalidation for Supabase Database Webhooks. Point the
 * webhook at POST /api/revalidate with the header
 * `x-revalidation-secret: $SUPABASE_REVALIDATION_SECRET`; the payload's
 * `table` maps to the matching cache tag. A direct `{ "tag": "products" }`
 * body is accepted too. Tags expire with `{ expire: 0 }` — the webhook
 * caller wants the data gone immediately, not stale-while-revalidate.
 */

const TABLE_TAGS: Record<string, string[]> = {
  products: ["products"],
  categories: ["categories"],
  product_images: ["product-images", "products"],
  industries: ["industries"],
  locations_served: ["locations"],
  site_settings: ["site-settings"],
  plants: ["plants"],
  testimonials: ["testimonials"],
  news_posts: ["news"],
  downloads: ["downloads"],
};

/** Constant-time secret comparison, normalized through digests. */
function secretsMatch(received: string | null, expected: string): boolean {
  if (!received) return false;
  const a = createHash("sha256").update(received).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.SUPABASE_REVALIDATION_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, code: "not_configured" }, { status: 503 });
  }
  if (!secretsMatch(req.headers.get("x-revalidation-secret"), secret)) {
    return NextResponse.json({ ok: false, code: "unauthorized" }, { status: 401 });
  }

  let body: { tag?: string; tags?: string[]; table?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, code: "bad_json" }, { status: 400 });
  }

  const tags = new Set<string>(body.tags ?? []);
  if (body.tag) tags.add(body.tag);
  for (const tableTag of TABLE_TAGS[body.table ?? ""] ?? []) tags.add(tableTag);

  if (tags.size === 0) {
    return NextResponse.json(
      { ok: false, code: "no_tag", hint: 'Send {"table":"products"} or {"tag":"products"}' },
      { status: 400 },
    );
  }

  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ ok: true, revalidated: [...tags] });
}
