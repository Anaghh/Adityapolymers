import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.adityapolymers.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Aditya Polymers — Industrial Adhesives Manufacturer, Pune, India",
    template: "%s | Aditya Polymers",
  },
  description:
    "ISO-certified manufacturer, supplier and exporter of synthetic, packaging and wood-working adhesives for paper tubes, corrugated boxes, fibre drums and furniture. Dr Bond brand, 6000 MTPA across two Pune plants, exports to the Middle East and Africa.",
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // No maximumScale — pinch zoom stays enabled (accessibility trust signal).
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${archivo.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
