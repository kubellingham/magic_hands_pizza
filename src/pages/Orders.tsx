import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loadOrderHistory, type OrderRecord } from '../lib/orderHistory'
import { fetchOrderStatus, type OrderStatus } from '../lib/tracking'
import { downloadReceiptPdf } from '../lib/receipt'
import { formatINR } from '../lib/format'

const STATUS_CHIP: Record<OrderStatus, { label: string; cls: string }> = {
  new: { label: 'Received', cls: 'bg-chip text-soft' },
  preparing: { label: 'Preparing', cls: 'bg-warn/20 text-warn' },
  ready: { label: 'Ready', cls: 'bg-veg/20 text-veg' },
  out: { label: 'On the way', cls: 'bg-veg/20 text-veg' },
  delivered: { label: 'Delivered ✓', cls: 'bg-veg text-white' },
  cancelled: { label: 'Cancelled', cls: 'bg-brand/20 text-brand' },
}

export function Orders() {
  const navigate = useNavigate()
  const [history] = useState<OrderRecord[]>(loadOrderHistory)
  const [statuses, setStatuses] = useState<Record<string, OrderStatus>>({})
  const [downloading, setDownloading] = useState('')

  useEffect(() => {
    let alive = true
    // fetch live status for the recent few (older ones rarely change)
    history.slice(0, 8).forEach(async (order) => {
      const result = await fetchOrderStatus(order.code)
      if (alive && result) setStatuses((prev) => ({ ...prev, [order.code]: result.status }))
    })
    return () => {
      alive = false
    }
  }, [history])

  const receipt = async (order: OrderRecord) => {
    setDownloading(order.code)
    try {
      await downloadReceiptPdf(order)
    } finally {
      setDownloading('')
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back" className="text-xl text-white">
          ‹
        </button>
        <span className="font-cond text-[22px] font-bold">My Orders</span>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <span className="text-4xl">🧾</span>
          <p className="text-sm text-mut">No orders from this phone yet.</p>
          <Link to="/menu" className="rounded-[14px] bg-brand px-6 py-2.5 text-sm font-extrabold text-white">
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-5 pt-2 pb-8">
          {history.map((order) => {
            const status = statuses[order.code]
            const chip = status ? STATUS_CHIP[status] : null
            const active = status && !['delivered', 'cancelled'].includes(status)
            const summary = order.items
              .filter((i) => i.lineTotal > 0)
              .map((i) => `${i.qty}× ${i.name}${i.variant ? ` (${i.variant[0]})` : ''}`)
              .join(', ')
            return (
              <div key={order.code} className="rounded-[16px] border border-white/5 bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-anton text-[15px] text-gold">{order.code}</span>
                  {chip && <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${chip.cls}`}>{chip.label}</span>}
                </div>
                <div className="mt-1 text-[11px] text-mut">
                  {new Date(order.placedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} ·{' '}
                  {order.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'} · {order.payment.toUpperCase()}
                </div>
                <div className="mt-2 line-clamp-2 text-xs leading-snug text-soft">{summary}</div>
                <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2.5">
                  <span className="text-sm font-bold">{formatINR(order.total)}</span>
                  <span className="flex gap-2">
                    {status === 'delivered' && (
                      <button
                        type="button"
                        disabled={downloading === order.code}
                        onClick={() => receipt(order)}
                        className="rounded-lg bg-chip px-3 py-1.5 text-xs font-bold text-soft disabled:opacity-50"
                      >
                        {downloading === order.code ? 'Saving…' : '🧾 Receipt PDF'}
                      </button>
                    )}
                    {active && (
                      <Link
                        to={`/track/${order.code}`}
                        className="rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white"
                      >
                        Track ›
                      </Link>
                    )}
                  </span>
                </div>
              </div>
            )
          })}
          <p className="pt-1 text-center text-[10px] text-mut">
            Orders are saved on this phone (up to 20 recent).
          </p>
        </div>
      )}
    </div>
  )
}
