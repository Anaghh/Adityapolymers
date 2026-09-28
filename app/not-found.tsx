import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="bg-navy-900 text-white">
      <Container className="py-20 sm:py-28">
        <p className="eyebrow text-cta">404</p>
        <h1 className="mt-2 max-w-2xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          That page is not here.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-navy-100">
          The old adityapolymers.com URLs redirect automatically. If you reached this page from a
          legacy link, write to us and we will route it.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/products" variant="primary" size="lg">
            Browse products
          </ButtonLink>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-white/40 px-6 py-3.5 font-display text-base font-semibold tracking-wide text-white transition-colors hover:border-white/70 hover:bg-white/10"
          >
            Home
          </Link>
        </div>
      </Container>
    </section>
  );
}
