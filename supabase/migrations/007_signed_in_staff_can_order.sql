-- Being signed in to the admin dashboard made it impossible to place an order.
--
-- The insert policy was granted to `anon` only. The Supabase client shares one
-- auth session across the whole origin, so once someone signs in at /admin,
-- every request from the customer app on that phone goes out as
-- `authenticated` — a role with no insert policy at all. The insert came back
-- 42501 and the order silently disappeared. Owner and staff phones are exactly
-- the ones most likely to be signed in, and they are also the ones used to
-- test and to place orders for walk-in customers.
--
-- Placing an order must never depend on being signed out. Reads stay closed:
-- selecting orders is still admin-only, so this exposes no customer data.

drop policy if exists "anyone can place an order" on public.orders;

create policy "anyone can place an order"
  on public.orders
  for insert
  to anon, authenticated
  with check (true);
