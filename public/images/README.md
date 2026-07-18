# Image folders — drop your pictures here

The app works without any images (it shows warm placeholder art), and
automatically switches to your photos the moment a correctly-named file
exists here. After adding images: commit → push → Vercel redeploys.

## `menu/` — food photos

One photo per menu item, named **exactly** `<item-id>.jpg` (lowercase).
The item ids are in `src/data/menu.ts` — examples:

```
public/images/menu/margherita.jpg
public/images/menu/chicken-tikka-pizza.jpg
public/images/menu/oreo-shake.jpg
public/images/menu/classic-fries.jpg
```

Shown on: menu cards, item pages, trending cards, cart thumbnails.
Best size: square-ish, about 600×600, JPG, under ~150 KB each
(compress at tinypng.com or squoosh.app before committing).

## `brand/` — logo & branding

```
public/images/brand/logo.png       # the Magic Hand's logo
```

(Also consider regenerating the PWA icons in `public/icons/` from the real
logo when you have it — currently they use a drawn pizza mark.)

## `payment/` — UPI QR code

```
public/images/payment/upi-qr.png   # screenshot/export of the shop's UPI QR
```

When this file exists, the order-confirmation screen shows it to customers
who chose UPI, with a "Scan to pay" caption.
