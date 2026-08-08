/**
 * Demo build.
 *
 * This started as a real ordering app for a restaurant near a university. That
 * arrangement ended, so every detail that identified them — name, logo, phone,
 * address — has been replaced with a fictional one, and DEMO switches off every
 * outbound link so nothing this app does can reach a real person's phone. The
 * engineering underneath is unchanged.
 *
 * To point it at a real business again: set DEMO to false and fill in the real
 * details below.
 */
export const DEMO = true

export const RESTAURANT = {
  name: 'Corner Oven Pizza',
  /** Fictional. Nothing in the app dials or messages it while DEMO is true. */
  phoneDisplay: '00000-00000',
  /** E.164 without '+', for wa.me links */
  whatsappNumber: '910000000000',
  telLink: 'tel:+910000000000',
  address: 'Shop 4, Campus Road — opposite the north gate',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('pizza near me'),
  /** Open 11:00 to 04:00 next day */
  openHour: 11,
  closeHour: 4,
  hoursDisplay: '11:00 AM – 4:00 AM',
  deliveryNote: 'Free delivery (conditions apply)',
  prepTimeNote: 'Every order takes 25–30 minutes',
} as const

/** Where a real build would link out. Null in the demo, and callers show a chip. */
export function whatsappHref(text?: string): string | null {
  if (DEMO) return null
  const query = text ? `?text=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${RESTAURANT.whatsappNumber}${query}`
}

export function telHref(): string | null {
  return DEMO ? null : RESTAURANT.telLink
}

/** Sending a receipt to a customer's own number — also disabled in the demo. */
export function customerWhatsappHref(phone: string, text: string): string | null {
  if (DEMO) return null
  return `https://wa.me/91${phone}?text=${encodeURIComponent(text)}`
}

export interface Offer {
  id: string
  title: string
  detail: string
}

export const OFFERS: Offer[] = [
  {
    id: 'tuesday-pizza',
    title: 'Tuesday Deal',
    detail: 'Buy 2 large pizzas, get 1 small pizza FREE (Tuesdays only)',
  },
  {
    id: 'free-drink',
    title: 'Free Cold Drink',
    detail: 'Buy 2 large pizzas, get a 750 ml cold drink FREE',
  },
  {
    id: 'bulk-discount',
    title: 'Big Order Bonus',
    detail: 'Orders of ₹999 or more get up to 10% discount',
  },
]
