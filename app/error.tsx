"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[60vh] items-center bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <p className="eyebrow text-navy-600">SOMETHING WENT WRONG</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
          This page hit an error.
        </h1>
        <p className="mt-4 max-w-xl text-ink-soft">
          Try again — if it keeps failing, the sales desk is reachable on phone or WhatsApp.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-md bg-navy-900 px-6 py-3.5 font-display text-base font-semibold tracking-wide text-white transition-colors hover:bg-navy-800"
        >
          Try again
        </button>
      </div>
    </section>
  );
}
