import type { Metadata } from "next";
import { ProductPageBody, productMetadata } from "@/components/catalog/product-view";
import { getProducts } from "@/lib/data";

export const revalidate = 3600;

type Params = { category: string; slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const products = await getProducts();
  return products.map((p) => ({ category: p.categorySlug, slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  return productMetadata(slug);
}

export default async function ProductDetailPage({ params }: { params: Promise<Params> }) {
  const { category, slug } = await params;
  return <ProductPageBody slug={slug} segments={[category]} />;
}
