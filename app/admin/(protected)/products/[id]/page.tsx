import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { clsx } from "clsx";
import { getServiceRoleClient } from "@/lib/supabase";
import { getAdminUser } from "@/lib/supabase/ssr";
import { saveProductFromForm } from "@/lib/admin";
import { getCategories } from "@/lib/data";
import type { Specs } from "@/lib/types";
import {
  AdminBanner,
  AdminPageHeader,
  CheckboxField,
  ConfigureSupabase,
  Field,
  adminCard,
  adminInput,
} from "@/app/admin/_components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin product editor",
  robots: { index: false, follow: false },
};

type ProductEditRow = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category_id: string;
  short_description: string;
  description: string;
  applications: string;
  specs: Partial<Specs> | null;
  pack_sizes: string[];
  is_featured: boolean;
  is_retail_pack: boolean;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
};

function text(v: string | null | undefined): string {
  return v ?? "";
}

export default async function AdminProductEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { isAdmin } = await getAdminUser();
  const db = getServiceRoleClient();
  const [{ id }, query] = await Promise.all([params, searchParams]);

  if (!isAdmin || !db) return <ConfigureSupabase />;

  const isNew = id === "new";
  const categories = await getCategories();

  let product: ProductEditRow | null = null;
  if (!isNew) {
    const { data } = await db.from("products").select("*").eq("id", id).single();
    if (!data) notFound();
    product = data as ProductEditRow;
  }

  const specs = product?.specs ?? {};

  return (
    <div>
      <p className="mb-2">
        <Link href="/admin/products" className="text-sm text-ink-soft underline-offset-4 hover:text-navy-900 hover:underline">
          ← All products
        </Link>
      </p>

      <AdminPageHeader
        title={isNew ? "New product" : `Edit ${product?.name ?? "product"}`}
        intro={isNew ? "Specs left blank render “On request” on the public page until TDS verifies them." : `SKU ${product?.sku ?? ""}`}
      />

      <AdminBanner error={query.error} />

      <form action={saveProductFromForm} className={clsx(adminCard, "space-y-6 p-6")}>
        {!isNew ? <input type="hidden" name="id" value={product?.id} /> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name">
            <input id="name" name="name" required defaultValue={text(product?.name)} className={adminInput} />
          </Field>
          <Field label="SKU" htmlFor="sku" hint="Datasheet code, e.g. AP-44">
            <input id="sku" name="sku" required defaultValue={text(product?.sku)} className={adminInput} />
          </Field>
          <Field label="Slug" htmlFor="slug" hint="Blank derives from the SKU">
            <input id="slug" name="slug" defaultValue={text(product?.slug)} className={adminInput} />
          </Field>
          <Field label="Category" htmlFor="category_id">
            <select
              id="category_id"
              name="category_id"
              required
              defaultValue={product?.category_id ?? ""}
              className={adminInput}
            >
              <option value="" disabled>
                Select a category…
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Short description" htmlFor="short_description">
          <input
            id="short_description"
            name="short_description"
            defaultValue={text(product?.short_description)}
            className={adminInput}
          />
        </Field>

        <Field label="Description" htmlFor="description">
          <textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={text(product?.description)}
            className={clsx(adminInput, "resize-y")}
          />
        </Field>

        <Field label="Applications" htmlFor="applications" hint="Comma-separated uses shown on the product page">
          <textarea
            id="applications"
            name="applications"
            rows={2}
            defaultValue={text(product?.applications)}
            className={clsx(adminInput, "resize-y")}
          />
        </Field>

        <fieldset className="space-y-4">
          <legend className="eyebrow text-ink-soft">Specs — blank renders “On request”</legend>
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Solids %" htmlFor="solids_pct">
              <input
                id="solids_pct"
                name="solids_pct"
                type="number"
                step="0.1"
                min={0}
                max={100}
                defaultValue={specs.solids_pct ?? ""}
                className={adminInput}
              />
            </Field>
            <Field label="Viscosity" htmlFor="viscosity">
              <input id="viscosity" name="viscosity" defaultValue={text(specs.viscosity)} className={adminInput} />
            </Field>
            <Field label="pH" htmlFor="ph">
              <input id="ph" name="ph" defaultValue={text(specs.ph)} className={adminInput} />
            </Field>
            <Field label="Base" htmlFor="base">
              <input id="base" name="base" defaultValue={text(specs.base)} className={adminInput} />
            </Field>
          </div>
          <Field
            label="Water resistant"
            htmlFor="water_resistant"
            hint="Yes / no / unspecified — unspecified shows “On request”"
          >
            <select
              id="water_resistant"
              name="water_resistant"
              defaultValue={
                specs.water_resistant === true ? "true" : specs.water_resistant === false ? "false" : ""
              }
              className={clsx(adminInput, "w-48")}
            >
              <option value="">Unspecified</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </Field>
        </fieldset>

        <Field label="Pack sizes" htmlFor="pack_sizes" hint="Comma-separated, e.g. 5 kg, 20 kg, 50 kg, 210 kg">
          <input
            id="pack_sizes"
            name="pack_sizes"
            defaultValue={(product?.pack_sizes ?? []).join(", ")}
            className={adminInput}
          />
        </Field>

        <div className="flex flex-wrap gap-6">
          <CheckboxField name="is_featured" label="Featured" defaultChecked={product?.is_featured ?? false} />
          <CheckboxField
            name="is_retail_pack"
            label="Retail pack"
            defaultChecked={product?.is_retail_pack ?? false}
          />
          <CheckboxField name="is_active" label="Active" defaultChecked={product?.is_active ?? true} />
        </div>

        <div className="grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
          <Field label="SEO title" htmlFor="seo_title">
            <input id="seo_title" name="seo_title" defaultValue={text(product?.seo_title)} className={adminInput} />
          </Field>
          <Field label="SEO description" htmlFor="seo_description">
            <input
              id="seo_description"
              name="seo_description"
              defaultValue={text(product?.seo_description)}
              className={adminInput}
            />
          </Field>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-navy-900 px-5 py-2.5 font-display text-sm font-semibold tracking-wide text-white transition-colors hover:bg-navy-800"
          >
            {isNew ? "Create product" : "Save product"}
          </button>
          <Link href="/admin/products" className="text-sm text-ink-soft underline-offset-4 hover:underline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
