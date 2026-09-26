import type { Metadata } from "next";
import Link from "next/link";
import { clsx } from "clsx";
import { getServiceRoleClient } from "@/lib/supabase";
import { getAdminUser } from "@/lib/supabase/ssr";
import { updateEnquiryStatusQuick } from "@/lib/admin";
import {
  AdminBanner,
  AdminPageHeader,
  ConfigureSupabase,
  StatusChip,
  adminCard,
  adminInput,
  formatDate,
} from "@/app/admin/_components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin enquiries",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 50;
const STATUSES = ["new", "contacted", "quoted", "won", "lost", "spam"] as const;

type EnquiryRow = {
  id: string;
  name: string;
  company: string | null;
  status: string;
  enquiry_type: string;
  message: string;
  created_at: string;
  products: { sku: string } | null;
};

function excerpt(text: string, max = 64): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; error?: string; saved?: string }>;
}) {
  const { isAdmin } = await getAdminUser();
  const db = getServiceRoleClient();
  const params = await searchParams;

  if (!isAdmin || !db) return <ConfigureSupabase />;

  const status = STATUSES.find((s) => s === params.status);
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  let query = db
    .from("enquiries")
    .select("id, name, company, status, enquiry_type, message, created_at, products(sku)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (status) query = query.eq("status", status);

  const { data, count } = await query;
  const rows = (data ?? []) as unknown as EnquiryRow[];
  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageLink = (p: number) => {
    const qs = new URLSearchParams();
    if (p !== 1) qs.set("page", String(p));
    if (status) qs.set("status", status);
    const s = qs.toString();
    return s ? `/admin/enquiries?${s}` : "/admin/enquiries";
  };

  return (
    <div>
      <AdminPageHeader
        title="Enquiries"
        intro="Every contact-form lead and quotation request, newest first."
      />

      <AdminBanner error={params.error} saved={params.saved === "1"} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          href={status ? "/admin/enquiries" : "/admin/enquiries"}
          className={clsx(
            "rounded-full border px-3 py-1 font-display text-xs font-semibold tracking-wide uppercase",
            !status ? "border-navy-900 bg-navy-900 text-white" : "border-line bg-white text-ink-soft",
          )}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/enquiries?status=${s}`}
            className={clsx(
              "rounded-full border px-3 py-1 font-display text-xs font-semibold tracking-wide uppercase",
              status === s
                ? "border-navy-900 bg-navy-900 text-white"
                : "border-line bg-white text-ink-soft",
            )}
          >
            {s}
          </Link>
        ))}
        <span className="ml-auto text-xs text-ink-soft">
          {total} total{status ? ` · filtered by “${status}”` : ""}
        </span>
      </div>

      {rows.length === 0 ? (
        <p className={clsx(adminCard, "p-6 text-sm text-ink-soft")}>No enquiries on this view.</p>
      ) : (
        <div className={clsx(adminCard, "overflow-x-auto")}>
          <table className="spec-table w-full min-w-[52rem]">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Company</th>
                <th scope="col">Product SKU</th>
                <th scope="col">Type</th>
                <th scope="col">Message</th>
                <th scope="col">Received</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link
                      href={`/admin/enquiries/${row.id}`}
                      className="font-medium text-navy-900 underline-offset-4 hover:underline"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="text-ink-soft">{row.company ?? "—"}</td>
                  <td data-kind="figure">{row.products?.sku ?? "—"}</td>
                  <td>
                    <StatusChip status={row.enquiry_type} />
                  </td>
                  <td className="max-w-[18rem] text-ink-soft">{excerpt(row.message)}</td>
                  <td data-kind="figure" className="whitespace-nowrap text-ink-soft">
                    {formatDate(row.created_at)}
                  </td>
                  <td>
                    <form action={updateEnquiryStatusQuick} className="flex items-center gap-1.5">
                      <input type="hidden" name="id" value={row.id} />
                      <label htmlFor={`status-${row.id}`} className="sr-only">
                        Status for {row.name}
                      </label>
                      <select
                        id={`status-${row.id}`}
                        name="status"
                        defaultValue={row.status}
                        className={clsx(adminInput, "w-auto py-1.5 text-xs")}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded border border-navy-200 px-2 py-1.5 font-display text-xs font-semibold text-navy-900 transition-colors hover:bg-navy-50"
                      >
                        Set
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 ? (
        <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link href={pageLink(page - 1)} className="font-semibold text-navy-700 underline-offset-4 hover:underline">
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="text-ink-soft" data-kind="figure">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={pageLink(page + 1)} className="font-semibold text-navy-700 underline-offset-4 hover:underline">
              Older →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
