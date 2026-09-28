import clsx from "clsx";

/**
 * Dr Bond brand mark: a safety-goggled adhesive droplet inside a hex nut
 * badge. The drop is the product (adhesive), the goggles are the "Dr", the
 * hex nut is the factory. Geometric, crisp at 24 px, inline SVG (no requests).
 *
 * tone "ink"   — for light backgrounds (default)
 * tone "paper" — for dark/ink backgrounds (badge flips to paper, drop stays amber)
 */
export function BrandMark({
  className,
  tone = "ink",
}: {
  className?: string;
  tone?: "ink" | "paper";
}) {
  const dark = tone === "paper";
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="Dr Bond mascot: a goggled adhesive droplet on a hex nut"
      className={clsx("shrink-0", className)}
    >
      {/* Hex nut badge */}
      <polygon
        points="24,2 41.3,12 41.3,36 24,46 6.7,36 6.7,12"
        fill={dark ? "var(--color-paper)" : "var(--color-ink)"}
      />
      <polygon
        points="24,7 37,14.7 37,33.3 24,41 11,33.3 11,14.7"
        fill={dark ? "var(--color-ink)" : "var(--color-paper)"}
      />
      {/* Droplet */}
      <path
        d="M24 10c4.6 6.1 8.4 10.9 8.4 15.6A8.4 8.4 0 0 1 24 34a8.4 8.4 0 0 1-8.4-8.4C15.6 20.9 19.4 16.1 24 10Z"
        fill="var(--color-cta)"
      />
      {/* Safety goggles */}
      <g fill="none" stroke={dark ? "var(--color-ink)" : "var(--color-ink)"} strokeWidth="2.4">
        <rect x="15.4" y="19.6" width="17.2" height="8.6" rx="4.3" fill="#fff" />
        <circle cx="20.9" cy="23.9" r="1.9" fill="var(--color-ink)" stroke="none" />
        <circle cx="27.1" cy="23.9" r="1.9" fill="var(--color-ink)" stroke="none" />
        <path d="M13.5 21.5 15.4 22.4M34.5 21.5 32.6 22.4" strokeLinecap="round" />
      </g>
      {/* Smile */}
      <path
        d="M20.5 31.2c1 1.1 2.2 1.7 3.5 1.7s2.5-.6 3.5-1.7"
        fill="none"
        stroke={dark ? "var(--color-ink)" : "var(--color-ink)"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Full logo lockup: mark + wordmark. The wordmark is display type set solid,
 * with the "DR BOND" chip carrying the accent so the lockup reads at small
 * sizes without the mark.
 */
export function BrandLockup({
  className,
  tone = "ink",
}: {
  className?: string;
  tone?: "ink" | "paper";
}) {
  const dark = tone === "paper";
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <BrandMark tone={tone} className="size-9" />
      <span className="flex flex-col leading-none">
        <span
          className={clsx(
            "font-display text-lg font-extrabold uppercase tracking-wide",
            dark ? "text-paper" : "text-ink",
          )}
        >
          Dr Bond
        </span>
        <span
          className={clsx(
            "font-mono text-[10px] uppercase tracking-[0.18em]",
            dark ? "text-navy-300" : "text-ink-soft",
          )}
        >
          Aditya Polymers
        </span>
      </span>
    </span>
  );
}
