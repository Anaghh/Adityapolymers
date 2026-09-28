import Link from "next/link";
import { clsx } from "clsx";

type Variant = "primary" | "outline" | "ghost" | "whatsapp" | "navy";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-display font-bold uppercase tracking-wide transition-all focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  // Amber conversion action: stamped plate with hard shadow, presses on click.
  primary:
    "rounded-sharp-md bg-cta text-navy-950 shadow-stamp shadow-stamp-amber press press-amber hover:bg-cta-strong focus-visible:outline-cta-strong",
  outline:
    "rounded-sharp-md border-2 border-navy-900 text-navy-900 bg-transparent shadow-stamp-sm press hover:bg-navy-50 focus-visible:outline-navy-900",
  ghost: "text-navy-900 hover:text-navy-700 focus-visible:outline-navy-700",
  whatsapp:
    "rounded-sharp-md bg-success text-white shadow-stamp press hover:brightness-110 focus-visible:outline-success",
  navy: "rounded-sharp-md bg-navy-900 text-white shadow-stamp press hover:bg-navy-800 focus-visible:outline-navy-900",
};

const sizes: Record<Size, string> = {
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

export function buttonClass(variant: Variant, size: Size = "md") {
  return clsx(base, variants[variant], sizes[size]);
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  external,
  children,
  className,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  external?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const cls = buttonClass(variant, size);
  if (external || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("wa.me")) {
    return (
      <a href={href} className={clsx(cls, className)} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={clsx(cls, className)}>
      {children}
    </Link>
  );
}
