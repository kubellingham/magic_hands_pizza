import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { PlaceOrderResult } from '../lib/orders'
import { formatINR } from '../lib/format'

const COUNTDOWN_SECONDS = 5

export function OrderPlaced() {
  const { state } = useLocation() as { state: PlaceOrderResult | null }
  const navigate = useNavigate()
  const [secondsLeft, setSecondsLeft] = useState(state?.waLink ? COUNTDOWN_SECONDS : 0)
  const [showQr, setShowQr] = useState(true)
  const openedRef = useRef(false)

  const openWhatsApp = () => {
    if (!state?.waLink || openedRef.current) return
    openedRef.current = true
    // Same-tab navigation: on phones this hands off to the WhatsApp app,
    // and it can't be popup-blocked.
    window.location.href = state.waLink
  }

  useEffect(() => {
    if (!state?.waLink) return
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer)
          openWhatsApp()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-6 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full text-4xl text-white shadow-[0_10px_30px_rgba(46,158,75,.4)]"
          style={{ background: 'radial-gradient(circle, #2e9e4b, #12813a)' }}
        >
          ✓
        </div>
        <h1 className="font-cond mt-4 text-[30px] leading-none font-bold">Order Placed!</h1>

        <div className="mt-4 w-full rounded-[14px] border border-veg/30 bg-[#132a1c] px-5 py-4 text-left">
          <div className="text-[13px] leading-relaxed">
            <b>One last step:</b> we're opening WhatsApp with your order already typed out.
            Just press the <b className="text-veg">Send ➤</b> button there — that's what
            tells the kitchen to start cooking.
          </div>
          {state?.waLink && secondsLeft > 0 && (
            <div className="mt-3 flex items-center gap-3">
              <span className="font-anton flex h-9 w-9 items-center justify-center rounded-full border-2 border-veg text-lg text-veg">
                {secondsLeft}
              </span>
              <span className="text-xs text-mut">Opening WhatsApp in {secondsLeft}s…</span>
            </div>
          )}
          {state?.waLink && (
            <button
              type="button"
              onClick={() => {
                openedRef.current = false
                openWhatsApp()
              }}
              className="mt-3 w-full rounded-xl bg-veg py-3 text-sm font-extrabold text-white"
            >
              Open WhatsApp now
            </button>
          )}
        </div>

        <div className="mt-4 w-full rounded-[14px] bg-card px-5 py-4">
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

        {/* UPI QR — appears once the owner drops public/images/payment/upi-qr.png */}
        {state?.payment === 'upi' && showQr && (
          <div className="mt-4 w-full rounded-[14px] bg-white p-4">
            <img
              src="/images/payment/upi-qr.png"
              alt="UPI payment QR code"
              onError={() => setShowQr(false)}
              className="mx-auto max-h-56 w-auto"
            />
            <div className="mt-2 text-center text-[11px] font-bold text-bg">Scan to pay via UPI</div>
          </div>
        )}
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
        <Link to="/" className="py-1 text-center text-[13px] font-semibold text-mut">
          Back to home
        </Link>
      </div>
    </div>
  )
}
