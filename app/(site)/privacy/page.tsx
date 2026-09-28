import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Band } from "@/components/ui/section-heading";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Privacy Notice",
  description:
    "How Aditya Polymers collects, uses and protects personal data submitted through this website, under India's DPDP Act, 2023.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "What we collect",
    body: [
      "Enquiry form: your name, email, phone and, optionally, company, country, product interest, quantity note and message. We also record the page you sent the form from.",
      "Downloads: when you download a technical or safety document, we record which document was fetched along with a salted, hashed form of your IP address, not the IP itself.",
    ],
  },
  {
    heading: "Why we use it",
    body: [
      "To respond to your quotation, sample or dealership request, and to keep a record of enquiries made through the website. Submitting the enquiry form is your consent for this use.",
      "Download events are used in aggregate to understand which documents are needed, and are not used to contact you.",
    ],
  },
  {
    heading: "What we do not do",
    body: [
      "We do not sell, rent or trade your details. We do not add you to marketing lists or share your enquiry with third parties outside the service providers that run this website (hosting, database and email delivery).",
    ],
  },
  {
    heading: "Retention",
    body: [
      "Enquiry records are retained while they serve the business relationship and thereafter only as required for record-keeping. Hashed download logs may be retained in aggregate form.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "Under India's Digital Personal Data Protection Act, 2023 you may ask for a copy of your data, its correction, or its erasure, and you may withdraw consent for future contact. Write to us at the office address below, or raise it on the same phone numbers listed on our contact page.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="border-b border-line bg-white">
        <Container className="py-10 sm:py-14">
          <p className="eyebrow text-cta-strong">PRIVACY</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            Privacy notice
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">
            Last updated 26 September 2026: how this website handles your personal data under the
            DPDP Act, 2023.
          </p>
        </Container>
      </section>
      <Band tone="white">
        <div className="max-w-2xl">
          {SECTIONS.map((section) => (
            <section key={section.heading} className="mb-10 last:mb-0">
              <h2 className="font-display text-xl font-bold tracking-tight text-navy-950">
                {section.heading}
              </h2>
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-3 text-sm leading-6 text-ink">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
          <p className="mt-10 border-t border-line pt-6 text-sm leading-6 text-ink-soft">
            Aditya Polymers · Chinchwad, Pune 411019, Maharashtra, India
          </p>
        </div>
      </Band>
    </>
  );
}
