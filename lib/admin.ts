"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase";
import { getAdminUser } from "@/lib/supabase/ssr";

/**
 * Admin server actions. Every action:
 *   1. re-verifies the caller's admin_users row via the SSR (cookie) client —
 *      the form is never trusted;
 *   2. operates through the service-role client, server-only;
 *   3. returns/redirects with a generic message — service-role errors are
 *      logged, never surfaced raw.
 *
 * Env-missing and not-admin both collapse to `{ ok: false, error }` (or a
 * redirect carrying `?error=`), so pages stay renderable without Supabase.
 */

export type AdminActionResult = { ok: boolean; error?: string };

const GENERIC_ERROR = "Something went wrong saving the change. Please try again.";
const NOT_CONFIGURED = "Supabase is not configured on this deployment.";
const NOT_AUTHORIZED = "Your session expired. Sign in again.";

// ---------------------------------------------------------------------------
// FormData + zod helpers
// ---------------------------------------------------------------------------

function fdStr(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function fdOpt(fd: FormData, key: string): string | null {
  const v = fdStr(fd, key);
  return v === "" ? null : v;
}

function fdBool(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === "on" || v === "true" || v === "1";
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Wraps a write with the admin gate + generic error mapping. */
async function guard(
  run: (db: NonNullable<ReturnType<typeof getServiceRoleClient>>) => Promise<void>,
): Promise<AdminActionResult> {
  const { isAdmin } = await getAdminUser();
  if (!isAdmin) return { ok: false, error: NOT_AUTHORIZED };

  const db = getServiceRoleClient();
  if (!db) return { ok: false, error: NOT_CONFIGURED };

  try {
    await run(db);
    return { ok: true };
  } catch (error) {
    console.error("[admin action]", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

// ---------------------------------------------------------------------------
// Enquiries
// ---------------------------------------------------------------------------

const ENQUIRY_STATUSES = ["new", "contacted", "quoted", "won", "lost", "spam"] as const;

export async function setEnquiryStatus(fd: FormData): Promise<AdminActionResult> {
  const id = fdStr(fd, "id");
  const status = fdStr(fd, "status");
  const internalNotes = fdStr(fd, "internal_notes");

  const parsed = z
    .object({
      id: z.string().uuid(),
      status: z.enum(ENQUIRY_STATUSES),
      internalNotes: z.string().max(5000),
    })
    .safeParse({ id, status, internalNotes });
  if (!parsed.success) return { ok: false, error: "Invalid enquiry update." };

  const result = await guard(async (db) => {
    await db
      .from("enquiries")
      .update({ status: parsed.data.status, internal_notes: parsed.data.internalNotes })
      .eq("id", parsed.data.id)
      .throwOnError();
  });
  if (result.ok) revalidatePath("/admin/enquiries");
  return result;
}

/** Status-only update from the per-row select on the enquiries table. */
export async function updateEnquiryStatusQuick(fd: FormData): Promise<void> {
  const result = await setEnquiryStatus(fd);
  if (result.ok) {
    revalidatePath("/admin/enquiries");
    redirect("/admin/enquiries?saved=1");
  }
  redirect(`/admin/enquiries?error=${encodeURIComponent(result.error ?? GENERIC_ERROR)}`);
}

/** Status + internal notes from the enquiry detail screen. */
export async function saveEnquiryDetail(fd: FormData): Promise<void> {
  const id = fdStr(fd, "id");
  const result = await setEnquiryStatus(fd);
  if (result.ok) {
    redirect(`/admin/enquiries/${id}?saved=1`);
  }
  redirect(`/admin/enquiries/${id}?error=${encodeURIComponent(result.error ?? GENERIC_ERROR)}`);
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

const productSchema = z.object({
  id: z.string().uuid().nullable(),
  name: z.string().min(2).max(200),
  sku: z.string().min(1).max(80),
  slug: z.string().max(90),
  categoryId: z.string().uuid(),
  shortDescription: z.string().max(500),
  description: z.string().max(8000),
  applications: z.string().max(2000),
  solidsPct: z.number().min(0).max(100).nullable(),
  viscosity: z.string().max(80).nullable(),
  ph: z.string().max(40).nullable(),
  base: z.string().max(80).nullable(),
  waterResistant: z.boolean().nullable(),
  packSizes: z.array(z.string().max(40)).max(20),
  isFeatured: z.boolean(),
  isRetailPack: z.boolean(),
  isActive: z.boolean(),
  seoTitle: z.string().max(200).nullable(),
  seoDescription: z.string().max(400).nullable(),
});

function parsePackSizes(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function tri(fd: FormData, key: string): boolean | null {
  const v = fdStr(fd, key);
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
}

export async function upsertProduct(fd: FormData): Promise<AdminActionResult> {
  const numOrNull = (key: string): number | null => {
    const v = fdStr(fd, key);
    if (v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const candidate = {
    id: fdOpt(fd, "id"),
    name: fdStr(fd, "name"),
    sku: fdStr(fd, "sku"),
    slug: fdStr(fd, "slug"),
    categoryId: fdStr(fd, "category_id"),
    shortDescription: fdStr(fd, "short_description"),
    description: fdStr(fd, "description"),
    applications: fdStr(fd, "applications"),
    solidsPct: numOrNull("solids_pct"),
    viscosity: fdOpt(fd, "viscosity"),
    ph: fdOpt(fd, "ph"),
    base: fdOpt(fd, "base"),
    waterResistant: tri(fd, "water_resistant"),
    packSizes: parsePackSizes(fdStr(fd, "pack_sizes")),
    isFeatured: fdBool(fd, "is_featured"),
    isRetailPack: fdBool(fd, "is_retail_pack"),
    isActive: fdBool(fd, "is_active"),
    seoTitle: fdOpt(fd, "seo_title"),
    seoDescription: fdOpt(fd, "seo_description"),
  };

  const parsed = productSchema.safeParse(candidate);
  if (!parsed.success) return { ok: false, error: "Check the form — some fields are invalid." };

  const p = parsed.data;
  const slug = p.slug ? slugify(p.slug) : slugify(p.sku) || slugify(p.name);
  if (!slug) return { ok: false, error: "Could not derive a slug from SKU or name." };

  const row = {
    ...(p.id ? { id: p.id } : {}),
    name: p.name,
    sku: p.sku,
    slug,
    category_id: p.categoryId,
    short_description: p.shortDescription,
    description: p.description,
    applications: p.applications,
    specs: {
      solids_pct: p.solidsPct,
      viscosity: p.viscosity,
      ph: p.ph,
      base: p.base,
      water_resistant: p.waterResistant,
    },
    pack_sizes: p.packSizes,
    is_featured: p.isFeatured,
    is_retail_pack: p.isRetailPack,
    is_active: p.isActive,
    seo_title: p.seoTitle,
    seo_description: p.seoDescription,
  };

  const result = await guard(async (db) => {
    await db.from("products").upsert(row).throwOnError();
  });

  if (result.ok) {
    revalidatePath("/products");
    updateTag("products");
    updateTag("catalog");
  }
  return result;
}

/** Full form post → save, then land back on the admin list (spec behaviour). */
export async function saveProductFromForm(fd: FormData): Promise<void> {
  const result = await upsertProduct(fd);
  if (result.ok) {
    revalidatePath("/admin/products");
    redirect("/admin/products?saved=1");
  }
  redirect(`/admin/products?error=${encodeURIComponent(result.error ?? GENERIC_ERROR)}`);
}

export async function setProductActive(fd: FormData): Promise<void> {
  const id = fdStr(fd, "id");
  const active = fdStr(fd, "active") === "1";
  const parsed = z.string().uuid().safeParse(id);

  if (!parsed.success) redirect(`/admin/products?error=${encodeURIComponent("Invalid product.")}`);

  const result = await guard(async (db) => {
    await db.from("products").update({ is_active: active }).eq("id", parsed.data).throwOnError();
  });

  if (result.ok) {
    revalidatePath("/products");
    updateTag("products");
    updateTag("catalog");
    revalidatePath("/admin/products");
    redirect("/admin/products?saved=1");
  }
  redirect(`/admin/products?error=${encodeURIComponent(result.error ?? GENERIC_ERROR)}`);
}

// ---------------------------------------------------------------------------
// Categories (minimal editor)
// ---------------------------------------------------------------------------

export async function saveCategoryFromForm(fd: FormData): Promise<void> {
  const result = await upsertCategory(fd);
  if (result.ok) {
    revalidatePath("/admin/products");
    redirect("/admin/products?saved=1");
  }
  redirect(`/admin/products?error=${encodeURIComponent(result.error ?? GENERIC_ERROR)}`);
}

export async function upsertCategory(fd: FormData): Promise<AdminActionResult> {
  const candidate = {
    id: fdOpt(fd, "id"),
    name: fdStr(fd, "name"),
    slug: fdStr(fd, "slug"),
    shortName: fdStr(fd, "short_name"),
    description: fdStr(fd, "description"),
    sortOrder: fdStr(fd, "sort_order") === "" ? 0 : Number(fdStr(fd, "sort_order")),
  };

  const parsed = z
    .object({
      id: z.string().uuid().nullable(),
      name: z.string().min(2).max(120),
      slug: z.string().max(90),
      shortName: z.string().min(1).max(60),
      description: z.string().max(2000),
      sortOrder: z.number().min(0).max(999),
    })
    .safeParse(candidate);
  if (!parsed.success) return { ok: false, error: "Check the category fields." };

  const c = parsed.data;
  const result = await guard(async (db) => {
    await db
      .from("categories")
      .upsert({
        ...(c.id ? { id: c.id } : {}),
        name: c.name,
        slug: c.slug ? slugify(c.slug) : slugify(c.name),
        short_name: c.shortName,
        description: c.description,
        sort_order: c.sortOrder,
      })
      .throwOnError();
  });

  if (result.ok) {
    revalidatePath("/products");
    updateTag("categories");
    updateTag("catalog");
  }
  return result;
}

// ---------------------------------------------------------------------------
// Downloads (Storage upload + row)
// ---------------------------------------------------------------------------

const DOWNLOAD_KINDS = ["tds", "sds", "brochure"] as const;

export async function uploadDownload(fd: FormData): Promise<AdminActionResult> {
  const candidate = {
    file: fd.get("file") instanceof File ? (fd.get("file") as File) : null,
    kind: fdStr(fd, "kind"),
    title: fdStr(fd, "title"),
    productId: fdOpt(fd, "product_id"),
    version: fdStr(fd, "version"),
  };

  const parsed = z
    .object({
      file: z.instanceof(File).refine((f) => f.size > 0, "file required").nullable(),
      kind: z.enum(DOWNLOAD_KINDS),
      title: z.string().min(2).max(200),
      productId: z.string().uuid().nullable(),
      version: z.string().max(40),
    })
    .safeParse(candidate);
  const doc = parsed.success ? parsed.data : null;
  if (!doc || !doc.file) {
    return { ok: false, error: "Pick a file, a document kind and a title." };
  }
  const docFile = doc.file;

  const safeName = docFile.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-120) || "document";
  const path = `${doc.kind}/${Date.now()}-${safeName}`;

  const result = await guard(async (db) => {
    const { error: upErr } = await db.storage.from("documents").upload(path, docFile, {
      cacheControl: "3600",
      upsert: false,
    });
    if (upErr) throw upErr;

    await db
      .from("downloads")
      .insert({
        kind: doc.kind,
        title: doc.title,
        product_id: doc.productId,
        file_path: path,
        file_size: docFile.size,
        ...(doc.version ? { version: doc.version } : {}),
      })
      .throwOnError();
  });

  if (result.ok) {
    revalidatePath("/downloads");
    updateTag("catalog");
    revalidatePath("/admin/downloads");
  }
  return result;
}

export async function saveUploadFromForm(fd: FormData): Promise<void> {
  const result = await uploadDownload(fd);
  if (result.ok) {
    redirect("/admin/downloads?saved=1");
  }
  redirect(`/admin/downloads?error=${encodeURIComponent(result.error ?? GENERIC_ERROR)}`);
}

export async function setDownloadActive(fd: FormData): Promise<void> {
  const id = fdStr(fd, "id");
  const active = fdStr(fd, "active") === "1";
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) redirect(`/admin/downloads?error=${encodeURIComponent("Invalid download.")}`);

  const result = await guard(async (db) => {
    await db.from("downloads").update({ is_active: active }).eq("id", parsed.data).throwOnError();
  });

  if (result.ok) {
    revalidatePath("/downloads");
    updateTag("catalog");
    revalidatePath("/admin/downloads");
    redirect("/admin/downloads?saved=1");
  }
  redirect(`/admin/downloads?error=${encodeURIComponent(result.error ?? GENERIC_ERROR)}`);
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export async function setTestimonialApproval(fd: FormData): Promise<void> {
  const id = fdStr(fd, "id");
  const approved = fdStr(fd, "approved") === "1";
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) redirect(`/admin/testimonials?error=${encodeURIComponent("Invalid testimonial.")}`);

  const result = await guard(async (db) => {
    await db.from("testimonials").update({ is_approved: approved }).eq("id", parsed.data).throwOnError();
  });

  if (result.ok) {
    updateTag("testimonials");
    updateTag("catalog");
    revalidatePath("/admin/testimonials");
    redirect("/admin/testimonials?saved=1");
  }
  redirect(`/admin/testimonials?error=${encodeURIComponent(result.error ?? GENERIC_ERROR)}`);
}

// ---------------------------------------------------------------------------
// Product images (Storage upload + row)
// ---------------------------------------------------------------------------

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"] as const;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function imageExtensionOf(name: string): string | null {
  const match = /\.([a-z0-9]+)$/i.exec(name);
  const ext = match?.[1]?.toLowerCase() ?? "";
  return (IMAGE_EXTENSIONS as readonly string[]).includes(ext) ? ext : null;
}

/**
 * Uploads a product photo to the public product-images bucket and registers
 * it. The first image of a product becomes primary automatically; that row
 * starts at sort_order 0 so the client gallery (ordered primary-first) shows
 * the right hero shot without a manual reorder.
 */
export async function uploadProductImage(fd: FormData): Promise<AdminActionResult> {
  const candidate = {
    file: fd.get("file") instanceof File ? (fd.get("file") as File) : null,
    productId: fdStr(fd, "product_id"),
    alt: fdStr(fd, "alt"),
  };

  const parsed = z
    .object({
      file: z.instanceof(File).refine((f) => f.size > 0, "file required"),
      productId: z.string().uuid(),
      alt: z.string().max(200),
    })
    .safeParse(candidate);
  const input = parsed.success ? parsed.data : null;
  if (!input || !input.file) {
    return { ok: false, error: "Pick an image (jpg, png, webp or avif) and add alt text." };
  }
  const ext = imageExtensionOf(input.file.name);
  if (!ext) return { ok: false, error: "Only jpg, png, webp or avif images are supported." };
  if (input.file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Images must be 8 MB or smaller." };
  }

  const file = input.file;
  const path = `${input.productId}/${Date.now()}.${ext}`;

  const result = await guard(async (db) => {
    const { error: upErr } = await db.storage.from("product-images").upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type || `image/${ext}`,
    });
    if (upErr) throw upErr;

    const { count } = await db
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_id", input.productId);
    const isFirst = (count ?? 0) === 0;

    await db
      .from("product_images")
      .insert({
        product_id: input.productId,
        storage_path: path,
        alt: input.alt,
        is_primary: isFirst,
        sort_order: isFirst ? 0 : count ?? 0,
      })
      .throwOnError();
  });

  if (result.ok) {
    updateTag("product-images");
    updateTag("catalog");
    revalidatePath(`/admin/products/${input.productId}`);
  }
  return result;
}

export async function saveProductImageFromForm(fd: FormData): Promise<void> {
  const productId = fdStr(fd, "product_id");
  const result = await uploadProductImage(fd);
  if (result.ok) {
    redirect(`/admin/products/${productId}?saved=1`);
  }
  redirect(`/admin/products/${productId}?error=${encodeURIComponent(result.error ?? GENERIC_ERROR)}`);
}

/** Promotes an image to primary and demotes the previous primary. */
export async function setProductImagePrimary(fd: FormData): Promise<void> {
  const imageId = fdStr(fd, "image_id");
  const productId = fdStr(fd, "product_id");
  const parsed = z
    .object({ imageId: z.string().uuid(), productId: z.string().uuid() })
    .safeParse({ imageId, productId });
  if (!parsed.success) {
    redirect(`/admin/products/${productId || ""}?error=${encodeURIComponent("Invalid image.")}`);
  }

  const result = await guard(async (db) => {
    await db
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", parsed.data.productId)
      .throwOnError();
    await db
      .from("product_images")
      .update({ is_primary: true, sort_order: 0 })
      .eq("id", parsed.data.imageId)
      .throwOnError();
  });

  if (result.ok) {
    updateTag("product-images");
    revalidatePath(`/admin/products/${parsed.data.productId}`);
    redirect(`/admin/products/${parsed.data.productId}?saved=1`);
  }
  redirect(`/admin/products/${parsed.data.productId}?error=${encodeURIComponent(GENERIC_ERROR)}`);
}

/** Deletes the Storage object and the row. Storage cleanup failure does not block row deletion. */
export async function deleteProductImage(fd: FormData): Promise<void> {
  const imageId = fdStr(fd, "image_id");
  const productId = fdStr(fd, "product_id");
  const parsed = z
    .object({ imageId: z.string().uuid(), productId: z.string().uuid() })
    .safeParse({ imageId, productId });
  if (!parsed.success) {
    redirect(`/admin/products/${productId || ""}?error=${encodeURIComponent("Invalid image.")}`);
  }

  const result = await guard(async (db) => {
    const { data } = await db
      .from("product_images")
      .select("storage_path")
      .eq("id", parsed.data.imageId)
      .maybeSingle();
    const path = (data as { storage_path: string } | null)?.storage_path;

    await db.from("product_images").delete().eq("id", parsed.data.imageId).throwOnError();

    if (path) {
      const { error: rmErr } = await db.storage.from("product-images").remove([path]);
      if (rmErr) console.error("[admin action] storage remove failed:", rmErr.message);
    }
  });

  if (result.ok) {
    updateTag("product-images");
    revalidatePath(`/admin/products/${parsed.data.productId}`);
    redirect(`/admin/products/${parsed.data.productId}?saved=1`);
  }
  redirect(`/admin/products/${parsed.data.productId}?error=${encodeURIComponent(GENERIC_ERROR)}`);
}

// ---------------------------------------------------------------------------
// Site settings — the single source of truth for contact data
// ---------------------------------------------------------------------------

const phoneSchema = z.object({
  value: z.string().min(3).max(40),
  display: z.string().min(3).max(60),
  label: z.string().min(1).max(60),
  verified: z.boolean(),
});

export async function updateContactSettings(fd: FormData): Promise<AdminActionResult> {
  // Parallel arrays (one entry per row, in row order) → phones.
  const values = fd.getAll("phone_value").map(String);
  const displays = fd.getAll("phone_display").map(String);
  const labels = fd.getAll("phone_label").map(String);
  // Every row submits a hidden "off" before its checkbox; checked rows add
  // "on" after it. Walk the flat list in document order so verified flags
  // stay aligned with rows no matter which boxes are ticked.
  const rawVerified = fd.getAll("phone_verified").map(String);
  const verified: boolean[] = [];
  for (let i = 0; i < rawVerified.length; i += 1) {
    if (rawVerified[i] === "on") continue; // already consumed with its row
    verified.push(rawVerified[i + 1] === "on");
    if (rawVerified[i + 1] === "on") i += 1;
  }

  const phones: z.infer<typeof phoneSchema>[] = [];
  for (let i = 0; i < values.length; i += 1) {
    const p = phoneSchema.safeParse({
      value: values[i]?.trim() ?? "",
      display: displays[i]?.trim() ?? "",
      label: labels[i]?.trim() ?? "",
      verified: verified[i] ?? false,
    });
    if (!p.success) return { ok: false, error: `Phone row ${i + 1} is incomplete.` };
    phones.push(p.data);
  }

  const candidate = {
    address: fdStr(fd, "address"),
    email: fdOpt(fd, "email"),
    whatsappNumber: fdStr(fd, "whatsapp_number"),
  };
  const parsed = z
    .object({
      address: z.string().min(8).max(400),
      email: z.string().email().nullable(),
      whatsappNumber: z.string().min(6).max(40),
    })
    .safeParse(candidate);
  if (!parsed.success) return { ok: false, error: "Address, WhatsApp number and email are required." };

  const result = await guard(async (db) => {
    const existing = await db
      .from("site_settings")
      .select("value")
      .eq("key", "contact")
      .maybeSingle()
      .throwOnError();
    const prev = (existing.data?.value as Record<string, unknown>) ?? {};

    const nextValue = {
      // Preserve anything the editor does not own (geo, client sign-off flag).
      ...prev,
      address: parsed.data.address,
      email: parsed.data.email,
      whatsapp_number: parsed.data.whatsappNumber,
      phones,
    };

    await db
      .from("site_settings")
      .upsert({ key: "contact", value: nextValue })
      .throwOnError();
  });

  if (result.ok) {
    updateTag("site-settings");
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
  }
  return result;
}

export async function saveContactSettingsFromForm(fd: FormData): Promise<void> {
  const result = await updateContactSettings(fd);
  if (result.ok) {
    redirect("/admin/settings?saved=1");
  }
  redirect(`/admin/settings?error=${encodeURIComponent(result.error ?? GENERIC_ERROR)}`);
}
