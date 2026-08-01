# Images

There are two ways a picture gets into the app. **The dashboard is the normal
one** — this folder is the fallback.

## 1. From the admin dashboard (no redeploy)

- **Food photos** — Menu & stock → tap the thumbnail on any row → pick a photo.
  It is centre-cropped square, shrunk to 900 px and uploaded to Supabase
  Storage. Customers see it on their next visit. The ✕ on the thumbnail
  removes it again.
- **UPI QR** — App home → UPI QR → Upload. Scaled, never cropped (cropping a
  QR breaks it), and shown at checkout to anyone paying by UPI.

Anyone with a staff login can do this from a phone. Nothing touches the repo.

## 2. Committed to this folder (fallback)

Used when no upload exists for an item, so a photo shipped with the code still
works. After adding files: commit → push → Vercel redeploys.

### `menu/` — one photo per item, named exactly `<item-id>.jpg`

```
public/images/menu/margherita.jpg
public/images/menu/chicken-tikka-pizza.jpg
public/images/menu/classic-fries.jpg
```

Item ids live in `src/data/menu.ts`. Square-ish, ~600×600, under ~150 KB.

### `brand/` — `logo.png`, already in place

Consider regenerating `public/icons/` from the real logo; they currently use a
drawn pizza mark.

### `payment/` — `upi-qr.png`

Only used if no QR has been uploaded from the dashboard.

## Resolution order

uploaded photo → file in `menu/` → drawn oven-glow art

Every item without a picture falls back to the generated art, so a partial set
looks deliberate rather than broken. Start with the three trending picks and
the bestsellers.
