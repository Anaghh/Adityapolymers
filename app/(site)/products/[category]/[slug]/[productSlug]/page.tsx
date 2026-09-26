import type { Metadata } from "next";
import { ProductPageBody, productMetadata } from "@/components/catalog/product-view";
import { getCategories, getProducts } from "@/lib/data";

export const revalidate = 3600;

/**
 * Parent-prefixed grade URLs, e.g. /products/packaging/starch-based-dextrin/dexo-3000.
 * Segment naming follows Next's same-name-per-depth rule shared with the
 * canonical /products/[category]/[slug] route: `slug` is the child-category
 * slug here, `productSlug` the grade slug. Renders the same grade page as
 * /products/{category}/{productSlug}; the shared view validates that
 * {category} is an ancestor of {slug} and canonicalizes metadata to the
 * short URL.
 */

type Params = { category: string; slug: string; productSlug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const out: Params[] = [];
  for (const product of products) {
    const own = categories.find((c) => c.slug === product.categorySlug);
    if (!own || !own.parentId) continue;
    const parent = categories.find((c) => c.id === own.parentId);
    if (!parent) continue;
    out.push({ category: parent.slug, slug: own.slug, productSlug: product.slug });
  }
  return out;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { productSlug } = await params;
  return productMetadata(productSlug);
}

export default async function NestedProductDetailPage({ params }: { params: Promise<Params> }) {
  const { category, slug, productSlug } = await params;
  return <ProductPageBody slug={productSlug} segments={[category, slug]} />;
}
