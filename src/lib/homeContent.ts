import { useEffect, useSyncExternalStore } from 'react'
import { supabase } from './supabase'

export interface SpecialCard {
  badge: string
  title: string
}

export interface HomeContent {
  special: SpecialCard
  /** The admin-picked items shown on the home rail (also flagged BESTSELLER) */
  trending: string[]
  /** Kitchen paused — the 3:50 AM safety valve. Blocks new orders. */
  paused: boolean
}

export const DEFAULT_HOME_CONTENT: HomeContent = {
  special: { badge: 'TUESDAY', title: 'Buy 2 large, small one rides free.' },
  trending: ['overload-veg', 'chicken-tikka-pizza', 'farmhouse'],
  paused: false,
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
      if (row.key === 'store') {
        next.paused = row.value?.paused === true
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
  return useSyncExternalStore(
    subscribe,
    () => content,
    () => DEFAULT_HOME_CONTENT,
  )
}
