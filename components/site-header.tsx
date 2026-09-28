"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import { clsx } from "clsx";
import { buttonClass } from "@/components/ui/button";

/**
 * Global header + conversion bar: verified phone click-to-call, amber
 * "Get a Quote", WhatsApp — reachable in one click from every page.
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
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2" aria-label="Aditya Polymers, home">
          <span className="font-display text-xl font-extrabold tracking-tight text-navy-900">
            ADITYA POLYMERS
          </span>
          <span className="eyebrow hidden text-ink-soft sm:inline">Dr Bond adhesives</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "rounded px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "text-navy-900 bg-navy-50"
                  : "text-ink-soft hover:text-navy-900",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href={`tel:${phone.value}`}
            className="inline-flex items-center gap-2 px-2 py-2 text-sm font-medium text-navy-900 hover:text-navy-700"
          >
            <Phone className="size-4" aria-hidden />
            <span className="font-mono">{phone.display}</span>
          </a>
          <Link href="/enquiry" className={buttonClass("primary")}>
            Get a Quote
          </Link>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={buttonClass("whatsapp")}>
            WhatsApp
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded p-2 text-navy-900 lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open ? (
        <nav className="border-t border-line bg-white px-4 py-4 lg:hidden" aria-label="Mobile">
          <ul className="grid gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded px-3 py-2.5 font-medium text-ink hover:bg-navy-50"
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
                  className="block rounded px-3 py-2.5 pl-6 text-sm text-ink-soft hover:bg-navy-50"
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
