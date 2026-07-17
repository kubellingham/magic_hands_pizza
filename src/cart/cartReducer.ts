import type { AddOnId } from '../data/addons'

export interface CartLine {
  /** itemId:variantId:addon1+addon2 — identical configs merge into one line */
  key: string
  itemId: string
  variantId: string
  addOnIds: AddOnId[]
  qty: number
}

export interface CartState {
  lines: CartLine[]
}

export type CartAction =
  | { type: 'add'; itemId: string; variantId: string; addOnIds: AddOnId[]; qty?: number }
  | { type: 'setQty'; key: string; qty: number }
  | { type: 'clear' }

export function lineKey(itemId: string, variantId: string, addOnIds: AddOnId[]): string {
  return `${itemId}:${variantId}:${[...addOnIds].sort().join('+')}`
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const key = lineKey(action.itemId, action.variantId, action.addOnIds)
      const qty = action.qty ?? 1
      const existing = state.lines.find((l) => l.key === key)
      if (existing) {
        return {
          lines: state.lines.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l)),
        }
      }
      return {
        lines: [
          ...state.lines,
          { key, itemId: action.itemId, variantId: action.variantId, addOnIds: action.addOnIds, qty },
        ],
      }
    }
    case 'setQty': {
      if (action.qty <= 0) {
        return { lines: state.lines.filter((l) => l.key !== action.key) }
      }
      return {
        lines: state.lines.map((l) => (l.key === action.key ? { ...l, qty: action.qty } : l)),
      }
    }
    case 'clear':
      return { lines: [] }
  }
}
