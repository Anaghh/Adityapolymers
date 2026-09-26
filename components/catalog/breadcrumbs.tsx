import Link from "next/link";
import { clsx } from "clsx";

export type Crumb = { name: string; href: string };

/**
 * Visual breadcrumb + BreadcrumbList JSON-LD in one place so every catalog
 * page emits matching markup and structured data. Hrefs must be canonical
 * routes (child categories link at their own /products/{slug} page, not a
 * parent-prefixed path).
 */
export function Breadcrumbs({
  items,
  tone = "light",
}: {
  items: Crumb[];
  tone?: "light" | "dark";
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.adityapolymers.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb">
        <ol
          className={clsx(
            "flex flex-wrap items-center gap-1.5 text-sm",
            tone === "dark" ? "text-navy-200" : "text-ink-soft",
          )}
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${index}-${item.href}`} className="flex items-center gap-1.5">
                {index > 0 ? (
                  <span aria-hidden className={tone === "dark" ? "text-navy-300" : "text-navy-200"}>
                    /
                  </span>
                ) : null}
                {isLast ? (
                  <span aria-current="page" className={tone === "dark" ? "text-white" : "text-navy-900"}>
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className={clsx(
                      "hover:underline",
                      tone === "dark"
                        ? "text-navy-100 hover:text-white"
                        : "text-navy-700 hover:text-navy-900",
                    )}
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
