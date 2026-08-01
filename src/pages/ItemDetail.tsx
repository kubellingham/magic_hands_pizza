import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMenuItem } from '../data/menu'
import { PIZZA_ADD_ONS, addOnPrice, type AddOnId } from '../data/addons'
import { useCart } from '../cart/CartContext'
import { formatINR } from '../lib/format'
import { useAvailability, isAvailable } from '../lib/availability'
import { usePriceOverrides, effectivePrice } from '../lib/livePrices'
import { useHomeContent } from '../lib/homeContent'
import { VegDot } from '../components/VegDot'
import { QtyStepper } from '../components/QtyStepper'
import { ItemImage } from '../components/ItemImage'

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`relative h-7 w-12 rounded-full transition-colors ${on ? 'bg-brand' : 'bg-line'}`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${on ? 'right-1' : 'left-1'}`}
      />
    </button>
  )
}

export function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { dispatch } = useCart()
  const availability = useAvailability()
  const overrides = usePriceOverrides()
  const { trending } = useHomeContent()
  const item = id ? getMenuItem(id) : undefined
  const [variantId, setVariantId] = useState<string | null>(null)
  const [addOnIds, setAddOnIds] = useState<AddOnId[]>([])
  const [qty, setQty] = useState(1)

  if (!item) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-surface px-8 text-center">
        <p className="font-display text-lg font-extrabold">That one's off the menu.</p>
        <button type="button" onClick={() => navigate('/menu')} className="mt-4 text-sm font-bold text-brand">
          Back to the menu
        </button>
      </div>
    )
  }

  const available = isAvailable(availability, item.id)
  // Medium is the house pick when an item has one
  const defaultVariant = item.variants.find((v) => v.id === 'M') ?? item.variants[0]
  const variant = item.variants.find((v) => v.id === variantId) ?? defaultVariant
  const addOnsTotal = item.supportsAddOns
    ? addOnIds.reduce((sum, a) => sum + addOnPrice(a, variant.id), 0)
    : 0
  const total = (effectivePrice(overrides, item.id, variant) + addOnsTotal) * qty
  const isVeg = variant.isVeg ?? item.isVeg

  const toggleAddOn = (a: AddOnId) =>
    setAddOnIds((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))

  const addToCart = () => {
    dispatch({ type: 'add', itemId: item.id, variantId: variant.id, addOnIds, qty })
    // straight back to the menu so ordering keeps flowing
    navigate(-1)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <ItemImage itemId={item.id} category={item.category} className="h-[230px] shrink-0">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-lg text-white backdrop-blur"
        >
          ‹
        </button>
        <div className="absolute right-0 bottom-0 left-0 h-20 bg-gradient-to-t from-[var(--sh-surface)] to-transparent" />
      </ItemImage>

      <div className="px-5 pt-3">
        <div className="flex items-center gap-2">
          <VegDot isVeg={isVeg} />
          <span className="text-[10px] font-extrabold tracking-wide text-mut">
            {isVeg ? 'VEG' : 'NON-VEG'}
            {trending.includes(item.id) && <span className="text-accent"> · BESTSELLER</span>}
          </span>
        </div>
        <h1 className="font-display mt-1.5 text-[26px] leading-[1.05] font-extrabold tracking-[-.5px]">
          {item.name}
        </h1>
        {item.description && <p className="mt-1.5 text-[13px] text-mut">{item.description}</p>}
        {!available && (
          <p className="mt-2 text-[13px] font-bold text-brand">Back tomorrow — this one's sold out tonight.</p>
        )}
      </div>

      {item.variants.length > 1 && (
        <div className="px-5 pt-5">
          <div className="mb-2.5 text-[10px] font-extrabold tracking-[1px] text-mut">SIZE</div>
          <div className="flex gap-2.5">
            {item.variants.map((v) => {
              const on = v.id === variant.id
              const isHousePick = v.id === 'M' && item.variants.length > 1
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  className={`relative flex-1 rounded-2xl border p-3 text-center ${
                    on ? 'border-brand bg-brand/10' : 'border-line bg-card'
                  }`}
                >
                  {isHousePick && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-accent px-2 py-0.5 text-[8px] font-extrabold tracking-wide whitespace-nowrap text-bg">
                      MOST PICKED
                    </span>
                  )}
                  <div className="text-[13px] font-bold">{v.label || item.name}</div>
                  <div className="font-display mt-0.5 text-sm font-extrabold">
                    {formatINR(effectivePrice(overrides, item.id, v))}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {item.supportsAddOns && (
        <div className="px-5 pt-5">
          <div className="mb-1 text-[10px] font-extrabold tracking-[1px] text-mut">MAKE IT HEAVIER</div>
          {PIZZA_ADD_ONS.map((addOn, i) => (
            <div
              key={addOn.id}
              className={`flex items-center justify-between py-3 ${
                i < PIZZA_ADD_ONS.length - 1 ? 'border-b border-line' : ''
              }`}
            >
              <span className="text-[15px] font-semibold">
                {addOn.name}{' '}
                <span className="font-display font-extrabold text-accent">
                  +{formatINR(addOnPrice(addOn.id, variant.id))}
                </span>
              </span>
              <Toggle on={addOnIds.includes(addOn.id)} onClick={() => toggleAddOn(addOn.id)} />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between px-5 pt-5">
        <span className="text-[15px] font-bold">Quantity</span>
        <QtyStepper qty={qty} onChange={(q) => setQty(Math.max(1, q))} min={1} size="lg" />
      </div>

      <div className="mt-auto flex items-center gap-4 border-t border-line bg-bg px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div>
          <div className="text-[10px] tracking-wide text-mut">TOTAL</div>
          <div className="font-display text-[22px] font-extrabold">{formatINR(total)}</div>
        </div>
        <button
          type="button"
          disabled={!available}
          onClick={addToCart}
          className="flex-1 rounded-2xl bg-brand py-4 text-center text-[15px] font-extrabold text-white shadow-[0_8px_24px_rgba(230,51,42,.4)] disabled:opacity-40 disabled:shadow-none"
        >
          {available ? 'Add to cart' : 'Back tomorrow'}
        </button>
      </div>
    </div>
  )
}
