import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import { formatINR } from '../lib/format'
import { loadProfile, isProfileComplete, currentAddress, type Profile } from '../lib/profile'
import { generateOrderCode, placeOrder } from '../lib/orders'
import { saveLastOrder } from '../lib/lastOrder'
import { addOrderToHistory } from '../lib/orderHistory'
import { useOnline } from '../components/OfflineBanner'
import { QtyStepper } from '../components/QtyStepper'
import { VegDot } from '../components/VegDot'
import { ItemImage } from '../components/ItemImage'
import { AddressSheet } from '../components/AddressSheet'

type Fulfilment = 'delivery' | 'pickup'
type Payment = 'upi' | 'cod'

export function Cart() {
  const { priced, bill, dispatch } = useCart()
  const navigate = useNavigate()
  const online = useOnline()
  const [fulfilment, setFulfilment] = useState<Fulfilment>('delivery')
  const [payment, setPayment] = useState<Payment>('upi')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [profile, setProfile] = useState<Profile>(loadProfile)
  const profileReady = isProfileComplete(profile)
  const address = currentAddress(profile)

  if (priced.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-surface px-8 text-center">
        <span className="text-4xl">🛒</span>
        <p className="text-sm text-mut">Your cart is empty.</p>
        <Link to="/menu" className="rounded-[14px] bg-brand px-6 py-2.5 text-sm font-extrabold text-white">
          Browse Menu
        </Link>
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
          })),
          ...(bill.freeDrink
            ? [{ name: 'Cold Drink 750 ml (FREE offer)', variant: null, addOns: [], qty: 1, lineTotal: 0 }]
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
      // The confirmation screen counts down before opening WhatsApp,
      // so the customer sees what's about to happen.
      navigate('/order-placed', { state: result })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <div className="flex items-center gap-3 px-5 pt-4 pb-2.5">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back" className="text-xl text-white">
          ‹
        </button>
        <span className="font-cond text-[22px] font-bold">Your Cart</span>
      </div>

      {/* Delivery / Pickup */}
      <div className="px-5 pb-2.5">
        <div className="flex rounded-xl bg-card p-1">
          {(
            [
              ['delivery', 'Delivery'],
              ['pickup', 'Pickup'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFulfilment(value)}
              className={`flex-1 rounded-full px-[15px] py-2 text-center text-[13px] font-bold ${
                fulfilment === value ? 'bg-brand text-white' : 'text-mut'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Address card */}
      {fulfilment === 'delivery' && (
        <div className="px-5 pb-2">
          <button
            type="button"
            onClick={() => (address ? setSheetOpen(true) : navigate('/details'))}
            className="flex w-full items-start gap-2.5 rounded-xl bg-card p-3 text-left"
          >
            <span className="text-base text-brand">📍</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold">
                {profileReady ? profile.name : 'Add delivery details'}
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-mut">
                {address || 'Name, phone & address needed to deliver'}
              </span>
            </span>
            <span className="text-[11px] font-bold text-brand">{address ? 'Change' : 'Add'}</span>
          </button>
        </div>
      )}

      {/* Lines */}
      <div className="flex flex-col gap-3.5 px-5 pt-0.5 pb-1">
        {priced.map((line) => (
          <div key={line.key} className="flex items-center gap-3">
            <ItemImage itemId={line.itemId} className="h-[46px] w-[46px] shrink-0 rounded-xl">
              <VegDot isVeg={line.isVeg} className="absolute top-1 left-1 scale-75" />
            </ItemImage>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-bold">
                {line.name}
                {line.variantLabel && ` (${line.variantLabel[0]})`}
              </div>
              <div className="text-[11px] text-mut">
                {line.addOnNames.length > 0 ? `+ ${line.addOnNames.join(', ')}` : 'Regular'}
              </div>
            </div>
            <QtyStepper qty={line.qty} onChange={(qty) => dispatch({ type: 'setQty', key: line.key, qty })} />
            <span className="w-12 text-right text-[13px] font-bold">{formatINR(line.lineTotal)}</span>
          </div>
        ))}

        {bill.freeDrink && (
          <div className="flex items-center gap-3">
            <div
              className="h-[46px] w-[46px] shrink-0 rounded-xl"
              style={{ background: 'radial-gradient(circle at 50% 40%, #3a6a8f, #16324a)' }}
            />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold">Cold Drink 750ml</div>
              <div className="text-[11px] font-semibold text-veg">FREE with offer</div>
            </div>
            <span className="w-12 text-right text-[13px] font-bold text-mut line-through">₹40</span>
          </div>
        )}

        <Link
          to="/menu"
          className="rounded-xl border border-dashed border-line p-[11px] text-center text-xs font-bold text-brand"
        >
          + Add more items
        </Link>
      </div>

      {/* Offer banner */}
      {(bill.discount > 0 || bill.freeDrink || bill.notes.length > 0) && (
        <div className="px-5 pt-3 pb-2">
          <div className="flex items-center gap-2 rounded-[10px] border border-dashed border-brand bg-brand/10 px-3 py-2.5">
            <span className="text-gold">🎉</span>
            <span className="flex-1 text-xs font-semibold">
              {[
                bill.discount > 0 && '10% off (₹999+)',
                bill.freeDrink && 'free 750ml drink',
                ...bill.notes,
              ]
                .filter(Boolean)
                .join(' + ')}
            </span>
            <span className="text-[11px] font-bold text-veg">✓</span>
          </div>
        </div>
      )}

      {/* Notes for the kitchen */}
      <div className="px-5 pt-1 pb-1.5">
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes for the kitchen (less spicy, no onions…) — optional"
          className="w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-mut focus:border-brand"
        />
      </div>

      {/* Bill */}
      <div className="flex flex-col gap-1.5 px-5 pb-1.5 text-xs text-soft">
        <div className="flex justify-between">
          <span>Item total</span>
          <span>{formatINR(bill.itemTotal)}</span>
        </div>
        {bill.discount > 0 && (
          <div className="flex justify-between">
            <span>Discount (10%)</span>
            <span className="text-veg">−{formatINR(bill.discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>{fulfilment === 'delivery' ? 'Delivery fee' : 'Pickup'}</span>
          <span className="text-veg">FREE</span>
        </div>
      </div>

      {/* Payment */}
      <div className="px-5 pt-2 pb-1.5">
        <div className="mb-2 text-[11px] font-bold text-mut">PAYMENT</div>
        <div className="flex gap-[9px]">
          {(
            [
              ['upi', 'UPI'],
              ['cod', fulfilment === 'delivery' ? 'Cash on Delivery' : 'Cash at Counter'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setPayment(value)}
              className={`flex-1 rounded-[10px] p-2.5 text-center text-xs font-bold ${
                payment === value ? 'border-2 border-brand bg-brand/10 text-white' : 'border border-line text-soft'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto flex items-center gap-3 bg-bg px-5 py-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))]">
        <div>
          <div className="text-[11px] text-mut">To Pay</div>
          <div className="font-cond text-[22px] font-bold">{formatINR(bill.toPay)}</div>
        </div>
        <button
          type="button"
          disabled={!online || submitting}
          onClick={submit}
          className="flex-1 rounded-[14px] bg-brand py-3.5 text-center text-sm font-extrabold text-white shadow-[0_6px_16px_rgba(216,31,26,.4)] disabled:opacity-50"
        >
          {!online ? 'Offline — connect to order' : submitting ? 'Placing…' : 'Place Order ›'}
        </button>
      </div>

      {sheetOpen && <AddressSheet onClose={() => setSheetOpen(false)} onChanged={setProfile} />}
    </div>
  )
}
