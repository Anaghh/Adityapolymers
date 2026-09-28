"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import { clsx } from "clsx";
import { buttonClass } from "@/components/ui/button";
import { BrandLockup } from "@/components/brand/brand-mark";

/**
 * Global header + conversion bar: mascot lockup, verified phone click-to-call,
 * amber "Get a Quote" plate, WhatsApp. Light factory styling: white bar on
 * concrete page, hard bottom rule, sharp chips.
 */
export function SiteHeader({
  categories,
  phone,
  whatsappHref,
}: {
  categories: { slug: string; name: string; shortName: string }[];
  phone: { display: string; value: string };
  whatsappHref: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const nav = [
    { href: "/about", label: "About" },
    { href: "/products", label: "Products" },
    { href: "/infrastructure", label: "Infrastructure" },
    { href: "/quality", label: "Quality" },
    { href: "/downloads", label: "Downloads" },
    { href: "/locations", label: "Locations" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b-2 border-navy-950 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Dr Bond by Aditya Polymers, home">
          <BrandLockup />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "rounded-sharp-md px-3 py-2 font-display text-[13px] font-bold uppercase tracking-wide transition-colors",
                pathname === item.href
                  ? "bg-navy-950 text-paper"
                  : "text-ink-soft hover:bg-navy-50 hover:text-navy-900",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href={`tel:${phone.value}`}
            className="inline-flex items-center gap-2 px-2 py-2 font-mono text-sm font-medium text-navy-900 hover:text-navy-700"
          >
            <Phone className="size-4" aria-hidden />
            {phone.display}
          </a>
          <Link href="/enquiry" className={buttonClass("primary")}>
            Get a Quote
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-sharp-md p-2 text-navy-900 lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open ? (
        <nav className="border-t border-line bg-paper px-4 py-4 lg:hidden" aria-label="Mobile">
          <ul className="grid gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-sharp-md px-3 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-ink hover:bg-navy-50"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/products/${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-sharp-md px-3 py-2 pl-6 font-mono text-xs text-ink-soft hover:bg-navy-50"
                >
                  {c.shortName}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <a href={`tel:${phone.value}`} className={buttonClass("outline")}>
              <Phone className="size-4" aria-hidden /> Call
            </a>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={buttonClass("whatsapp")}>
              WhatsApp
            </a>
            <Link href="/enquiry" onClick={() => setOpen(false)} className={buttonClass("primary", "lg") + " col-span-2"}>
              Get a Quote
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
