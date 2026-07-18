-- Live price editing from the admin dashboard.
-- The code menu (src/data/menu.ts) stays the base; a row here overrides one
-- variant's price. Deleting the row resets to the base price. Prices are
-- public data, so anon may read; only staff may write.

create table public.price_overrides (
  item_id    text not null,
  variant_id text not null,
  price      integer not null check (price between 1 and 20000),
  updated_at timestamptz not null default now(),
  primary key (item_id, variant_id)
);

alter table public.price_overrides enable row level security;

create policy "anyone can read price overrides"
  on public.price_overrides for select
  to anon, authenticated
  using (true);

create policy "staff manage price overrides"
  on public.price_overrides for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.price_overrides to anon;
grant select, insert, update, delete on public.price_overrides to authenticated;
