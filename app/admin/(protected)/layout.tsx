import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getAdminUser } from "@/lib/supabase/ssr";
import { AdminNav } from "@/app/admin/_components/admin-nav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = await getAdminUser();
  if (!user) redirect("/admin/login");

  if (!isAdmin) {
    // Authenticated, but no admin_users row — do not redirect-loop to login;
    // show a plain refusal with a way out.
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-4">
        <div className="max-w-sm rounded-lg border border-line bg-white p-8 text-center">
          <ShieldAlert aria-hidden className="mx-auto size-8 text-danger" />
          <h1 className="mt-3 font-display text-xl font-bold text-navy-900">Not an admin</h1>
          <p className="mt-2 text-sm text-ink-soft">
            This account is signed in but has no admin_users record. Ask the site owner to add
            you to <code className="font-mono text-xs">admin_users</code>.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block font-display text-sm font-semibold text-navy-700 underline-offset-4 hover:underline"
          >
            ← Back to site
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      <aside className="shrink-0 bg-navy-900 sm:w-60">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="eyebrow text-cta">Aditya Polymers</p>
          <p className="font-display text-base font-bold tracking-wide text-white">Control room</p>
        </div>
        <AdminNav />
      </aside>
      <div className="flex-1 bg-paper">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
