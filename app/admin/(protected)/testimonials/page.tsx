import type { Metadata } from "next";
import { clsx } from "clsx";
import { getServiceRoleClient } from "@/lib/supabase";
import { getAdminUser } from "@/lib/supabase/ssr";
import { setTestimonialApproval } from "@/lib/admin";
import {
  AdminBanner,
  AdminPageHeader,
  ConfigureSupabase,
  adminCard,
  formatDate,
} from "@/app/admin/_components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin testimonials",
  robots: { index: false, follow: false },
};

type TestimonialRow = {
  id: string;
  author_name: string;
  company: string | null;
  location: string | null;
  content: string;
  rating: number | null;
  is_approved: boolean;
  created_at: string;
};

function TestimonialCard({ row }: { row: TestimonialRow }) {
  return (
    <article className={clsx(adminCard, "flex flex-col gap-3 p-5")}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-display text-sm font-bold text-navy-900">
          {row.author_name}
          {row.company ? `, ${row.company}` : ""}
        </p>
        {row.location ? <p className="text-xs text-ink-soft">{row.location}</p> : null}
        {row.rating ? (
          <p data-kind="figure" className="ml-auto text-xs text-ink-soft" aria-label={`Rated ${row.rating} of 5`}>
            {row.rating} / 5
          </p>
        ) : null}
      </div>
      <p className="text-sm leading-relaxed text-ink">{row.content}</p>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3">
        <p data-kind="figure" className="text-xs text-ink-soft">
          {formatDate(row.created_at)} · {row.is_approved ? "approved" : "pending"}
        </p>
        <form action={setTestimonialApproval}>
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="approved" value={row.is_approved ? "0" : "1"} />
          <button
            type="submit"
            className={
              row.is_approved
                ? "rounded-md border border-navy-200 px-3 py-1.5 font-display text-xs font-semibold tracking-wide text-navy-900 transition-colors hover:bg-navy-50"
                : "rounded-md bg-success px-3 py-1.5 font-display text-xs font-semibold tracking-wide text-white transition-colors hover:bg-[#256a41]"
            }
          >
            {row.is_approved ? "Unapprove" : "Approve"}
          </button>
        </form>
      </div>
    </article>
  );
}

export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { isAdmin } = await getAdminUser();
  const db = getServiceRoleClient();
  const params = await searchParams;

  if (!isAdmin || !db) return <ConfigureSupabase />;

  const { data } = await db
    .from("testimonials")
    .select("*")
    .order("is_approved")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as TestimonialRow[];
  const pending = rows.filter((r) => !r.is_approved);
  const approved = rows.filter((r) => r.is_approved);

  return (
    <div>
      <AdminPageHeader
        title="Testimonials"
        intro="Nothing appears on the public site until it is approved here."
      />

      <AdminBanner error={params.error} saved={params.saved === "1"} />

      <section aria-label="Pending approval" className="mb-8">
        <h2 className="mb-3 font-display text-lg font-bold text-navy-900">
          Pending <span data-kind="figure" className="text-ink-soft">({pending.length})</span>
        </h2>
        {pending.length === 0 ? (
          <p className={clsx(adminCard, "p-6 text-sm text-ink-soft")}>Nothing waiting — all clear.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pending.map((row) => (
              <TestimonialCard key={row.id} row={row} />
            ))}
          </div>
        )}
      </section>

      <section aria-label="Approved">
        <h2 className="mb-3 font-display text-lg font-bold text-navy-900">
          Approved <span data-kind="figure" className="text-ink-soft">({approved.length})</span>
        </h2>
        {approved.length === 0 ? (
          <p className={clsx(adminCard, "p-6 text-sm text-ink-soft")}>No approved testimonials yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {approved.map((row) => (
              <TestimonialCard key={row.id} row={row} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
