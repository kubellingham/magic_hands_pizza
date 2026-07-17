import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchOrderStatus, type TrackedOrder, type OrderStatus } from '../lib/tracking'
import { RESTAURANT } from '../data/restaurant'

const POLL_MS = 12_000

const STATUS_RANK: Record<OrderStatus, number> = {
  new: 0,
  preparing: 1,
  ready: 2,
  out: 3,
  delivered: 4,
  cancelled: -1,
}

interface Step {
  title: string
  sub?: string
  /** step is complete at/after this rank */
  doneAt: number
  /** step is the current one at/after this rank (until doneAt) */
  activeAt: number
}

function stepsFor(order: TrackedOrder): Step[] {
  const pickup = order.fulfilment === 'pickup'
  const placedTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  })
  return [
    { title: 'Order received', sub: placedTime, doneAt: 0, activeAt: 0 },
    { title: 'Preparing your food', sub: 'In the oven now', doneAt: 2, activeAt: 1 },
    pickup
      ? { title: 'Ready for pickup', sub: 'Collect at the counter', doneAt: 4, activeAt: 2 }
      : { title: 'Out for delivery', doneAt: 4, activeAt: 3 },
    { title: pickup ? 'Picked up' : 'Delivered', doneAt: 4, activeAt: 4 },
  ]
}

export function Track() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<TrackedOrder | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!code) return
    let alive = true
    const poll = async () => {
      const result = await fetchOrderStatus(code)
      if (!alive) return
      setLoaded(true)
      if (result) setOrder(result)
    }
    poll()
    const timer = setInterval(poll, POLL_MS)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [code])

  const rank = order ? STATUS_RANK[order.status] : 0
  const cancelled = order?.status === 'cancelled'
  const delivered = order?.status === 'delivered'
  const headline = !order
    ? 'Tracking your order…'
    : cancelled
      ? 'Order cancelled'
      : delivered
        ? order.fulfilment === 'pickup'
          ? 'Picked up — enjoy!'
          : 'Delivered — enjoy!'
        : order.status === 'ready' && order.fulfilment === 'pickup'
          ? 'Ready for pickup!'
          : 'Arriving in 25–30 min'

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      {/* Decorative map header */}
      <div
        className="relative h-[180px] shrink-0 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #20463a, #132a24)' }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.06) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        <svg viewBox="0 0 300 180" className="absolute inset-0 h-full w-full">
          <path
            d="M40 150 Q120 120 150 90 T260 40"
            fill="none"
            stroke="#d81f1a"
            strokeWidth="4"
            strokeDasharray="8 7"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute bottom-[26px] left-8 h-3.5 w-3.5 rounded-full border-[3px] border-brand bg-white" />
        <div className="absolute top-7 right-11 text-[22px]">🏠</div>
        <div className="absolute top-20 left-[120px] text-xl">🛵</div>
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="Home"
          className="absolute top-3.5 left-4 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-black/45 text-lg text-white"
        >
          ‹
        </button>
      </div>

      <div className="px-5 pt-4 pb-2">
        <h1 className="font-cond text-2xl leading-none font-bold">{headline}</h1>
        <p className="mt-1 text-xs text-mut">
          Order #{code}
          {order && !cancelled && !delivered && ' · on time'}
          {!loaded && ' · connecting…'}
          {loaded && !order && ' · status not available yet — the kitchen has your WhatsApp order'}
        </p>
      </div>

      {cancelled ? (
        <div className="mx-5 mt-2 rounded-xl border border-brand/40 bg-brand/10 p-4 text-sm">
          This order was cancelled. If that's unexpected, call us — {RESTAURANT.phoneDisplay}.
        </div>
      ) : (
        <div className="flex flex-col px-5 pt-2">
          {order &&
            stepsFor(order).map((step, i, steps) => {
              const done = rank >= step.doneAt
              const active = !done && rank >= step.activeAt
              const last = i === steps.length - 1
              return (
                <div key={step.title} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] ${
                        done
                          ? 'bg-veg text-white'
                          : active
                            ? 'bg-brand text-white'
                            : 'border border-line bg-chip text-mut'
                      }`}
                    >
                      {done ? '✓' : '●'}
                    </span>
                    {!last && (
                      <span className={`min-h-[22px] w-0.5 flex-1 ${done ? 'bg-veg' : 'bg-line'}`} />
                    )}
                  </div>
                  <div className="pb-4">
                    <div className={`text-[13px] font-bold ${done || active ? 'text-white' : 'text-mut'}`}>
                      {step.title}
                    </div>
                    {step.sub && (done || active) && (
                      <div className="text-[11px] text-mut">{step.sub}</div>
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      )}

      <div className="mt-auto flex items-center gap-3 bg-card px-5 py-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))]">
        <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-line text-lg">🍕</div>
        <div className="flex-1">
          <div className="text-[13px] font-bold">{RESTAURANT.name}</div>
          <div className="text-[11px] text-mut">Questions about your order? Call us</div>
        </div>
        <a
          href={RESTAURANT.telLink}
          aria-label="Call restaurant"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-veg text-white"
        >
          ✆
        </a>
      </div>
    </div>
  )
}
