-- Aditya Polymers — core schema (migration 0001)
-- Public read via RLS on catalog tables; admin writes via admin_users role.
-- The Next server reads with the anon key; the service-role key is used only
-- inside server-only route handlers.

-- Extensions first: the trigram index below needs gin_trgm_ops.
-- pg_trgm may already be installed on the project (Dashboard toggle or an
-- earlier partial run) in `public` OR `extensions`. `create extension if not
-- exists ... with schema extensions` is not enough on its own: when the
-- extension already lives elsewhere the statement no-ops successfully and the
-- schema-qualified `extensions.gin_trgm_ops` reference in the index then
-- fails with 42704. Install only when missing; the index resolves the
-- schema that actually holds the extension (see products_sku_trgm_idx).
do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_trgm') then
    if exists (select 1 from pg_namespace where nspname = 'extensions') then
      create extension pg_trgm with schema extensions;
    else
      create extension pg_trgm;
    end if;
  end if;
end
$$;

create type enquiry_type as enum ('rfq', 'sample', 'dealer');
create type enquiry_status as enum ('new', 'contacted', 'quoted', 'won', 'lost', 'spam');
create type download_kind as enum ('tds', 'sds', 'brochure');
create type location_scope as enum ('india_city', 'country', 'region');
create type admin_role as enum ('owner', 'editor');

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  parent_id uuid references categories(id) on delete set null,
  name text not null,
  short_name text not null,
  description text not null default '',
  hero_image text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index categories_parent_idx on categories(parent_id);

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete restrict,
  slug text not null unique,
  sku text not null,
  name text not null,
  brand text not null default 'Dr Bond',
  short_description text not null default '',
  description text not null default '',
  applications text not null default '',
  specs jsonb not null default '{}'::jsonb,
  pack_sizes text[] not null default '{}',
  is_featured boolean not null default false,
  is_retail_pack boolean not null default false,
  is_active boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on products(category_id);

-- Weighted full-text search (name/sku > applications/short_description > description)
alter table products
  add column search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(sku, '')), 'A')
    || setweight(to_tsvector('english', coalesce(applications, '') || ' ' || coalesce(short_description, '')), 'B')
    || setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) stored;
create index products_search_idx on products using gin(search_vector);
-- gin_trgm_ops lives in whichever schema actually holds pg_trgm
-- (`extensions` on Supabase, `public` on vanilla Postgres) — resolve it
-- dynamically so index creation never fails with "operator class
-- gin_trgm_ops does not exist" (42704).
do $$
declare
  trgm_schema text;
begin
  select n.nspname into trgm_schema
  from pg_extension e
  join pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'pg_trgm';

  if trgm_schema is null then
    raise exception 'pg_trgm is not installed — cannot create products_sku_trgm_idx';
  end if;

  execute format(
    'create index if not exists products_sku_trgm_idx on products using gin (sku %I.gin_trgm_ops)',
    trgm_schema
  );
end
$$;

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null,
  alt text not null default '',
  sort_order int not null default 0,
  is_primary boolean not null default false
);
create index product_images_product_idx on product_images(product_id);

create table industries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  summary text not null default '',
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table product_industries (
  product_id uuid not null references products(id) on delete cascade,
  industry_id uuid not null references industries(id) on delete cascade,
  primary key (product_id, industry_id)
);

create table locations_served (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  scope location_scope not null,
  region text not null default '',
  is_primary boolean not null default false,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  number text,
  scope text,
  issuing_body text,
  valid_from date,
  valid_until date,
  file_path text,
  is_current boolean not null default true
);

-- ---------------------------------------------------------------------------
-- Downloads (TDS/SDS/brochure) + lead capture
-- ---------------------------------------------------------------------------

create table downloads (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  kind download_kind not null,
  title text not null,
  version text not null default '1.0',
  file_path text not null,
  file_size bigint,
  published_at timestamptz not null default now(),
  is_active boolean not null default true
);
create index downloads_product_idx on downloads(product_id);

