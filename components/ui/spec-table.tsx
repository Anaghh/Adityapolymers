import type { Product } from "@/lib/types";

/**
 * Datasheet-style spec table. Renders every row honestly: if a value has
 * not been supplied by client TDS documents yet, the row shows "On request"
 * instead of an invented number.
 */
export function SpecTable({ product }: { product: Product }) {
  const rows: { label: string; value: string; kind: "figure" | "text" }[] = [
    { label: "Base chemistry", value: product.specs.base ?? "On request", kind: "text" },
    {
      label: "Solid content",
      value: product.specs.solids_pct != null ? `${product.specs.solids_pct}%` : "On request",
      kind: "figure",
    },
    { label: "Viscosity", value: product.specs.viscosity ?? "On request", kind: "figure" },
    { label: "pH", value: product.specs.ph ?? "On request", kind: "figure" },
    {
      label: "Water resistant",
      value:
        product.specs.water_resistant == null
          ? "On request"
          : product.specs.water_resistant
            ? "Yes"
            : "No",
      kind: "text",
    },
    { label: "Applications", value: product.applications || "On request", kind: "text" },
    {
      label: "Pack sizes",
      value: product.packSizes.length ? product.packSizes.join(", ") : "125 g-50 kg range",
      kind: "text",
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <table className="spec-table w-full border-collapse">
        <thead>
          <tr>
            <th scope="col" colSpan={2} className="!bg-navy-900 !text-white">
              {product.sku}: Technical specification
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="even:bg-paper/60">
              <th scope="row" className="w-44 font-medium text-ink">
                {row.label}
              </th>
              <td data-kind={row.kind} className={row.kind === "figure" ? "" : "text-ink"}>
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-line bg-paper px-4 py-3 text-xs text-ink-soft">
        Specifications are verified against technical data sheets before publication; request the
        current TDS for binding values.
      </p>
    </div>
  );
}
