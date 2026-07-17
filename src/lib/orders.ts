import { supabase } from './supabase'
import { buildOrderMessage, buildWaLink, type OrderDetails } from './whatsapp'

export function generateOrderCode(): string {
  return 'MH-' + Date.now().toString(36).toUpperCase().slice(-6)
}

export interface PlaceOrderResult {
  orderCode: string
  waLink: string
  /** false when the DB insert failed — the WhatsApp message still carries the order */
  savedToDb: boolean
}

/**
 * WhatsApp is the owner's real notification channel; Supabase is the record.
 * A DB failure must never lose an order, so we always return the wa.me link.
 */
export async function placeOrder(order: OrderDetails): Promise<PlaceOrderResult> {
  const message = buildOrderMessage(order)
  const waLink = buildWaLink(message)
  let savedToDb = false

  if (supabase) {
    try {
      const insert = supabase.from('orders').insert({
        order_code: order.orderCode,
        customer_name: order.customerName,
        phone: order.phone,
        address: order.address,
        notes: order.notes.trim() || null,
        items: order.priced.map((l) => ({
          item: l.name,
          variant: l.variantLabel || null,
          addOns: l.addOnNames,
          qty: l.qty,
          lineTotal: l.lineTotal,
        })),
        subtotal: order.subtotal,
        offer_note: order.offerNotes.join('; ') || null,
      })
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 3000),
      )
      const { error } = await Promise.race([insert, timeout])
      savedToDb = !error
    } catch {
      savedToDb = false
    }
  }

  return { orderCode: order.orderCode, waLink, savedToDb }
}
