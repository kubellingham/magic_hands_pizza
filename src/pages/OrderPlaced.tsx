import { Link, useLocation } from 'react-router-dom'
import type { PlaceOrderResult } from '../lib/orders'
import { RESTAURANT } from '../data/restaurant'

export function OrderPlaced() {
  const { state } = useLocation() as { state: PlaceOrderResult | null }

  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      <span className="text-5xl">✅</span>
      <h1 className="mt-3 text-lg font-bold">Order sent!</h1>
      {state?.orderCode && (
        <p className="mt-1 text-sm text-ink/70">
          Your order code is <span className="font-mono font-bold">{state.orderCode}</span>
        </p>
      )}
      <p className="mt-2 max-w-xs text-sm text-ink/60">
        Make sure you pressed <b>Send</b> in WhatsApp — that's how the kitchen gets your order. {RESTAURANT.prepTimeNote.toLowerCase()}.
      </p>
      {state?.waLink && (
        <a href={state.waLink} target="_blank" rel="noopener" className="mt-4 text-sm font-bold text-brand underline">
          WhatsApp didn't open? Tap here
        </a>
      )}
      <Link to="/menu" className="mt-6 rounded-xl bg-brand px-6 py-2.5 text-sm font-bold text-white">
        Back to Menu
      </Link>
    </div>
  )
}
