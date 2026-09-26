import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Read-only anon client for public, RLS-safe queries. Returns null when the
 * project has no Supabase credentials yet — callers fall back to
 * content/catalog.ts so the site builds and renders without a live database.
 */
export function getPublicClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Service-role client — server-only, bypasses RLS. Used exclusively inside
 * route handlers and admin server actions, never in components.
 */
export function getServiceRoleClient(): SupabaseClient | null {
  if (typeof window !== "undefined") {
    throw new Error("getServiceRoleClient must never be called on the client");
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
