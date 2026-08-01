-- Orders were being lost silently.
--
-- placeOrder() swallows any insert failure and still opens WhatsApp, so a row
-- rejected by a CHECK constraint vanished without a trace: the customer saw a
-- confirmation, the kitchen board never saw the order. Two constraints could
-- reject a perfectly real order:
--
--   * address >= 5 chars — a pickup order from someone with no saved address
--     sends an empty string, so every such order was dropped.
--   * subtotal >= 20 — the cheapest item on the menu is exactly Rs 20, so any
--     price edit downwards would start killing single-item orders.
--
-- Keep the upper bounds (they are the abuse guard); drop the lower ones. A
-- restaurant would rather receive a scruffy order than none at all.

alter table public.orders drop constraint if exists orders_address_check;
alter table public.orders
  add constraint orders_address_check check (char_length(address) <= 400);

alter table public.orders drop constraint if exists orders_subtotal_check;
alter table public.orders
  add constraint orders_subtotal_check check (subtotal >= 1 and subtotal <= 20000);

-- The app now retries failed inserts from an on-device outbox, so the same
-- order code can arrive more than once. A unique index turns the replay into a
-- no-op (23505) instead of a duplicate ticket in the kitchen.
create unique index if not exists orders_order_code_key on public.orders (order_code);
