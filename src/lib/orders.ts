import { buildOrderMessage, buildWaLink, type OrderDetails } from './whatsapp'
import { insertOrderRow, queueOrder, type OrderRow } from './orderOutbox'

export function generateOrderCode(): string {
  return 'MH-' + Date.now().toString(36).toUpperCase().slice(-6)
}

export interface PlaceOrderResult {
  orderCode: string
  waLink: string
  toPay: number
  payment: 'upi' | 'cod'
  /** false when the DB insert failed — the order is parked in the outbox and retried */
  savedToDb: boolean
}

const clamp = (text: string, max: number) => text.trim().slice(0, max)

/**
 * The row the kitchen board reads. Every field is trimmed to what the table
 * accepts, because a rejected insert costs the restaurant a real order.
 */
export function buildOrderRow(order: OrderDetails): OrderRow {
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

  // Pickup orders legitimately have no address — say so rather than sending
  // an empty string the kitchen can't read.
  const address = clamp(order.address, 400) || (order.fulfilment === 'pickup' ? 'Pickup at the counter' : '')
  const notes = clamp(order.notes, 300)
  const offerNote = clamp(order.bill.notes.join('; '), 300)

  return {
    order_code: order.orderCode,
    customer_name: clamp(order.customerName, 80) || 'Guest',
    phone: order.phone,
    address,
    notes: notes || null,
    items,
    subtotal: Math.max(1, Math.min(20000, order.bill.itemTotal)),
    discount: Math.max(0, Math.min(5000, order.bill.discount)),
    total: Math.max(0, Math.min(20000, order.bill.toPay)),
    fulfilment: order.fulfilment,
    payment: order.payment,
    offer_note: offerNote || null,
  }
}

/**
 * WhatsApp is the owner's real notification channel; Supabase is the record
 * (and powers the admin board + tracking). A DB failure must never lose an
 * order, so we always return the wa.me link — and park the row for retry.
 */
export async function placeOrder(order: OrderDetails): Promise<PlaceOrderResult> {
  const waLink = buildWaLink(buildOrderMessage(order))
  const row = buildOrderRow(order)

  const { ok, error } = await insertOrderRow(row)
  if (!ok) {
    console.warn('[order] insert failed, queued for retry:', error)
    queueOrder(row, error)
  }

  return { orderCode: order.orderCode, waLink, toPay: order.bill.toPay, payment: order.payment, savedToDb: ok }
}
