import { isValidIndianMobile } from './format'

export const MAX_ADDRESSES = 5

export interface Profile {
  name: string
  phone: string
  addresses: string[]
  /** index into addresses */
  selected: number
}

const KEY = 'mhp-profile-v2'
const LEGACY_KEY = 'mhp-profile-v1'

const EMPTY: Profile = { name: '', phone: '', addresses: [], selected: 0 }

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = JSON.parse(raw) as Profile
      const addresses = Array.isArray(p.addresses)
        ? p.addresses.filter((a): a is string => typeof a === 'string').slice(0, MAX_ADDRESSES)
        : []
      const selected = Math.min(Math.max(0, p.selected ?? 0), Math.max(0, addresses.length - 1))
      return { name: p.name ?? '', phone: p.phone ?? '', addresses, selected }
    }
    // migrate the old single-address shape
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      const old = JSON.parse(legacy) as { name?: string; phone?: string; address?: string }
      const migrated: Profile = {
        name: old.name ?? '',
        phone: old.phone ?? '',
        addresses: old.address?.trim() ? [old.address.trim()] : [],
        selected: 0,
      }
      saveProfile(migrated)
      return migrated
    }
    return EMPTY
  } catch {
    return EMPTY
  }
}

export function saveProfile(profile: Profile): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile))
  } catch {
    // storage unavailable — profile just won't persist
  }
}

export function currentAddress(p: Profile): string {
  return p.addresses[p.selected] ?? ''
}

export function isProfileComplete(p: Profile): boolean {
  return p.name.trim().length >= 2 && isValidIndianMobile(p.phone) && currentAddress(p).trim().length >= 5
}

/**
 * Short label for the Deliver-to header — the most recognisable chunk of the
 * address (usually the PG/hostel name) rather than a blunt truncation.
 */
export function addressLabel(address: string): string {
  const parts = address
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.length === 0) return address.trim()
  // "Room 214, Kapoor Castle PG, Meheru" → "Kapoor Castle PG"
  const named = parts.find((p) => /[a-z]/i.test(p) && !/^room\b|^flat\b|^#/i.test(p))
  const label = named ?? parts[0]
  return label.length <= 26 ? label : label.slice(0, 26) + '…'
}
