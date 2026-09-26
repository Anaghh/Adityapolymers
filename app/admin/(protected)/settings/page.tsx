import type { Metadata } from "next";
import { clsx } from "clsx";
import { getServiceRoleClient } from "@/lib/supabase";
import { getAdminUser } from "@/lib/supabase/ssr";
import { saveContactSettingsFromForm } from "@/lib/admin";
import content from "@/content/catalog";
import {
  AdminBanner,
  AdminPageHeader,
  ConfigureSupabase,
  Field,
  adminCard,
  adminInput,
} from "@/app/admin/_components/ui";
import { PhonesEditor, type PhoneRow } from "./phones-editor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin settings",
  robots: { index: false, follow: false },
};

type ContactValue = {
  address?: string;
  email?: string | null;
  whatsapp_number?: string;
  phones?: PhoneRow[];
};

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { isAdmin } = await getAdminUser();
  const db = getServiceRoleClient();
  const params = await searchParams;

  if (!isAdmin || !db) return <ConfigureSupabase />;

  const { data } = await db.from("site_settings").select("value").eq("key", "contact").maybeSingle();
  const stored = (data?.value as ContactValue | null) ?? null;

  // Seed values as the starting point until a row exists in the database.
  const initial: ContactValue = {
    address: stored?.address ?? content.SITE.address,
    email: stored?.email ?? content.SITE.email,
    whatsapp_number: stored?.whatsapp_number ?? content.SITE.whatsappNumber,
    phones:
      (stored?.phones as PhoneRow[] | undefined) ??
      (content.SITE.phones as unknown as PhoneRow[]),
  };

  return (
    <div>
      <AdminPageHeader
        title="Contact settings"
        intro="Single source of truth for every phone/address/ISO line on the public site — JSON-LD, footer and the contact page all read this row."
      />

      <AdminBanner error={params.error} saved={params.saved === "1"} />

      {!stored ? (
        <p className={clsx(adminCard, "mb-6 p-4 text-sm text-ink-soft")}>
          No <code className="font-mono text-xs">site_settings.contact</code> row yet — the form below is
          prefilled from the code seed. Saving creates the row.
        </p>
      ) : null}

      <form action={saveContactSettingsFromForm} className={clsx(adminCard, "space-y-6 p-6")}>
        <Field label="Registered address" htmlFor="address">
          <textarea
            id="address"
            name="address"
            rows={3}
            required
            defaultValue={initial.address}
            className={clsx(adminInput, "resize-y")}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp number" htmlFor="whatsapp_number" hint="Digits with country code, e.g. +919373387149">
            <input
              id="whatsapp_number"
              name="whatsapp_number"
              required
              defaultValue={initial.whatsapp_number}
              className={adminInput}
            />
          </Field>
          <Field label="Email" htmlFor="email" hint="Blank removes the email from the public site">
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={initial.email ?? ""}
              className={adminInput}
            />
          </Field>
        </div>

        <div className="space-y-2">
          <p className={clsx("font-display text-xs font-semibold tracking-wide uppercase text-ink-soft", "block")}>
            Phones
          </p>
          <PhonesEditor initialRows={initial.phones ?? []} />
        </div>

        <p className="text-xs text-ink-soft">
          Geo-coordinates and the client sign-off flag on this row are preserved untouched. Saving
          revalidates the whole public site.
        </p>

        <button
          type="submit"
          className="rounded-md bg-navy-900 px-5 py-2.5 font-display text-sm font-semibold tracking-wide text-white transition-colors hover:bg-navy-800"
        >
          Save contact settings
        </button>
      </form>
    </div>
  );
}
