import { Link } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import { formatINR } from '../lib/format'

/** The red view-cart strip pinned to the bottom whenever the cart has items. */
export function StickyCartBar() {
  const { count, bill } = useCart()
  if (count === 0) return null
  return (
    <Link
      to="/cart"
      className="sticky bottom-0 z-20 flex items-center justify-between bg-gradient-to-r from-brand-dark to-brand px-[18px] py-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))] text-white"
    >
      <span className="text-xs font-semibold">
        {count} item{count > 1 ? 's' : ''} · {formatINR(bill.toPay)}
      </span>
      <span className="flex items-center gap-1.5 text-sm font-extrabold">View Cart ›</span>
    </Link>
  )
}
