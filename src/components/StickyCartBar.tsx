import { Link } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import { formatINR } from '../lib/format'

/**
 * Floating view-cart bar, always visible when the cart has items — fixed to
 * the bottom of the viewport, no scrolling needed. Pages showing it should
 * leave ~72px of bottom padding.
 */
export function StickyCartBar() {
  const { count, bill } = useCart()
  if (count === 0) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-0">
      <Link
        to="/cart"
        className="flex items-center justify-between bg-gradient-to-r from-brand-dark to-brand px-[18px] py-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))] text-white shadow-[0_-6px_20px_rgba(0,0,0,.4)]"
      >
        <span className="text-xs font-semibold">
          {count} item{count > 1 ? 's' : ''} · {formatINR(bill.toPay)}
        </span>
        <span className="flex items-center gap-1.5 text-sm font-extrabold">View Cart ›</span>
      </Link>
    </div>
  )
}
