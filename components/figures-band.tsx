import { Container } from "@/components/ui/container";
import { getKeyFigures } from "@/lib/data";

/**
 * Key-figures band — sits directly beneath heroes on landing pages.
 * The numbers are the visual until real photography exists.
 */
export function FiguresBand({ tone = "navy" }: { tone?: "navy" | "paper" }) {
  const figures = getKeyFigures();
  const dark = tone === "navy";
  return (
    <div className={dark ? "bg-navy-950 text-white" : "bg-paper"}>
      <Container className="py-10">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
          {figures.map((figure) => (
            <div key={figure.label}>
              <dt className="sr-only">{figure.label}</dt>
              <dd>
                <span className="font-mono text-3xl font-medium tracking-tight sm:text-4xl">
                  {figure.value}
                </span>{" "}
                <span className="eyebrow text-cta">{figure.unit}</span>
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
