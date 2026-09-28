import type { Metadata } from "next";
import { CheckCircle2, FileDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Band, SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { getLabTests } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "ISO 9001:2015 Certified Manufacturing",
  description:
    "Aditya Polymers manufactures Dr Bond adhesives under an ISO 9001:2015 quality management system, with raw-material, in-process and batch-release testing in an in-house lab at both Pune plants.",
  alternates: { canonical: "/quality" },
};

const GATES = [
  {
    stage: "Raw material",
    body: "Incoming lots are checked against specification before they touch a reactor: solids, viscosity and appearance on every lot, supplier CoA cross-verified.",
  },
  {
    stage: "In process",
    body: "Mixing parameters (temperature, addition order, hold times) are logged on the batch record; in-process samples track viscosity and solids to the target curve.",
  },
  {
    stage: "Batch release",
    body: "No drum leaves the plant without a full test-panel pass. Batch certificates follow every industrial consignment.",
  },
];

export default function QualityPage() {
  const labTests = getLabTests();

  return (
    <>
      <section className="border-b border-line bg-white">
        <Container className="py-10 sm:py-14">
          <p className="eyebrow text-cta-strong">QUALITY SYSTEM</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            ISO 9001:2015, certified process, tested batches.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">
            A documented quality management system across both Pune plants, with the full test
            panel run in-house on every batch before release. Current certificate copies are
            available on request.
          </p>
        </Container>
      </section>

      <Band tone="white">
        <SectionHeading
          title="Three gates between raw material and your line."
          intro="Quality is not an inspection at the end, it is a gate at each stage, each with its own records."
        />
        <ol className="mt-8 divide-y divide-line border-y border-line">
          {GATES.map((gate, index) => (
            <li key={gate.stage} className="flex flex-col gap-2 py-6 sm:flex-row sm:gap-8">
              <h3 className="font-display text-lg font-bold text-navy-950 sm:w-80 sm:shrink-0">
                <span className="mr-3 font-mono text-sm font-medium text-navy-600">0{index + 1}</span>
                {gate.stage}
              </h3>
              <p className="flex-1 text-sm leading-6 text-ink-soft">{gate.body}</p>
            </li>
          ))}
        </ol>
      </Band>

      <Band tone="paper">
        <SectionHeading
          title="What gets tested."
          intro="The in-house laboratory runs this panel, the same properties your incoming inspection will measure."
        />
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {labTests.map((test) => (
            <li key={test} className="flex items-start gap-2.5 rounded-md border border-line bg-white px-4 py-3">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-navy-700" aria-hidden />
              <span className="text-sm font-medium text-navy-900">{test}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl text-sm leading-6 text-ink-soft">
          Published specifications appear on grade pages only as verified against the current
          technical data sheet; until a value is verified it shows “On request”, never a guess.
        </p>
      </Band>

      <Band tone="white">
        <SectionHeading
          title="Datasheets, safety sheets, certificates."
          intro="TDS and SDS documents publish through the download centre as they are verified, grade by grade."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/downloads" variant="primary" size="lg">
            <FileDown className="size-4" aria-hidden />
            Download centre
          </ButtonLink>
          <ButtonLink href="/enquiry" variant="outline" size="lg">
            Request certificate copies
          </ButtonLink>
        </div>
      </Band>
    </>
  );
}
