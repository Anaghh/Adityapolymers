import type { Metadata } from "next";
import { ArrowRight, Factory, Globe2, Handshake } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Band, SectionHeading } from "@/components/ui/section-heading";
import { FiguresBand } from "@/components/figures-band";
import { ButtonLink } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "25 Years of Adhesive Manufacturing in Pune",
  description:
    "Aditya Polymers is an ISO 9001:2015 manufacturer of Dr Bond industrial adhesives in Chinchwad, Pune, with 6,000 MTPA across two plants, exporting to the Middle East and Africa.",
  alternates: { canonical: "/about" },
};

const outlineOnLight =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-navy-200 bg-white px-6 py-3.5 font-display text-base font-semibold tracking-wide text-navy-900 transition-colors hover:border-navy-300 hover:bg-navy-50";

export default async function AboutPage() {
  const settings = await getSiteSettings();

  const pillars = [
    {
      icon: Factory,
      title: "Manufacturer first",
      body: "We blend on our own reactors in Pune, not on a trading desk. Every grade is made, tested and released in-house, so the specification and the accountability sit in one place.",
    },
    {
      icon: Globe2,
      title: "Built for industrial lines",
      body: "Textile tubes, corrugators, E-fluting laminators, fibre drums, post-forming lines. We engineer to machine conditions, not just to a datasheet.",
    },
    {
      icon: Handshake,
      title: "Contract-manufacturing grade",
      body: "A vendorised contract-packaging partner for MNCs: documentation, batch traceability and audits are part of the routine, not the exception.",
    },
  ];

  return (
    <>
      <section className="border-b border-line bg-white">
        <Container className="py-14 sm:py-20">
          <p className="eyebrow text-cta-strong">ABOUT ADITYA POLYMERS</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
            25 years of making adhesives, not marketing them.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-soft">
            From a Pune base, Aditya Polymers manufactures the Dr Bond range of synthetic, packaging
            and wood-working adhesives: 6,000 MTPA across two plants, shipping across India and to
            the Middle East and Africa.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/enquiry" variant="primary" size="lg">
              Get a Quote
            </ButtonLink>
            <a href="/infrastructure" className={outlineOnLight}>
              See the plants
            </a>
          </div>
        </Container>
      </section>

      <FiguresBand />

      <Band tone="white">
        <SectionHeading
          title="One brand, two divisions, a single standard."
          intro="Aditya Polymers runs two manufacturing divisions under the Dr Bond brand from the Pune region, synthetic adhesives and starch-based gums, with the office at Chinchwad."
        />
        <div className="mt-10 overflow-hidden rounded-lg border border-line">
          <div className="bg-navy-900 px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide text-white">
            At a glance
          </div>
          <table className="spec-table w-full border-collapse">
            <tbody>
              <tr className="even:bg-paper/60">
                <th scope="row" className="w-56 font-medium text-ink">Head office</th>
                <td className="text-ink">{settings.address}</td>
              </tr>
              <tr className="even:bg-paper/60">
                <th scope="row" className="w-56 font-medium text-ink">Plants</th>
                <td className="font-mono">2 - Chikhli/PCMC &amp; Chakan, Pune</td>
              </tr>
              <tr className="even:bg-paper/60">
                <th scope="row" className="w-56 font-medium text-ink">Combined capacity</th>
                <td className="font-mono">6,000 MTPA</td>
              </tr>
              <tr className="even:bg-paper/60">
                <th scope="row" className="w-56 font-medium text-ink">Brand</th>
                <td className="font-mono">Dr Bond</td>
              </tr>
              <tr className="even:bg-paper/60">
                <th scope="row" className="w-56 font-medium text-ink">Exports</th>
                <td className="text-ink">UAE &amp; South Africa, shipping worldwide</td>
              </tr>
              <tr className="even:bg-paper/60">
                <th scope="row" className="w-56 font-medium text-ink">Retail packs</th>
                <td className="font-mono">125 g-50 kg</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Band>

      <Band tone="paper">
        <SectionHeading title="What the plant floor buys you." />
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <li key={pillar.title} className="flex flex-col gap-2 py-6 sm:flex-row sm:gap-8">
                <h3 className="flex items-center gap-3 font-display text-lg font-bold text-navy-900 sm:w-80 sm:shrink-0">
                  <Icon className="size-5 shrink-0 text-navy-700" aria-hidden />
                  {pillar.title}
                </h3>
                <p className="flex-1 text-sm leading-6 text-ink-soft">{pillar.body}</p>
              </li>
            );
          })}
        </ul>
      </Band>

      <Band tone="white">
        <SectionHeading
          title="ERP-integrated from mixing to dispatch."
          intro="Production, QC and dispatch run on ERP; every batch is traceable from raw-material lot to customer gate. On-site effluent treatment keeps the sustainability line honest."
        />
        <div className="mt-8">
          <ButtonLink href="/quality" variant="outline" size="lg">
            How quality is checked
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </div>
      </Band>

      <section className="bg-navy-900">
        <Container className="flex flex-col gap-8 py-16 sm:py-20 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Working with us
            </h2>
            <p className="mt-3 max-w-xl text-navy-100">
              Dealership enquiries, contract manufacturing and customised grades: start with the
              quotation form or the sales desk.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/enquiry" variant="primary" size="lg">
              Get a Quote
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
