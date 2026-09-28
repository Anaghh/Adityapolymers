"use client";

import { useEffect, useRef, useState } from "react";
import { enquirySchema, fieldErrorsOf, ENQUIRY_TYPES } from "@/lib/enquiry";

type ProductOption = { slug: string; name: string };

type Status = "idle" | "submitting" | "success" | "error";

declare global {
  interface Window {
    turnstile?: {
      render: (el: string | HTMLElement, opts: Record<string, unknown>) => string;
      getResponse: (id?: string) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

const FIELD =
  "w-full rounded-md border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-200";

const UTM_KEY = "ap_utm";

/** utm_* params from the URL, persisted for the session (landing → form hops). */
function readUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const fresh: Record<string, string> = {};
    for (const [key, value] of params) {
      if (key.startsWith("utm_") && value) fresh[key] = value;
    }
    if (Object.keys(fresh).length > 0) {
      sessionStorage.setItem(UTM_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return JSON.parse(sessionStorage.getItem(UTM_KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-red-700" role="alert">
      {message}
    </p>
  );
}

export function EnquiryForm({
  products,
  defaultProduct,
}: {
  products: ProductOption[];
  defaultProduct?: string;
}) {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const widgetRef = useRef<string | undefined>(undefined);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formMessage, setFormMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!turnstileSiteKey) return;
    const render = () => {
      const box = document.getElementById("turnstile-box");
      if (!box || widgetRef.current !== undefined || !window.turnstile) return;
      widgetRef.current = window.turnstile.render(box, { sitekey: turnstileSiteKey, theme: "light" });
    };
    if (window.turnstile) {
      render();
    } else {
      window.onTurnstileLoad = render;
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
      script.async = true;
      document.head.appendChild(script);
    }
    return () => {
      try {
        if (widgetRef.current !== undefined) window.turnstile?.remove(widgetRef.current);
      } catch {
        // widget already gone
      }
      widgetRef.current = undefined;
      window.onTurnstileLoad = undefined;
    };
  }, [turnstileSiteKey]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage(null);

    const form = event.currentTarget;
    const fd = new FormData(form);
    const get = (key: string) => String(fd.get(key) ?? "").trim();

    const payload = {
      name: get("name"),
      email: get("email"),
      phone: get("phone"),
      company: get("company") || undefined,
      country: get("country") || undefined,
      productId: get("productId") || undefined,
      enquiryType: get("enquiryType") || "rfq",
      quantityNote: get("quantityNote") || undefined,
      message: get("message") || undefined,
      website: get("website") || undefined,
      turnstileToken:
        turnstileSiteKey && widgetRef.current !== undefined
          ? window.turnstile?.getResponse(widgetRef.current) || undefined
          : undefined,
      sourcePage: typeof window !== "undefined" ? window.location.pathname : undefined,
      utm: readUtm(),
    };

    const clientCheck = enquirySchema.safeParse(payload);
    if (!clientCheck.success) {
      setErrors(fieldErrorsOf(clientCheck.error));
      return;
    }
    setErrors({});
    setStatus("submitting");

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        code?: string;
        errors?: Record<string, string>;
      };

      if (res.ok && json.ok) {
        setStatus("success");
        form.reset();
        window.turnstile?.reset(widgetRef.current);
        return;
      }
      if (json.errors) setErrors(json.errors);
      setFormMessage(
        json.code === "not_configured"
          ? "The enquiry desk is not connected yet — please call or WhatsApp us instead."
          : json.code === "rate_limited"
            ? "Too many submissions from this connection. Please try again in a few minutes."
            : json.code === "captcha_failed"
              ? "Please complete the human verification and submit again."
              : res.ok
                ? null
                : "The enquiry could not be sent. Please call or WhatsApp us instead.",
      );
      setStatus("error");
    } catch {
      setFormMessage("The enquiry could not be sent. Please call or WhatsApp us instead.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-line bg-white p-8 sm:p-10" role="status">
        <p className="eyebrow text-navy-600">ENQUIRY RECEIVED</p>
        <h3 className="mt-2 font-display text-2xl font-bold text-navy-950">
          Thank you — your requirement is with our sales desk.
        </h3>
        <p className="mt-3 text-ink-soft">
          We reply to quotations and sample requests on working days. If it is urgent, WhatsApp is
          the fastest route.
        </p>
        <button
          type="button"
          className="mt-6 text-sm font-semibold text-navy-700 hover:underline"
          onClick={() => setStatus("idle")}
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-lg border border-line bg-white p-6 sm:p-8">
      {/* Honeypot — visually hidden, ignored by humans */}
      <div className="absolute -left-[9999px] top-auto size-px overflow-hidden" aria-hidden>
        <label htmlFor="website">Leave this field empty</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-ink">
            Your name <span className="text-cta-strong">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={FIELD}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          <FieldError id="name-error" message={errors.name} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-ink">
            Email <span className="text-cta-strong">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={FIELD}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          <FieldError id="email-error" message={errors.email} />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-ink">
            Phone <span className="text-cta-strong">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            className={FIELD}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
          <FieldError id="phone-error" message={errors.phone} />
        </div>
        <div>
          <label htmlFor="company" className="mb-1.5 block text-sm font-semibold text-ink">
            Company
          </label>
          <input id="company" name="company" type="text" autoComplete="organization" className={FIELD} />
        </div>
        <div>
          <label htmlFor="enquiryType" className="mb-1.5 block text-sm font-semibold text-ink">
            Enquiry type
          </label>
          <select id="enquiryType" name="enquiryType" defaultValue="rfq" className={FIELD}>
            {ENQUIRY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === "rfq" ? "Quotation" : type === "sample" ? "Sample request" : "Dealership"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="productId" className="mb-1.5 block text-sm font-semibold text-ink">
            Product
          </label>
          <select id="productId" name="productId" defaultValue={defaultProduct ?? ""} className={FIELD}>
            <option value="">Not sure yet — describe below</option>
            {products.map((product) => (
              <option key={product.slug} value={product.slug}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="quantityNote" className="mb-1.5 block text-sm font-semibold text-ink">
            Quantity / pack size
          </label>
          <input
            id="quantityNote"
            name="quantityNote"
            type="text"
            placeholder="e.g. 500 kg in 35 kg drums"
            className={FIELD}
          />
        </div>
        <div>
          <label htmlFor="country" className="mb-1.5 block text-sm font-semibold text-ink">
            Country
          </label>
          <input id="country" name="country" type="text" autoComplete="country-name" className={FIELD} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-ink">
            Requirement details <span className="text-cta-strong">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            placeholder="Substrate, line speed, application — the more specific, the more accurate the quote."
            className={FIELD}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "message-error" : undefined}
          />
          <FieldError id="message-error" message={errors.message} />
        </div>
      </div>

      {formMessage ? (
        <p className="mt-5 rounded-md bg-paper px-4 py-3 text-sm text-ink" role="alert">
          {formMessage}
        </p>
      ) : null}

      {turnstileSiteKey ? (
        <div className="mt-6">
          <div id="turnstile-box" />
          <FieldError id="turnstile-error" message={errors.turnstileToken} />
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-ink-soft">
          By submitting, you agree that we may use these details to respond to your enquiry — see
          our privacy notice.
        </p>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-cta px-6 py-3 font-display text-sm font-semibold tracking-wide text-navy-950 transition-colors hover:bg-cta-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta-strong disabled:pointer-events-none disabled:opacity-60"
        >
          {status === "submitting" ? "Sending…" : "Send enquiry"}
        </button>
      </div>
    </form>
  );
}
