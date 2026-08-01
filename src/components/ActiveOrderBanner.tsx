import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import { loadLastOrder, clearLastOrder } from '../lib/lastOrder'
import { fetchOrderStatus, type OrderStatus } from '../lib/tracking'

const POLL_MS = 15_000

const STATUS_TEXT: Record<OrderStatus, string> = {
  new: 'Order received',
  preparing: 'In the oven now',
  ready: 'Boxed and ready',
  out: 'On the way to you',
  delivered: '',
  cancelled: '',
}

/**
 * Live strip on Home while an order is in flight — sits above the cart bar
 * when both are showing. Clears itself once delivered or cancelled.
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

  return (
    <div
      className={`fixed inset-x-0 z-30 mx-auto max-w-md px-3 ${
        count > 0 ? 'bottom-[72px]' : 'bottom-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]'
      }`}
    >
      <Link
        to={`/track/${order.code}`}
        className="flex items-center justify-between rounded-2xl border border-accent/30 bg-card px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,.35)]"
      >
        <span className="flex items-center gap-2.5 text-[13px] font-bold">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          </span>
          {STATUS_TEXT[order.status]} · {order.code}
        </span>
        <span className="text-xs font-bold text-accent">Track ›</span>
      </Link>
    </div>
  )
}
