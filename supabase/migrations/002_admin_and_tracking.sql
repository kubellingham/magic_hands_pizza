-- Admin dashboard + customer order tracking.
--
-- Additions:
--  * orders gains fulfilment/payment/discount/total and a richer status set
--    matching the kitchen flow: new → preparing → ready → out → delivered
--    (or cancelled).
--  * admin_users gates which authenticated accounts count as staff — an
--    open Supabase signup must NOT grant order access.
--  * Staff can read orders and update ONLY the status column.
--  * get_order_status() lets an anonymous customer poll their own order's
--    status by order code without exposing any PII columns.
--  * item_availability lets staff mark items out of stock; customers can
--    read it (it contains no sensitive data).

-- ── orders: new columns + status set ─────────────────────────────────────
alter table public.orders
  add column fulfilment text not null default 'delivery'
    check (fulfilment in ('delivery', 'pickup')),
  add column payment text not null default 'cod'
    check (payment in ('upi', 'cod')),
  add column discount integer not null default 0 check (discount between 0 and 5000),
  add column total integer check (total between 0 and 20000);

alter table public.orders drop constraint orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('new', 'preparing', 'ready', 'out', 'delivered', 'cancelled'));

-- ── staff gate ───────────────────────────────────────────────────────────
create table public.admin_users (
  email text primary key
);
alter table public.admin_users enable row level security;
-- No policies: only the service role touches this table. Authenticated
-- users can't even read the staff list.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where email = (auth.jwt() ->> 'email')
  );
$$;

-- ── staff access to orders ───────────────────────────────────────────────
create policy "staff can read orders"
  on public.orders for select
  to authenticated
  using (public.is_admin());

create policy "staff can update orders"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, update (status) on public.orders to authenticated;

-- ── anonymous status tracking (no PII) ───────────────────────────────────
create or replace function public.get_order_status(code text)
returns table (order_code text, status text, fulfilment text, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select o.order_code, o.status, o.fulfilment, o.created_at
  from public.orders o
  where o.order_code = code
  order by o.created_at desc
  limit 1;
$$;

grant execute on function public.get_order_status(text) to anon, authenticated;

-- ── item availability ────────────────────────────────────────────────────
create table public.item_availability (
  item_id text primary key,
  available boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.item_availability enable row level security;

create policy "anyone can read availability"
  on public.item_availability for select
  to anon, authenticated
  using (true);

create policy "staff manage availability"
  on public.item_availability for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.item_availability to anon;
grant select, insert, update, delete on public.item_availability to authenticated;
