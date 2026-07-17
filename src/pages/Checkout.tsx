import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import { detectOffers } from '../cart/selectors'
import { useOnline } from '../components/OfflineBanner'
import { formatINR, isValidIndianMobile } from '../lib/format'
import { generateOrderCode, placeOrder } from '../lib/orders'

export function Checkout() {
  const { priced, subtotal, dispatch } = useCart()
  const online = useOnline()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (priced.length === 0) {
    return (
      <div className="px-4 py-16 text-center text-sm text-ink/60">
        Your cart is empty.{' '}
        <Link to="/menu" className="font-bold text-brand">
          Browse the menu
        </Link>
      </div>
    )
  }

  const submit = async () => {
    if (name.trim().length < 2) return setError('Please enter your name.')
    if (!isValidIndianMobile(phone)) return setError('Please enter a valid 10-digit mobile number.')
    if (address.trim().length < 5) return setError('Please enter your full delivery address.')
    setError('')
    setSubmitting(true)
    try {
      const result = await placeOrder({
        orderCode: generateOrderCode(),
        customerName: name.trim(),
        phone,
        address: address.trim(),
        notes,
        priced,
        subtotal,
        offerNotes: detectOffers(priced, new Date()),
      })
      // Open WhatsApp in the same tab via anchor click — most reliable on mobile
      const a = document.createElement('a')
      a.href = result.waLink
      a.target = '_blank'
      a.rel = 'noopener'
      a.click()
      dispatch({ type: 'clear' })
      navigate('/order-placed', { state: result })
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-cream-dark bg-white px-3 py-2.5 text-sm outline-none focus:border-brand'

  return (
    <div className="px-4 pb-4">
      <h1 className="mt-4 text-base font-bold">Delivery details</h1>
      <div className="mt-3 space-y-3">
        <input className={inputClass} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <input
          className={inputClass}
          placeholder="Mobile number (10 digits)"
          inputMode="tel"
          maxLength={10}
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
        />
        <textarea
          className={inputClass}
          placeholder="Delivery address (hostel/PG, room, landmark…)"
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <textarea
          className={inputClass}
          placeholder="Notes for the kitchen (optional)"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-xs font-bold text-ink/60 uppercase">Order summary</h2>
        <div className="mt-2 space-y-1 text-sm">
          {priced.map((line) => (
            <div key={line.key} className="flex justify-between gap-2">
              <span>
                {line.qty}x {line.name}
                {line.variantLabel && ` (${line.variantLabel})`}
                {line.addOnNames.length > 0 && ` + ${line.addOnNames.join(', ')}`}
              </span>
              <span className="shrink-0 font-medium">{formatINR(line.lineTotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between border-t border-cream-dark pt-2 text-sm font-bold">
          <span>Subtotal</span>
          <span>{formatINR(subtotal)}</span>
        </div>
      </div>

      {error && <p className="mt-3 text-xs font-medium text-brand">{error}</p>}

      <button
        type="button"
        disabled={!online || submitting}
        onClick={submit}
        className="mt-4 w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white active:bg-brand-dark disabled:opacity-50"
      >
        {!online
          ? "You're offline — connect to place your order"
          : submitting
            ? 'Placing order…'
            : 'Place Order on WhatsApp'}
      </button>
      <p className="mt-2 text-center text-[11px] text-ink/50">
        Placing the order opens WhatsApp with your order details — just hit send.
      </p>
    </div>
  )
}
