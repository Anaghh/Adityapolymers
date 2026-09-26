import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HashShim } from "@/components/catalog/hash-shim";
import { getCategories, getProducts } from "@/lib/data";
import type { Category } from "@/lib/types";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Products",
  description:
    "The Dr Bond range: synthetic, packaging (paper conversion, lamination, labeling, starch/dextrin) and wood-working adhesives, manufactured in Pune and shipped across India, the Middle East and Africa.",
  alternates: { canonical: "/products" },
};

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

export default async function ProductsPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  const countBySlug = new Map<string, number>();
  for (const product of products) {
    countBySlug.set(product.categorySlug, (countBySlug.get(product.categorySlug) ?? 0) + 1);
  }

  // Parent categories count their descendants' grades (packaging = its children's grades).
  const countFor = (category: Category): number => {
    const children = categories.filter((c) => c.parentId === category.id);
    if (children.length === 0) return countBySlug.get(category.slug) ?? 0;
    return children.reduce((total, child) => total + (countBySlug.get(child.slug) ?? 0), 0);
  };

  const ordered = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <HashShim />

      <section className="bg-navy-900 text-white">
        <Container className="py-16 sm:py-24">
          <p className="eyebrow rise-in text-cta">DR BOND ADHESIVES · CATALOGUE</p>
          <h1 className="rise-in mt-4 max-w-3xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
            The Dr Bond range.
          </h1>
          <p className="rise-in mt-5 max-w-2xl text-lg text-navy-100">
            {ordered.length} adhesive families across packaging, wood working and industrial
            conversion — every grade manufactured in-house at the Pune plants, with specifications
            published only from verified data sheets.
          </p>
        </Container>
      </section>

      <section className="bg-white">
        <Container className="py-14 sm:py-16">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ordered.map((category) => {
              const count = countFor(category);
              return (
                <li key={category.slug}>
                  <Link
                    href={`/products/${category.slug}`}
                    className="group flex h-full flex-col rounded-lg border border-line p-6 transition-colors hover:border-navy-300"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="font-display text-lg font-bold text-navy-900 group-hover:text-navy-700">
                        {category.name}
                      </h2>
                      {count > 0 ? (
                        <span className="shrink-0 font-mono text-xs text-ink-soft">
                          {count} grades
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">
                      {truncate(category.description, 120)}
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

          <div className="mt-10 flex flex-col gap-5 rounded-lg border border-line bg-paper p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-ink">
              <span className="font-semibold text-navy-900">Need a grade that is not listed?</span>{" "}
              Customised grades are developed against customer requirement — send us your
              application.
            </p>
            <ButtonLink href="/enquiry" variant="primary" size="lg" className="shrink-0">
              Get a Quote
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
