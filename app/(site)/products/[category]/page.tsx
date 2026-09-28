import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Breadcrumbs, type Crumb } from "@/components/catalog/breadcrumbs";
import { ProductTable } from "@/components/catalog/product-table";
import { getCategories, getProducts } from "@/lib/data";

export const revalidate = 3600;

type Params = { category: string };

export async function generateStaticParams(): Promise<Params[]> {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category: slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { title: "Products" };
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/products/${category.slug}` },
  };
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { category: slug } = await params;
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const children = categories
    .filter((c) => c.parentId === category.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const childSlugs = new Set(children.map((c) => c.slug));

  // Parent categories aggregate their descendants' grades into the table;
  // child categories show their own products only.
  const ownProducts = products.filter((p) => p.categorySlug === category.slug);
  const descendantProducts = products.filter((p) => childSlugs.has(p.categorySlug));
  const tableProducts = [...ownProducts, ...descendantProducts];

  const countBySlug = new Map<string, number>();
  for (const product of products) {
    countBySlug.set(product.categorySlug, (countBySlug.get(product.categorySlug) ?? 0) + 1);
  }

  const crumbs: Crumb[] = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: category.name, href: `/products/${category.slug}` },
  ];

  return (
    <>
      <section className="border-b border-line bg-white">
        <Container className="py-10 sm:py-14">
          <Breadcrumbs items={crumbs} tone="light" />
          <p className="eyebrow mt-8 text-cta">DR BOND PRODUCT FAMILY</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            {category.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">{category.description}</p>
        </Container>
      </section>

      <section className="bg-white">
        <Container className="py-12 sm:py-16">
          {children.length > 0 ? (
            <section aria-labelledby="subfamilies-heading" className="mb-12">
              <h2
                id="subfamilies-heading"
                className="font-display text-2xl font-bold tracking-tight text-navy-950"
              >
                Sub-families
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {children.map((child) => {
                  const count = countBySlug.get(child.slug) ?? 0;
                  return (
                    <li key={child.slug}>
                      <Link
                        href={`/products/${child.slug}`}
                        className="group flex h-full flex-col rounded-lg border border-line p-6 transition-colors hover:border-navy-300"
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <h3 className="font-display text-lg font-bold text-navy-900 group-hover:text-navy-700">
                            {child.name}
                          </h3>
                          {count > 0 ? (
                            <span className="shrink-0 font-mono text-xs text-ink-soft">
                              {count} grades
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">
                          {truncate(child.description, 140)}
                        </p>
                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700">
                          {count > 0 ? "View grades" : "Customised grades"}
                          <ArrowRight
                            className="size-4 transition-transform group-hover:translate-x-0.5"
                            aria-hidden
                          />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {tableProducts.length > 0 ? (
            <section aria-labelledby="grades-heading">
              <h2
                id="grades-heading"
                className="font-display text-2xl font-bold tracking-tight text-navy-950"
              >
                Grades in this family
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-ink-soft">
                Figures marked “On request” are published only after verification against the
                current technical data sheet.
              </p>
              <div className="mt-6">
                <ProductTable products={tableProducts} />
              </div>
            </section>
          ) : children.length === 0 ? (
            <section className="rounded-lg border border-line bg-paper p-8 sm:p-10">
              <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">
                Customised grades, developed against customer requirement
              </h2>
              <p className="mt-3 max-w-2xl text-ink-soft">
                No catalogue grades are published for {category.name} yet; this family is made to
                order. Send us your substrate, line speed and pack size and we will match a
                formulation and quote it.
              </p>
              <div className="mt-6">
                <ButtonLink href="/enquiry" variant="primary" size="lg">
                  Get a Quote
                </ButtonLink>
              </div>
            </section>
          ) : null}
        </Container>
      </section>
    </>
  );
}
