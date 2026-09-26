"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { adminInput, adminLabel } from "@/app/admin/_components/ui";

export type PhoneRow = {
  value: string;
  display: string;
  label: string;
  verified: boolean;
};

type EditorRow = PhoneRow & { key: string };

let keySeed = 0;
function rowKey(): string {
  keySeed += 1;
  return `row-${keySeed}`;
}

/**
 * Repeatable phone mini-editor. Rows render parallel arrays of named inputs
 * (phone_value / phone_display / phone_label / phone_verified); the server
 * action rebuilds phones[] from them in row order. Each row keeps a hidden
 * "off" before the checkbox so unchecked rows still stay aligned.
 */
export function PhonesEditor({ initialRows }: { initialRows: PhoneRow[] }) {
  const [rows, setRows] = useState<EditorRow[]>(() =>
    initialRows.map((row) => ({ ...row, key: rowKey() })),
  );

  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <fieldset key={row.key} className="rounded-md border border-line bg-paper/60 p-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-semibold tracking-wide uppercase text-ink-soft">
              Phone {i + 1}
            </span>
            <button
              type="button"
              onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
              className="inline-flex items-center gap-1 text-xs font-semibold text-danger hover:underline"
              aria-label={`Remove phone ${i + 1}`}
            >
              <X aria-hidden className="size-3.5" /> Remove
            </button>
          </div>

          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <label className={adminLabel} htmlFor={`phone-value-${i}`}>
                Value (tel:)
              </label>
              <input
                id={`phone-value-${i}`}
                name="phone_value"
                defaultValue={row.value}
                required
                className={adminInput}
                placeholder="+912066114227"
              />
            </div>
            <div className="space-y-1">
              <label className={adminLabel} htmlFor={`phone-display-${i}`}>
                Display
              </label>
              <input
                id={`phone-display-${i}`}
                name="phone_display"
                defaultValue={row.display}
                required
                className={adminInput}
                placeholder="+91 20 6611 4227"
              />
            </div>
            <div className="space-y-1">
              <label className={adminLabel} htmlFor={`phone-label-${i}`}>
                Label
              </label>
              <input
                id={`phone-label-${i}`}
                name="phone_label"
                defaultValue={row.label}
                required
                className={adminInput}
                placeholder="Office"
              />
            </div>
          </div>

          <label className="mt-2 flex items-center gap-2 text-sm text-ink" htmlFor={`phone-verified-${i}`}>
            <input type="hidden" name="phone_verified" value="off" />
            <input
              id={`phone-verified-${i}`}
              type="checkbox"
              name="phone_verified"
              value="on"
              defaultChecked={row.verified}
              className="size-4 rounded border-navy-300 accent-navy-900"
            />
            Verified — client sign-off on file (unverified numbers never become canonical)
          </label>
        </fieldset>
      ))}

      <button
        type="button"
        onClick={() =>
          setRows((prev) => [
            ...prev,
            { value: "", display: "", label: "", verified: false, key: rowKey() },
          ])
        }
        className="inline-flex items-center gap-1.5 rounded-md border border-navy-200 px-3 py-2 font-display text-xs font-semibold tracking-wide text-navy-900 transition-colors hover:bg-navy-50"
      >
        <Plus aria-hidden className="size-4" /> Add phone
      </button>
    </div>
  );
}
