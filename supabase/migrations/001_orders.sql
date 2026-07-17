-- Orders placed by customers through the PWA.
-- Security model: the client ships the public anon key, so RLS is the entire
-- boundary. Anonymous users may do exactly one thing — insert an order.
-- There is no SELECT/UPDATE/DELETE policy for anon, so customer PII
-- (names, phones, addresses) can never be read back with the anon key.

create table public.orders (
  id            uuid primary key default gen_random_uuid(),
  order_code    text not null check (char_length(order_code) between 4 and 20),
  customer_name text not null check (char_length(customer_name) between 1 and 80),
  phone         text not null check (phone ~ '^[6-9][0-9]{9}$'),
  address       text not null check (char_length(address) between 5 and 400),
  notes         text check (notes is null or char_length(notes) <= 300),
  -- Denormalized snapshot of the cart, so the record stays meaningful
  -- even after menu prices change: [{item, variant, addOns, qty, lineTotal}]
  items         jsonb not null check (pg_column_size(items) <= 8192),
  subtotal      integer not null check (subtotal between 20 and 20000),
  offer_note    text check (offer_note is null or char_length(offer_note) <= 300),
  status        text not null default 'new'
                check (status in ('new', 'confirmed', 'delivered', 'cancelled')),
  created_at    timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "anyone can place an order"
  on public.orders
  for insert
  to anon
  with check (true);

-- Belt and braces on top of the missing policies.
revoke select, update, delete on public.orders from anon;
