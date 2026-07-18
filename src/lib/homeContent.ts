import { useEffect, useSyncExternalStore } from 'react'
import { supabase } from './supabase'

export interface SpecialCard {
  badge: string
  title: string
}

export interface HomeContent {
  special: SpecialCard
  /** Exactly the three admin-picked trending item ids */
  trending: string[]
}

export const DEFAULT_HOME_CONTENT: HomeContent = {
  special: { badge: 'TUESDAY ONLY', title: '2 LARGE + 1 SMALL PIZZA FREE' },
  trending: ['overload-veg', 'chicken-tikka-pizza', 'farmhouse'],
}

let content: HomeContent = DEFAULT_HOME_CONTENT
let loadStarted = false
const listeners = new Set<() => void>()

function emit() {
  for (const cb of listeners) cb()
}

export async function loadHomeContent(): Promise<void> {
  if (!supabase) return
  try {
    const { data, error } = await supabase.from('home_content').select('key, value')
    if (error || !data) return
    const next: HomeContent = { ...DEFAULT_HOME_CONTENT }
    for (const row of data) {
      if (row.key === 'special' && row.value?.title) {
        next.special = { badge: String(row.value.badge ?? ''), title: String(row.value.title) }
      }
      if (row.key === 'trending' && Array.isArray(row.value?.items)) {
        const items = (row.value.items as unknown[]).filter((x): x is string => typeof x === 'string')
        if (items.length > 0) next.trending = items.slice(0, 3)
      }
    }
    content = next
    emit()
  } catch {
    // keep defaults
  }
}

function ensureLoaded() {
  if (loadStarted) return
  loadStarted = true
  loadHomeContent()
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useHomeContent(): HomeContent {
  useEffect(ensureLoaded, [])
  return useSyncExternalStore(subscribe, () => content, () => DEFAULT_HOME_CONTENT)
}
