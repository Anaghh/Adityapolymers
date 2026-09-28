import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { EnquiryForm } from "@/components/enquiry/enquiry-form";
import { getProducts, getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Get a Quote, Dr Bond Industrial Adhesives",
  description:
    "Request a quotation, sample or dealership for Dr Bond industrial adhesives: synthetic, packaging and wood-working grades from Aditya Polymers, Pune.",
  alternates: { canonical: "/enquiry" },
};

export default async function EnquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const [{ product: requested }, products, settings] = await Promise.all([
    searchParams,
    getProducts(),
    getSiteSettings(),
  ]);

  const options = products
    .map((product) => ({ slug: product.slug, name: `${product.name}: ${product.applications}` }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Catalog pages link /enquiry?product=AP-44 (the SKU); options carry slugs.
  // Match on slug first, then name, then the "Dr Bond AP-44" display name.
  // Resolved server-side so the prefilled select is present in the SSR HTML.
  const needle = (requested ?? "").trim().toLowerCase();
  const defaultProduct = needle
    ? (
        products.find((p) => p.slug.toLowerCase() === needle) ??
        products.find((p) => p.sku.toLowerCase() === needle) ??
        products.find((p) => p.name.toLowerCase().includes(needle))
      )?.slug
    : undefined;

  const verifiedPhones = settings.phones.filter((phone) => phone.verified);
  const whatsappHref = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    "Hello Aditya Polymers, I need a quotation for ",
  )}`;

  return (
    <>
      <section className="blueprint-grid border-b-2 border-navy-950 bg-concrete">
        <Container className="py-10 sm:py-14">
          <p className="eyebrow text-ink-soft">QUOTATIONS · SAMPLES · DEALERSHIP</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            Get a quote
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">
            Tell us the substrate, line speed and pack size. The sales desk matches a Dr Bond
            grade and quotes it, typically within one working day.
          </p>
        </Container>
      </section>

      <section className="bg-paper">
        <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_320px]">
          <div>
            <EnquiryForm products={options} defaultProduct={defaultProduct} />
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-line bg-white p-6">
              <h2 className="font-display text-lg font-bold text-navy-950">Prefer to talk?</h2>
              <ul className="mt-4 space-y-3">
                {verifiedPhones.map((phone) => (
                  <li key={phone.value}>
                    <a
                      href={`tel:${phone.value}`}
                      className="text-sm font-semibold text-navy-700 hover:underline"
                    >
                      {phone.display}
                    </a>
                    <span className="ml-2 text-xs text-ink-soft">{phone.label}</span>
                  </li>
                ))}
              </ul>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-success px-4 py-2.5 font-display text-sm font-semibold tracking-wide text-white transition-colors hover:bg-[#256a41]"
              >
                WhatsApp us
              </a>
              <p className="mt-6 border-t border-line pt-4 text-xs leading-5 text-ink-soft">
                {settings.address}
              </p>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
