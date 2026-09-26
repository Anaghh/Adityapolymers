import { unstable_cache } from "next/cache";
import { getPublicClient } from "@/lib/supabase";
import type {
  Category,
  Industry,
  LocationEntry,
  Product,
  SiteSettings,
  KeyFigure,
  Plant,
  Phone,
} from "@/lib/types";
import content from "@/content/catalog";

/**
 * Public data access. Every getter tries Supabase first (tagged for
 * on-demand revalidation via /api/revalidate) and falls back to
 * content/catalog.ts when the database is unreachable or not yet
 * provisioned — ISR pages then fail open with seed content.
 */

const TAG_ALL = "catalog";

function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    slug: row.slug as string,
    parentId: (row.parent_id as string | null) ?? null,
    name: row.name as string,
    shortName: row.short_name as string,
    description: row.description as string,
    sortOrder: row.sort_order as number,
  };
}

function mapProduct(row: Record<string, unknown>): Product {
  const cat = row.categories as Record<string, unknown> | undefined;
  return {
    id: row.id as string,
    slug: row.slug as string,
    sku: row.sku as string,
    name: row.name as string,
    brand: (row.brand as string) ?? "Dr Bond",
    categoryId: row.category_id as string,
    categorySlug: (cat?.slug as string) ?? "",
    categoryName: (cat?.name as string) ?? "",
    shortDescription: (row.short_description as string) ?? "",
    description: (row.description as string) ?? "",
    applications: (row.applications as string) ?? "",
    specs: {
      solids_pct: (row.specs as Record<string, unknown>)?.solids_pct as number | null ?? null,
      viscosity: (row.specs as Record<string, unknown>)?.viscosity as string | null ?? null,
      ph: (row.specs as Record<string, unknown>)?.ph as string | null ?? null,
      base: (row.specs as Record<string, unknown>)?.base as string | null ?? null,
      water_resistant: (row.specs as Record<string, unknown>)?.water_resistant as boolean | null ?? null,
    },
    packSizes: (row.pack_sizes as string[]) ?? [],
    isFeatured: (row.is_featured as boolean) ?? false,
    isRetailPack: (row.is_retail_pack as boolean) ?? false,
  };
}

export async function getCategories(): Promise<Category[]> {
  const db = getPublicClient();
  if (db) {
    try {
      const { data, error } = await unstable_cache(
        () => db.from("categories").select("*").eq("is_active", true).order("sort_order"),
        ["categories"],
        { tags: [TAG_ALL, "categories"], revalidate: 3600 },
      )();
      if (!error && data) return data.map(mapCategory);
    } catch {
      // fall through to content fallback
    }
  }
  return content.CATEGORIES.map((c, i) => ({
    id: `seed-${c.slug}`,
    slug: c.slug,
    parentId: c.parentSlug ? `seed-${c.parentSlug}` : null,
    name: c.name,
    shortName: c.shortName,
    description: c.description,
    sortOrder: c.sortOrder ?? i,
  }));
}

export async function getProducts(): Promise<Product[]> {
  const db = getPublicClient();
  if (db) {
    try {
      const { data, error } = await unstable_cache(
        () => db.from("products").select("*, categories(slug, name)").eq("is_active", true),
        ["products"],
        { tags: [TAG_ALL, "products"], revalidate: 3600 },
      )();
      if (!error && data) return data.map(mapProduct);
    } catch {
      // fall through
    }
  }
  return content.PRODUCTS.map((p) => {
    const cat = content.CATEGORIES.find((c) => c.slug === p.categorySlug);
    return {
      id: `seed-${p.slug}`,
      slug: p.slug,
      sku: p.name.replace(/^Dr Bond /, ""),
      name: p.name,
      brand: p.brand,
      categoryId: `seed-${p.categorySlug}`,
      categorySlug: p.categorySlug,
      categoryName: cat?.name ?? "",
      shortDescription: "",
      description: p.notes ?? "",
      applications: p.applications,
      specs: p.specs,
      packSizes: p.packSizes,
      isFeatured: false,
      isRetailPack: p.isRetailPack,
    };
  });
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.categorySlug === categorySlug);
}

