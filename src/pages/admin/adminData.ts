import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { OrderStatus } from '../../lib/tracking'
import { loadOverrides, usePriceOverrides, type OverrideMap } from '../../lib/livePrices'
import { loadHomeContent, useHomeContent, type HomeContent } from '../../lib/homeContent'

export interface AdminOrderItem {
  item: string
  variant: string | null
  addOns: string[]
  qty: number
  lineTotal: number
}

export interface AdminOrder {
  id: string
  order_code: string
  customer_name: string
  phone: string
  address: string
  notes: string | null
  items: AdminOrderItem[]
  subtotal: number
  discount: number
  total: number | null
  status: OrderStatus
  fulfilment: 'delivery' | 'pickup'
  payment: 'upi' | 'cod'
  created_at: string
}

const POLL_MS = 12_000

/** Orders from the last 24h, newest first, refreshed on a poll. */
export function useAdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [error, setError] = useState('')
  const timer = useRef<ReturnType<typeof setInterval>>()

  const refresh = useCallback(async () => {
    if (!supabase) return
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data, error: err } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
    if (err) {
      setError(err.message)
      return
    }
    setError('')
    setOrders((data ?? []) as AdminOrder[])
  }, [])

  useEffect(() => {
    refresh()
    timer.current = setInterval(refresh, POLL_MS)
    return () => clearInterval(timer.current)
  }, [refresh])

  const setStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      if (!supabase) return
      // Optimistic update so the board feels instant; poll corrects drift.
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
      const { error: err } = await supabase.from('orders').update({ status }).eq('id', id)
      if (err) refresh()
    },
    [refresh],
  )

  return { orders, error, refresh, setStatus }
}

/** Availability map + toggle for the menu manager. */
export function useAdminAvailability() {
  const [map, setMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('item_availability')
      .select('item_id, available')
      .then(({ data }) => {
        if (!data) return
        const next: Record<string, boolean> = {}
        for (const row of data) next[row.item_id as string] = row.available as boolean
        setMap(next)
      })
  }, [])

  const toggle = useCallback(async (itemId: string) => {
    if (!supabase) return
    let next = true
    setMap((prev) => {
      next = !(prev[itemId] !== false)
      return { ...prev, [itemId]: next }
    })
    await supabase.from('item_availability').upsert({ item_id: itemId, available: next })
  }, [])

  return { map, toggle }
}

/** Price overrides for the menu manager: shared live map + staff save. */
export function useAdminPrices(): {
  overrides: OverrideMap
  savePrice: (itemId: string, variantId: string, price: number, basePrice: number) => Promise<boolean>
} {
  const overrides = usePriceOverrides()

  const savePrice = useCallback(
    async (itemId: string, variantId: string, price: number, basePrice: number) => {
      if (!supabase) return false
      // Setting a price back to the printed base removes the override row.
      const { error } =
        price === basePrice
          ? await supabase.from('price_overrides').delete().match({ item_id: itemId, variant_id: variantId })
          : await supabase.from('price_overrides').upsert({ item_id: itemId, variant_id: variantId, price })
      await loadOverrides()
      return !error
    },
    [],
  )

  return { overrides, savePrice }
}

/** Sold-per-item counts for tonight's shift — doubles as a mise-en-place hint. */
export function soldTonight(orders: AdminOrder[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const order of orders) {
    if (order.status === 'cancelled') continue
    for (const item of order.items) {
      if (item.lineTotal === 0) continue
      const key = item.item.toLowerCase()
      counts[key] = (counts[key] ?? 0) + item.qty
    }
  }
  return counts
}

/** Home-screen content (special card, trending picks, pause valve). */
export function useAdminHomeContent(): {
  content: HomeContent
  saveSpecial: (badge: string, title: string) => Promise<boolean>
  saveTrending: (items: string[]) => Promise<boolean>
  setPaused: (paused: boolean) => Promise<boolean>
} {
  const content = useHomeContent()

  const saveSpecial = useCallback(async (badge: string, title: string) => {
    if (!supabase) return false
    const { error } = await supabase
      .from('home_content')
      .upsert({ key: 'special', value: { badge: badge.trim(), title: title.trim() } })
    await loadHomeContent()
    return !error
  }, [])

  const saveTrending = useCallback(async (items: string[]) => {
    if (!supabase) return false
    const { error } = await supabase
      .from('home_content')
      .upsert({ key: 'trending', value: { items: items.slice(0, 3) } })
    await loadHomeContent()
    return !error
  }, [])

  const setPaused = useCallback(async (paused: boolean) => {
    if (!supabase) return false
    const { error } = await supabase.from('home_content').upsert({ key: 'store', value: { paused } })
    await loadHomeContent()
    return !error
  }, [])

  return { content, saveSpecial, saveTrending, setPaused }
}

/** Staff list management — RLS restricts every call to admins. */
export function useStaff(currentEmail: string | null) {
  const [staff, setStaff] = useState<string[]>([])
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!supabase) return
    const { data, error: err } = await supabase.from('admin_users').select('email').order('email')
    if (err) return setError(err.message)
    setError('')
    setStaff((data ?? []).map((r) => r.email as string))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addStaff = useCallback(
    async (email: string): Promise<string> => {
      if (!supabase) return 'Backend not configured.'
      const normalized = email.trim().toLowerCase()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return 'Enter a valid email address.'
      const { error: err } = await supabase.from('admin_users').insert({ email: normalized })
      if (err) return err.code === '23505' ? 'That email is already staff.' : err.message
      await refresh()
      return ''
    },
    [refresh],
  )

  const removeStaff = useCallback(
    async (email: string): Promise<string> => {
      if (!supabase) return 'Backend not configured.'
      if (email === currentEmail) return "You can't remove yourself."
      const { error: err } = await supabase.from('admin_users').delete().eq('email', email)
      if (err) return err.message
      await refresh()
      return ''
    },
    [currentEmail, refresh],
  )

  return { staff, error, addStaff, removeStaff }
}

export function ageLabel(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}
