import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loadOrderHistory, reorderableLines, type OrderRecord } from '../lib/orderHistory'
import { fetchOrderStatus, type OrderStatus } from '../lib/tracking'
import { downloadReceiptPdf } from '../lib/receipt'
import { formatINR } from '../lib/format'
import { useCart } from '../cart/CartContext'

const STATUS_CHIP: Record<OrderStatus, { label: string; cls: string }> = {
  new: { label: 'Received', cls: 'bg-chip text-soft' },
  preparing: { label: 'In the oven', cls: 'bg-accent/15 text-accent' },
  ready: { label: 'Ready', cls: 'bg-veg/15 text-veg' },
  out: { label: 'On the way', cls: 'bg-veg/15 text-veg' },
  delivered: { label: 'Delivered ✓', cls: 'bg-veg text-white' },
  cancelled: { label: 'Cancelled', cls: 'bg-brand/15 text-brand' },
}

export function Orders() {
  const navigate = useNavigate()
  const { dispatch } = useCart()
  const [history] = useState<OrderRecord[]>(loadOrderHistory)
  const [statuses, setStatuses] = useState<Record<string, OrderStatus>>({})
  const [busy, setBusy] = useState('')

  useEffect(() => {
    let alive = true
    history.slice(0, 8).forEach(async (order) => {
      const result = await fetchOrderStatus(order.code)
      if (alive && result) setStatuses((prev) => ({ ...prev, [order.code]: result.status }))
    })
    return () => {
      alive = false
    }
  }, [history])

  const receipt = async (order: OrderRecord) => {
    setBusy(order.code)
    try {
      await downloadReceiptPdf(order)
    } finally {
      setBusy('')
    }
  }

  const reorder = (order: OrderRecord) => {
    const lines = reorderableLines(order)
    if (lines.length === 0) return
    dispatch({ type: 'clear' })
    for (const line of lines) {
      dispatch({ type: 'add', itemId: line.itemId, variantId: line.variantId, addOnIds: line.addOnIds, qty: line.qty })
    }
    navigate('/cart')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back" className="text-xl">
          ‹
        </button>
        <h1 className="font-display text-[22px] font-extrabold">Your orders</h1>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-10 text-center">
          <span className="text-4xl">🧾</span>
          <p className="font-display mt-2 text-xl font-extrabold">No orders yet.</p>
          <p className="text-sm text-mut">First one's always the best one.</p>
          <Link
            to="/menu"
            className="mt-5 rounded-2xl bg-brand px-7 py-3 text-sm font-extrabold text-white"
          >
            Browse menu
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-5 pt-2 pb-10">
          {history.map((order) => {
            const status = statuses[order.code]
            const chip = status ? STATUS_CHIP[status] : null
            const active = status && !['delivered', 'cancelled'].includes(status)
            const summary = order.items
              .filter((i) => i.lineTotal > 0)
              .map((i) => `${i.qty}× ${i.name.replace(/ Pizza$/, '')}${i.variant ? ` (${i.variant[0]})` : ''}`)
              .join(', ')
            const canReorder = reorderableLines(order).length > 0
            return (
              <div key={order.code} className="rounded-2xl border border-line bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[15px] font-extrabold text-accent">{order.code}</span>
                  {chip && (
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${chip.cls}`}>
                      {chip.label}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[11px] text-mut">
                  {new Date(order.placedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} ·{' '}
                  {order.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'} · {order.payment.toUpperCase()}
                </div>
                <div className="mt-2 line-clamp-2 text-xs leading-snug text-soft">{summary}</div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
                  <span className="font-display text-[17px] font-extrabold">{formatINR(order.total)}</span>
                  <span className="flex gap-2">
                    {status === 'delivered' && (
                      <button
                        type="button"
                        disabled={busy === order.code}
                        onClick={() => receipt(order)}
                        className="rounded-xl border border-line bg-chip px-3 py-2 text-[11px] font-bold text-soft disabled:opacity-50"
                      >
                        {busy === order.code ? 'Saving…' : 'Receipt'}
                      </button>
                    )}
                    {canReorder && (
                      <button
                        type="button"
                        onClick={() => reorder(order)}
                        className="rounded-xl bg-brand px-4 py-2 text-[11px] font-extrabold text-white"
                      >
                        Order again ↻
                      </button>
                    )}
                    {active && (
                      <Link
                        to={`/track/${order.code}`}
                        className="rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 text-[11px] font-extrabold text-accent"
                      >
                        Track ›
                      </Link>
                    )}
                  </span>
                </div>
              </div>
            )
          })}
          <p className="pt-1 text-center text-[10px] text-mut">Saved on this phone · last 20 orders</p>
        </div>
      )}
    </div>
  )
}