export async function getProduct(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getIndustries(): Promise<Industry[]> {
  const db = getPublicClient();
  if (db) {
    try {
      const { data, error } = await unstable_cache(
        async () => {
          const rows = await db
            .from("industries")
            .select("*, product_industries(products(slug))")
            .eq("is_active", true)
            .order("sort_order");
          return rows;
        },
        ["industries"],
        { tags: [TAG_ALL, "industries"], revalidate: 3600 },
      )();
      if (!error && data) {
        return data.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          slug: row.slug as string,
          name: row.name as string,
          summary: row.summary as string,
          productSlugs: ((row.product_industries as { products: { slug: string } }[]) ?? [])
            .map((pi) => pi.products?.slug)
            .filter(Boolean) as string[],
        }));
      }
    } catch {
      // fall through
    }
  }
  return content.INDUSTRIES.map((i) => ({ id: `seed-${i.slug}`, ...i }));
}

export async function getLocations(): Promise<LocationEntry[]> {
  const db = getPublicClient();
  if (db) {
    try {
      const { data, error } = await unstable_cache(
        () => db.from("locations_served").select("*").eq("is_active", true).order("sort_order"),
        ["locations"],
        { tags: [TAG_ALL, "locations"], revalidate: 3600 },
      )();
      if (!error && data) {
        return data.map((row: Record<string, unknown>) => ({
          slug: row.slug as string,
          name: row.name as string,
          scope: row.scope as LocationEntry["scope"],
          region: (row.region as string) ?? "",
          isPrimary: (row.is_primary as boolean) ?? false,
        }));
      }
    } catch {
      // fall through
    }
  }
  return content.LOCATIONS.map((l) => ({
    slug: l.name.toLowerCase().replace(/[^a-z]+/g, "-"),
    name: l.name,
    scope: l.scope,
    region: l.region,
    isPrimary: l.isPrimary,
  }));
}

/** Contact settings with client-verification flags surfaced for the UI. */
export async function getSiteSettings(): Promise<{
  phones: Phone[];
  whatsappNumber: string;
  email: string | null;
  address: string;
  geo: { lat: number; lng: number };
}> {
  const db = getPublicClient();
  if (db) {
    try {
      const { data, error } = await unstable_cache(
        () => db.from("site_settings").select("value").eq("key", "contact").maybeSingle(),
        ["site-settings"],
        { tags: [TAG_ALL, "site-settings"], revalidate: 3600 },
      )();
      const v = data?.value as Record<string, unknown> | undefined;
      if (!error && v) {
        return {
          phones: (v.phones as Phone[]) ?? [],
          whatsappNumber: (v.whatsapp_number as string) ?? content.SITE.whatsappNumber,
          email: (v.email as string | null) ?? null,
          address: (v.address as string) ?? content.SITE.address,
          geo: (v.geo as { lat: number; lng: number }) ?? content.SITE.geo,
        };
      }
    } catch {
      // fall through
    }
  }
  return {
    phones: [...content.SITE.phones],
    whatsappNumber: content.SITE.whatsappNumber,
    email: content.SITE.email,
    address: content.SITE.address,
    geo: { ...content.SITE.geo },
  };
}

export async function getPlants(): Promise<Plant[]> {
  const db = getPublicClient();
  if (db) {
    try {
      const { data, error } = await unstable_cache(
        () => db.from("plants").select("*").order("sort_order"),
        ["plants"],
        { tags: [TAG_ALL, "plants"], revalidate: 3600 },
      )();
      if (!error && data) {
        return data.map((row: Record<string, unknown>) => ({
          name: row.name as string,
          area: row.area as string,
          capacity: `${row.capacity_mtpa as number} MTPA`,
          detail: row.detail as string,
        }));
      }
    } catch {
      // fall through
    }
  }
  return content.SITE.plants.map((p) => ({ ...p }));
}

export function getKeyFigures(): KeyFigure[] {
  return content.SITE.keyFigures.map((k) => ({ ...k }));
}

export function getLabTests(): string[] {
  return [...content.SITE.stats.labTests];
}

export async function getNav(): Promise<{ categories: Category[]; industries: Industry[] }> {
  const [categories, industries] = await Promise.all([getCategories(), getIndustries()]);
  return { categories, industries };
}
