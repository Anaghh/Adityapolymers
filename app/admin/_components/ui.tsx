import Link from "next/link";
import { clsx } from "clsx";
import { AlertTriangle, CheckCircle2, DatabaseZap } from "lucide-react";

/**
 * Small shared admin UI: form controls, status chips, banners and the
 * "Configure Supabase" empty-state. Industrial navy, datasheet-style —
 * amber stays reserved for conversion actions on the public site.
 */

export const adminInput =
  "w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm text-ink shadow-none outline-none placeholder:text-ink-soft/70 focus:border-navy-600 focus-visible:outline-navy-600";
export const adminLabel = "block font-display text-xs font-semibold tracking-wide uppercase text-ink-soft";
export const adminCard = "rounded-lg border border-line bg-white";

export function Field({
  label,
  htmlFor,
  children,
  hint,
  className,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={clsx("space-y-1.5", className)}>
      <label className={adminLabel} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}

export function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 rounded border-navy-300 accent-navy-900"
      />
      {label}
    </label>
  );
}

const STATUS_CHIP: Record<string, string> = {
  new: "bg-cta-soft text-[#7c5300] border-cta/40",
  contacted: "bg-navy-50 text-navy-800 border-navy-200",
  quoted: "bg-navy-100 text-navy-900 border-navy-300",
  won: "bg-success/10 text-success border-success/30",
  lost: "bg-line/50 text-ink-soft border-line",
  spam: "bg-line/50 text-ink-soft border-line",
  rfq: "bg-navy-50 text-navy-800 border-navy-200",
  sample: "bg-navy-50 text-navy-800 border-navy-200",
  dealer: "bg-navy-50 text-navy-800 border-navy-200",
};

export function StatusChip({ status }: { status: string }) {
  const tone = STATUS_CHIP[status] ?? "bg-navy-50 text-navy-800 border-navy-200";
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-display text-xs font-semibold tracking-wide uppercase",
        tone,
      )}
    >
      {status}
    </span>
  );
}

export function AdminBanner({ error, saved }: { error?: string; saved?: boolean }) {
  if (error) {
    return (
      <p
        role="alert"
        className={clsx(
          "mb-4 flex items-start gap-2 rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger",
        )}
      >
        <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
        {error}
      </p>
    );
  }
  if (saved) {
    return (
      <p
        role="status"
        className="mb-4 flex items-start gap-2 rounded-md border border-success/30 bg-success/5 px-4 py-3 text-sm text-success"
      >
        <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0" />
        Saved.
      </p>
    );
  }
  return null;
}

export function ConfigureSupabase() {
  return (
    <div className={clsx(adminCard, "flex flex-col items-start gap-3 p-6")}>
      <div className="flex items-center gap-2 text-navy-900">
        <DatabaseZap aria-hidden className="size-5" />
        <h2 className="font-display text-lg font-bold">Configure Supabase</h2>
      </div>
      <p className="max-w-prose text-sm text-ink-soft">
        This deployment has no Supabase credentials, so admin data is unavailable. Copy
        <code className="mx-1 rounded bg-paper px-1.5 py-0.5 font-mono text-xs">.env.example</code>
        to
        <code className="mx-1 rounded bg-paper px-1.5 py-0.5 font-mono text-xs">.env.local</code>
        and set
        <code className="mx-1 rounded bg-paper px-1.5 py-0.5 font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code>,
        <code className="mx-1 rounded bg-paper px-1.5 py-0.5 font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
        and the service-role key, then redeploy.
      </p>
    </div>
  );
}

export function AdminPageHeader({
  title,
  intro,
  actions,
}: {
  title: string;
  intro?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow text-ink-soft">Admin</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
          {title}
        </h1>
        {intro ? <p className="mt-1 max-w-prose text-sm text-ink-soft">{intro}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}

export function AdminLink({
  href,
  children,
  subtle,
}: {
  href: string;
  children: React.ReactNode;
  subtle?: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "font-display text-sm font-semibold tracking-wide underline-offset-4 hover:underline",
        subtle ? "text-ink-soft" : "text-navy-700",
      )}
    >
      {children}
    </Link>
  );
}

export function formatBytes(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
