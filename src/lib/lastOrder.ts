const KEY = 'mhp-last-order-v1'
const MAX_AGE_MS = 6 * 60 * 60 * 1000 // stop watching after 6h

export interface LastOrder {
  code: string
  at: number
}

export function saveLastOrder(code: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() } satisfies LastOrder))
  } catch {
    // fine — home just won't show the banner
  }
}

export function loadLastOrder(): LastOrder | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LastOrder
    if (!parsed.code || Date.now() - parsed.at > MAX_AGE_MS) return null
    return parsed
  } catch {
    return null
  }
}

export function clearLastOrder(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
