import type { PricedLine } from '../cart/selectors'
import { RESTAURANT } from '../data/restaurant'
import { formatINR } from './format'

export interface OrderDetails {
  orderCode: string
  customerName: string
  phone: string
  address: string
  notes: string
  priced: PricedLine[]
  subtotal: number
  offerNotes: string[]
}

export function buildOrderMessage(order: OrderDetails): string {
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
  lines.push('')
  lines.push(`*Subtotal: ${formatINR(order.subtotal)}*`)
  for (const note of order.offerNotes) {
    lines.push(`Offer eligible: ${note}`)
  }
  lines.push('')
  lines.push(`Name: ${order.customerName}`)
  lines.push(`Phone: ${order.phone}`)
  lines.push(`Address: ${order.address}`)
  if (order.notes.trim()) lines.push(`Notes: ${order.notes.trim()}`)
  return lines.join('\n')
}

export function buildWaLink(message: string): string {
  return `https://wa.me/${RESTAURANT.whatsappNumber}?text=${encodeURIComponent(message)}`
}
