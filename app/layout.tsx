import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

/* Self-hosted fonts (no runtime Google dependency, no build-time fetch):
   IBM Plex Sans for body, Archivo Variable for display, IBM Plex Mono for
   figures — the datasheet voice. */
const plexSans = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-plex-sans",
  display: "swap",
});

const archivo = localFont({
  src: [{ path: "./fonts/archivo-variable-latin.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-archivo",
  display: "swap",
});

const plexMono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.adityapolymers.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Aditya Polymers, Industrial Adhesives Manufacturer, Pune, India",
    template: "%s | Aditya Polymers",
  },
  description:
    "ISO-certified manufacturer, supplier and exporter of synthetic, packaging and wood-working adhesives for paper tubes, corrugated boxes, fibre drums and furniture. Dr Bond brand, 6000 MTPA across two Pune plants, exports to the Middle East and Africa.",
  // No layout-level canonical: a canonical set in a layout is inherited by
  // every child page and would mark them duplicates of "/". Each page (and
  // the home page) sets its own alternates.canonical instead.
  openGraph: {
    type: "website",
    siteName: "Aditya Polymers",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // No maximumScale — pinch zoom stays enabled (accessibility trust signal).
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${archivo.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
