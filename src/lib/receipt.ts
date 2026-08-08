import { RESTAURANT, customerWhatsappHref } from '../data/restaurant'
import type { OrderRecord } from './orderHistory'

/**
 * Digital receipt: a branded ticket-format PDF built client-side (jsPDF is
 * lazy-loaded so it never weighs down the main bundle), plus the matching
 * WhatsApp message for sending it to the customer.
 */

function inr(n: number): string {
  // jsPDF's built-in fonts have no ₹ glyph — "Rs." renders everywhere.
  return `Rs. ${n.toLocaleString('en-IN')}`
}

const INK: [number, number, number] = [28, 22, 16]
const RED: [number, number, number] = [214, 47, 33]
const GREEN: [number, number, number] = [30, 122, 67]
const MUTED: [number, number, number] = [140, 122, 94]

export async function downloadReceiptPdf(order: OrderRecord): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const W = 80
  const doc = new jsPDF({ unit: 'mm', format: [W, 175] })
  const left = 7
  const right = W - 7
  let y = 6

  // Perforated top edge
  doc.setFillColor(...INK)
  for (let x = 3; x < W - 2; x += 4) doc.circle(x, y, 0.7, 'F')
  y += 7

  doc.setTextColor(...INK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text(RESTAURANT.name, W / 2, y, { align: 'center' })
  y += 4.5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...MUTED)
  doc.text(`${RESTAURANT.address}`, W / 2, y, { align: 'center', maxWidth: W - 14 })
  y += 5.5
  doc.text(`${RESTAURANT.phoneDisplay}  ·  open till 4 AM`, W / 2, y, { align: 'center' })
  y += 5

  // PAID stamp
  doc.setDrawColor(...GREEN)
  doc.setLineWidth(0.6)
  doc.roundedRect(right - 22, y - 3.5, 22, 8, 1.5, 1.5, 'S')
  doc.setTextColor(...GREEN)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('PAID', right - 11, y + 2, { align: 'center' })

  doc.setTextColor(...MUTED)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.text('ORDER', left, y - 1)
  doc.setTextColor(...RED)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(order.code, left, y + 4)
  y += 9

  doc.setTextColor(...MUTED)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  const placed = new Date(order.placedAt)
  doc.text(placed.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }), left, y)
  doc.text(order.fulfilment === 'delivery' ? 'Delivered' : 'Picked up', right, y, { align: 'right' })
  y += 3.5
  doc.text(`For ${order.customerName}`, left, y)
  doc.text('25-30 min', right, y, { align: 'right' })
  y += 4

  const dashed = () => {
    doc.setDrawColor(200, 190, 170)
    doc.setLineWidth(0.25)
    doc.setLineDashPattern([1, 1.2], 0)
    doc.line(left, y, right, y)
    doc.setLineDashPattern([], 0)
    y += 4.5
  }
  dashed()

  doc.setTextColor(...INK)
  doc.setFontSize(7.5)
  for (const item of order.items) {
    const label = `${item.qty}x ${item.name}${item.variant ? ` (${item.variant})` : ''}`
    const wrapped = doc.splitTextToSize(label, 48) as string[]
    doc.setFont('helvetica', 'bold')
    doc.text(wrapped, left, y)
    doc.setFont('helvetica', 'normal')
    doc.text(item.lineTotal === 0 ? 'FREE' : inr(item.lineTotal), right, y, { align: 'right' })
    y += wrapped.length * 3.3
    for (const addOn of item.addOns) {
      doc.setTextColor(...MUTED)
      doc.text(`   + ${addOn}`, left, y)
      doc.setTextColor(...INK)
      y += 3.2
    }
    y += 1
  }
  y += 1
  dashed()

  doc.setFontSize(7.5)
  doc.text('Items', left, y)
  doc.text(inr(order.itemTotal), right, y, { align: 'right' })
  y += 4
  if (order.discount > 0) {
    doc.setTextColor(...GREEN)
    doc.text('Deal discount', left, y)
    doc.text(`- ${inr(order.discount)}`, right, y, { align: 'right' })
    doc.setTextColor(...INK)
    y += 4
  }
  doc.text('Delivery', left, y)
  doc.setTextColor(...GREEN)
  doc.text('FREE', right, y, { align: 'right' })
  doc.setTextColor(...INK)
  y += 5.5

  doc.setDrawColor(...INK)
  doc.setLineWidth(0.4)
  doc.line(left, y - 3, right, y - 3)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(order.payment === 'upi' ? 'PAID · UPI' : 'PAID · CASH', left, y + 1)
  doc.setFontSize(15)
  doc.text(inr(order.total), right, y + 2, { align: 'right' })
  y += 10

  // Night-shift sign-off
  const lateNight = placed.getHours() >= 23 || placed.getHours() < 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...MUTED)
  if (lateNight) {
    doc.text('You ordered at 3 AM. We respect that.', W / 2, y, { align: 'center' })
    y += 4
  }
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...INK)
  doc.setFontSize(7)
  doc.text("The light that's still on.", W / 2, y, { align: 'center' })
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.setTextColor(...MUTED)
  doc.text('Thank you — see you again soon.', W / 2, y, { align: 'center' })
  y += 6

  // Perforated bottom edge
  doc.setFillColor(...INK)
  for (let x = 3; x < W - 2; x += 4) doc.circle(x, y, 0.7, 'F')

  doc.save(`MagicHands-Receipt-${order.code}.pdf`)
}

/** The WhatsApp message staff send to the customer alongside the PDF. */
export function buildReceiptMessage(order: OrderRecord): string {
  const lines: string[] = []
  lines.push(`🧾 *${RESTAURANT.name} — receipt*`)
  lines.push(`Order ${order.code} · delivered ✅`)
  lines.push('')
  for (const item of order.items) {
    const variant = item.variant ? ` (${item.variant})` : ''
    lines.push(`${item.qty}x ${item.name}${variant} — ${item.lineTotal === 0 ? 'FREE' : `₹${item.lineTotal}`}`)
  }
  lines.push('')
  if (order.discount > 0) lines.push(`Deal discount: −₹${order.discount}`)
  lines.push(`*Paid: ₹${order.total}* (${order.payment === 'upi' ? 'UPI' : 'cash'})`)
  lines.push('')
  lines.push("Receipt PDF attached. The light's still on till 4 AM — see you again 🍕")
  return lines.join('\n')
}

/** Null in the demo build — a receipt must never reach a real customer. */
export function buildCustomerWaLink(customerPhone: string, message: string): string | null {
  return customerWhatsappHref(customerPhone, message)
}
