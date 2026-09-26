import type { Metadata } from "next";
import Link from "next/link";
import { clsx } from "clsx";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ArrowRight } from "lucide-react";
import { getServiceRoleClient } from "@/lib/supabase";
import { getAdminUser } from "@/lib/supabase/ssr";
import {
  AdminPageHeader,
  ConfigureSupabase,
  StatusChip,
  adminCard,
  formatDate,
} from "@/app/admin/_components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

type EnquiryRow = {
  id: string;
  name: string;
  company: string | null;
  status: string;
  enquiry_type: string;
  message: string;
  created_at: string;
};

const STATUSES = ["new", "contacted", "quoted", "won", "lost", "spam"] as const;

async function fetchDashboard(db: SupabaseClient) {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [recent, week, productCount, downloadCount] = await Promise.all([
    db
      .from("enquiries")
      .select("id, name, company, status, enquiry_type, message, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    db.from("enquiries").select("status").gte("created_at", weekAgo),
    db.from("products").select("id", { count: "exact", head: true }),
    db.from("downloads").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  return {
    enquiryRows: ((recent.data ?? []) as EnquiryRow[]),
    weekStatuses: ((week.data ?? []) as { status: string }[]),
    productCount: productCount.count ?? 0,
    downloadCount: downloadCount.count ?? 0,
    weekTotal: ((week.data ?? []) as unknown[]).length,
  };
}

export default async function AdminDashboardPage() {
  const { isAdmin } = await getAdminUser();
  const db = getServiceRoleClient();

  if (!isAdmin || !db) {
    return <ConfigureSupabase />;
  }

  const { enquiryRows, weekStatuses, productCount, downloadCount, weekTotal } =
    await fetchDashboard(db);

  const weekByStatus = new Map<string, number>();
  for (const row of weekStatuses) {
    weekByStatus.set(row.status, (weekByStatus.get(row.status) ?? 0) + 1);
  }

  const tiles = [
    ...STATUSES.map((status) => ({
      label: `${status} · 7d`,
      value: weekByStatus.get(status) ?? 0,
      href: `/admin/enquiries?status=${status}`,
    })),
    { label: "products", value: productCount, href: "/admin/products" },
    { label: "active downloads", value: downloadCount, href: "/admin/downloads" },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        intro="Enquiries are the daily work — everything else is upkeep."
        actions={
          <Link
            href="/admin/enquiries"
            className="inline-flex items-center gap-1.5 rounded-md bg-navy-900 px-4 py-2 font-display text-sm font-semibold tracking-wide text-white transition-colors hover:bg-navy-800"
          >
            Open enquiries <ArrowRight aria-hidden className="size-4" />
          </Link>
        }
      />

      <section aria-label="This week at a glance" className="mb-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              className={clsx(adminCard, "block p-4 transition-colors hover:border-navy-300")}
            >
              <p className="font-mono text-2xl font-medium text-navy-900">{tile.value}</p>
              <p className="mt-1 font-display text-xs font-semibold tracking-wide uppercase text-ink-soft">
                {tile.label}
              </p>
            </Link>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-soft">{weekTotal} enquiries in the last 7 days.</p>
      </section>

      <section aria-label="Recent enquiries">
        <h2 className="mb-3 font-display text-lg font-bold text-navy-900">Latest 10 enquiries</h2>
        {enquiryRows.length === 0 ? (
          <p className={clsx(adminCard, "p-6 text-sm text-ink-soft")}>
            No enquiries yet. Leads from the contact form and quotation requests land here.
          </p>
        ) : (
          <div className={clsx(adminCard, "overflow-x-auto")}>
            <table className="spec-table w-full min-w-[42rem]">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Company</th>
                  <th scope="col">Type</th>
                  <th scope="col">Status</th>
                  <th scope="col">Received</th>
                  <th scope="col">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {enquiryRows.map((row) => (
                  <tr key={row.id}>
                    <td className="font-medium text-ink">{row.name}</td>
                    <td className="text-ink-soft">{row.company ?? "—"}</td>
                    <td>
                      <StatusChip status={row.enquiry_type} />
                    </td>
                    <td>
                      <StatusChip status={row.status} />
                    </td>
                    <td data-kind="figure" className="whitespace-nowrap text-ink-soft">
                      {formatDate(row.created_at)}
                    </td>
                    <td>
                      <Link
                        href={`/admin/enquiries/${row.id}`}
                        className="font-display text-sm font-semibold text-navy-700 underline-offset-4 hover:underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
