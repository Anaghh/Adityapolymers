import { Container } from "@/components/ui/container";
import { getKeyFigures } from "@/lib/data";

/**
 * Key-figures band: a concrete plate with a blueprint hairline grid, mono
 * counters stamped like plant-floor signage. Sits directly beneath heroes.
 */
export function FiguresBand({ tone = "concrete" }: { tone?: "concrete" | "navy" }) {
  const figures = getKeyFigures();
  const dark = tone === "navy";
  return (
    <div className={dark ? "bg-navy-950 text-white" : "blueprint-grid bg-concrete"}>
      <Container className="py-10">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
          {figures.map((figure) => (
            <div key={figure.label}>
              <dt className="sr-only">{figure.label}</dt>
              <dd>
                <span className="font-mono text-3xl font-medium tracking-tight sm:text-4xl">
                  {figure.value}
                </span>{" "}
                <span className="eyebrow text-cta-strong">{figure.unit}</span>
                <p className={dark ? "mt-1 text-sm text-navy-100" : "mt-1 text-sm text-ink-soft"}>
                  {figure.label}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </div>
  );
}
