import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchOrderStatus, type TrackedOrder, type OrderStatus } from '../lib/tracking'
import { loadOrderHistory, type OrderRecord } from '../lib/orderHistory'
import { RESTAURANT } from '../data/restaurant'
import { formatINR } from '../lib/format'

// 5s keeps the bar feeling genuinely live without hammering the free tier
const POLL_MS = 5_000

const STAGES = ['RECEIVED', 'IN THE OVEN', 'ON THE WAY', 'AT YOUR DOOR'] as const

const STAGE_INDEX: Record<OrderStatus, number> = {
  new: 0,
  preparing: 1,
  ready: 1,
  out: 2,
  delivered: 3,
  cancelled: 0,
}

function headline(order: TrackedOrder | null, loaded: boolean): string {
  if (!order) return loaded ? 'Finding your order…' : 'Tracking…'
  if (order.status === 'cancelled') return 'Order cancelled'
  if (order.status === 'delivered') return order.fulfilment === 'pickup' ? 'Picked up. Enjoy.' : 'Delivered. Enjoy.'
  if (order.status === 'ready' && order.fulfilment === 'pickup') return 'Ready at the counter'
  if (order.status === 'out') return 'Hot in a few minutes'
  return 'Hot in 25–30 min'
}

export function Track() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<TrackedOrder | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [record] = useState<OrderRecord | undefined>(() =>
    loadOrderHistory().find((o) => o.code === code),
  )

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

  const stage = order ? STAGE_INDEX[order.status] : 0
  const cancelled = order?.status === 'cancelled'
  const pickup = order?.fulfilment === 'pickup'
  const stages = pickup ? (['RECEIVED', 'IN THE OVEN', 'READY', 'PICKED UP'] as const) : STAGES
  const itemsLine = record?.items
    .filter((i) => i.lineTotal > 0)
    .map((i) => `${i.name.replace(/ Pizza$/, '')}${i.variant ? ` (${i.variant[0]})` : ''}`)
    .join(' · ')

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      {/* Map header — decorative; we don't track rider GPS */}
      <div
        className="relative h-[190px] shrink-0 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1d3a30, #10231d)' }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.06) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        <svg viewBox="0 0 300 190" className="absolute inset-0 h-full w-full">
          <path
            d="M38 158 Q120 128 152 96 T262 44"
            fill="none"
            stroke="#e6332a"
            strokeWidth="4"
            strokeDasharray="9 8"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute bottom-8 left-8 h-3.5 w-3.5 rounded-full border-[3px] border-brand bg-white" />
        <div className="absolute top-8 right-12 text-[22px]">🏠</div>
        <div className="absolute top-[86px] left-[132px] text-xl">🛵</div>
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="Home"
          className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-lg text-white backdrop-blur"
        >
          ‹
        </button>
      </div>

      <div className="px-5 pt-5">
        <h1 className="font-display text-[28px] leading-none font-extrabold tracking-[-.5px]">
          {headline(order, loaded)}
        </h1>
        <p className="mt-1.5 text-[12px] text-mut">
          #{code}
          {order && !cancelled && order.status !== 'delivered' && ' · running on time'}
          {loaded && !order && ' · the kitchen has your WhatsApp order'}
        </p>
      </div>

      {cancelled ? (
        <div className="mx-5 mt-5 rounded-2xl border border-brand/40 bg-brand/10 p-4 text-sm">
          This order was cancelled. If that's a surprise, call us — {RESTAURANT.phoneDisplay}.
        </div>
      ) : (
        <div className="px-5 pt-6">
          {/* Progress bar */}
          <div className="flex gap-1.5">
            {stages.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                  i <= stage ? 'bg-accent' : 'bg-line'
                }`}
              />
            ))}
          </div>
          <div className="mt-2.5 flex justify-between">
            {stages.map((label, i) => (
              <span
                key={label}
                className={`text-[9px] font-extrabold tracking-wide ${
                  i === stage ? 'text-accent' : i < stage ? 'text-soft' : 'text-mut'
                } ${i === 0 ? 'text-left' : i === stages.length - 1 ? 'text-right' : 'text-center'}`}
                style={{ flex: 1 }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {record && (
        <div className="mx-5 mt-6 rounded-2xl border border-line bg-card p-4">
          <div className="text-[13px] font-bold">{itemsLine}</div>
          <div className="mt-1.5 text-[11px] text-mut">
            Paying {formatINR(record.total)} by {record.payment === 'upi' ? 'UPI' : 'cash'}
            {record.fulfilment === 'delivery' ? '' : ' · pickup at the counter'}
          </div>
        </div>
      )}

      <div className="mx-5 mt-4 rounded-2xl border border-dashed border-line px-4 py-3">
        <p className="text-[11px] leading-relaxed text-mut">
          <span className="font-extrabold text-accent">3 AM tip:</span> gate's locked? Reply{' '}
          <b className="text-soft">"gate"</b> on WhatsApp and the rider calls instead of ringing.
        </p>
      </div>

      <div className="mt-auto flex items-center gap-3 border-t border-line bg-bg px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="flex-1">
          <div className="text-[13px] font-bold">Anything wrong? We pick up fast.</div>
          <div className="text-[11px] text-mut">{RESTAURANT.phoneDisplay}</div>
        </div>
        <a
          href={`https://wa.me/${RESTAURANT.whatsappNumber}`}
          target="_blank"
          rel="noopener"
          className="rounded-xl bg-veg px-4 py-2.5 text-xs font-extrabold text-white"
        >
          WhatsApp
        </a>
        <a
          href={RESTAURANT.telLink}
          aria-label="Call the shop"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card"
        >
          ✆
        </a>
      </div>
    </div>
  )
}
