import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { getLocations } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Locations We Serve — Across India & Export Markets",
  description:
    "Aditya Polymers supplies Dr Bond adhesives across major Indian metros — Pune, Mumbai, Delhi, Kolkata, Bengaluru and more — with exports to the Middle East and Africa.",
  alternates: { canonical: "/locations" },
};

export default async function LocationsPage() {
  const locations = await getLocations();

  const cities = locations
    .filter((entry) => entry.scope === "india_city")
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.name.localeCompare(b.name));
  const countries = locations.filter((entry) => entry.scope === "country");
  const regions = locations.filter((entry) => entry.scope === "region");

  const byRegion = new Map<string, typeof cities>();
  for (const city of cities) {
    const list = byRegion.get(city.region) ?? [];
    list.push(city);
    byRegion.set(city.region, list);
  }

  return (
    <>
      <section className="bg-navy-900 text-white">
        <Container className="py-10 sm:py-14">
          <p className="eyebrow text-cta">SUPPLY NETWORK</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            Direct supply across India. Exports on schedule.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-navy-100">
            Dr Bond adhesives ship from the two Pune plants to manufacturing hubs across the
            country, and abroad to the Middle East and Africa.
          </p>
        </Container>
      </section>

      <section className="bg-white">
        <Container className="py-12 sm:py-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">
            India — {cities.length} cities
          </h2>
          <div className="mt-6 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...byRegion.entries()]
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([region, list]) => (
                <div key={region}>
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-navy-600">
                    {region}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {list.map((city) => (
                      <li key={city.slug} className="flex items-baseline gap-2 text-ink">
                        <MapPin
                          className={`size-4 shrink-0 ${city.isPrimary ? "text-navy-700" : "text-line"}`}
                          aria-hidden
                        />
                        <span className={city.isPrimary ? "font-semibold text-navy-900" : ""}>
                          {city.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>

          <h2 className="mt-14 font-display text-2xl font-bold tracking-tight text-navy-950">
            Export markets
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {countries.map((country) => (
              <div key={country.slug} className="rounded-lg border border-line p-6">
                <h3 className="font-display text-lg font-bold text-navy-900">{country.name}</h3>
                <p className="mt-1 text-sm text-ink-soft">
                  Direct exports — documentation and logistics handled desk-side.
                </p>
              </div>
            ))}
            {regions.map((region) => (
              <div key={region.slug} className="rounded-lg border border-line bg-paper p-6">
                <h3 className="font-display text-lg font-bold text-navy-900">
                  {region.name} — enquiries welcome
                </h3>
                <p className="mt-1 text-sm text-ink-soft">
                  Shipping worldwide from Nhava Sheva; write to us with your port.
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-lg border border-line bg-paper p-8 sm:p-10">
            <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">
              Your city not listed?
            </h2>
            <p className="mt-3 max-w-2xl text-ink-soft">
              Transport desks cover every major route from Pune — tell us your location and volume
              and we will quote delivered.
            </p>
            <div className="mt-6">
              <ButtonLink href="/enquiry" variant="primary" size="lg">
                Get a Quote
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
