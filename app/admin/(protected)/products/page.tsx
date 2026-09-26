import type { Metadata } from "next";
import Link from "next/link";
import { clsx } from "clsx";
import { getServiceRoleClient } from "@/lib/supabase";
import { getAdminUser } from "@/lib/supabase/ssr";
import { saveCategoryFromForm, setProductActive } from "@/lib/admin";
import {
  AdminBanner,
  AdminPageHeader,
  ConfigureSupabase,
  adminCard,
  adminInput,
  adminLabel,
} from "@/app/admin/_components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin products",
  robots: { index: false, follow: false },
};

type ProductRow = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  is_active: boolean;
  is_featured: boolean;
  categories: { name: string } | null;
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { isAdmin } = await getAdminUser();
  const db = getServiceRoleClient();
  const params = await searchParams;

  if (!isAdmin || !db) return <ConfigureSupabase />;

  const { data } = await db
    .from("products")
    .select("id, sku, name, slug, is_active, is_featured, categories(name)")
    .order("name");

  const rows = (data ?? []) as unknown as ProductRow[];

  return (
    <div>
      <AdminPageHeader
        title="Products"
        intro="Catalog data feeds every public product page and the enquiry form."
        actions={
          <Link
            href="/admin/products/new"
            className="rounded-md bg-navy-900 px-4 py-2 font-display text-sm font-semibold tracking-wide text-white transition-colors hover:bg-navy-800"
          >
            New product
          </Link>
        }
      />

      <AdminBanner error={params.error} saved={params.saved === "1"} />

      <div className={clsx(adminCard, "overflow-x-auto")}>
        <table className="spec-table w-full min-w-[40rem]">
          <thead>
            <tr>
              <th scope="col">SKU</th>
              <th scope="col">Name</th>
              <th scope="col">Category</th>
              <th scope="col">Flags</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={row.is_active ? "" : "opacity-60"}>
                <td data-kind="figure">{row.sku}</td>
                <td>
                  <Link
                    href={`/admin/products/${row.id}`}
                    className="font-medium text-navy-900 underline-offset-4 hover:underline"
                  >
                    {row.name}
                  </Link>
                </td>
                <td className="text-ink-soft">{row.categories?.name ?? "—"}</td>
                <td>
                  <span className="flex flex-wrap gap-1">
                    {!row.is_active ? (
                      <span className="rounded-full border border-line bg-paper px-2 py-0.5 text-xs text-ink-soft">
                        inactive
                      </span>
                    ) : null}
                    {row.is_featured ? (
                      <span className="rounded-full border border-navy-200 bg-navy-50 px-2 py-0.5 text-xs text-navy-800">
                        featured
                      </span>
                    ) : null}
                  </span>
                </td>
                <td>
                  <span className="flex items-center gap-3">
                    <Link
                      href={`/admin/products/${row.id}`}
                      className="font-display text-sm font-semibold text-navy-700 underline-offset-4 hover:underline"
                    >
                      Edit
                    </Link>
                    {row.is_active ? (
                      <form action={setProductActive}>
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="active" value="0" />
                        <button
                          type="submit"
                          className="font-display text-sm font-semibold text-danger underline-offset-4 hover:underline"
                        >
                          Deactivate
                        </button>
                      </form>
                    ) : (
                      <form action={setProductActive}>
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="active" value="1" />
                        <button
                          type="submit"
                          className="font-display text-sm font-semibold text-success underline-offset-4 hover:underline"
                        >
                          Activate
                        </button>
                      </form>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-ink-soft">No products yet.</p>
        ) : null}
      </div>

      <details className={clsx(adminCard, "mt-8 p-5")}>
        <summary className="cursor-pointer font-display text-sm font-semibold tracking-wide text-navy-900">
          Add a category
        </summary>
        <form action={saveCategoryFromForm} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={adminLabel} htmlFor="cat-name">
              Name
            </label>
            <input id="cat-name" name="name" required className={adminInput} />
          </div>
          <div className="space-y-1.5">
            <label className={adminLabel} htmlFor="cat-short">
              Short name (nav)
            </label>
            <input id="cat-short" name="short_name" required className={adminInput} />
          </div>
          <div className="space-y-1.5">
            <label className={adminLabel} htmlFor="cat-slug">
              Slug — blank derives from name
            </label>
            <input id="cat-slug" name="slug" className={adminInput} />
          </div>
          <div className="space-y-1.5">
            <label className={adminLabel} htmlFor="cat-sort">
              Sort order
            </label>
            <input
              id="cat-sort"
              name="sort_order"
              type="number"
              min={0}
              defaultValue={0}
              className={adminInput}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className={adminLabel} htmlFor="cat-desc">
              Description
            </label>
            <textarea id="cat-desc" name="description" rows={2} className={adminInput} />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-navy-900 px-4 py-2.5 font-display text-sm font-semibold tracking-wide text-white transition-colors hover:bg-navy-800"
            >
              Save category
            </button>
          </div>
        </form>
      </details>
    </div>
  );
}
