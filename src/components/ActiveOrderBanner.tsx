import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import { loadLastOrder, clearLastOrder } from '../lib/lastOrder'
import { fetchOrderStatus, type OrderStatus } from '../lib/tracking'

const POLL_MS = 30_000

const STATUS_TEXT: Record<OrderStatus, string> = {
  new: 'Order received',
  preparing: 'Preparing your food',
  ready: 'Ready!',
  out: 'Out for delivery',
  delivered: '',
  cancelled: '',
}

/**
 * Floating strip on Home while an order is in flight — sits just above the
 * cart bar when both are visible. Disappears once delivered/cancelled.
 */
export function ActiveOrderBanner() {
  const { count } = useCart()
  const [order, setOrder] = useState<{ code: string; status: OrderStatus } | null>(null)

  useEffect(() => {
    const last = loadLastOrder()
    if (!last) return
    let alive = true
    const poll = async () => {
      const result = await fetchOrderStatus(last.code)
      if (!alive || !result) return
      if (result.status === 'delivered' || result.status === 'cancelled') {
        clearLastOrder()
        setOrder(null)
        return
      }
      setOrder({ code: last.code, status: result.status })
    }
    poll()
    const timer = setInterval(poll, POLL_MS)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [])

  if (!order) return null
  const bottom = count > 0 ? 'bottom-[60px] pb-1' : 'bottom-0 pb-[env(safe-area-inset-bottom)]'

  return (
    <div className={`fixed inset-x-0 z-30 mx-auto max-w-md ${bottom}`}>
      <Link
        to={`/track/${order.code}`}
        className="mx-3 mb-2 flex items-center justify-between rounded-xl border border-veg/40 bg-[#132a1c] px-4 py-3 shadow-[0_6px_20px_rgba(0,0,0,.45)]"
      >
        <span className="flex items-center gap-2.5 text-[13px] font-bold text-white">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute h-full w-full animate-ping rounded-full bg-veg opacity-60" />
            <span className="h-2.5 w-2.5 rounded-full bg-veg" />
          </span>
          🛵 {STATUS_TEXT[order.status]} · {order.code}
        </span>
        <span className="text-xs font-bold text-veg">Track ›</span>
      </Link>
    </div>
  )
}
