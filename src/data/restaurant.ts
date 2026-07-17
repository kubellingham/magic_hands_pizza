export const RESTAURANT = {
  name: "Magic Hand's Pizza",
  phoneDisplay: '96469-52001',
  /** E.164 without '+', for wa.me links */
  whatsappNumber: '919646952001',
  telLink: 'tel:+919646952001',
  address: 'Opp. Green Valley, near Kapoor Castle PG, Vill. Meheru, LPU, Low Gate',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Magic Hands Pizza Meheru LPU'),
  /** Open 11:00 to 04:00 next day */
  openHour: 11,
  closeHour: 4,
  hoursDisplay: '11:00 AM – 4:00 AM',
  deliveryNote: 'Free delivery (conditions apply)',
  prepTimeNote: 'Every order takes 25–30 minutes',
} as const

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
