import type { Metadata } from "next";
import { FileDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Band, SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { getDownloads } from "@/lib/downloads";
import { getSiteSettings } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "TDS & SDS Downloads — Dr Bond Adhesives",
  description:
    "Technical data sheets and safety data sheets for Dr Bond industrial adhesives, grade by grade, from the Aditya Polymers download centre.",
  alternates: { canonical: "/downloads" },
};

const KIND_LABELS = {
  tds: "Technical data sheets",
  sds: "Safety data sheets",
  brochure: "Brochures",
} as const;

export default async function DownloadsPage() {
  const [downloads, settings] = await Promise.all([getDownloads(), getSiteSettings()]);
  const whatsappHref = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    "Hello Aditya Polymers, please send the TDS for ",
  )}`;

  const grouped = (["tds", "sds", "brochure"] as const)
    .map((kind) => ({ kind, docs: downloads.filter((d) => d.kind === kind) }))
    .filter((group) => group.docs.length > 0);

  if (downloads.length === 0) {
    return (
      <>
        <section className="bg-navy-900 text-white">
          <Container className="py-10 sm:py-14">
            <p className="eyebrow text-cta">DOWNLOAD CENTRE</p>
            <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              TDS &amp; SDS downloads
            </h1>
          </Container>
        </section>
        <Band tone="white">
          <div className="rounded-lg border border-line bg-paper p-8 sm:p-10">
            <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">
              The library is being verified, grade by grade
            </h2>
            <p className="mt-3 max-w-2xl text-ink-soft">
              Data sheets publish here only after verification against the current client
              documents — nothing goes up unverified. Ask the sales desk for any grade&apos;s TDS
              or SDS in the meantime; it comes back the same working day.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/enquiry" variant="primary" size="lg">
                Request a document
              </ButtonLink>
              <ButtonLink href={whatsappHref} variant="whatsapp" size="lg" external>
                <FileDown className="size-4" aria-hidden />
                WhatsApp
              </ButtonLink>
            </div>
          </div>
        </Band>
      </>
    );
  }

  return (
    <>
      <section className="bg-navy-900 text-white">
        <Container className="py-10 sm:py-14">
          <p className="eyebrow text-cta">DOWNLOAD CENTRE</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            TDS &amp; SDS downloads
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-navy-100">
            Verified documents, grade by grade — no signup wall.
          </p>
        </Container>
      </section>
      <Band tone="white">
        {grouped.map((group) => (
          <section key={group.kind} aria-labelledby={`kind-${group.kind}`} className="mb-12 last:mb-0">
            <h2
              id={`kind-${group.kind}`}
              className="font-display text-2xl font-bold tracking-tight text-navy-950"
            >
              {KIND_LABELS[group.kind]}
            </h2>
            <ul className="mt-6 divide-y divide-line overflow-hidden rounded-lg border border-line">
              {group.docs.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="font-medium text-navy-900">{doc.title}</p>
                    <p className="mt-0.5 font-mono text-xs text-ink-soft">
                      v{doc.version}
                      {doc.fileSize ? ` · ${(doc.fileSize / 1024).toFixed(0)} KB` : ""}
                    </p>
                  </div>
                  <a
                    href={`/api/download/${doc.id}`}
                    className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-cta-strong hover:underline"
                    aria-label={`Download ${doc.title}`}
                  >
                    <FileDown className="size-4" aria-hidden />
                    Download
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Band>
    </>
  );
}
