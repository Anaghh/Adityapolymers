# Aditya Polymers — website

Modern rebuild of [adityapolymers.com](https://www.adityapolymers.com) — an ISO-certified industrial
adhesive manufacturer in Chinchwad, Pune (Dr Bond brand). Next.js 16 · Vercel · Supabase.

## Local development

```bash
npm install
npm run dev          # http://localhost:3000  (works without any credentials)
```

The site renders from `content/catalog.ts` (audited seed data) until Supabase is connected.

## Setup: Supabase

1. Create a project at [database.new](https://database.new) (or supabase.com) — region close to
   India (Singapore/Mumbai) recommended.
2. **Run the migrations** — SQL Editor, paste in order:
   - `supabase/migrations/0001_schema.sql` (tables, RLS, storage buckets, search RPC)
   - `supabase/migrations/0002_seed.sql` (catalog seed: 7 categories, 19 grades, locations, plants, settings)
3. **Create the first admin**: Authentication → Users → *Invite user* (email + password),
   then SQL editor:
   ```sql
   insert into admin_users (id, display_name, role)
   values ('<auth-user-uuid>', 'Owner', 'owner');
   ```
4. **Storage**: buckets `product-images` and `documents` are created by the migration.
5. Copy `NEXT_PUBLIC_SUPABASE_URL` + keys from Project Settings → API into `.env.local`
   (see `.env.example` for the full list).

## Setup: Vercel

Follow these steps to create a Vercel deployment. The site can deploy without connecting
Supabase; in that case it shows the audited catalog in `content/catalog.ts`, while admin and
database-backed features stay unavailable.

1. **Push the project to GitHub.** Create or use the repository `Anaghh/Adityapolymers` and
   push the branch you want to deploy (the production branch is `main`). Do not commit
   `.env.local`; environment files are ignored by Git.
2. **Import the repository into Vercel.** Sign in at [vercel.com/new](https://vercel.com/new),
   choose **Continue with GitHub**, authorize Vercel if prompted, then select
   `Anaghh/Adityapolymers`. Keep the detected Next.js settings and click **Deploy**. Vercel
   installs from `package-lock.json` and uses `npm run build`.
3. **Add environment variables.** In the Vercel project, open **Settings → Environment
   Variables**. Add the variables listed below from `.env.example`, selecting the environments
   where each should be available. Paste actual values from the relevant service dashboards;
   do not paste the blank example values. Redeploy after changing variables so the deployment
   picks them up.

   | Variable | Needed when | Vercel environments |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Connecting the site to Supabase | Production, Preview |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Connecting the site to Supabase | Production, Preview |
   | `SUPABASE_SERVICE_ROLE_KEY` | Admin/API server operations | Production; Preview if testing admin |
   | `RESEND_API_KEY` | Sending enquiry email | Production; Preview if testing forms |
   | `ENQUIRY_NOTIFY_EMAIL` | Recipient inbox for enquiry notifications | Production; Preview if testing forms |
   | `SUPABASE_REVALIDATION_SECRET` | Securing the Supabase revalidation webhook | Production; Preview if configuring a preview webhook |
   | `NEXT_PUBLIC_SITE_URL` | Canonical site URL and metadata | Production: `https://www.adityapolymers.com`; Preview: that deployment's URL |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp contact link | Production, Preview |
   | `NEXT_PUBLIC_GA4_ID` | Google Analytics (optional) | Production; Preview if analytics is desired there |

   Values beginning with `NEXT_PUBLIC_` are included in browser code. Never use that prefix
   for a secret. Keep `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and
   `SUPABASE_REVALIDATION_SECRET` server-only. For a first deploy without integrations, you
   can skip the integration variables; the fallback catalog still renders.
4. **Check the deployment.** Open the URL Vercel gives the project and confirm the home page
   and catalog load. To publish database-backed content or use admin, first finish
   [Setup: Supabase](#setup-supabase), then set the Supabase variables above and redeploy.
5. **Connect the domain.** In **Settings → Domains**, add `www.adityapolymers.com` and the
   apex domain `adityapolymers.com`. Follow the DNS records Vercel displays at your DNS
   provider, and set the apex domain to redirect to `www`. DNS is currently managed by the
   incumbent vendor (Maharashtra Industries Directory / GID hosting), so arrange access before
   cutover. Wait for Vercel to verify both domains and issue HTTPS. Set
   `NEXT_PUBLIC_SITE_URL=https://www.adityapolymers.com` for Production and redeploy.
6. **Enable instant content updates (optional).** In Supabase, create Database Webhooks for
   the relevant `products`, `categories`, and `testimonials` writes, targeting
   `POST https://www.adityapolymers.com/api/revalidate`. Include the header
   `x-revalidation-secret` with the same value as `SUPABASE_REVALIDATION_SECRET` in Vercel.
   Configure the webhook only after the domain and secret are in place.

Third-party services used by the full production setup: **Supabase** (database and auth),
**Resend** (enquiry notifications; verify the sending domain's SPF/DKIM), and optionally
**Google Analytics 4**. Form abuse is handled without a third-party service: a honeypot field
filters bots, and junk leads are triaged to the spam status in the admin.

Third-party free tiers used: **Resend** (email notifications — verify SPF/DKIM for the domain).

## Launch checklist (client sign-offs)

- [ ] Current ISO certificate (verify **9001:2015**; number, scope, expiry) — never republish the 2008 claim
- [ ] One reconciled phone set (legacy site had conflicting numbers; see site_settings)
- [ ] One published email address (monitored inbox)
- [ ] Real factory/product photography (typographic placeholders are used until then)
- [ ] Permission for client logos / testimonials
- [ ] DNS/registrar control + lowered TTLs before cutover
- [ ] Google Search Console + Bing re-verification; GBP refresh; `readme.html` removal request

## Legacy redirects

All legacy `.html`/`.php` URLs 301 to the new routes (`next.config.ts`). The hijacked
`/readme.html` returns **410 Gone**.
