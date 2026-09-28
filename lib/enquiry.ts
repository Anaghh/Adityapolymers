import { z } from "zod";

/**
 * Shared RFQ payload schema — the single shape used by the enquiry form
 * (client-side validation) and POST /api/enquiry (server-side gate).
 *
 * Isomorphic by design: no server-only imports here. The `website` field is
 * the honeypot — it must stay empty for humans and is checked by the route
 * handler, not by validation, so bots slip into the silent trap.
 */

export const ENQUIRY_TYPES = ["rfq", "sample", "dealer"] as const;

/** Digits, spaces and the separators used when people type phone numbers. */
const PHONE_PATTERN = /^[0-9+()\- ]+$/;

export const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please tell us your name.")
    .max(100, "Name must be 100 characters or fewer."),
  email: z
    .string()
    .trim()
    .min(1, "We need an email address to reply.")
    .max(254, "Email must be 254 characters or fewer.")
    .email("That email address does not look right."),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number should be at least 7 characters.")
    .max(25, "Phone number should be 25 characters or fewer.")
    .regex(PHONE_PATTERN, "Use digits, spaces and the + ( ) - separators only."),
  company: z.string().trim().max(120, "Company must be 120 characters or fewer.").optional(),
  country: z.string().trim().max(80, "Country must be 80 characters or fewer.").optional(),
  productId: z.string().trim().max(100, "Pick a product from the list.").optional(),
  enquiryType: z.enum(ENQUIRY_TYPES).default("rfq"),
  message: z.string().trim().max(5000, "Message must be 5000 characters or fewer.").optional(),
  quantityNote: z.string().trim().max(200, "Quantity note must be 200 characters or fewer.").optional(),
  /** Honeypot — empty for humans; the route handler silently accepts spam here. */
  website: z.string().max(200).optional(),
  sourcePage: z.string().max(200).optional(),
  utm: z.record(z.string(), z.string()).optional(),
}).superRefine((val, ctx) => {
  if (!val.message?.trim() && !val.productId) {
    ctx.addIssue({
      code: "custom",
      path: ["message"],
      message: "Describe your requirement or pick a product so we can quote accurately.",
    });
  }
});

export type EnquiryPayload = z.infer<typeof enquirySchema>;

/** Flatten a ZodError into `{ field: message }` — first issue wins per field. */
export function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : "";
    if (key && !(key in out)) out[key] = issue.message;
  }
  return out;
}

const TYPE_LABELS: Record<EnquiryPayload["enquiryType"], string> = {
  rfq: "Quotation",
  sample: "Sample request",
  dealer: "Dealership",
};

/** Human label for an enquiry type ("rfq" -> "Quotation"). */
export function enquiryTypeLabel(type: EnquiryPayload["enquiryType"]): string {
  return TYPE_LABELS[type] ?? "Quotation";
}
