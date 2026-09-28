import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getDownloadById } from "@/lib/downloads";
import { getPublicClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Document download gate: validates the document exists, logs the event
 * (best-effort — the redirect must never break because logging did), then
 * 302s to the public Storage object in the `documents` bucket.
 */

/** Same salt order as the enquiry route so hashes stay comparable across events. */
function ipHash(ip: string): string {
  return createHash("sha256")
    .update(ip + (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.ENQUIRY_HASH_SALT ?? "aditya-polymers"))
    .digest("hex");
}
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const download = await getDownloadById(id);
  if (!download?.filePath) {
    return NextResponse.json({ ok: false, code: "not_found" }, { status: 404 });
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) {
    return NextResponse.json({ ok: false, code: "not_configured" }, { status: 503 });
  }

  const db = getPublicClient();
  if (db) {
    try {
      await db.from("download_events").insert({
        download_id: download.id,
        ip_hash: ipHash(req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? ""),
        user_agent: req.headers.get("user-agent") ?? null,
      });
    } catch {
      // Logging is best-effort by design.
    }
  }

  const encoded = download.filePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return NextResponse.redirect(
    new URL(`/storage/v1/object/public/documents/${encoded}`, base),
    302,
  );
}
