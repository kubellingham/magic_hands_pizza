import type { CartLine } from './cartReducer'
import { getMenuItem } from '../data/menu'
import { addOnPrice, PIZZA_ADD_ONS } from '../data/addons'
import { effectivePrice, type OverrideMap } from '../lib/livePrices'

export interface PricedLine extends CartLine {
  name: string
  variantLabel: string
  addOnNames: string[]
  unitPrice: number
  lineTotal: number
  isVeg: boolean
}

/**
 * Prices are always derived fresh from the menu — never stored in the cart —
 * so a deployed price change can't leave stale prices in a saved cart.
 * Lines whose item/variant no longer exists in the menu are dropped.
 */
export function priceLines(lines: CartLine[], overrides: OverrideMap = {}): PricedLine[] {
  const priced: PricedLine[] = []
  for (const line of lines) {
    const item = getMenuItem(line.itemId)
    if (!item) continue
    const variant = item.variants.find((v) => v.id === line.variantId)
    if (!variant) continue
    const addOnsTotal = line.addOnIds.reduce((sum, id) => sum + addOnPrice(id, variant.id), 0)
    const unitPrice = effectivePrice(overrides, item.id, variant) + addOnsTotal
    priced.push({
      ...line,
      name: item.name,
      variantLabel: variant.label,
      addOnNames: line.addOnIds.map((id) => PIZZA_ADD_ONS.find((a) => a.id === id)?.name ?? id),
      unitPrice,
      lineTotal: unitPrice * line.qty,
      isVeg: variant.isVeg ?? item.isVeg,
    })
  }
  return priced
}

export function itemCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.qty, 0)
}

export interface Bill {
  itemTotal: number
  /** 10% off when itemTotal >= 999 */
  discount: number
  /** 2+ large pizzas → a 750ml cold drink on the house */
  freeDrink: boolean
  toPay: number
  /** Non-price notes, e.g. the Tuesday free-pizza deal (needs a pizza choice) */
  notes: string[]
}

function largePizzaCount(priced: PricedLine[]): number {
  return priced
    .filter((l) => {
      const item = getMenuItem(l.itemId)
      return (
        (item?.category === 'veg-pizza' || item?.category === 'nonveg-pizza') && l.variantId === 'L'
      )
    })
    .reduce((sum, l) => sum + l.qty, 0)
}

/**
 * The two deterministic offers are applied automatically (matching the
 * design); the Tuesday deal needs the customer to pick a small pizza, so it
 * stays a note the owner honors on WhatsApp.
 */
export function computeBill(priced: PricedLine[], now: Date): Bill {
  const itemTotal = priced.reduce((sum, l) => sum + l.lineTotal, 0)
  const largePizzas = largePizzaCount(priced)
  const freeDrink = largePizzas >= 2
  const discount = itemTotal >= 999 ? Math.round(itemTotal * 0.1) : 0
  const notes: string[] = []
  if (freeDrink && now.getDay() === 2) {
    notes.push('Tuesday deal: 2 Large pizzas → 1 Small pizza FREE — tell us your pick!')
  }
  return { itemTotal, discount, freeDrink, toPay: itemTotal - discount, notes }
}
