import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { cartReducer, type CartAction, type CartLine, type CartState } from './cartReducer'
import { computeBill, itemCount, priceLines, type Bill, type PricedLine } from './selectors'
import { usePriceOverrides } from '../lib/livePrices'

const STORAGE_KEY = 'mhp-cart-v1'

interface CartValue {
  lines: CartLine[]
  priced: PricedLine[]
  bill: Bill
  count: number
  dispatch: (action: CartAction) => void
}

const CartContext = createContext<CartValue | null>(null)

function loadInitial(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { lines: [] }
    const parsed = JSON.parse(raw) as CartState
    if (!Array.isArray(parsed.lines)) return { lines: [] }
    return parsed
  } catch {
    return { lines: [] }
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadInitial)
  const overrides = usePriceOverrides()

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage full/unavailable — cart still works in memory
    }
  }, [state])

  const value = useMemo<CartValue>(() => {
    const priced = priceLines(state.lines, overrides)
    return {
      lines: state.lines,
      priced,
      bill: computeBill(priced, new Date()),
      count: itemCount(state.lines),
      dispatch,
    }
  }, [state, overrides])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
