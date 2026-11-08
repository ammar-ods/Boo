-- BOO Custom Creations — run in the Supabase SQL editor.
-- Storage bucket: inquiry-assets (private)

create extension if not exists "pgcrypto";

create sequence if not exists public.inquiry_ref_seq start with 1004;

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  reference_code text unique not null default ('BOO-' || nextval('public.inquiry_ref_seq')::text),
  product_slug text not null,
  product_name text not null,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  material text,
  quantity integer not null default 1 check (quantity > 0),
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'quoted', 'fulfilled', 'cancelled')),
  quoted_price numeric(12, 2),
  mockup_path text not null default '',
  production_paths text[] default '{}',
  canvas_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cleanup_requested_at timestamptz
);

create index if not exists inquiries_status_idx on public.inquiries (status, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists inquiries_set_updated_at on public.inquiries;
create trigger inquiries_set_updated_at
before update on public.inquiries
for each row execute procedure public.set_updated_at();

-- Artwork is kept when an order is fulfilled or cancelled.
-- Files are removed only when an admin deletes the order from the dashboard.
drop trigger if exists inquiries_cleanup_on_terminal on public.inquiries;
drop function if exists public.flag_inquiry_storage_cleanup();

alter table public.inquiries enable row level security;

drop policy if exists "service role full access" on public.inquiries;
create policy "service role full access"
on public.inquiries
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- Storage
insert into storage.buckets (id, name, public)
values ('inquiry-assets', 'inquiry-assets', false)
on conflict (id) do nothing;

drop policy if exists "service role storage" on storage.objects;
create policy "service role storage"
on storage.objects
for all
using (bucket_id = 'inquiry-assets' and auth.role() = 'service_role')
with check (bucket_id = 'inquiry-assets' and auth.role() = 'service_role');

create table if not exists public.products (
  slug text primary key,
  name text not null,
  category text not null,
  tagline text,
  description text,
  is_laser_cut boolean not null default false,
  materials text[] not null default '{}',
  default_material text,
  canvas_width integer not null default 800,
  canvas_height integer not null default 800,
  safe_zone_bounds jsonb not null default '{"left":200,"top":200,"width":400,"height":400}'::jsonb,
  mockup text not null,
  accent text not null default 'teal',
  show_safe_zone boolean not null default true,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);

alter table public.products enable row level security;

drop policy if exists "service role products" on public.products;
create policy "service role products"
on public.products
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists "public read products" on public.products;
create policy "public read products"
on public.products
for select
using (true);

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do update set public = true;

drop policy if exists "public read uploads" on storage.objects;
create policy "public read uploads"
on storage.objects
for select
using (bucket_id = 'uploads');

drop policy if exists "service role write uploads" on storage.objects;
create policy "service role write uploads"
on storage.objects
for all
using (bucket_id = 'uploads' and auth.role() = 'service_role')
with check (bucket_id = 'uploads' and auth.role() = 'service_role');

create table if not exists public.site_content (
  id text primary key default 'default',
  document jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "public read site" on public.site_content;
create policy "public read site"
on public.site_content
for select
using (true);

drop policy if exists "service write site" on public.site_content;
create policy "service write site"
on public.site_content
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
