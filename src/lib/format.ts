import { RESTAURANT } from '../data/restaurant'

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

/** Hours span midnight (11:00 → 04:00), so open = after opening OR before closing. */
export function isOpenNow(now: Date = new Date()): boolean {
  const hour = now.getHours()
  return hour >= RESTAURANT.openHour || hour < RESTAURANT.closeHour
}

export function isValidIndianMobile(phone: string): boolean {
  return /^[6-9][0-9]{9}$/.test(phone)
}
