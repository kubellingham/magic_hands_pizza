-- Photos the shop uploads themselves from the admin dashboard.
--
-- Files live in a public storage bucket rather than the repo, so swapping a
-- picture is a phone tap in the kitchen instead of a commit and a redeploy.
-- The table records which items have a photo (so the app never fires 404s
-- guessing) and carries updated_at, which doubles as a cache-buster.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu-photos', 'menu-photos', true, 3145728,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = 3145728,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

create table if not exists public.item_photos (
  item_id text primary key,
  path text not null,
  updated_at timestamptz not null default now()
);

alter table public.item_photos enable row level security;

drop policy if exists "anyone can read menu photos" on public.item_photos;
create policy "anyone can read menu photos"
  on public.item_photos for select to anon, authenticated using (true);

drop policy if exists "staff manage menu photos" on public.item_photos;
create policy "staff manage menu photos"
  on public.item_photos for all to authenticated
  using (is_admin()) with check (is_admin());

-- Storage: the world may read the bucket, only staff may write to it.
drop policy if exists "menu photos are public" on storage.objects;
create policy "menu photos are public"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'menu-photos');

drop policy if exists "staff upload menu photos" on storage.objects;
create policy "staff upload menu photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'menu-photos' and is_admin());

drop policy if exists "staff replace menu photos" on storage.objects;
create policy "staff replace menu photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'menu-photos' and is_admin())
  with check (bucket_id = 'menu-photos' and is_admin());

drop policy if exists "staff remove menu photos" on storage.objects;
create policy "staff remove menu photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'menu-photos' and is_admin());
