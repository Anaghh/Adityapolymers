import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { getNav, getSiteSettings } from "@/lib/data";

/** Public shell: sticky conversion header, footer with verified NAP, WhatsApp float. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [{ categories }, settings] = await Promise.all([getNav(), getSiteSettings()]);
  const verifiedPhone = settings.phones.find((p) => p.verified) ?? settings.phones[0];
  const whatsappHref = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello Aditya Polymers, I need a quotation for ")}`;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        categories={categories.map((c) => ({ slug: c.slug, name: c.name, shortName: c.shortName }))}
        phone={{ display: verifiedPhone.display, value: verifiedPhone.value }}
        whatsappHref={whatsappHref}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter address={settings.address} phones={settings.phones} email={settings.email} />
      <WhatsAppFloat href={whatsappHref} />
    </div>
  );
}
