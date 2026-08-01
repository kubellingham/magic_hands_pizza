import { useEffect, useState } from 'react'
import { RESTAURANT } from '../data/restaurant'

export type Shift = 'day' | 'night'

/** Night falls at 7 PM and lasts until the 4 AM close (and through the closed hours). */
export const NIGHT_START_HOUR = 19

export function shiftAt(date: Date = new Date()): Shift {
  const hour = date.getHours()
  return hour >= NIGHT_START_HOUR || hour < RESTAURANT.openHour ? 'night' : 'day'
}

/** Copy flips with the lighting — same layout, different mood. */
export interface ShiftCopy {
  greetingTop: string
  greetingBottom: string
  statusPill: string
  railTitle: string
  searchPlaceholder: string
}

const COPY: Record<Shift, ShiftCopy> = {
  night: {
    greetingTop: 'Still awake?',
    greetingBottom: 'Good. So is the oven.',
    statusPill: 'OPEN TILL 4 AM · 25–30 MIN',
    railTitle: 'Most ordered after midnight',
    searchPlaceholder: 'Paneer, tikka, shakes…',
  },
  day: {
    greetingTop: 'Lunch plans?',
    greetingBottom: 'Already in the oven.',
    statusPill: 'OPEN NOW · CLOSES 4 AM',
    railTitle: 'Lunch favourites',
    searchPlaceholder: 'Paneer, tikka, shakes…',
  },
}

export function copyFor(shift: Shift): ShiftCopy {
  return COPY[shift]
}

/**
 * Current shift, re-evaluated every minute so a phone left open through
 * 7 PM (or 11 AM) flips without a reload. Writes `data-shift` on <html>.
 */
export function useShift(): Shift {
  const [shift, setShift] = useState<Shift>(() => shiftAt())

  useEffect(() => {
    const apply = () => {
      const next = shiftAt()
      setShift(next)
      document.documentElement.dataset.shift = next
    }
    apply()
    const timer = setInterval(apply, 60_000)
    return () => clearInterval(timer)
  }, [])

  return shift
}
