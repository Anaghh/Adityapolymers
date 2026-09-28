import Link from "next/link";
import { Container } from "@/components/ui/container";
import { BrandLockup } from "@/components/brand/brand-mark";

/**
 * Deep-navy footer carrying real NAP data (address, phones, email, ISO line).
 * The lockup repeats the mascot for brand recall at the close.
 */
export function SiteFooter({
  address,
  phones,
  email,
}: {
  address: string;
  phones: { display: string; value: string; label: string }[];
  email: string | null;
}) {
  return (
    <footer className="mt-auto bg-navy-950 text-navy-100">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <BrandLockup tone="paper" />
          <p className="mt-4 text-sm text-navy-200">
            Manufacturer, supplier and exporter of industrial adhesives under the Dr Bond brand,
            serving packaging and woodworking industries since 2000.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3 text-cta">Contact</p>
          <address className="text-sm not-italic leading-6">
            {address}
          </address>
          <ul className="mt-3 space-y-1 text-sm">
            {phones.map((p) => (
              <li key={p.value}>
                <a href={`tel:${p.value}`} className="font-mono hover:text-white">
                  {p.display}
                </a>
                <span className="ml-2 text-xs text-navy-300">{p.label}</span>
              </li>
            ))}
          </ul>
          {email ? (
            <a href={`mailto:${email}`} className="mt-3 inline-block text-sm hover:text-white">
              {email}
            </a>
          ) : null}
        </div>
        <div>
          <p className="eyebrow mb-3 text-cta">Products</p>
          <ul className="space-y-1.5 text-sm">
            <li><Link href="/products/synthetic" className="hover:text-white">Synthetic adhesives</Link></li>
            <li><Link href="/products/packaging" className="hover:text-white">Packaging adhesives</Link></li>
            <li><Link href="/products/starch-based-dextrin" className="hover:text-white">Starch based (dextrin)</Link></li>
            <li><Link href="/products/wood-working" className="hover:text-white">Wood working adhesives</Link></li>
            <li><Link href="/downloads" className="hover:text-white">TDS / SDS downloads</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3 text-cta">Company</p>
          <ul className="space-y-1.5 text-sm">
            <li><Link href="/about" className="hover:text-white">About us</Link></li>
            <li><Link href="/infrastructure" className="hover:text-white">Infrastructure</Link></li>
            <li><Link href="/quality" className="hover:text-white">Quality</Link></li>
            <li><Link href="/locations" className="hover:text-white">Locations we serve</Link></li>
            <li><Link href="/enquiry" className="hover:text-white">Send an enquiry</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-navy-800">
        <Container className="flex flex-col gap-2 py-5 text-xs text-navy-300 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Aditya Polymers, Chinchwad, Pune. All rights reserved.</p>
          <p>ISO 9001:2015 certified, certificate details on the <Link href="/quality" className="underline hover:text-white">quality page</Link>.</p>
        </Container>
      </div>
    </footer>
  );
}
