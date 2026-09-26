import type { Metadata } from "next";
import { clsx } from "clsx";
import { getServiceRoleClient } from "@/lib/supabase";
import { getAdminUser } from "@/lib/supabase/ssr";
import { saveUploadFromForm, setDownloadActive } from "@/lib/admin";
import {
  AdminBanner,
  AdminPageHeader,
  ConfigureSupabase,
  Field,
  adminCard,
  adminInput,
  formatDate,
  formatBytes,
} from "@/app/admin/_components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin downloads",
  robots: { index: false, follow: false },
};

type DownloadRow = {
  id: string;
  kind: string;
  title: string;
  version: string;
  file_path: string;
  file_size: number | null;
  published_at: string;
  is_active: boolean;
  products: { sku: string; name: string } | null;
};

type ProductOption = { id: string; sku: string; name: string };

export default async function AdminDownloadsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { isAdmin } = await getAdminUser();
  const db = getServiceRoleClient();
  const params = await searchParams;

  if (!isAdmin || !db) return <ConfigureSupabase />;

  const [{ data, error }, products] = await Promise.all([
    db
      .from("downloads")
      .select("id, kind, title, version, file_path, file_size, published_at, is_active, products(sku, name)")
      .order("published_at", { ascending: false }),
    db.from("products").select("id, sku, name").eq("is_active", true).order("name"),
  ]);

  const rows = (data ?? []) as unknown as DownloadRow[];
  const productOptions = (products.data ?? []) as ProductOption[];

  return (
    <div>
      <AdminPageHeader
        title="Downloads"
        intro="TDS, SDS and brochure PDFs. Uploading to the public documents bucket and listing here is all it takes to publish."
      />

      <AdminBanner error={params.error} saved={params.saved === "1"} />

      <form action={saveUploadFromForm} className={clsx(adminCard, "mb-8 space-y-4 p-6")} encType="multipart/form-data">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="File (PDF)" htmlFor="file">
            <input
              id="file"
              name="file"
              type="file"
              required
              accept=".pdf,application/pdf"
              className={clsx(adminInput, "py-1.5")}
            />
          </Field>
          <Field label="Kind" htmlFor="kind">
            <select id="kind" name="kind" required defaultValue="tds" className={adminInput}>
              <option value="tds">TDS — technical data sheet</option>
              <option value="sds">SDS — safety data sheet</option>
              <option value="brochure">Brochure</option>
            </select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Title" htmlFor="title">
            <input id="title" name="title" required className={adminInput} placeholder="AP-44 — Technical Data Sheet" />
          </Field>
          <Field label="Product (optional)" htmlFor="product_id">
            <select id="product_id" name="product_id" defaultValue="" className={adminInput}>
              <option value="">Not linked</option>
              {productOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Version" htmlFor="version" hint="Defaults to 1.0">
            <input id="version" name="version" defaultValue="1.0" className={adminInput} />
          </Field>
        </div>
        <button
          type="submit"
          className="rounded-md bg-navy-900 px-5 py-2.5 font-display text-sm font-semibold tracking-wide text-white transition-colors hover:bg-navy-800"
        >
          Upload & publish
        </button>
      </form>

      <h2 className="mb-3 font-display text-lg font-bold text-navy-900">Published documents</h2>
      {rows.length === 0 ? (
        <p className={clsx(adminCard, "p-6 text-sm text-ink-soft")}>
          No documents yet.{error ? " Could not load the list." : ""}
        </p>
      ) : (
        <div className={clsx(adminCard, "overflow-x-auto")}>
          <table className="spec-table w-full min-w-[46rem]">
            <thead>
              <tr>
                <th scope="col">Kind</th>
                <th scope="col">Title</th>
                <th scope="col">Product</th>
                <th scope="col">Size</th>
                <th scope="col">Published</th>
                <th scope="col">State</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className={row.is_active ? "" : "opacity-60"}>
                  <td data-kind="figure" className="uppercase">
                    {row.kind}
                  </td>
                  <td className="font-medium text-ink">
                    {row.title}
                    <span className="block text-xs text-ink-soft">v{row.version} · {row.file_path}</span>
                  </td>
                  <td className="text-ink-soft">{row.products?.sku ?? "—"}</td>
                  <td data-kind="figure">{formatBytes(row.file_size)}</td>
                  <td data-kind="figure" className="whitespace-nowrap text-ink-soft">
                    {formatDate(row.published_at)}
                  </td>
                  <td>
                    <span
                      className={
                        row.is_active
                          ? "rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-xs text-success"
                          : "rounded-full border border-line bg-paper px-2 py-0.5 text-xs text-ink-soft"
                      }
                    >
                      {row.is_active ? "live" : "inactive"}
                    </span>
                  </td>
                  <td>
                    <form action={setDownloadActive}>
                      <input type="hidden" name="id" value={row.id} />
                      <input type="hidden" name="active" value={row.is_active ? "0" : "1"} />
                      <button
                        type="submit"
                        className={
                          row.is_active
                            ? "font-display text-sm font-semibold text-danger underline-offset-4 hover:underline"
                            : "font-display text-sm font-semibold text-success underline-offset-4 hover:underline"
                        }
                      >
                        {row.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
