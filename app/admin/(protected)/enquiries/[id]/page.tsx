import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { clsx } from "clsx";
import { getServiceRoleClient } from "@/lib/supabase";
import { getAdminUser } from "@/lib/supabase/ssr";
import { saveEnquiryDetail } from "@/lib/admin";
import {
  AdminBanner,
  AdminPageHeader,
  ConfigureSupabase,
  StatusChip,
  adminCard,
  adminInput,
  adminLabel,
  formatDate,
} from "@/app/admin/_components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin enquiry",
  robots: { index: false, follow: false },
};

const STATUSES = ["new", "contacted", "quoted", "won", "lost", "spam"] as const;

type EnquiryDetail = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  country: string | null;
  enquiry_type: string;
  status: string;
  message: string;
  quantity_note: string | null;
  source_page: string | null;
  utm: Record<string, unknown> | null;
  internal_notes: string;
  ip_hash: string | null;
  user_agent: string | null;
  created_at: string;
  products: { sku: string; name: string; slug: string } | null;
};

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-display text-xs font-semibold tracking-wide uppercase text-ink-soft">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{children}</dd>
    </div>
  );
}

export default async function AdminEnquiryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { isAdmin } = await getAdminUser();
  const db = getServiceRoleClient();
  const [{ id }, query] = await Promise.all([params, searchParams]);

  if (!isAdmin || !db) return <ConfigureSupabase />;

  const { data } = await db
    .from("enquiries")
    .select(
      "id, name, email, phone, company, country, enquiry_type, status, message, quantity_note, source_page, utm, internal_notes, ip_hash, user_agent, created_at, products(sku, name, slug)",
    )
    .eq("id", id)
    .single();

  if (!data) notFound();
  const row = data as unknown as EnquiryDetail;
  const utmEntries = Object.entries(row.utm ?? {}).filter(
    ([, v]) => v !== null && v !== "" && v !== undefined,
  );

  return (
    <div>
      <p className="mb-2">
        <Link href="/admin/enquiries" className="text-sm text-ink-soft underline-offset-4 hover:text-navy-900 hover:underline">
          ← All enquiries
        </Link>
      </p>

      <AdminPageHeader
        title={row.name}
        intro={row.company ?? undefined}
        actions={<StatusChip status={row.status} />}
      />

      <AdminBanner error={query.error} saved={query.saved === "1"} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section aria-label="Message" className={clsx(adminCard, "p-5")}>
            <h2 className="eyebrow text-ink-soft">Message</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">
              {row.message || "—"}
            </p>
          </section>

          <section aria-label="Contact details" className={clsx(adminCard, "p-5")}>
            <h2 className="eyebrow mb-3 text-ink-soft">Contact</h2>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Fact label="Email">{row.email}</Fact>
              <Fact label="Phone">
                <span data-kind="figure">{row.phone}</span>
              </Fact>
              <Fact label="Country">{row.country ?? "—"}</Fact>
              <Fact label="Company">{row.company ?? "—"}</Fact>
              <Fact label="Type">
                <StatusChip status={row.enquiry_type} />
              </Fact>
              <Fact label="Quantity note">{row.quantity_note ?? "—"}</Fact>
              <Fact label="Product">
                {row.products ? (
                  <span>
                    <span data-kind="figure">{row.products.sku}</span> — {row.products.name}
                  </span>
                ) : (
                  "—"
                )}
              </Fact>
              <Fact label="Received">{formatDate(row.created_at)}</Fact>
              <Fact label="Source page">{row.source_page ?? "—"}</Fact>
            </dl>
          </section>

          <section aria-label="Attribution" className={clsx(adminCard, "p-5")}>
            <h2 className="eyebrow mb-3 text-ink-soft">Attribution</h2>
            <dl className="grid grid-cols-2 gap-4">
              <Fact label="IP hash">
                <span className="break-all font-mono text-xs">{row.ip_hash ?? "—"}</span>
              </Fact>
              <Fact label="User agent">
                <span className="break-all font-mono text-xs">{row.user_agent ?? "—"}</span>
              </Fact>
            </dl>
            {utmEntries.length > 0 ? (
              <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-line pt-4">
                {utmEntries.map(([key, value]) => (
                  <Fact key={key} label={key.replace(/^utm_/, "")}>
                    {String(value)}
                  </Fact>
                ))}
              </dl>
            ) : (
              <p className="mt-3 text-xs text-ink-soft">No UTM parameters recorded.</p>
            )}
          </section>
        </div>

        <section aria-label="Workflow" className="lg:col-span-2">
          <form action={saveEnquiryDetail} className={clsx(adminCard, "space-y-4 p-5")}>
            <input type="hidden" name="id" value={row.id} />
            <div className="space-y-1.5">
              <label className={adminLabel} htmlFor="status">
                Status
              </label>
              <select id="status" name="status" defaultValue={row.status} className={adminInput}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={adminLabel} htmlFor="internal_notes">
                Internal notes
              </label>
              <textarea
                id="internal_notes"
                name="internal_notes"
                rows={8}
                defaultValue={row.internal_notes}
                className={clsx(adminInput, "resize-y")}
                placeholder="Called on — quoted — follow up…"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-navy-900 px-4 py-2.5 font-display text-sm font-semibold tracking-wide text-white transition-colors hover:bg-navy-800"
            >
              Save
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
