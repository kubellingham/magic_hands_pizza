-- Admin-editable home screen content: the "special" hero card text and the
-- three trending item picks. Key/value JSONB keeps it flexible for future
-- home sections without more migrations. Public data → anon can read.

create table public.home_content (
  key        text primary key,
  value      jsonb not null check (pg_column_size(value) <= 4096),
  updated_at timestamptz not null default now()
);

alter table public.home_content enable row level security;

create policy "anyone can read home content"
  on public.home_content for select
  to anon, authenticated
  using (true);

create policy "staff manage home content"
  on public.home_content for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.home_content to anon;
grant select, insert, update, delete on public.home_content to authenticated;
