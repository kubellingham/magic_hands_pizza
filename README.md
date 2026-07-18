# Magic Hand's Pizza — Ordering PWA 🍕

An installable, offline-capable Progressive Web App for **Magic Hand's Pizza**
(Opp. Green Valley, near Kapoor Castle PG, Vill. Meheru, LPU — open 11 AM to 4 AM),
implementing the dark-theme design from the Claude Design prototype
(`Magic Hands Prototype.dc.html`).

Two sides in one app:

- **Customer app** (mobile) — browse the full menu, build a cart with sizes and
  add-ons, place an order that is saved to the database **and** delivered to the
  owner's WhatsApp (96469-52001) as a pre-filled itemized message, then track it live.
- **Admin dashboard** (`/admin`, desktop) — staff log in to a live orders board
  (New → Preparing → Ready → Out → Delivered), a kitchen display, menu
  availability toggles, and simple sales stats. Status changes flow straight
  back into the customer's tracking screen.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 with prototype design tokens (Anton, Barlow Condensed, Plus Jakarta Sans) |
| PWA | vite-plugin-pwa (Workbox) — installable, offline menu, cached Google Fonts |
| State | React Context + `useReducer`, persisted to `localStorage` |
| Backend | Supabase — Postgres + RLS + Auth (staff), no server code |
| Ordering channel | WhatsApp deep link (`wa.me`) with a formatted order message |
| Hosting | Vercel (static build; SPA rewrites in `vercel.json`) |

## How ordering works

1. Customer picks items (S/M/L pizzas, veg/non-veg variants, Cheese Burst /
   Extra Cheese add-ons), chooses Delivery or Pickup and UPI or Cash.
2. Delivery details come from an on-device profile (no OTP/SMS — saved in
   `localStorage`, pre-filled every order). Customers can save up to five
   addresses and switch them from the "Deliver to" picker on Home or in the cart.
3. `placeOrder()` (`src/lib/orders.ts`) saves the order to Supabase; the
   confirmation screen then explains what happens next and counts down 5
   seconds before opening WhatsApp with the full order pre-typed — the
   customer just presses **Send**. (A manual "Open WhatsApp now" button is
   always there too.) **If the database is unreachable, the WhatsApp message
   still goes out** — WhatsApp is the fulfillment channel; the database powers
   the admin board and tracking.
4. The confirmation screen links to `/track/<code>`, which polls order status
   every 5 seconds (no PII — see security below) as the kitchen moves it
   along. While an order is in flight, Home shows a floating status strip
   linking to tracking.
5. Every order is also saved on the customer's phone: **My Orders** (🧾 on
   Home, or from the profile) lists past orders with live status, a Track
   link while active, and a downloadable PDF receipt once delivered.
6. **Digital receipts**: when staff press "Delivered" (or "Picked up") on the
   live board, a branded PDF receipt downloads immediately and a dialog opens
   WhatsApp to the customer's number with the receipt message — staff attach
   the PDF and send. (wa.me links can't attach files automatically, so the
   attach step is the one manual action.)
5. Photos: drop images into `public/images/` (see the README there) — menu
   item photos, the brand logo, and a UPI QR that appears on the
   order-confirmation screen for UPI orders. Everything falls back to
   placeholder art until the photos exist.

### Offers (auto-applied in the cart)

- **2 large pizzas → free 750 ml cold drink** — added as a ₹0 line.
- **Order ≥ ₹999 → 10% off** — shown in the bill breakdown.
- **Tuesday: 2 large → 1 small pizza free** — needs a pizza choice, so it rides
  along as a note in the WhatsApp message for the owner to fulfil.

## Security model

The anon key ships in the bundle by design; **Row Level Security is the boundary**
(`supabase/migrations/`):

- `anon` can **INSERT** orders — nothing else. No select/update/delete policies,
  so customer PII (names, phones, addresses) is never readable with the public key.
- Order tracking uses `get_order_status(code)`, a `security definer` function
  returning only `order_code, status, fulfilment, created_at` — no PII.
- Signing up a Supabase account grants **nothing**: staff access is gated by the
  `admin_users` table (checked via `is_admin()`), verified by test — a random
  authenticated account sees zero orders, cannot read the staff list, and
  cannot add itself to it. Only existing admins manage the list, and an admin
  cannot delete their own entry (enforced by RLS, not just the UI).
- Staff can read orders and update **only** the `status` column
  (`grant update (status)`); availability and price overrides are staff-only
  writes, anon-readable (no sensitive data — verified: anon insert denied).
- CHECK constraints validate phone format, bound text lengths, and cap items JSON size.

## Development

```bash
npm install
cp .env.example .env.local   # Supabase URL + anon key
npm run dev
npm run build                # type-check + production build
npm run preview
```

Without `.env.local` the app still runs — orders skip the database and go
straight to WhatsApp; tracking and admin need the backend.

## Updating the menu

The menu lives in code — `src/data/menu.ts` (~93 items) — bundled, type-checked,
offline-cached. Add items with a **new unique `id`** using the `sml()` / `ml()` /
`vegNonveg()` / `std()` helpers, then commit → push → Vercel redeploys.

Day-to-day changes need **no redeploy** — both live in the admin's
**Menu & Prices** view:

- **Availability** ("out of stock") toggles.
- **Prices**: edit any price cell and press Enter — customers see it
  immediately (menu, item page, cart, WhatsApp message, order record). Edited
  prices show in gold; entering the printed base price resets the override.
  Overrides live in the `price_overrides` table on top of the code menu, so
  offline customers fall back to the printed base prices.

Hours, phone, address, and offer copy: `src/data/restaurant.ts`.

## Admin dashboard

- URL: `/admin` (best on a laptop/tablet; the phone works in a pinch).
- Sign in with a staff account. **Adding staff is self-service**: any admin
  opens the **Staff** view, adds the new person's email, and the new person
  uses "Create staff account" on the `/admin` login screen with that exact
  email (confirm via the emailed link, then sign in). Admins can remove any
  staff member except themselves — no accidental lock-outs.
  Note: Supabase's built-in email service is rate-limited on the free tier
  (a few confirmation emails per hour), which is plenty for occasional staff changes.
- **Live Orders**: Accept/Reject new orders, then Mark Ready → Hand to rider →
  Delivered. Each step updates the customer's tracking page within ~12 s.
- **Kitchen Display**: big-type tickets for new + preparing orders.
- **Home Screen**: edit the special hero card (badge + headline, with live
  preview) and pick the three Trending Now items customers see on Home.
- **Menu & Prices**: live price editing + availability toggles (see "Updating the menu").
- **Sales**: last-24h orders, revenue, average order, busiest hours, top items,
  UPI/cash split.

## Deploying

1. Import the repo in Vercel (framework: Vite).
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars.
3. Done — HTTPS makes the PWA installable from Chrome's "Add to Home screen".

## Verification (done in development)

- ✅ Menu audited against the printed menu; all four pricing shapes exercised
- ✅ Offer math: 2× Magic Pizza Hut Spl. (L) = ₹1,038 → free drink + −₹104 → ₹934,
  correct in cart, WhatsApp message, and DB row
- ✅ Full lifecycle in headless Chromium: order → admin Accept → Kitchen →
  Ready → Out → Delivered, with the customer's tracking page following each step
- ✅ Availability toggle in admin grays the item out for customers
- ✅ RLS probed end-to-end: anon read/update/delete denied; non-staff
  authenticated account sees zero orders; bad phone rejected by CHECK
- ✅ Offline: menu + cart browsable, checkout blocked with a clear message
- 📋 Remaining before launch: real Android install test + one live order to the
  owner's WhatsApp
