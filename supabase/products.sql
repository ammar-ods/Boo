-- Compatibility migration for the existing products table
-- (slug, title, category, description, base_image_url, overlay_image_url,
--  safe_zone_bounds, is_laser_cut, is_active).
-- Run this in the Supabase SQL editor, then redeploy the site.

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
