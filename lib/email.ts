import { Resend } from "resend";
import { enquiryTypeLabel, type EnquiryPayload } from "@/lib/enquiry";

/**
 * Enquiry email notification — notification-only by design: the Supabase
 * `enquiries` row is the system of record, so a failed or unconfigured send
 * is logged and swallowed, never thrown into the lead pipeline.
 */

const FROM = process.env.ENQUIRY_FROM_EMAIL ?? "Aditya Polymers <notifications@resend.dev>";

export type EnquiryEmailData = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  country?: string;
  enquiryType: EnquiryPayload["enquiryType"];
  productLabel?: string;
  quantityNote?: string;
  message?: string;
  sourcePage?: string;
};

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function row(label: string, value?: string): string {
  if (!value?.trim()) return "";
  return `<tr><td style="padding:4px 12px 4px 0;color:#666;font-size:13px">${escapeHtml(label)}</td><td style="padding:4px 0;font-size:14px">${escapeHtml(value)}</td></tr>`;
}

export function enquiryEmailHtml(data: EnquiryEmailData): string {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif">
<table style="border-collapse:collapse;max-width:560px">
  <tr><td colspan="2" style="padding:0 0 12px;font-size:16px;font-weight:bold">
    New ${escapeHtml(enquiryTypeLabel(data.enquiryType))} — Aditya Polymers website
  </td></tr>
  ${row("Name", data.name)}
  ${row("Email", data.email)}
  ${row("Phone", data.phone)}
  ${row("Company", data.company)}
  ${row("Country", data.country)}
  ${row("Product", data.productLabel)}
  ${row("Quantity / pack size", data.quantityNote)}
  ${row("Message", data.message)}
  ${row("Source page", data.sourcePage)}
</table>
</body></html>`;
}

/** Fire-and-forget: resolves quietly when email is not configured. */
export async function sendEnquiryNotification(data: EnquiryEmailData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_NOTIFY_EMAIL;
  if (!apiKey || !to) return;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: FROM,
      to,
      replyTo: data.email,
      subject: `[${enquiryTypeLabel(data.enquiryType)}] ${data.name}${data.company ? ` — ${data.company}` : ""}`,
      html: enquiryEmailHtml(data),
    });
  } catch (error) {
    // The DB row already exists — never let notification failures drop a lead.
    console.error("[email] enquiry notification failed:", error);
  }
}
