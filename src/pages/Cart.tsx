import { Link } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import { detectOffers } from '../cart/selectors'
import { QtyStepper } from '../components/QtyStepper'
import { formatINR } from '../lib/format'
import { RESTAURANT } from '../data/restaurant'

export function Cart() {
  const { priced, subtotal, dispatch } = useCart()
  const offerNotes = detectOffers(priced, new Date())

  if (priced.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
        <span className="text-4xl">🛒</span>
        <p className="text-sm text-ink/60">Your cart is empty.</p>
        <Link to="/menu" className="rounded-xl bg-brand px-6 py-2.5 text-sm font-bold text-white">
          Browse Menu
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 pb-4">
      <div className="mt-3 space-y-3">
        {priced.map((line) => (
          <div key={line.key} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">
                  {line.name}
                  {line.variantLabel && <span className="text-ink/60"> · {line.variantLabel}</span>}
                </div>
                {line.addOnNames.length > 0 && (
                  <div className="mt-0.5 text-xs text-ink/60">+ {line.addOnNames.join(', ')}</div>
                )}
                <div className="mt-1 text-sm font-bold">{formatINR(line.lineTotal)}</div>
              </div>
              <QtyStepper qty={line.qty} onChange={(qty) => dispatch({ type: 'setQty', key: line.key, qty })} />
            </div>
          </div>
        ))}
      </div>

      {offerNotes.length > 0 && (
        <div className="mt-4 rounded-xl border border-veg/40 bg-veg/5 p-3 text-xs text-veg">
          <div className="font-bold">🎉 Offers you may be eligible for:</div>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            {offerNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <p className="mt-1.5 text-[11px] opacity-80">
            Offers are applied by the restaurant when confirming your order.
          </p>
        </div>
      )}

      <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex justify-between text-sm font-bold">
          <span>Subtotal</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        <p className="mt-1 text-[11px] text-ink/50">
          {RESTAURANT.prepTimeNote} · {RESTAURANT.deliveryNote}
        </p>
      </div>

      <Link
        to="/checkout"
        className="mt-4 block rounded-xl bg-brand py-3.5 text-center text-sm font-bold text-white active:bg-brand-dark"
      >
        Proceed to Checkout · {formatINR(subtotal)}
      </Link>
    </div>
  )
}
