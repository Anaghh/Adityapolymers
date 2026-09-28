import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileDown, MapPin, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Band, SectionHeading } from "@/components/ui/section-heading";
import { FiguresBand } from "@/components/figures-band";
import {
  getCategories,
  getLabTests,
  getLocations,
  getProducts,
  getSiteSettings,
} from "@/lib/data";
import type { Product } from "@/lib/types";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: {
    absolute: "Aditya Polymers — Industrial Adhesives Manufacturer, Pune, India",
  },
  description:
    "Dr Bond synthetic, packaging and wood-working adhesives from an ISO 9001:2015 certified Pune manufacturer — 6,000 MTPA across two plants, exports to the Middle East and Africa.",
  alternates: { canonical: "/" },
};

/**
 * Secondary CTA styling for dark bands — the shared outline variant is tuned
 * for light bands (navy text) and would disappear on navy.
 */
const outlineOnDark =
  "inline-flex items-center justify-center gap-2 rounded-md border border-white/40 px-6 py-3.5 font-display text-base font-semibold tracking-wide text-white transition-colors hover:border-white/70 hover:bg-white/10";

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

export default async function HomePage() {
  const [categories, allProducts, locations, settings] = await Promise.all([
    getCategories(),
    getProducts(),
    getLocations(),
    getSiteSettings(),
  ]);

  const featured = ["ap-44", "bp-2500", "cl-150", "wr-50"]
    .map((slug) => allProducts.find((product) => product.slug === slug))
    .filter((product): product is Product => product !== undefined);

  // Structured data is a public claim — only client-verified numbers go in it,
  // matching the contact page's tel: gating.
  const verifiedPhones = settings.phones.filter((phone) => phone.verified);
  const metroCount = locations.filter((entry) => entry.scope === "india_city").length;
  const labTests = getLabTests();
  const whatsappHref = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    "Hello Aditya Polymers, I need a quotation for ",
  )}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.adityapolymers.com";

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Aditya Polymers",
    url: siteUrl,
    description:
      "Manufacturer, supplier and exporter of synthetic, packaging and wood-working adhesives under the Dr Bond brand.",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: settings.geo.lat,
      longitude: settings.geo.lng,
    },
    contactPoint: verifiedPhones.map((phone) => ({
      "@type": "ContactPoint",
      telephone: phone.value,
      contactType: phone.label,
      areaServed: "IN",
      availableLanguage: ["en", "hi", "mr"],
    })),
  };

  const capabilityRows: { label: string; value: string; kind: "figure" | "text" }[] = [
    { label: "Stainless-steel reactors", value: "5", kind: "figure" },
    { label: "Pilot plant", value: "50 kg batch", kind: "figure" },
    { label: "R&D reactor", value: "2 kg glass", kind: "figure" },
    { label: "In-house lab tests", value: labTests.join(" · "), kind: "text" },
    { label: "Effluent treatment", value: "Full ETP on site — the sustainability line", kind: "text" },
    { label: "Operations", value: "ERP-integrated production, QC and dispatch", kind: "text" },
    { label: "Exports", value: "UAE + South Africa; shipping worldwide", kind: "text" },
    { label: "Retail packs", value: "125 g – 50 kg", kind: "text" },
    { label: "Contract manufacturing", value: "MNC contract-packaging vendorship", kind: "text" },
  ];

  const trustCards = [
    {
      href: "/quality",
      icon: ShieldCheck,
      label: "ISO 9001:2015 certified",
      description: "A documented quality management system across both Pune units.",
    },
    {
      href: "/locations",
      icon: MapPin,
      label: `${metroCount} Indian metros + export desks`,
      description: "Direct supply across India; exports to the Middle East and Africa.",
    },
    {
      href: "/downloads",
      icon: FileDown,
      label: "TDS/SDS download centre",
      description: "Technical data sheets and safety data sheets, grade by grade.",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />

      {/* ——— Hero ——— */}
      <section className="bg-navy-900 text-white">
        <Container className="py-20 sm:py-28">
          <p className="eyebrow rise-in text-cta">DR BOND INDUSTRIAL ADHESIVES · PUNE, INDIA</p>
          <h1 className="rise-in mt-4 max-w-3xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
            Industrial adhesives for packaging and woodworking — engineered in Pune.
          </h1>
          <p className="rise-in mt-5 max-w-2xl text-lg text-navy-100">
            Manufacturer, supplier and exporter of the Dr Bond range — ISO 9001:2015 certified,
            6,000 MTPA across two plants, shipping across India and to the Middle East and Africa.
          </p>
          <div className="rise-in mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/enquiry" variant="primary" size="lg">
              Get a Quote
            </ButtonLink>
            <Link href="/products" className={outlineOnDark}>
              Explore products
            </Link>
          </div>
        </Container>
      </section>

      <FiguresBand />

      {/* ——— Product families ——— */}
      <Band tone="paper">
        <SectionHeading
          eyebrow="Product families"
          title="Seven families. One Dr Bond standard."
          intro="From textile-tube synthetics to dextrin gums and furniture-grade PVA — every grade is made in-house at the Pune plants."
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/products/${category.slug}`}
                className="group flex h-full flex-col rounded-lg border border-line bg-white p-6 transition-colors hover:border-navy-300"
              >
                <h3 className="font-display text-lg font-bold text-navy-900 group-hover:text-navy-700">
                  {category.shortName}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">
                  {truncate(category.description, 120)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700">
                  View grades
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Band>

      {/* ——— Signature grades ——— */}
      <Band tone="white">
        <SectionHeading
          eyebrow="Signature grades"
          title="The grades our customers reorder."
          intro="Four workhorse grades across woodworking and packaging — full data on request or by TDS."
        />
        <ul className="mt-10 divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
          {featured.map((product) => (
            <li
              key={product.slug}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-mono text-base font-medium text-navy-900">{product.sku}</p>
                <p className="mt-0.5 text-sm text-ink-soft">{product.applications}</p>
              </div>
              <div className="flex shrink-0 items-center gap-5">
                <Link
                  href={`/products/${product.categorySlug}`}
                  className="text-sm font-medium text-navy-700 hover:underline"
                >
                  View grades
                </Link>
                <Link
                  href="/enquiry"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-cta-strong hover:underline"
                >
                  Request quote
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </Band>

      {/* ——— Why Aditya Polymers ——— */}
      <Band tone="paper">
        <SectionHeading
          eyebrow="Why Aditya Polymers"
          title="Plant facts, not marketing claims."
          intro="The figures below are audited on site — the same ones our customers check during vendor audits."
        />
        <div className="mt-10 overflow-hidden rounded-lg border border-line bg-white">
          <div className="bg-navy-900 px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide text-white">
            Aditya Polymers — capability sheet
          </div>
          <table className="spec-table w-full border-collapse">
            <tbody>
              {capabilityRows.map((row) => (
                <tr key={row.label} className="even:bg-paper/60">
                  <th scope="row" className="w-56 font-medium text-ink">
                    {row.label}
                  </th>
                  <td data-kind={row.kind} className={row.kind === "figure" ? "" : "text-ink"}>
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-line bg-paper px-4 py-3 text-xs text-ink-soft">
            Audited on site, 2026 — figures reconcile to the 6,000 MTPA combined capacity.
          </p>
        </div>
      </Band>

      {/* ——— Trust strip ——— */}
      <Band tone="white">
        <SectionHeading eyebrow="Trust" title="Certified, connected, documented." />
        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {trustCards.map((card) => {
            const Icon = card.icon;
            return (
              <li key={card.href}>
                <Link
                  href={card.href}
                  className="group flex h-full flex-col rounded-lg border border-line bg-white p-6 transition-colors hover:border-navy-300"
                >
                  <Icon className="size-6 text-navy-700" aria-hidden />
                  <h3 className="mt-3 font-display text-lg font-bold text-navy-900">{card.label}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-6 text-ink-soft">{card.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700">
                    More
                    <ArrowRight className="size-4" aria-hidden />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Band>

      {/* ——— Closing CTA ——— */}
      <section className="bg-navy-900">
        <Container className="flex flex-col gap-8 py-16 sm:py-20 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Need a grade specified?
            </h2>
            <p className="mt-3 max-w-xl text-navy-100">
              Tell us the substrate, line speed and pack size — we will match a grade and quote it.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/enquiry" variant="primary" size="lg">
              Get a Quote
            </ButtonLink>
            <ButtonLink href={whatsappHref} variant="whatsapp" size="lg" external>
              WhatsApp
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
