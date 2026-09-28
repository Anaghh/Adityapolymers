import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";

/**
 * Datasheet-grade catalog table for category pages. Renders honestly:
 * unverified spec cells and empty pack lists show "On request" instead of
 * invented values. The SKU links to the grade detail page; the final column
 * carries the per-row amber conversion link (amber is reserved for
 * conversion actions only).
 */
export function ProductTable({ products }: { products: Product[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="overflow-x-auto">
        <table className="spec-table w-full min-w-[760px] border-collapse">
          <thead>
            <tr>
              <th scope="col" className="w-40">
                Grade / SKU
              </th>
              <th scope="col">Applications</th>
              <th scope="col" className="w-32">
                Solid content
              </th>
              <th scope="col" className="w-44">
                Pack sizes
              </th>
              <th scope="col" className="w-36">
                <span className="sr-only">Request quote</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="even:bg-paper/60">
                <td>
                  <Link
                    href={`/products/${product.categorySlug}/${product.slug}`}
                    className="font-mono font-medium text-navy-800 hover:text-navy-600 hover:underline"
                  >
                    {product.sku}
                  </Link>
                </td>
                <td className="text-ink">{product.applications}</td>
                <td
                  data-kind="figure"
                  className={product.specs.solids_pct == null ? "text-ink-soft" : ""}
                >
                  {product.specs.solids_pct != null ? `${product.specs.solids_pct}%` : "On request"}
                </td>
                <td className="text-ink">
                  {product.packSizes.length ? product.packSizes.join(", ") : "On request"}
                </td>
                <td>
                  <Link
                    href={`/enquiry?product=${encodeURIComponent(product.sku)}`}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-cta-strong hover:underline"
                  >
                    Request quote
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-line bg-paper px-4 py-3 text-xs text-ink-soft">
        “On request” marks values still being verified against current technical data sheets; ask
        for the TDS for binding figures.
      </p>
    </div>
  );
}
