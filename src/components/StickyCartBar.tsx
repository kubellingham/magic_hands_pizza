import { Link } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import { formatINR } from '../lib/format'

/**
 * Floating view-cart bar, always visible when the cart has items.
 * Pages showing it leave ~96px of bottom padding.
 */
export function StickyCartBar() {
  const { count, bill } = useCart()
  if (count === 0) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <Link
        to="/cart"
        className="flex items-center justify-between rounded-2xl bg-brand px-5 py-3.5 text-white shadow-[0_8px_28px_rgba(230,51,42,.45)]"
      >
        <span className="text-[13px] font-semibold">
          {count} item{count > 1 ? 's' : ''} · {formatINR(bill.toPay)}
        </span>
        <span className="text-sm font-bold">View cart ›</span>
      </Link>
    </div>
  )
}
