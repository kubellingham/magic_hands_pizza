import type { AddOnId } from '../data/addons'

/**
 * On-device order history (no accounts): the full snapshot of every order
 * this phone placed, saved at placement time. Powers My Orders, receipts,
 * and one-tap reorder.
 */

export interface ReceiptItem {
  name: string
  variant: string | null
  addOns: string[]
  qty: number
  lineTotal: number
  /** Cart refs — present from v2 onward, enable exact reorder */
  itemId?: string
  variantId?: string
  addOnIds?: AddOnId[]
}

export interface OrderRecord {
  code: string
  placedAt: number
  items: ReceiptItem[]
  itemTotal: number
  discount: number
  total: number
  payment: 'upi' | 'cod'
  fulfilment: 'delivery' | 'pickup'
  customerName: string
}

const KEY = 'mhp-order-history-v1'
const MAX_ORDERS = 20

export function loadOrderHistory(): OrderRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function addOrderToHistory(record: OrderRecord): void {
  try {
    const history = [record, ...loadOrderHistory()].slice(0, MAX_ORDERS)
    localStorage.setItem(KEY, JSON.stringify(history))
  } catch {
    // storage unavailable — history just won't persist
  }
}

/** Lines that can be put straight back in the cart (skips free-offer items). */
export function reorderableLines(
  record: OrderRecord,
): Array<{ itemId: string; variantId: string; addOnIds: AddOnId[]; qty: number }> {
  return record.items
    .filter((i) => i.itemId && i.variantId && i.lineTotal > 0)
    .map((i) => ({
      itemId: i.itemId!,
      variantId: i.variantId!,
      addOnIds: i.addOnIds ?? [],
      qty: i.qty,
    }))
}
