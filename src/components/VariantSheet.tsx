import { useEffect, useState } from 'react'
import type { MenuItem } from '../data/types'
import { PIZZA_ADD_ONS, addOnPrice, type AddOnId } from '../data/addons'
import { useCart } from '../cart/CartContext'
import { formatINR } from '../lib/format'
import { VegDot } from './VegDot'
import { QtyStepper } from './QtyStepper'

interface Props {
  item: MenuItem
  onClose: () => void
}

export function VariantSheet({ item, onClose }: Props) {
  const { dispatch } = useCart()
  const [variantId, setVariantId] = useState(item.variants[0].id)
  const [addOnIds, setAddOnIds] = useState<AddOnId[]>([])
  const [qty, setQty] = useState(1)

  useEffect(() => {
    setVariantId(item.variants[0].id)
    setAddOnIds([])
    setQty(1)
  }, [item])

  const variant = item.variants.find((v) => v.id === variantId) ?? item.variants[0]
  const addOnsTotal = item.supportsAddOns
    ? addOnIds.reduce((sum, id) => sum + addOnPrice(id, variant.id), 0)
    : 0
  const total = (variant.price + addOnsTotal) * qty

  const toggleAddOn = (id: AddOnId) => {
    setAddOnIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  const confirm = () => {
    dispatch({ type: 'add', itemId: item.id, variantId: variant.id, addOnIds, qty })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center" role="dialog" aria-modal="true">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-t-2xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl">
        <div className="flex items-center gap-2">
          <VegDot isVeg={variant.isVeg ?? item.isVeg} />
          <h2 className="text-base font-bold">{item.name}</h2>
        </div>
        {item.description && <p className="mt-1 text-xs text-ink/60">{item.description}</p>}

        {item.variants.length > 1 && (
          <div className="mt-4">
            <div className="text-xs font-semibold text-ink/60 uppercase">Choose option</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {item.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                    v.id === variantId
                      ? 'border-brand bg-brand text-white'
                      : 'border-cream-dark bg-white text-ink'
                  }`}
                >
                  {v.label} · {formatINR(v.price)}
                </button>
              ))}
            </div>
          </div>
        )}

        {item.supportsAddOns && (
          <div className="mt-4">
            <div className="text-xs font-semibold text-ink/60 uppercase">Add-ons</div>
            <div className="mt-2 space-y-2">
              {PIZZA_ADD_ONS.map((addOn) => (
                <label key={addOn.id} className="flex items-center justify-between rounded-lg border border-cream-dark px-4 py-2.5 text-sm">
                  <span className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={addOnIds.includes(addOn.id)}
                      onChange={() => toggleAddOn(addOn.id)}
                      className="h-4 w-4 accent-brand"
                    />
                    {addOn.name}
                  </span>
                  <span className="font-semibold">+{formatINR(addOn.priceBySize[variant.id as 'S' | 'M' | 'L'] ?? 0)}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <QtyStepper qty={qty} onChange={(q) => setQty(Math.max(1, q))} min={1} />
          <button
            type="button"
            onClick={confirm}
            className="flex-1 rounded-xl bg-brand py-3 text-sm font-bold text-white active:bg-brand-dark"
          >
            Add to cart · {formatINR(total)}
          </button>
        </div>
      </div>
    </div>
  )
}
