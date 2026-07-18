import { useEffect, useSyncExternalStore } from 'react'
import { supabase } from './supabase'
import type { MenuItem, Variant } from '../data/types'

/**
 * Live price overrides layered over the code menu: key `itemId:variantId` →
 * price in rupees. Staff edit them in the admin; customers read them
 * anonymously. Offline or DB-less dev falls back to the printed base prices.
 */
export type OverrideMap = Record<string, number>

let map: OverrideMap = {}
let loadStarted = false
const listeners = new Set<() => void>()

function emit() {
  for (const cb of listeners) cb()
}

export async function loadOverrides(): Promise<void> {
  if (!supabase) return
  try {
    const { data, error } = await supabase.from('price_overrides').select('item_id, variant_id, price')
    if (error || !data) return
    const next: OverrideMap = {}
    for (const row of data) next[`${row.item_id}:${row.variant_id}`] = row.price as number
    map = next
    emit()
  } catch {
    // keep base prices
  }
}

function ensureLoaded() {
  if (loadStarted) return
  loadStarted = true
  loadOverrides()
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const EMPTY: OverrideMap = {}

/** Reactive override map — components re-render when overrides (re)load. */
export function usePriceOverrides(): OverrideMap {
  useEffect(ensureLoaded, [])
  return useSyncExternalStore(subscribe, () => map, () => EMPTY)
}

export function effectivePrice(overrides: OverrideMap, itemId: string, variant: Variant): number {
  return overrides[`${itemId}:${variant.id}`] ?? variant.price
}

export function effectiveMinPrice(overrides: OverrideMap, item: MenuItem): number {
  return Math.min(...item.variants.map((v) => effectivePrice(overrides, item.id, v)))
}
