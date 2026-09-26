import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";
import { getAdminUser } from "@/lib/supabase/ssr";
import { adminInput, adminLabel, adminCard, AdminBanner } from "@/app/admin/_components/ui";
import { signIn } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ user }, params] = await Promise.all([getAdminUser(), searchParams]);
  if (user) redirect("/admin");

  const notConfigured = params.error === "not-configured";

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-navy-900 text-cta">
            <KeyRound aria-hidden className="size-5" />
          </span>
          <div>
            <p className="eyebrow text-ink-soft">Aditya Polymers</p>
            <p className="font-display text-sm font-semibold tracking-wide text-navy-900">
              Staff sign-in
            </p>
          </div>
        </div>

        <div className={adminCard + " p-6 sm:p-8"}>
          <AdminBanner
            error={
              notConfigured
                ? "Supabase is not configured on this deployment. Ask the site maintainer to set the environment variables."
                : params.error
                  ? "Invalid credentials."
                  : undefined
            }
          />

          {notConfigured ? (
            <Link href="/" className="text-sm font-semibold text-navy-700 underline-offset-4 hover:underline">
              ← Back to site
            </Link>
          ) : (
            <form action={signIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className={adminLabel} htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={adminInput}
                  placeholder="you@adityapolymers.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className={adminLabel} htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={adminInput}
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-navy-900 px-4 py-2.5 font-display text-sm font-semibold tracking-wide text-white transition-colors hover:bg-navy-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900"
              >
                Sign in
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center">
          <Link href="/" className="text-sm text-ink-soft underline-offset-4 hover:text-navy-900 hover:underline">
            ← Back to site
          </Link>
        </p>
      </div>
    </main>
  );
}
