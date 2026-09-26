import { clsx } from "clsx";
import { Container } from "./container";

/**
 * Section label in tracked caps + real H2. Every content section gets
 * exactly one heading — the old site's keyword-stuffed alt-text pattern
 * is dead by design.
 */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  tone = "light",
  align = "start",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  tone?: "light" | "dark";
  align?: "start" | "center";
}) {
  return (
    <div className={clsx(align === "center" && "text-center")}>
      {eyebrow ? (
        <p className={clsx("eyebrow mb-2", tone === "dark" ? "text-cta" : "text-navy-600")}>
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={clsx(
          "font-display text-3xl font-bold tracking-tight sm:text-4xl",
          tone === "dark" ? "text-white" : "text-navy-950",
        )}
      >
        {title}
      </h2>
      {intro ? (
        <p
          className={clsx(
            "mt-3 max-w-2xl text-base",
            tone === "dark" ? "text-navy-100" : "text-ink-soft",
            align === "center" && "mx-auto",
          )}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}

/** Full-width band wrapper with padding + optional dark/paper tone. */
export function Band({
  tone = "white",
  children,
  className,
}: {
  tone?: "white" | "paper" | "navy";
  children: React.ReactNode;
  className?: string;
}) {
  const tones = {
    white: "bg-white",
    paper: "bg-paper",
    navy: "bg-navy-900 text-navy-100",
  } as const;
  return (
    <section className={clsx(tones[tone], "py-16 sm:py-20", className)}>
      <Container>{children}</Container>
    </section>
  );
}
