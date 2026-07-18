import { RESTAURANT } from '../data/restaurant'
import type { OrderRecord } from './orderHistory'

/**
 * Digital receipt: a small branded PDF built client-side (jsPDF is
 * lazy-loaded so it never weighs down the main bundle), plus the matching
 * WhatsApp message for sending it to the customer.
 */

function inr(n: number): string {
  // jsPDF's built-in fonts lack the ₹ glyph — "Rs." renders everywhere.
  return `Rs. ${n.toLocaleString('en-IN')}`
}

export async function downloadReceiptPdf(order: OrderRecord): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: [80, 160] }) // receipt-printer proportions
  const W = 80
  const left = 8
  const right = W - 8
  let y = 12

  const line = (dashed = false) => {
    if (dashed) doc.setLineDashPattern([1.2, 1.2], 0)
    doc.setDrawColor(160)
    doc.line(left, y, right, y)
    doc.setLineDashPattern([], 0)
    y += 4.5
  }

  doc.setFont('helvetica', 'bolditalic')
  doc.setFontSize(15)
  doc.text("Magic Hand's", W / 2, y, { align: 'center' })
  y += 5.5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(216, 31, 26)
  doc.text('P  I  Z  Z  A', W / 2, y, { align: 'center' })
  doc.setTextColor(0)
  y += 4.5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.text(RESTAURANT.address, W / 2, y, { align: 'center', maxWidth: W - 12 })
  y += 6
  doc.text(`Ph: ${RESTAURANT.phoneDisplay}`, W / 2, y, { align: 'center' })
  y += 4
  line()

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(`RECEIPT  ${order.code}`, left, y)
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text(new Date(order.placedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }), left, y)
  doc.text(order.fulfilment === 'delivery' ? 'Delivery' : 'Pickup', right, y, { align: 'right' })
  y += 3
  doc.text(`Customer: ${order.customerName}`, left, y)
  y += 3.5
  line(true)

  doc.setFontSize(7.5)
  for (const item of order.items) {
    const label = `${item.qty} x ${item.name}${item.variant ? ` (${item.variant})` : ''}`
    const wrapped = doc.splitTextToSize(label, 48) as string[]
    doc.text(wrapped, left, y)
    doc.text(item.lineTotal === 0 ? 'FREE' : inr(item.lineTotal), right, y, { align: 'right' })
    y += wrapped.length * 3.2
    for (const addOn of item.addOns) {
      doc.setTextColor(110)
      doc.text(`   + ${addOn}`, left, y)
      doc.setTextColor(0)
      y += 3.2
    }
    y += 0.8
  }
  y += 1.5
  line(true)

  doc.text('Item total', left, y)
  doc.text(inr(order.itemTotal), right, y, { align: 'right' })
  y += 4
  if (order.discount > 0) {
    doc.text('Discount (10%)', left, y)
    doc.text(`- ${inr(order.discount)}`, right, y, { align: 'right' })
    y += 4
  }
  doc.text('Delivery', left, y)
  doc.text('FREE', right, y, { align: 'right' })
  y += 4.5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.text('TOTAL PAID', left, y)
  doc.text(inr(order.total), right, y, { align: 'right' })
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text(order.payment === 'upi' ? 'Paid via UPI' : 'Paid in cash', left, y)
  y += 4
  line()

  doc.setFontSize(7.5)
  doc.text('Thank you for ordering!', W / 2, y, { align: 'center' })
  y += 3.5
  doc.setFontSize(6.5)
  doc.setTextColor(110)
  doc.text(`Open ${RESTAURANT.hoursDisplay} - see you again soon`, W / 2, y, { align: 'center' })

  doc.save(`MagicHands-Receipt-${order.code}.pdf`)
}

/** The WhatsApp message the staff sends to the customer with the receipt. */
export function buildReceiptMessage(order: OrderRecord): string {
  const lines: string[] = []
  lines.push(`🧾 *${RESTAURANT.name} — Receipt*`)
  lines.push(`Order ${order.code} · delivered ✅`)
  lines.push('')
  for (const item of order.items) {
    const variant = item.variant ? ` (${item.variant})` : ''
    lines.push(`${item.qty}x ${item.name}${variant} — ${item.lineTotal === 0 ? 'FREE' : `₹${item.lineTotal}`}`)
  }
  lines.push('')
  if (order.discount > 0) lines.push(`Discount: −₹${order.discount}`)
  lines.push(`*Total paid: ₹${order.total}* (${order.payment === 'upi' ? 'UPI' : 'cash'})`)
  lines.push('')
  lines.push('Thank you for ordering — the PDF receipt is attached. See you again! 🍕')
  return lines.join('\n')
}

export function buildCustomerWaLink(customerPhone: string, message: string): string {
  return `https://wa.me/91${customerPhone}?text=${encodeURIComponent(message)}`
}
