import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/data";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.adityapolymers.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  const staticRoutes = [
    { path: "", priority: 1.0 },
    { path: "/products", priority: 0.9 },
    { path: "/enquiry", priority: 0.9 },
    { path: "/about", priority: 0.7 },
    { path: "/infrastructure", priority: 0.7 },
    { path: "/quality", priority: 0.7 },
    { path: "/locations", priority: 0.7 },
    { path: "/contact", priority: 0.8 },
    { path: "/downloads", priority: 0.6 },
    { path: "/privacy", priority: 0.2 },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: new Date(),
      priority: route.priority,
    })),
    ...categories.map((category) => ({
      url: `${SITE_URL}/products/${category.slug}`,
      lastModified: new Date(),
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/products/${product.categorySlug}/${product.slug}`,
      lastModified: new Date(),
      priority: 0.7,
    })),
  ];
}
