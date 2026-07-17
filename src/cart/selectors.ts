import type { CartLine } from './cartReducer'
import { getMenuItem } from '../data/menu'
import { addOnPrice, PIZZA_ADD_ONS } from '../data/addons'

export interface PricedLine extends CartLine {
  name: string
  variantLabel: string
  addOnNames: string[]
  unitPrice: number
  lineTotal: number
}

/**
 * Prices are always derived fresh from the menu — never stored in the cart —
 * so a deployed price change can't leave stale prices in a saved cart.
 * Lines whose item/variant no longer exists in the menu are dropped.
 */
export function priceLines(lines: CartLine[]): PricedLine[] {
  const priced: PricedLine[] = []
  for (const line of lines) {
    const item = getMenuItem(line.itemId)
    if (!item) continue
    const variant = item.variants.find((v) => v.id === line.variantId)
    if (!variant) continue
    const addOnsTotal = line.addOnIds.reduce((sum, id) => sum + addOnPrice(id, variant.id), 0)
    const unitPrice = variant.price + addOnsTotal
    priced.push({
      ...line,
      name: item.name,
      variantLabel: variant.label,
      addOnNames: line.addOnIds.map((id) => PIZZA_ADD_ONS.find((a) => a.id === id)?.name ?? id),
      unitPrice,
      lineTotal: unitPrice * line.qty,
    })
  }
  return priced
}

export function subtotal(priced: PricedLine[]): number {
  return priced.reduce((sum, l) => sum + l.lineTotal, 0)
}

export function itemCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.qty, 0)
}

/**
 * Offers are detected and surfaced as notes — never auto-applied to prices.
 * The owner confirms and applies discounts when the order arrives on WhatsApp.
 */
export function detectOffers(priced: PricedLine[], now: Date): string[] {
  const notes: string[] = []
  const largePizzas = priced
    .filter((l) => {
      const item = getMenuItem(l.itemId)
      return (item?.category === 'veg-pizza' || item?.category === 'nonveg-pizza') && l.variantId === 'L'
    })
    .reduce((sum, l) => sum + l.qty, 0)

  if (largePizzas >= 2) {
    notes.push('2 Large pizzas → FREE 750 ml cold drink')
    if (now.getDay() === 2) {
      notes.push('Tuesday deal: 2 Large pizzas → 1 Small pizza FREE')
    }
  }
  if (subtotal(priced) >= 999) {
    notes.push('Order ≥ ₹999 → up to 10% discount')
  }
  return notes
}