create table download_events (
  id uuid primary key default gen_random_uuid(),
  download_id uuid not null references downloads(id) on delete cascade,
  email text,
  ip_hash text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Enquiries (leads)
-- ---------------------------------------------------------------------------

create table enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  company text,
  country text,
  product_id uuid references products(id) on delete set null,
  enquiry_type enquiry_type not null default 'rfq',
  message text not null default '',
  quantity_note text,
  source_page text,
  utm jsonb not null default '{}'::jsonb,
  status enquiry_status not null default 'new',
  internal_notes text not null default '',
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index enquiries_status_idx on enquiries(status, created_at desc);

create table inquiry_items (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references enquiries(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  quantity text,
  unit text,
  note text
);

-- ---------------------------------------------------------------------------
-- Content: testimonials, news, plants, settings
-- ---------------------------------------------------------------------------

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  company text,
  location text,
  content text not null,
  rating int check (rating between 1 and 5),
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  cover_image text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table plants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  street_address text not null default '',
  area text not null default '',
  geo numeric[] ,
  unit text,
  capacity_mtpa int,
  detail text not null default '',
  sort_order int not null default 0
);

create table site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Admin users (1:1 with auth.users)
-- ---------------------------------------------------------------------------

create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role admin_role not null default 'editor'
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table industries enable row level security;
alter table product_industries enable row level security;
alter table locations_served enable row level security;
alter table certifications enable row level security;
alter table downloads enable row level security;
alter table download_events enable row level security;
alter table enquiries enable row level security;
alter table inquiry_items enable row level security;
alter table testimonials enable row level security;
alter table news_posts enable row level security;
alter table plants enable row level security;
alter table site_settings enable row level security;
alter table admin_users enable row level security;

-- Admin predicate: caller must have an admin_users row.
create function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from admin_users where id = auth.uid());
$$;

-- Public read of active/approved/published rows
create policy "public read categories" on categories for select using (is_active);
create policy "public read products" on products for select using (is_active);
create policy "public read product_images" on product_images for select using (true);
create policy "public read industries" on industries for select using (is_active);
create policy "public read product_industries" on product_industries for select using (true);
create policy "public read locations" on locations_served for select using (is_active);
create policy "public read certifications" on certifications for select using (true);
create policy "public read downloads" on downloads for select using (is_active);
create policy "public read testimonials" on testimonials for select using (is_approved);
create policy "public read news" on news_posts for select using (is_published);
create policy "public read plants" on plants for select using (true);
create policy "public read settings" on site_settings for select using (true);

-- Anon insert-only for leads
create policy "anon insert enquiries" on enquiries for insert to anon, authenticated with check (true);
create policy "anon insert inquiry_items" on inquiry_items for insert to anon, authenticated with check (true);
create policy "anon insert download_events" on download_events for insert to anon, authenticated with check (true);

-- Admin full access
create policy "admin all categories" on categories for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all products" on products for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all product_images" on product_images for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all industries" on industries for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all product_industries" on product_industries for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all locations" on locations_served for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all certifications" on certifications for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all downloads" on downloads for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all download_events" on download_events for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all enquiries" on enquiries for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all inquiry_items" on inquiry_items for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all testimonials" on testimonials for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all news" on news_posts for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all plants" on plants for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all settings" on site_settings for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin read admin_users" on admin_users for select to authenticated using (true);

-- Keep updated_at fresh
create or replace function touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger categories_touch before update on categories for each row execute function touch_updated_at();
create trigger products_touch before update on products for each row execute function touch_updated_at();

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('documents', 'documents', true)
  on conflict (id) do nothing;

-- Public read of image objects, but no bucket listing
create policy "public read product images" on storage.objects for select
  using (bucket_id = 'product-images');
create policy "public read documents" on storage.objects for select
  using (bucket_id = 'documents');

-- Admin write, scoped to admin_users via JWT sub
create policy "admin write product-images" on storage.objects for all to authenticated
  using (bucket_id = 'product-images' and is_admin())
  with check (bucket_id = 'product-images' and is_admin());
create policy "admin write documents" on storage.objects for all to authenticated
  using (bucket_id = 'documents' and is_admin())
  with check (bucket_id = 'documents' and is_admin());

-- ---------------------------------------------------------------------------
-- Search RPC (websearch syntax + trigram fuzzy fallback)
-- ---------------------------------------------------------------------------

create or replace function search_products(q text, max_rows int default 20)
returns table (
  id uuid, slug text, sku text, name text, brand text,
  short_description text, applications text, rank real
)
language sql stable set search_path = 'public', 'extensions' as $$
  select p.id, p.slug, p.sku, p.name, p.brand, p.short_description, p.applications,
         ts_rank(p.search_vector, websearch_to_tsquery('english', q)) as rank
  from products p
  where p.is_active
    and p.search_vector @@ websearch_to_tsquery('english', q)
  union all
  select p.id, p.slug, p.sku, p.name, p.brand, p.short_description, p.applications, 0
  from products p
  where p.is_active and similarity(p.sku, q) > 0.3
    and not exists (
      select 1 from products p2
      where p2.id = p.id and p2.search_vector @@ websearch_to_tsquery('english', q)
    )
  order by rank desc
  limit max_rows;
$$;
