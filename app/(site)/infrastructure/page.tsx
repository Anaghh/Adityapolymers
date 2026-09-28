import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Band, SectionHeading } from "@/components/ui/section-heading";
import { FiguresBand } from "@/components/figures-band";
import { ButtonLink } from "@/components/ui/button";
import { getLabTests, getPlants } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Two Pune Plants, 6,000 MTPA",
  description:
    "Five stainless-steel reactors, a 50 kg pilot plant, dedicated starch-gum cookers and a full testing laboratory inside the two Aditya Polymers plants at Chikhli/PCMC and Chakan, Pune.",
  alternates: { canonical: "/infrastructure" },
};

export default async function InfrastructurePage() {
  const [plants, labTests] = await Promise.all([getPlants(), getLabTests()]);

  const capabilityRows: { label: string; value: string }[] = [
    { label: "Stainless-steel reactors", value: "5" },
    { label: "Pilot plant", value: "50 kg batch" },
    { label: "R&D reactor", value: "2 kg glass" },
    { label: "Water treatment", value: "DM / RO plant on site" },
    { label: "Effluent treatment", value: "Full ETP on site" },
    { label: "Operations", value: "ERP-integrated production, QC and dispatch" },
  ];

  return (
    <>
      <section className="border-b border-line bg-white">
        <Container className="py-10 sm:py-14">
          <p className="eyebrow text-cta-strong">INFRASTRUCTURE</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            Two plants, one process discipline.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">
            The synthetic and starch-gum divisions run on separate equipment at Chikhli/PCMC and
            Chakan, Pune, 6,000 MTPA combined, with a full-fledged laboratory behind every release.
          </p>
        </Container>
      </section>

      <FiguresBand />

      <Band tone="white">
        <SectionHeading
          title="Purpose-built lines, not shared ones."
          intro="Synthetic adhesives and starch-based gums never share a reactor; the divisions run on dedicated equipment, each with its own quality lab."
        />
        <ul className="mt-10 grid gap-4 lg:grid-cols-2">
          {plants.map((plant) => (
            <li key={plant.name} className="flex h-full flex-col rounded-lg border border-line bg-white p-6 sm:p-8">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-xl font-bold text-navy-950">{plant.name}</h3>
                <span className="shrink-0 rounded bg-paper px-2.5 py-1 font-mono text-sm font-medium text-navy-900">
                  {plant.capacity}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-soft">{plant.area}</p>
              <p className="mt-4 flex-1 text-sm leading-6 text-ink">{plant.detail}</p>
            </li>
          ))}
        </ul>
      </Band>

      <Band tone="paper">
        <SectionHeading
          title="The capability sheet."
          intro="The figures our customers check during vendor audits, audited on site."
        />
        <div className="mt-10 overflow-hidden rounded-lg border border-line bg-white">
          <div className="bg-navy-900 px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide text-white">
            Plant capability
          </div>
          <table className="spec-table w-full border-collapse">
            <tbody>
              {capabilityRows.map((row) => (
                <tr key={row.label} className="even:bg-paper/60">
                  <th scope="row" className="w-56 font-medium text-ink">
                    {row.label}
                  </th>
                  <td className="text-ink">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Band>

      <Band tone="white">
        <SectionHeading
          title="Every batch is tested before release."
          intro="The in-house lab runs the full test panel on raw materials, in-process material and finished batches, the same tests your incoming-inspection will run."
        />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {labTests.map((test) => (
            <li
              key={test}
              className="rounded-md border border-line bg-paper px-4 py-3 text-sm font-medium text-navy-900"
            >
              {test}
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <ButtonLink href="/quality" variant="outline" size="lg">
            Quality system &amp; certifications
          </ButtonLink>
        </div>
      </Band>
    </>
  );
}
