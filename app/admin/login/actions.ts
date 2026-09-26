"use server";

import { redirect } from "next/navigation";
import { createSsrClient } from "@/lib/supabase/ssr";

/**
 * Email + password sign-in for the invite-only admin. Any failure collapses
 * to the same generic outcome — no credential details are disclosed.
 */
export async function signIn(fd: FormData): Promise<void> {
  const email = fd.get("email");
  const password = fd.get("password");
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    redirect("/admin/login?error=invalid");
  }

  const client = await createSsrClient();
  if (!client) redirect("/admin/login?error=not-configured");

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) redirect("/admin/login?error=invalid");

  redirect("/admin");
}
