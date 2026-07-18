import { useState } from 'react'
import { itemsInCategory } from '../../data/menu'
import { MENU_GROUPS, CATEGORY_TITLES } from '../../data/groups'
import type { MenuItem, Variant } from '../../data/types'
import { VegDot } from '../../components/VegDot'
import { effectivePrice, type OverrideMap } from '../../lib/livePrices'
import { useAdminAvailability, useAdminPrices } from './adminData'

interface PriceCellProps {
  item: MenuItem
  variant?: Variant
  overrides: OverrideMap
  savePrice: (itemId: string, variantId: string, price: number, basePrice: number) => Promise<boolean>
}

/**
 * Editable price. Saves on blur/Enter; entering the printed base price (or
 * clearing the field) resets the override. Overridden prices show in gold.
 */
function PriceCell({ item, variant, overrides, savePrice }: PriceCellProps) {
  const [saving, setSaving] = useState(false)
  if (!variant) {
    return <span className="w-[60px] py-1 text-center text-[13px] text-mut">—</span>
  }
  const effective = effectivePrice(overrides, item.id, variant)
  const overridden = effective !== variant.price

  const commit = async (input: HTMLInputElement) => {
    const parsed = parseInt(input.value, 10)
    const next = Number.isNaN(parsed) ? variant.price : parsed
    if (next === effective) {
      input.value = String(effective)
      return
    }
    if (next < 1 || next > 20000) {
      input.value = String(effective)
      return
    }
    setSaving(true)
    const ok = await savePrice(item.id, variant.id, next, variant.price)
    setSaving(false)
    if (!ok) input.value = String(effective)
  }

  return (
    <input
      key={`${item.id}:${variant.id}:${effective}`}
      type="text"
      inputMode="numeric"
      defaultValue={effective}
      aria-label={`${item.name} ${variant.label || 'price'}`}
      title={overridden ? `Overridden (printed: ₹${variant.price}) — enter ${variant.price} to reset` : 'Edit price'}
      disabled={saving}
      onBlur={(e) => commit(e.currentTarget)}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      className={`w-[60px] rounded-[7px] border bg-card py-1 text-center text-[13px] outline-none focus:border-brand ${
        overridden ? 'border-gold/40 font-bold text-gold' : 'border-transparent text-soft'
      } ${saving ? 'opacity-50' : ''}`}
    />
  )
}

function variantOf(item: MenuItem, id: string): Variant | undefined {
  return item.variants.find((v) => v.id === id)
}

export function MenuManager() {
  const [groupId, setGroupId] = useState(MENU_GROUPS[0].id)
  const { map, toggle } = useAdminAvailability()
  const { overrides, savePrice } = useAdminPrices()
  const group = MENU_GROUPS.find((g) => g.id === groupId) ?? MENU_GROUPS[0]
  const isPizza = groupId === 'pizza'

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <span className="font-cond text-2xl font-bold text-white">Menu &amp; Prices</span>
        <span className="text-xs text-mut">
          Edit a price and press Enter — customers see it immediately. Gold = changed from the printed menu.
        </span>
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-6 pt-3.5">
        {MENU_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGroupId(g.id)}
            className={`shrink-0 rounded-full px-[15px] py-2 text-xs font-bold whitespace-nowrap ${
              g.id === groupId ? 'bg-brand text-white' : 'bg-chip text-soft'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
      <div className="flex px-6 pt-3.5 pb-1 text-[11px] font-bold tracking-wide text-mut">
        <span className="flex-1">ITEM</span>
        {isPizza ? (
          <>
            <span className="w-[60px] text-center">S</span>
            <span className="mx-1.5 w-[60px] text-center">M</span>
            <span className="w-[60px] text-center">L</span>
          </>
        ) : (
          <span className="w-[186px] text-center">PRICE</span>
        )}
        <span className="w-[90px] text-center">AVAILABLE</span>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {group.categories.map((cat) => (
          <div key={cat}>
            <div className="font-cond pt-3 pb-1 text-base font-bold text-brand">{CATEGORY_TITLES[cat]}</div>
            {itemsInCategory(cat).map((item) => {
              const available = map[item.id] !== false
              return (
                <div
                  key={item.id}
                  className={`flex items-center border-t border-white/5 py-3 ${available ? '' : 'opacity-55'}`}
                >
                  <span className="flex flex-1 items-center gap-2.5">
                    <VegDot isVeg={item.isVeg} />
                    <span className="text-sm font-semibold text-white">
                      {item.name}
                      {!available && <span className="ml-1.5 text-[11px] font-bold text-brand">· OUT OF STOCK</span>}
                    </span>
                  </span>
                  {isPizza ? (
                    <>
                      <PriceCell item={item} variant={variantOf(item, 'S')} overrides={overrides} savePrice={savePrice} />
                      <span className="mx-1.5">
                        <PriceCell item={item} variant={variantOf(item, 'M')} overrides={overrides} savePrice={savePrice} />
                      </span>
                      <PriceCell item={item} variant={variantOf(item, 'L')} overrides={overrides} savePrice={savePrice} />
                    </>
                  ) : (
                    <span className="flex w-[186px] items-center justify-center gap-1.5">
                      {item.variants.map((v) => (
                        <span key={v.id} className="flex flex-col items-center gap-0.5">
                          {v.label && <span className="text-[9px] text-mut">{v.label}</span>}
                          <PriceCell item={item} variant={v} overrides={overrides} savePrice={savePrice} />
                        </span>
                      ))}
                    </span>
                  )}
                  <span className="flex w-[90px] justify-center">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={available}
                      aria-label={`${item.name} available`}
                      onClick={() => toggle(item.id)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${available ? 'bg-veg' : 'bg-line'}`}
                    >
                      <span
                        className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-all ${
                          available ? 'right-[3px]' : 'left-[3px] bg-mut'
                        }`}
                      />
                    </button>
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
