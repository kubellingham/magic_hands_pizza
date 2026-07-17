import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { PlaceOrderResult } from '../lib/orders'
import { formatINR } from '../lib/format'

export function OrderPlaced() {
  const { state } = useLocation() as { state: PlaceOrderResult | null }
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full text-5xl text-white shadow-[0_10px_30px_rgba(46,158,75,.4)]"
          style={{ background: 'radial-gradient(circle, #2e9e4b, #12813a)' }}
        >
          ✓
        </div>
        <h1 className="font-cond mt-5 text-[30px] leading-none font-bold">Order Placed!</h1>
        <p className="mt-2 text-[13px] text-mut">
          Now hit <b className="text-white">Send</b> in WhatsApp — that's how the kitchen gets your order.
          Sit tight, hot food is on the way.
        </p>
        {state?.waLink && (
          <a
            href={state.waLink}
            target="_blank"
            rel="noopener"
            className="mt-3 text-[13px] font-bold text-brand underline"
          >
            WhatsApp didn&rsquo;t open? Tap here
          </a>
        )}

        <div className="mt-5 w-full rounded-[14px] bg-card px-5 py-4">
          <div className="text-[11px] text-mut">ORDER NUMBER</div>
          <div className="font-anton text-[22px] tracking-wide text-gold">{state?.orderCode ?? '—'}</div>
          <div className="my-3 h-px bg-line" />
          <div className="flex justify-between text-[13px]">
            <span className="text-mut">Estimated time</span>
            <span className="font-bold">25–30 min</span>
          </div>
          {state && (
            <div className="mt-2 flex justify-between text-[13px]">
              <span className="text-mut">{state.payment === 'upi' ? 'Pay via UPI' : 'Pay with cash'}</span>
              <span className="font-bold">{formatINR(state.toPay)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => state?.orderCode && navigate(`/track/${state.orderCode}`)}
          disabled={!state?.orderCode}
          className="w-full rounded-[14px] bg-brand py-3.5 text-center text-sm font-extrabold text-white disabled:opacity-40"
        >
          Track Order
        </button>
        <Link to="/menu" className="py-1 text-center text-[13px] font-semibold text-mut">
          Back to menu
        </Link>
      </div>
    </div>
  )
}
