import { unstable_cache } from "next/cache";
import { getPublicClient } from "@/lib/supabase";
import type { DownloadDoc } from "@/lib/types";

/**
 * TDS/SDS/brochure documents live only in Supabase (`downloads` table) —
 * there is no content fallback, because a data sheet must never be
 * published without the verified client document behind it. Until the
 * client uploads TDS files the list is simply empty and the page shows the
 * "library pending verification" state.
 */

export async function getDownloads(): Promise<DownloadDoc[]> {
  const db = getPublicClient();
  if (!db) return [];
  try {
    const { data } = await unstable_cache(
      async () =>
        await db
          .from("downloads")
          .select("id, kind, title, version, product_id, published_at, file_path, file_size")
          .eq("is_active", true)
          .order("kind")
          .order("title"),
      ["downloads"],
      { tags: ["catalog", "downloads"], revalidate: 3600 },
    )();
    if (!data) return [];
    return data.map(
      (row: Record<string, unknown>): DownloadDoc => ({
        id: row.id as string,
        kind: row.kind as DownloadDoc["kind"],
        title: row.title as string,
        version: (row.version as string) ?? "1.0",
        productId: (row.product_id as string | null) ?? null,
        publishedAt: (row.published_at as string | null) ?? null,
        filePath: (row.file_path as string | null) ?? null,
        fileSize: (row.file_size as number | null) ?? null,
      }),
    );
  } catch {
    return [];
  }
}

export async function getDownloadById(id: string): Promise<DownloadDoc | null> {
  const db = getPublicClient();
  if (!db) return null;
  try {
    const { data } = await db
      .from("downloads")
      .select("id, kind, title, version, product_id, published_at, file_path, file_size")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();
    if (!data) return null;
    const row = data as Record<string, unknown>;
    return {
      id: row.id as string,
      kind: row.kind as DownloadDoc["kind"],
      title: row.title as string,
      version: (row.version as string) ?? "1.0",
      productId: (row.product_id as string | null) ?? null,
      publishedAt: (row.published_at as string | null) ?? null,
      filePath: (row.file_path as string | null) ?? null,
      fileSize: (row.file_size as number | null) ?? null,
    };
  } catch {
    return null;
  }
}
