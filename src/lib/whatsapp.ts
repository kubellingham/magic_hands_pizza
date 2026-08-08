import type { Bill, PricedLine } from '../cart/selectors'
import { RESTAURANT, whatsappHref } from '../data/restaurant'
import { formatINR } from './format'

export interface OrderDetails {
  orderCode: string
  customerName: string
  phone: string
  address: string
  notes: string
  fulfilment: 'delivery' | 'pickup'
  payment: 'upi' | 'cod'
  priced: PricedLine[]
  bill: Bill
}

export function buildOrderMessage(order: OrderDetails): string {
  const { bill } = order
  const lines: string[] = []
  lines.push(`🍕 *New Order — ${RESTAURANT.name}*`)
  lines.push(`Order code: ${order.orderCode}`)
  lines.push('')
  for (const l of order.priced) {
    const variant = l.variantLabel ? ` (${l.variantLabel})` : ''
    lines.push(`${l.qty}x ${l.name}${variant} — ${formatINR(l.lineTotal)}`)
    for (const addOn of l.addOnNames) {
      lines.push(`   + ${addOn}`)
    }
  }
  if (bill.freeDrink) {
    lines.push(`1x Cold Drink 750 ml — FREE (2 large pizza offer)`)
  }
  lines.push('')
  lines.push(`Item total: ${formatINR(bill.itemTotal)}`)
  if (bill.discount > 0) {
    lines.push(`Discount (10%, order ≥ ₹999): −${formatINR(bill.discount)}`)
  }
  lines.push(`*To pay: ${formatINR(bill.toPay)}*`)
  for (const note of bill.notes) {
    lines.push(note)
  }
  lines.push('')
  lines.push(order.fulfilment === 'delivery' ? '🛵 Delivery' : '🏃 Pickup')
  lines.push(order.payment === 'upi' ? 'Payment: UPI' : 'Payment: Cash')
  lines.push('')
  lines.push(`Name: ${order.customerName}`)
  lines.push(`Phone: ${order.phone}`)
  if (order.fulfilment === 'delivery') {
    lines.push(`Address: ${order.address}`)
  }
  if (order.notes.trim()) lines.push(`Notes: ${order.notes.trim()}`)
  return lines.join('\n')
}

/** Null in the demo build, where the hand-off is shown rather than performed. */
export function buildWaLink(message: string): string | null {
  return whatsappHref(message)
}
