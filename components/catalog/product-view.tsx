import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, FileDown } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SpecTable } from "@/components/ui/spec-table";
import { Breadcrumbs, type Crumb } from "@/components/catalog/breadcrumbs";
import { getCategories, getProduct, getProductsByCategory, getSiteSettings } from "@/lib/data";
import type { Category, Product } from "@/lib/types";

/**
 * Shared body for the grade detail page (the long-tail SEO engine). Both the
 * canonical /products/{category}/{slug} route and the parent-prefixed
 * /products/{parent}/{child}/{slug} route render through this component; the
 * category segments are validated against the product's own category or one
 * of its ancestors, and unknown combinations 404.
 */

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

/** Splits the audited applications string into list items (data uses ";" as separator). */
function splitApplications(text: string): string[] {
  return text
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
}

function packSizeLine(product: Product): string {
  if (product.packSizes.length) return product.packSizes.join(" · ");
  return product.isRetailPack ? "125 g – 50 kg retail range" : "On request";
}

/** Metadata shared by both detail routes; the deep route canonicalizes to the short URL. */
export async function productMetadata(slug: string): Promise<Metadata> {
  const product = await getProduct(slug);
  if (!product) return { title: "Product" };
  const categories = await getCategories();
  const own = categories.find((c) => c.slug === product.categorySlug);
  return {
    title: `${product.name} — ${own?.name ?? "Adhesives"}`,
    description: product.applications,
    alternates: { canonical: `/products/${product.categorySlug}/${product.slug}` },
  };
}

export async function ProductPageBody({ slug, segments }: { slug: string; segments: string[] }) {
  const product = await getProduct(slug);
  if (!product) notFound();

  const categories = await getCategories();
  const own = categories.find((c) => c.slug === product.categorySlug);
  if (!own) notFound();

  // Full ancestor chain: [grandparent, …, parent, ownCategory].
  const chain: Category[] = [own];
  let cursor = own;
  while (cursor.parentId) {
    const parent = categories.find((c) => c.id === cursor.parentId);
    if (!parent) break;
    chain.unshift(parent);
    cursor = parent;
  }

  // The provided category segments must match the tail of the chain —
  // /products/starch-based-dextrin/dexo-3000 (own category) and
  // /products/packaging/starch-based-dextrin/dexo-3000 (ancestor path) both
  // validate; anything else 404s.
  const expected = chain.slice(-segments.length).map((c) => c.slug);
  if (expected.length !== segments.length || expected.some((s, i) => s !== segments[i])) {
    notFound();
  }

  const [settings, categoryProducts] = await Promise.all([
    getSiteSettings(),
    getProductsByCategory(product.categorySlug),
  ]);
  const related = categoryProducts.filter((p) => p.id !== product.id);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.adityapolymers.com";
  const canonicalPath = `/products/${product.categorySlug}/${product.slug}`;
  const enquiryHref = `/enquiry?product=${encodeURIComponent(product.sku)}`;
  const waDigits = settings.whatsappNumber.replace(/[^0-9]/g, "");
  const whatsappHref = `https://wa.me/${waDigits}?text=${encodeURIComponent(
    `Hello Aditya Polymers, I need a quotation for ${product.sku} (${product.name}).`,
  )}`;

  const crumbs: Crumb[] = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    ...chain.map((c) => ({ name: c.name, href: `/products/${c.slug}` })),
    { name: product.sku, href: canonicalPath },
  ];

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand || "Dr Bond" },
    description: product.applications,
    category: product.categoryName || own.name,
    url: `${siteUrl}${canonicalPath}`,
  };

  const applications = splitApplications(product.applications);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />

      <section className="bg-navy-900 text-white">
        <Container className="py-10 sm:py-14">
          <Breadcrumbs items={crumbs} tone="dark" />
          <p className="eyebrow mt-8 text-cta">{own.shortName.toUpperCase()}</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-navy-100">{product.applications}</p>
        </Container>
      </section>

      <section className="bg-white">
        <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-10">
            <SpecTable product={product} />

            {product.description ? (
              <p className="max-w-2xl leading-7 text-ink">{product.description}</p>
            ) : null}

            <section aria-labelledby="applications-heading">
              <h2
                id="applications-heading"
                className="font-display text-xl font-bold tracking-tight text-navy-950"
              >
                Common applications
              </h2>
              {applications.length > 0 ? (
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink">
                  {applications.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-ink-soft">On request — matched to your application.</p>
              )}
            </section>

            <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-line bg-paper px-4 py-3">
              <span className="eyebrow text-navy-600">Pack sizes</span>
              <span className="font-mono text-sm text-navy-900">{packSizeLine(product)}</span>
            </div>
          </div>

          {/* Conversion rail: sticky on desktop, stacks below the datasheet on mobile. */}
          <aside className="self-start lg:sticky lg:top-24">
            <div className="rounded-lg border border-line bg-paper p-5">
              <h2 className="font-display text-lg font-bold text-navy-950">Get a quotation</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Quote direct from the manufacturer — send grade and quantity.
              </p>
              <div className="mt-4 space-y-2.5">
                <ButtonLink href={enquiryHref} variant="primary" className="w-full">
                  Get a Quote
                </ButtonLink>
                <ButtonLink href={whatsappHref} variant="whatsapp" external className="w-full">
                  WhatsApp
                </ButtonLink>
                <ButtonLink href="/downloads" variant="outline" className="w-full">
                  <FileDown className="size-4" aria-hidden />
                  Download TDS
                </ButtonLink>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-line p-5">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-navy-900">
                Related grades in this category
              </h2>
              {related.length > 0 ? (
                <ul className="mt-3 divide-y divide-line">
                  {related.map((p) => (
                    <li key={p.id} className="py-2.5">
                      <Link
                        href={`/products/${p.categorySlug}/${p.slug}`}
                        className="font-mono text-sm font-medium text-navy-800 hover:underline"
                      >
                        {p.sku}
                      </Link>
                      <span className="mt-0.5 block text-xs leading-5 text-ink-soft">
                        {truncate(p.applications, 90)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-ink-soft">
                  No other listed grades in this family yet — customised grades are developed
                  against customer requirement.
                </p>
              )}
              <Link
                href={`/products/${product.categorySlug}`}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:underline"
              >
                All {own.shortName} grades
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
