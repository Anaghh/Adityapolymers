# Aditya Polymers — website

Next.js 16 (App Router, TS, Tailwind v4) on Vercel · Supabase (Postgres + RLS, Auth, Storage).
Rebuild of adityapolymers.com — audit of the legacy static site lives in `.ap_audit/`.

## Commands

```bash
npm run dev        # http://localhost:3000
npm run build      # must pass clean before any commit
npm run lint
npx tsc --noEmit
```

Local dev needs **no Supabase credentials**: `lib/data.ts` falls back to
`content/catalog.ts` when `NEXT_PUBLIC_SUPABASE_URL` is unset. Admin/API routes
return 503/empty-states instead of crashing. Copy `.env.example` → `.env.local`
when wiring the real project.

## Architecture rules

- **Design system**: navy `#0F2B46` primary; amber `#F2A81D` is reserved
  exclusively for conversion actions (Get a Quote / Download TDS / WhatsApp).
  Tokens live in `app/globals.css` `@theme`. Fonts: IBM Plex Sans (body),
  Archivo (display), IBM Plex Mono (figures/specs).
- **One `<h1>` per page.** Every page exports unique `metadata` and
  `export const revalidate = 3600` (ISR).
- **Data**: components read through `lib/data.ts` (tagged `unstable_cache`;
  tags: catalog, categories, products, industries, locations, site-settings,
  plants, testimonials, news). Never query Supabase directly in components.
- **Specs are never invented.** `null` spec fields render "On request" until
  client TDS documents verify them (see SpecTable).
- **Admin** (`app/admin/(protected)/**`): auth via `lib/supabase/ssr.ts`
  (cookie client); every server action re-verifies the `admin_users` row and
  uses `getServiceRoleClient()` (server-only, throws on client).
- **Site settings** (`site_settings.key='contact'`) are the single source of
  truth for phones/address/WhatsApp — JSON-LD, footer, and contact page read
  them; edit via the admin Settings screen only.
- **Contact numbers carry `verified` flags** — the legacy site shipped wrong
  `tel:` links; nothing unverified gets used as a canonical number without
  client sign-off.

## Legacy URL migration

Legacy `.html`/`.php` URLs 301 via `next.config.ts` redirects (page-level).
Legacy *anchor* fragments (`#packagingadhesives`…) never reach servers —
`components/catalog/hash-shim.tsx` on `/products` handles them client-side.
`/readme.html` (hijacked spam page) serves **410** from
`app/readme.html/route.ts` — keep it out of the redirects array.

## Supabase migrations

Schema + RLS + storage buckets: `supabase/migrations/0001_schema.sql`;
seed: `0002_seed.sql` (mirrors `content/catalog.ts`). Apply with
`npx supabase db push` or paste into the SQL editor in order.
