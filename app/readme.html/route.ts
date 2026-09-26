/**
 * The legacy /readme.html was a hijacked spam page and is the only indexed
 * URL of the old site. It returns 410 Gone permanently and must never be
 * added to the redirect map — the intent is for crawlers to drop it.
 */

export const dynamic = "force-dynamic";

export function GET(): Response {
  return new Response(
    "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>410 Gone</title></head><body><h1>410 Gone</h1><p>This page has been permanently removed.</p></body></html>",
    {
      status: 410,
      headers: { "content-type": "text/html; charset=utf-8" },
    },
  );
}
