import Link from "next/link";
import { clsx } from "clsx";

type Variant = "primary" | "outline" | "ghost" | "whatsapp" | "navy";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-display font-semibold tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  // Amber — reserved exclusively for conversion actions.
  primary:
    "bg-cta text-navy-950 hover:bg-cta-strong focus-visible:outline-cta-strong",
  outline:
    "border border-navy-300 text-navy-900 bg-white/0 hover:bg-navy-50 focus-visible:outline-navy-700",
  ghost: "text-navy-900 hover:text-navy-700 focus-visible:outline-navy-700",
  whatsapp:
    "bg-success text-white hover:bg-[#256a41] focus-visible:outline-success",
  navy: "bg-navy-900 text-white hover:bg-navy-800 focus-visible:outline-navy-900",
};

const sizes: Record<Size, string> = {
  md: "px-4 py-2.5 text-sm rounded-md",
  lg: "px-6 py-3.5 text-base rounded-md",
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
