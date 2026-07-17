import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { OrderStatus } from '../../lib/tracking'

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

export function ageLabel(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}
