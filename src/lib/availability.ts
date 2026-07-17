import { useEffect, useState } from 'react'
import { supabase } from './supabase'

/**
 * Map of item_id → available. Items absent from the table are available.
 * Cached per page load; offline or DB-less dev just means everything shows.
 */
let cache: Record<string, boolean> | null = null
let inflight: Promise<Record<string, boolean>> | null = null

export async function fetchAvailability(): Promise<Record<string, boolean>> {
  if (cache) return cache
  if (inflight) return inflight
  inflight = (async () => {
    if (!supabase) return {}
    try {
      const { data, error } = await supabase.from('item_availability').select('item_id, available')
      if (error || !data) return {}
      const map: Record<string, boolean> = {}
      for (const row of data) map[row.item_id as string] = row.available as boolean
      cache = map
      return map
    } catch {
      return {}
    } finally {
      inflight = null
    }
  })()
  return inflight
}

export function useAvailability(): Record<string, boolean> {
  const [map, setMap] = useState<Record<string, boolean>>(cache ?? {})
  useEffect(() => {
    let alive = true
    fetchAvailability().then((m) => alive && setMap(m))
    return () => {
      alive = false
    }
  }, [])
  return map
}

export function isAvailable(map: Record<string, boolean>, itemId: string): boolean {
  return map[itemId] !== false
}
