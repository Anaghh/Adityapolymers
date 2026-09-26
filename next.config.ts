import type { NextConfig } from "next";

/**
 * Legacy URL 301 map (page-level — URL fragments never reach the server;
 * legacy pages receive a small client-side hash shim instead) plus image
 * optimization config for Supabase Storage.
 */
const legacyRedirects = [
  { source: "/index.html", destination: "/", permanent: true },
  { source: "/about-aditya-polymers.html", destination: "/about", permanent: true },
  { source: "/aditya-polymers-products.html", destination: "/products", permanent: true },
  { source: "/packaging-adhesives.html", destination: "/products/packaging", permanent: true },
  { source: "/synthetic-adhesives.html", destination: "/products/synthetic", permanent: true },
  { source: "/paper-conversion-adhesives.html", destination: "/products/paper-conversion", permanent: true },
  { source: "/lamination-adhesives.html", destination: "/products/lamination", permanent: true },
  { source: "/labeling-adhesives.html", destination: "/products/labeling", permanent: true },
  { source: "/starch-based-adhesives.html", destination: "/products/starch-based-dextrin", permanent: true },
  { source: "/wood-working-adhesives.html", destination: "/products/wood-working", permanent: true },
  { source: "/locations-we-serve.html", destination: "/locations", permanent: true },
  { source: "/clients.html", destination: "/about", permanent: true },
  { source: "/contact.html", destination: "/contact", permanent: true },
  { source: "/enquiry.php", destination: "/enquiry", permanent: true },
  { source: "/sitemap.html", destination: "/products", permanent: true },
];

const nextConfig: NextConfig = {
  redirects: legacyRedirects,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "supabase.co" },
    ],
  },
};

export default nextConfig;
