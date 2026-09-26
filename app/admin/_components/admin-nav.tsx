"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  ClipboardList,
  Download,
  LayoutDashboard,
  MessageSquareQuote,
  Package,
  ExternalLink,
  Settings,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/enquiries", label: "Enquiries", icon: ClipboardList },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/downloads", label: "Downloads", icon: Download },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="p-4">
      <ul className="space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 font-display text-sm font-semibold tracking-wide transition-colors",
                  active
                    ? "bg-navy-800 text-white"
                    : "text-navy-100/80 hover:bg-navy-800/60 hover:text-white",
                )}
              >
                <Icon aria-hidden className="size-4" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="my-4 border-t border-white/10" />

      <Link
        href="/"
        className="flex items-center gap-2.5 rounded-md px-3 py-2 font-display text-sm font-semibold tracking-wide text-navy-100/80 transition-colors hover:bg-navy-800/60 hover:text-white"
      >
        <ExternalLink aria-hidden className="size-4" />
        View site
      </Link>
    </nav>
  );
}
