import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { PlaceOrderResult } from '../lib/orders'
import { isQueued, onOutboxChange } from '../lib/orderOutbox'
import { formatINR } from '../lib/format'

const COUNTDOWN_SECONDS = 5

export function OrderPlaced() {
  const { state } = useLocation() as { state: PlaceOrderResult | null }
  const navigate = useNavigate()
  const [secondsLeft, setSecondsLeft] = useState(state?.waLink ? COUNTDOWN_SECONDS : 0)
  const [showQr, setShowQr] = useState(true)
  const [pending, setPending] = useState(() => (state ? !state.savedToDb : false))
  const openedRef = useRef(false)

  // The outbox retries in the background — drop the notice once it lands
  useEffect(() => {
    if (!state?.orderCode || state.savedToDb) return
    const sync = () => setPending(isQueued(state.orderCode))
    sync()
    return onOutboxChange(sync)
  }, [state?.orderCode, state?.savedToDb])

  const openWhatsApp = () => {
    if (!state?.waLink || openedRef.current) return
    openedRef.current = true
    // Same-tab navigation hands off to the WhatsApp app on phones and
    // can never be popup-blocked.
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
    <div className="flex min-h-dvh flex-col bg-surface px-6 pt-10">
      <div className="flex flex-1 flex-col">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-veg text-2xl text-white">
          ✓
        </div>
        <h1 className="font-display mt-5 text-[34px] leading-[1.02] font-extrabold tracking-[-1px]">
          One tap left.
        </h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-soft">
          Your order is typed out in WhatsApp. Press <b className="text-veg">Send ➤</b> there — that's what
          fires the oven.
        </p>

        {state?.waLink && (
          <>
            <a
              href={state.waLink}
              onClick={() => {
                openedRef.current = true
              }}
              className="mt-6 block rounded-2xl bg-veg py-4 text-center text-[15px] font-extrabold text-white shadow-[0_8px_24px_rgba(46,158,75,.35)]"
            >
              Open WhatsApp &amp; send ➤
            </a>
            <p className="mt-2.5 text-center text-[11px] text-mut">
              {secondsLeft > 0 ? (
                <>
                  Opens automatically in{' '}
                  <span className="font-display font-extrabold text-accent">{secondsLeft}s</span>
                </>
              ) : (
                'Opened — press Send in WhatsApp'
              )}
            </p>
          </>
        )}

        <div className="mt-7 rounded-2xl border border-line bg-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-semibold tracking-[1px] text-mut">ORDER</div>
              <div className="font-display text-[20px] font-extrabold text-accent">
                {state?.orderCode ?? '—'}
              </div>
            </div>
            {state && (
              <div className="text-right">
                <div className="text-[10px] font-semibold tracking-[1px] text-mut">
                  {state.payment === 'upi' ? 'PAYING BY UPI' : 'PAYING CASH'}
                </div>
                <div className="font-display text-[20px] font-extrabold">{formatINR(state.toPay)}</div>
              </div>
            )}
          </div>
          <div className="mt-3 border-t border-dashed border-line pt-3 text-[13px]">
            <span className="text-mut">Hot at your door</span>{' '}
            <span className="font-bold">25–30 min</span>
          </div>
        </div>

        {pending && (
          <div className="mt-4 rounded-2xl border border-accent/40 bg-accent/8 px-4 py-3 text-[12px] leading-relaxed">
            <b className="text-accent">Weak signal.</b> Your WhatsApp message is what counts, and it's
            ready to send. We'll slot this onto the kitchen's screen the moment the connection is back.
          </div>
        )}

        {/* UPI QR — appears once public/images/payment/upi-qr.png exists */}
        {state?.payment === 'upi' && showQr && (
          <div className="mt-4 rounded-2xl bg-white p-4">
            <img
              src="/images/payment/upi-qr.png"
              alt="UPI payment QR code"
              onError={() => setShowQr(false)}
              className="mx-auto max-h-52 w-auto"
            />
            <div className="mt-2 text-center text-[11px] font-bold text-[#221a12]">Scan to pay by UPI</div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => state?.orderCode && navigate(`/track/${state.orderCode}`)}
          disabled={!state?.orderCode}
          className="w-full rounded-2xl border border-line bg-card py-3.5 text-center text-sm font-extrabold disabled:opacity-40"
        >
          Track order
        </button>
        <Link to="/" className="text-center text-[13px] font-semibold text-mut">
          Back to home
        </Link>
      </div>
    </div>
  )
}
