/** Shared domain types — shapes returned by lib/data.ts (Supabase or fallback). */

export type Specs = {
  solids_pct: number | null;
  viscosity: string | null;
  ph: string | null;
  base: string | null;
  water_resistant: boolean | null;
};

export type Category = {
  id: string;
  slug: string;
  parentId: string | null;
  name: string;
  shortName: string;
  description: string;
  sortOrder: number;
};

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  brand: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  shortDescription: string;
  description: string;
  applications: string;
  specs: Specs;
  packSizes: string[];
  isFeatured: boolean;
  isRetailPack: boolean;
};

export type Industry = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  productSlugs: string[];
};

export type LocationEntry = {
  slug: string;
  name: string;
  scope: "india_city" | "country" | "region";
  region: string;
  isPrimary: boolean;
};

export type Phone = {
  value: string;
  display: string;
  label: string;
  verified: boolean;
};

export type Plant = {
  name: string;
  area: string;
  capacity: string;
  detail: string;
};

export type SiteSettings = {
  name: string;
  brand: string;
  tagline: string;
  address: string;
  geo: { lat: number; lng: number };
  phones: Phone[];
  whatsappNumber: string;
  email: string | null;
  plants: Plant[];
};

export type KeyFigure = { value: string; unit: string; label: string };

export type ProductImage = {
  id: string;
  /** Storage path inside the public `product-images` bucket. */
  storagePath: string;
  alt: string;
  sortOrder: number;
  isPrimary: boolean;
};

export type DownloadDoc = {
  id: string;
  kind: "tds" | "sds" | "brochure";
  title: string;
  version: string;
  productId: string | null;
  publishedAt: string | null;
  /** Storage path inside the `documents` bucket. */
  filePath: string | null;
  fileSize: number | null;
};
