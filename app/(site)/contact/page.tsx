import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact and Office Address, Chinchwad, Pune",
  description:
    "Reach Aditya Polymers (Dr Bond adhesives) in Chinchwad, Pune: phone, WhatsApp and office address, plus the quotation form.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  // Only client-verified numbers become canonical tel: links; unverified
  // ones are displayed with a pending flag and never auto-dialled.
  const verifiedPhones = settings.phones.filter((phone) => phone.verified);
  const unverifiedPhones = settings.phones.filter((phone) => !phone.verified);
  const whatsappHref = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    "Hello Aditya Polymers, ",
  )}`;

  const localBusinessLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Aditya Polymers",
    description: "Manufacturer of Dr Bond industrial adhesives: synthetic, packaging and wood-working.",
    address: { "@type": "PostalAddress", streetAddress: settings.address, addressCountry: "IN" },
    geo: { "@type": "GeoCoordinates", latitude: settings.geo.lat, longitude: settings.geo.lng },
    telephone: verifiedPhones.map((phone) => phone.value),
    contactPoint: verifiedPhones.map((phone) => ({
      "@type": "ContactPoint",
      telephone: phone.value,
      contactType: phone.label,
      areaServed: "IN",
      availableLanguage: ["en", "hi", "mr"],
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }}
      />

      <section className="bg-navy-900 text-white">
        <Container className="py-10 sm:py-14">
          <p className="eyebrow text-cta">CONTACT</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            Talk to the sales desk
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-navy-100">
            Chinchwad, Pune. Office hours 9:30 to 18:00 IST, Monday to Saturday.
          </p>
        </Container>
      </section>

      <section className="bg-white">
        <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">Office</h2>
            <address className="mt-4 not-italic text-ink">
              {settings.address.split(", ").map((part, index, parts) => (
                <span key={index}>
                  {part}
                  {index < parts.length - 1 ? ", " : ""}
                </span>
              ))}
            </address>
            <p className="mt-4 text-sm text-ink-soft">
              <a
                href={`https://www.google.com/maps?q=${settings.geo.lat},${settings.geo.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-navy-700 hover:underline"
              >
                Open in Google Maps
              </a>
            </p>

            <h2 className="mt-10 font-display text-2xl font-bold tracking-tight text-navy-950">
              Phone
            </h2>
            <ul className="mt-4 space-y-3">
              {verifiedPhones.map((phone) => (
                <li key={phone.value}>
                  <a
                    href={`tel:${phone.value}`}
                    className="font-mono text-base font-medium text-navy-900 hover:underline"
                  >
                    {phone.display}
                  </a>
                  <span className="ml-2 text-sm text-ink-soft">{phone.label}</span>
                </li>
              ))}
              {unverifiedPhones.map((phone) => (
                <li key={phone.value}>
                  <span className="font-mono text-base text-ink">{phone.display}</span>
                  <span className="ml-2 text-sm text-ink-soft">
                    {phone.label} · verification pending
                  </span>
                </li>
              ))}
            </ul>

            <h2 className="mt-10 font-display text-2xl font-bold tracking-tight text-navy-950">
              WhatsApp
            </h2>
            <div className="mt-4">
              <ButtonLink href={whatsappHref} variant="whatsapp" size="lg" external>
                Message on WhatsApp
              </ButtonLink>
            </div>

            {settings.email ? (
              <p className="mt-8 text-sm">
                <a href={`mailto:${settings.email}`} className="font-medium text-navy-700 hover:underline">
                  {settings.email}
                </a>
              </p>
            ) : (
              <p className="mt-8 text-sm text-ink-soft">
                Email desk publishes after client sign-off. Please use phone or WhatsApp meanwhile.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-line bg-paper p-6 sm:p-8 lg:self-start">
            <h2 className="font-display text-xl font-bold text-navy-950">Need a quotation?</h2>
            <p className="mt-3 text-ink-soft">
              The quotation form captures substrate, line speed and pack size in one pass, so quotes
              come back faster than over the phone.
            </p>
            <div className="mt-6">
              <ButtonLink href="/enquiry" variant="primary" size="lg">
                Get a Quote
              </ButtonLink>
            </div>
            <p className="mt-6 text-xs leading-5 text-ink-soft">
              Numbers marked “verification pending” are carried over from the legacy website and
              await client sign-off before they become canonical contact numbers.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
