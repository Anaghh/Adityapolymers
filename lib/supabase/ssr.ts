import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Server client bound to the request's auth cookies (@supabase/ssr).
 * Returns null when the project has no Supabase credentials yet — admin
 * routes then render a "Configure Supabase" empty-state instead of crashing.
 */
export async function createSsrClient(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render — session refresh is
          // handled by re-running the request; safe to ignore here.
        }
      },
    },
  });
}

/**
 * The current visitor and whether an `admin_users` row backs their session.
 * Never trust the form — every admin action and page re-checks this.
 */
export async function getAdminUser(): Promise<{
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
}> {
  const client = await createSsrClient();
  if (!client) return { user: null, isAdmin: false };

  const { data: auth } = await client.auth.getUser();
  const user = auth?.user ?? null;
  if (!user) return { user: null, isAdmin: false };

  const { data } = await client
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .single();

  return { user, isAdmin: Boolean(data) };
}
