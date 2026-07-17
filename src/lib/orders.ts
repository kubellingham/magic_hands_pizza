import { supabase } from './supabase'
import { buildOrderMessage, buildWaLink, type OrderDetails } from './whatsapp'

export function generateOrderCode(): string {
  return 'MH-' + Date.now().toString(36).toUpperCase().slice(-6)
}

export interface PlaceOrderResult {
  orderCode: string
  waLink: string
  toPay: number
  payment: 'upi' | 'cod'
  /** false when the DB insert failed — the WhatsApp message still carries the order */
  savedToDb: boolean
}

/**
 * WhatsApp is the owner's real notification channel; Supabase is the record
 * (and powers the admin board + tracking). A DB failure must never lose an
 * order, so we always return the wa.me link.
 */
export async function placeOrder(order: OrderDetails): Promise<PlaceOrderResult> {
  const message = buildOrderMessage(order)
  const waLink = buildWaLink(message)
  let savedToDb = false

  if (supabase) {
    try {
      const items = order.priced.map((l) => ({
        item: l.name,
        variant: l.variantLabel || null,
        addOns: l.addOnNames,
        qty: l.qty,
        lineTotal: l.lineTotal,
      }))
      if (order.bill.freeDrink) {
        items.push({ item: 'Cold Drink 750 ml (FREE offer)', variant: null, addOns: [], qty: 1, lineTotal: 0 })
      }
      const insert = supabase.from('orders').insert({
        order_code: order.orderCode,
        customer_name: order.customerName,
        phone: order.phone,
        address: order.address,
        notes: order.notes.trim() || null,
        items,
        subtotal: order.bill.itemTotal,
        discount: order.bill.discount,
        total: order.bill.toPay,
        fulfilment: order.fulfilment,
        payment: order.payment,
        offer_note: order.bill.notes.join('; ') || null,
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

  return { orderCode: order.orderCode, waLink, toPay: order.bill.toPay, payment: order.payment, savedToDb }
}
