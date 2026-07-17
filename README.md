# Magic Hand's Pizza — Customer PWA 🍕

An installable, offline-capable Progressive Web App for **Magic Hand's Pizza**
(Opp. Green Valley, near Kapoor Castle PG, Vill. Meheru, LPU — open 11 AM to 4 AM).

Customers browse the full menu, build a cart, and place an order that is
**saved to a database and delivered to the owner's WhatsApp** (96469-52001) as a
pre-filled, itemized message — matching exactly how the restaurant already takes orders.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| PWA | vite-plugin-pwa (Workbox) — installable, offline menu |
| State | React Context + `useReducer`, persisted to `localStorage` |
| Backend | Supabase (Postgres + RLS) — order records only |
| Ordering channel | WhatsApp deep link (`wa.me`) with a formatted order message |
| Hosting | Vercel (static build; SPA rewrites in `vercel.json`) |

## How ordering works

1. Customer builds a cart (sizes, veg/non-veg variants, pizza add-ons).
2. Checkout collects name, 10-digit mobile, address, and notes.
3. `placeOrder()` (`src/lib/orders.ts`):
   - inserts the order into Supabase (denormalized items snapshot + client-generated order code),
   - opens WhatsApp with the full order pre-typed — the customer just presses **Send**.
4. **If the database is unreachable, the WhatsApp message still goes out.**
   WhatsApp is the fulfillment channel; the database is the record. An order is never lost to a DB hiccup.

Offers (Tuesday deal, free cold drink with 2 large pizzas, ₹999+ discount) are
**detected and advertised, never auto-applied** — the cart appends an
"Offer eligible" note to the WhatsApp message and the owner applies the
discount when confirming. This makes wrong-price bugs impossible.

## Security model (why the anon key in the client is safe)

The Supabase anon key ships in the bundle — that is by design; **Row Level
Security is the boundary** (`supabase/migrations/001_orders.sql`):

- `anon` can do exactly one thing: `INSERT` into `orders`.
- There is no SELECT/UPDATE/DELETE policy for `anon` (plus an explicit `REVOKE`),
  so customer PII — names, phones, addresses — can never be read back with the public key.
  Verified with direct REST calls: reads/updates/deletes return `42501 permission denied`.
- CHECK constraints validate the phone format (`^[6-9][0-9]{9}$`), bound all
  text lengths, and cap the items JSON at 8 KB, limiting junk-insert abuse.
- Junk rows are harmless anyway — fulfillment happens via the WhatsApp message,
  not the table. (Phase-2 hardening if ever needed: captcha or an Edge Function rate limit.)

## Development

```bash
npm install
cp .env.example .env.local   # fill in the Supabase URL + anon key
npm run dev                  # dev server
npm run build                # type-check + production build
npm run preview              # serve the built PWA locally
```

Without `.env.local` the app still runs — orders simply skip the database and
go straight to WhatsApp.

## Updating the menu (for maintainers)

The menu lives in code — `src/data/menu.ts` — not in the database, so it is
bundled, type-checked, and automatically cached for offline browsing.

- **Change a price:** edit the number in `menu.ts`, commit, push. Vercel redeploys in ~1 minute; customers get the update on their next visit (the service worker auto-updates).
- **Add an item:** add an entry with a **new unique `id`** (never reuse an old id — it's the cart/order key). Pricing shapes:
  - `sml(89, 169, 259)` — Small/Medium/Large pizzas (`ml(...)` for M/L-only)
  - `vegNonveg(99, 129)` — dual veg/non-veg items (pasta, noodles, combos, wraps)
  - `std(70)` — single flat price
  - `supportsAddOns: true` — lets a pizza take Cheese Burst / Extra Cheese
- **Hours / phone / offers:** `src/data/restaurant.ts`.

## Deploying

1. Push to GitHub; import the repo in Vercel (framework: Vite).
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel → Project → Environment Variables.
3. Done — `vercel.json` already handles SPA routing, and HTTPS makes the PWA installable from Chrome's "Add to Home screen".

## Viewing orders (owner/maintainer)

Orders are visible in the Supabase dashboard (Table Editor → `orders`) with the
service-role context. A customer-facing status page / owner admin panel is a
planned phase 2 (Supabase Auth + authenticated SELECT/UPDATE policies + an
`/admin` route).

## Verification checklist (done in development)

- ✅ 93 menu items audited against the printed menu (17 veg + 13 non-veg pizzas, add-ons priced per size)
- ✅ Cart totals hand-checked across all pricing shapes (incl. pizza + Cheese Burst)
- ✅ RLS probed via REST: anon insert 201; select/update/delete 401; bad phone rejected 400
- ✅ End-to-end order in headless Chromium: form → DB row → wa.me message → confirmation page → cart cleared
- ✅ Offline: full menu + cart browsable with no connection; checkout blocked with a clear message
- 📋 Remaining before launch: install test on a real Android phone + one live order to the owner's WhatsApp
