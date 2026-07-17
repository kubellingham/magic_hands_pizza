import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMenuItem } from '../data/menu'
import { PIZZA_ADD_ONS, addOnPrice, type AddOnId } from '../data/addons'
import { useCart } from '../cart/CartContext'
import { formatINR } from '../lib/format'
import { foodGradient } from '../lib/foodArt'
import { useAvailability, isAvailable } from '../lib/availability'
import { VegDot } from '../components/VegDot'
import { QtyStepper } from '../components/QtyStepper'

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`relative h-[26px] w-11 rounded-full transition-colors ${on ? 'bg-brand' : 'bg-line'}`}
    >
      <span
        className={`absolute top-[3px] h-5 w-5 rounded-full transition-all ${
          on ? 'right-[3px] bg-white' : 'left-[3px] bg-mut'
        }`}
      />
    </button>
  )
}

export function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { dispatch } = useCart()
  const availability = useAvailability()
  const item = id ? getMenuItem(id) : undefined
  const [variantId, setVariantId] = useState<string | null>(null)
  const [addOnIds, setAddOnIds] = useState<AddOnId[]>([])
  const [qty, setQty] = useState(1)

  if (!item) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-surface px-8 text-center">
        <p className="text-sm text-mut">This item is no longer on the menu.</p>
        <button type="button" onClick={() => navigate('/menu')} className="mt-4 text-sm font-bold text-brand">
          Back to menu
        </button>
      </div>
    )
  }

  const available = isAvailable(availability, item.id)
  const variant = item.variants.find((v) => v.id === variantId) ?? item.variants[0]
  const addOnsTotal = item.supportsAddOns
    ? addOnIds.reduce((sum, a) => sum + addOnPrice(a, variant.id), 0)
    : 0
  const total = (variant.price + addOnsTotal) * qty

  const toggleAddOn = (a: AddOnId) =>
    setAddOnIds((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))

  const addToCart = () => {
    dispatch({ type: 'add', itemId: item.id, variantId: variant.id, addOnIds, qty })
    navigate('/cart')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <div className="relative h-[200px] shrink-0" style={{ background: foodGradient(item.id, item.category) }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="absolute top-3.5 left-4 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-black/45 text-lg text-white"
        >
          ‹
        </button>
        <VegDot isVeg={variant.isVeg ?? item.isVeg} className="absolute bottom-3 left-4" />
      </div>

      <div className="px-5 pt-4 pb-2">
        <h1 className="font-cond text-2xl leading-[1.05] font-bold">{item.name}</h1>
        {item.description && <p className="mt-1.5 text-xs text-mut">{item.description}</p>}
        {!available && (
          <p className="mt-2 text-xs font-bold text-brand">Out of stock right now — check back soon.</p>
        )}
      </div>

      {item.variants.length > 1 && (
        <div className="px-5 pt-1.5 pb-2">
          <div className="mb-2 text-[11px] font-bold tracking-wide text-mut">
            {item.variants.some((v) => v.id === 'S' || v.id === 'M') ? 'CHOOSE SIZE' : 'CHOOSE OPTION'}
          </div>
          <div className="flex gap-[9px]">
            {item.variants.map((v) => {
              const on = v.id === variant.id
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  className={`flex-1 rounded-xl p-2.5 text-center ${
                    on
                      ? 'border-2 border-brand bg-brand/10 text-white'
                      : 'border border-line text-soft'
                  }`}
                >
                  <div className="text-[13px] font-bold">{v.label || item.name}</div>
                  <div className="mt-0.5 text-xs">{formatINR(v.price)}</div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {item.supportsAddOns && (
        <div className="px-5 pt-2 pb-2">
          <div className="mb-2 text-[11px] font-bold tracking-wide text-mut">ADD ONS</div>
          {PIZZA_ADD_ONS.map((addOn, i) => (
            <div
              key={addOn.id}
              className={`flex items-center justify-between py-[11px] ${
                i < PIZZA_ADD_ONS.length - 1 ? 'border-b border-white/5' : ''
              }`}
            >
              <span className="text-sm font-semibold">
                {addOn.name}{' '}
                <span className="font-normal text-mut">· +{formatINR(addOnPrice(addOn.id, variant.id))}</span>
              </span>
              <Toggle on={addOnIds.includes(addOn.id)} onClick={() => toggleAddOn(addOn.id)} />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between px-5 py-1.5">
        <span className="text-sm font-bold">Quantity</span>
        <QtyStepper qty={qty} onChange={(q) => setQty(Math.max(1, q))} min={1} size="lg" />
      </div>

      <div className="mt-auto flex items-center gap-3 bg-bg px-5 py-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))]">
        <div>
          <div className="text-[11px] text-mut">Total</div>
          <div className="font-cond text-[22px] font-bold">{formatINR(total)}</div>
        </div>
        <button
          type="button"
          disabled={!available}
          onClick={addToCart}
          className="flex-1 rounded-[14px] bg-brand py-3.5 text-center text-sm font-extrabold text-white shadow-[0_6px_16px_rgba(216,31,26,.4)] disabled:opacity-40"
        >
          {available ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  )
}
