import { supabase } from './supabase'

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'out' | 'delivered' | 'cancelled'

export interface TrackedOrder {
  orderCode: string
  status: OrderStatus
  fulfilment: 'delivery' | 'pickup'
  createdAt: string
}

/** Reads status via a security-definer RPC — never any customer PII. */
export async function fetchOrderStatus(code: string): Promise<TrackedOrder | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase.rpc('get_order_status', { code })
    if (error || !data) return null
    const row = Array.isArray(data) ? data[0] : data
    if (!row) return null
    return {
      orderCode: row.order_code,
      status: row.status,
      fulfilment: row.fulfilment,
      createdAt: row.created_at,
    }
  } catch {
    return null
  }
}
