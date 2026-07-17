import { isValidIndianMobile } from './format'

export interface Profile {
  name: string
  phone: string
  address: string
}

const KEY = 'mhp-profile-v1'

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { name: '', phone: '', address: '' }
    const p = JSON.parse(raw) as Profile
    return { name: p.name ?? '', phone: p.phone ?? '', address: p.address ?? '' }
  } catch {
    return { name: '', phone: '', address: '' }
  }
}

export function saveProfile(profile: Profile): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile))
  } catch {
    // storage unavailable — profile just won't persist
  }
}

export function isProfileComplete(p: Profile): boolean {
  return p.name.trim().length >= 2 && isValidIndianMobile(p.phone) && p.address.trim().length >= 5
}
