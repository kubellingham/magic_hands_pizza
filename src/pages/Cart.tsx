import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import { formatINR } from '../lib/format'
import { loadProfile, isProfileComplete, currentAddress, type Profile } from '../lib/profile'
import { generateOrderCode, placeOrder } from '../lib/orders'
import { saveLastOrder } from '../lib/lastOrder'
import { addOrderToHistory } from '../lib/orderHistory'
import { useOnline } from '../components/OfflineBanner'
import { useHomeContent } from '../lib/homeContent'
import { QtyStepper } from '../components/QtyStepper'
import { VegDot } from '../components/VegDot'
import { ItemImage } from '../components/ItemImage'
import { AddressSheet } from '../components/AddressSheet'
import { OvenLoader } from '../components/OvenLoader'

type Fulfilment = 'delivery' | 'pickup'
type Payment = 'upi' | 'cod'

export function Cart() {
  const { priced, bill, dispatch } = useCart()
  const navigate = useNavigate()
  const online = useOnline()
  const { paused } = useHomeContent()
  const [fulfilment, setFulfilment] = useState<Fulfilment>('delivery')
  const [payment, setPayment] = useState<Payment>('upi')
  const [notes, setNotes] = useState('')
  const [notesOpen, setNotesOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [profile, setProfile] = useState<Profile>(loadProfile)
  const profileReady = isProfileComplete(profile)
  const address = currentAddress(profile)

  if (priced.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col bg-surface">
        <div className="flex items-center gap-3 px-5 pt-4">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back" className="text-xl">
            ‹
          </button>
          <h1 className="font-display text-[22px] font-extrabold">Your cart</h1>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
          <span className="text-4xl">🍕</span>
          <p className="font-display mt-3 text-xl font-extrabold">Nothing here yet.</p>
          <p className="mt-1.5 text-sm text-mut">The oven's hot and waiting. Go grab something.</p>
          <Link
            to="/menu"
            className="mt-6 rounded-2xl bg-brand px-7 py-3 text-sm font-extrabold text-white shadow-[0_8px_24px_rgba(230,51,42,.4)]"
          >
            Browse menu
          </Link>
        </div>
      </div>
    )
  }

  const submit = async () => {
    const needsAddress = fulfilment === 'delivery'
    if ((needsAddress && !profileReady) || profile.name.trim().length < 2 || profile.phone.length !== 10) {
      navigate('/details')
      return
    }
    setSubmitting(true)
    try {
      const result = await placeOrder({
        orderCode: generateOrderCode(),
        customerName: profile.name.trim(),
        phone: profile.phone,
        address: address.trim(),
        notes,
        fulfilment,
        payment,
        priced,
        bill,
      })
      saveLastOrder(result.orderCode)
      addOrderToHistory({
        code: result.orderCode,
        placedAt: Date.now(),
        items: [
          ...priced.map((l) => ({
            name: l.name,
            variant: l.variantLabel || null,
            addOns: l.addOnNames,
            qty: l.qty,
            lineTotal: l.lineTotal,
            itemId: l.itemId,
            variantId: l.variantId,
            addOnIds: l.addOnIds,
          })),
          ...(bill.freeDrink
            ? [{ name: 'Cold Drink 750 ml (free with offer)', variant: null, addOns: [], qty: 1, lineTotal: 0 }]
            : []),
        ],
        itemTotal: bill.itemTotal,
        discount: bill.discount,
        total: bill.toPay,
        payment,
        fulfilment,
        customerName: profile.name.trim(),
      })
      dispatch({ type: 'clear' })
      navigate('/order-placed', { state: result })
    } finally {
      setSubmitting(false)
    }
  }

  if (submitting) return <OvenLoader />

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back" className="text-xl">
          ‹
        </button>
        <h1 className="font-display text-[22px] font-extrabold">Your cart</h1>
      </div>

      {/* Delivery / Pickup */}
      <div className="px-5 pb-3">
        <div className="flex rounded-2xl border border-line bg-card p-1">
          {(
            [
              ['delivery', 'Delivery · FREE'],
              ['pickup', 'Pickup'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFulfilment(value)}
              className={`flex-1 rounded-xl py-2.5 text-center text-[13px] font-bold ${
                fulfilment === value ? 'bg-brand text-white' : 'text-mut'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Address */}
      {fulfilment === 'delivery' && (
        <div className="px-5 pb-3">
          <button
            type="button"
            onClick={() => (address ? setSheetOpen(true) : navigate('/details'))}
            className="flex w-full items-center gap-3 rounded-2xl border border-line bg-card p-3.5 text-left"
          >
            <span className="text-sm text-brand">◉</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-bold">
                {address || 'Add your delivery address'}
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-mut">
                {profileReady ? `${profile.name} · ${profile.phone}` : 'Name and phone needed too'}
              </span>
            </span>
            <span className="text-[11px] font-bold text-brand">{address ? 'Change' : 'Add'}</span>
          </button>
        </div>
      )}

      {/* Lines */}
      <div className="flex flex-col gap-4 px-5 pb-2">
        {priced.map((line) => (
          <div key={line.key} className="flex items-center gap-3">
            <ItemImage itemId={line.itemId} className="h-11 w-11 shrink-0 rounded-xl">
              <VegDot isVeg={line.isVeg} className="absolute top-0.5 left-0.5 scale-[.65]" />
            </ItemImage>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-bold">
                {line.name.replace(/ Pizza$/, '')}
                {line.variantLabel && ` (${line.variantLabel[0]})`}
              </div>
              <div className="truncate text-[11px] text-mut">
                {line.addOnNames.length > 0 ? line.addOnNames.join(' · ') : 'Regular'}
              </div>
            </div>
            <QtyStepper qty={line.qty} onChange={(qty) => dispatch({ type: 'setQty', key: line.key, qty })} />
            <span className="font-display w-14 text-right text-[15px] font-extrabold">
              {formatINR(line.lineTotal)}
            </span>
          </div>
        ))}

        {bill.freeDrink && (
          <div className="flex items-center gap-3">
            <div
              className="h-11 w-11 shrink-0 rounded-xl"
              style={{ background: 'radial-gradient(circle at 50% 38%, #3a6a8f, #16324a)' }}
            />
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold">Cold drink 750ml</div>
              <div className="text-[11px] font-semibold text-veg">Free with the deal</div>
            </div>
            <span className="font-display w-14 text-right text-[15px] font-extrabold text-mut line-through">
              ₹40
            </span>
          </div>
        )}
      </div>

      <div className="px-5 pt-3">
        <Link
          to="/menu"
          className="block rounded-2xl border border-dashed border-line py-3 text-center text-xs font-bold text-brand"
        >
          + Add more · shakes go well with this
        </Link>
      </div>

      {/* Deal nudge / applied deals */}
      {(bill.nudge || bill.discount > 0 || bill.freeDrink) && (
        <div className="px-5 pt-3">
          <div className="rounded-2xl border border-dashed border-accent/50 bg-accent/8 px-4 py-3">
            {bill.nudge ? (
              <p className="text-xs leading-relaxed">
                <span className="font-extrabold text-accent">Almost there:</span> {bill.nudge}
              </p>
            ) : (
              <p className="text-xs leading-relaxed">
                <span className="font-extrabold text-accent">Deal on:</span>{' '}
                {[bill.discount > 0 && '10% off this order', bill.freeDrink && 'free 750ml drink']
                  .filter(Boolean)
                  .join(' + ')}
                {bill.notes.length > 0 && ` · ${bill.notes.join(' · ')}`}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Kitchen note (tucked away until wanted) */}
      <div className="px-5 pt-3">
        {notesOpen ? (
          <textarea
            autoFocus
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Less spicy? No onions? Tell the kitchen."
            className="w-full rounded-2xl border border-line bg-card px-3.5 py-2.5 text-xs outline-none placeholder:text-mut focus:border-brand"
          />
        ) : (
          <button type="button" onClick={() => setNotesOpen(true)} className="text-xs font-bold text-mut">
            + Note for the kitchen
          </button>
        )}
      </div>

      {/* Bill */}
      <div className="mt-4 flex flex-col gap-2 border-t border-line px-5 pt-4 text-[13px]">
        <div className="flex justify-between text-soft">
          <span>Items</span>
          <span>{formatINR(bill.itemTotal)}</span>
        </div>
        {bill.discount > 0 && (
          <div className="flex justify-between text-soft">
            <span>Deal discount</span>
            <span className="font-bold text-veg">−{formatINR(bill.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-soft">
          <span>{fulfilment === 'delivery' ? 'Delivery' : 'Pickup'}</span>
          <span className="font-bold text-veg">FREE</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between border-t border-line pt-3">
          <span className="text-[15px] font-bold">To pay</span>
          <span className="font-display text-[22px] font-extrabold">{formatINR(bill.toPay)}</span>
        </div>
      </div>

      {/* Payment */}
      <div className="px-5 pt-4">
        <div className="flex gap-2.5">
          {(
            [
              ['upi', 'UPI'],
              ['cod', fulfilment === 'delivery' ? 'Cash on delivery' : 'Cash at counter'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setPayment(value)}
              className={`flex-1 rounded-2xl border p-3 text-center text-[13px] font-bold ${
                payment === value ? 'border-brand bg-brand/10' : 'border-line bg-card text-soft'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto px-5 pt-5 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <button
          type="button"
          disabled={!online || submitting || paused}
          onClick={submit}
          className="w-full rounded-2xl bg-brand py-4 text-center text-[15px] font-extrabold text-white shadow-[0_8px_24px_rgba(230,51,42,.45)] disabled:opacity-50 disabled:shadow-none"
        >
          {paused
            ? "Kitchen's catching up — back shortly"
            : !online
              ? 'No signal — reconnect to order'
              : submitting
                ? 'Sending…'
                : `Place order · ${formatINR(bill.toPay)} ›`}
        </button>
        <p className="mt-2.5 text-center text-[11px] text-mut">
          {paused
            ? 'Your cart is saved — try again in a few minutes.'
            : 'Confirms on WhatsApp — one tap, kitchen starts in seconds'}
        </p>
      </div>

      {sheetOpen && <AddressSheet onClose={() => setSheetOpen(false)} onChanged={setProfile} />}
    </div>
  )
}
