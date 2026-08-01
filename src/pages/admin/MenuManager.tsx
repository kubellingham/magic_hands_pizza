import { useState } from 'react'
import { itemsInCategory } from '../../data/menu'
import { MENU_GROUPS, CATEGORY_TITLES } from '../../data/groups'
import type { MenuItem, Variant } from '../../data/types'
import { VegDot } from '../../components/VegDot'
import { effectivePrice, type OverrideMap } from '../../lib/livePrices'
import { useAdminAvailability, useAdminPrices, soldTonight, type AdminOrder } from './adminData'

interface PriceCellProps {
  item: MenuItem
  variant?: Variant
  overrides: OverrideMap
  savePrice: (itemId: string, variantId: string, price: number, basePrice: number) => Promise<boolean>
}

/**
 * Editable price. Saves on blur/Enter; typing the printed base price back
 * clears the override. Amber = changed from the printed menu.
 */
function PriceCell({ item, variant, overrides, savePrice }: PriceCellProps) {
  const [saving, setSaving] = useState(false)
  if (!variant) return <span className="w-[58px] py-1 text-center text-[13px] text-mut">—</span>

  const effective = effectivePrice(overrides, item.id, variant)
  const overridden = effective !== variant.price

  const commit = async (input: HTMLInputElement) => {
    const parsed = parseInt(input.value, 10)
    const next = Number.isNaN(parsed) ? variant.price : parsed
    if (next === effective || next < 1 || next > 20000) {
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
      title={overridden ? `Changed from ₹${variant.price} — type ${variant.price} to reset` : 'Tap to edit'}
      disabled={saving}
      onBlur={(e) => commit(e.currentTarget)}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      className={`w-[58px] rounded-lg border bg-chip py-1.5 text-center text-[13px] outline-none focus:border-brand ${
        overridden ? 'border-accent/50 font-extrabold text-accent' : 'border-transparent text-soft'
      } ${saving ? 'opacity-50' : ''}`}
    />
  )
}

function variantOf(item: MenuItem, id: string): Variant | undefined {
  return item.variants.find((v) => v.id === id)
}

export function MenuManager({ orders }: { orders: AdminOrder[] }) {
  const [groupId, setGroupId] = useState(MENU_GROUPS[0].id)
  const { map, toggle } = useAdminAvailability()
  const { overrides, savePrice } = useAdminPrices()
  const group = MENU_GROUPS.find((g) => g.id === groupId) ?? MENU_GROUPS[0]
  const isPizza = groupId === 'pizza'
  const sold = soldTonight(orders)

  const liveCount = MENU_GROUPS.flatMap((g) => g.categories)
    .flatMap((c) => itemsInCategory(c))
    .filter((i) => map[i.id] !== false).length
  const totalCount = MENU_GROUPS.flatMap((g) => g.categories).flatMap((c) => itemsInCategory(c)).length

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <h1 className="font-display text-[22px] font-extrabold">Menu &amp; stock</h1>
        <span className="text-xs font-bold text-mut">
          {liveCount}/{totalCount} live
        </span>
      </div>

      <div className="mx-6 mt-4 rounded-2xl border border-accent/30 bg-accent/8 px-4 py-3 text-[12px] leading-relaxed text-soft">
        Anything you switch off shows as <b className="text-accent">"Back tomorrow"</b> in the app — never
        "out of stock". Prices save the moment you press Enter.
      </div>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-6">
        {MENU_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGroupId(g.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap ${
              g.id === groupId ? 'bg-brand text-white' : 'border border-line bg-card text-soft'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="flex px-6 pt-4 pb-1 text-[10px] font-extrabold tracking-wide text-mut">
        <span className="flex-1">ITEM</span>
        {isPizza ? (
          <>
            <span className="w-[58px] text-center">S</span>
            <span className="mx-1.5 w-[58px] text-center">M</span>
            <span className="w-[58px] text-center">L</span>
          </>
        ) : (
          <span className="w-[182px] text-center">PRICE</span>
        )}
        <span className="w-[76px] text-center">LIVE</span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {group.categories.map((cat) => (
          <div key={cat}>
            <div className="font-display pt-4 pb-1 text-base font-extrabold text-brand">
              {CATEGORY_TITLES[cat]}
            </div>
            {itemsInCategory(cat).map((item) => {
              const live = map[item.id] !== false
              const count = sold[item.name.toLowerCase()] ?? 0
              return (
                <div
                  key={item.id}
                  className={`flex items-center border-t border-line py-3 ${live ? '' : 'opacity-55'}`}
                >
                  <span className="flex flex-1 items-center gap-2.5">
                    <VegDot isVeg={item.isVeg} />
                    <span>
                      <span className="text-[14px] font-semibold">{item.name.replace(/ Pizza$/, '')}</span>
                      {!live ? (
                        <span className="ml-2 rounded bg-chip px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-mut">
                          BACK TOMORROW
                        </span>
                      ) : count > 0 ? (
                        <span className="ml-2 text-[11px] text-mut">sold {count} tonight</span>
                      ) : null}
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
                    <span className="flex w-[182px] items-center justify-center gap-1.5">
                      {item.variants.map((v) => (
                        <span key={v.id} className="flex flex-col items-center gap-0.5">
                          {v.label && <span className="text-[9px] text-mut">{v.label}</span>}
                          <PriceCell item={item} variant={v} overrides={overrides} savePrice={savePrice} />
                        </span>
                      ))}
                    </span>
                  )}
                  <span className="flex w-[76px] justify-center">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={live}
                      aria-label={`${item.name} available`}
                      onClick={() => toggle(item.id)}
                      className={`relative h-7 w-12 rounded-full transition-colors ${live ? 'bg-veg' : 'bg-line'}`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full transition-all ${
                          live ? 'right-1 bg-white' : 'left-1 bg-mut'
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
