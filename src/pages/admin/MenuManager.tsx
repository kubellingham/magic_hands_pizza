import { useState } from 'react'
import { itemsInCategory } from '../../data/menu'
import { MENU_GROUPS, CATEGORY_TITLES } from '../../data/groups'
import type { MenuItem } from '../../data/types'
import { VegDot } from '../../components/VegDot'
import { useAdminAvailability } from './adminData'

function PriceCell({ value }: { value?: number }) {
  return (
    <span className="w-[60px] rounded-[7px] bg-card py-1 text-center text-[13px] text-soft">
      {value ?? '—'}
    </span>
  )
}

function priceFor(item: MenuItem, id: string): number | undefined {
  return item.variants.find((v) => v.id === id)?.price
}

/**
 * Prices are read-only here on purpose — the menu is code-managed
 * (src/data/menu.ts) so it stays versioned and offline-cached. Availability
 * is the live, owner-controlled switch.
 */
export function MenuManager() {
  const [groupId, setGroupId] = useState(MENU_GROUPS[0].id)
  const { map, toggle } = useAdminAvailability()
  const group = MENU_GROUPS.find((g) => g.id === groupId) ?? MENU_GROUPS[0]
  const isPizza = groupId === 'pizza'

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <span className="font-cond text-2xl font-bold text-white">Menu &amp; Prices</span>
        <span className="text-xs text-mut">Prices are edited in code &amp; redeployed — toggles are live</span>
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
                      <PriceCell value={priceFor(item, 'S')} />
                      <span className="mx-1.5">
                        <PriceCell value={priceFor(item, 'M')} />
                      </span>
                      <PriceCell value={priceFor(item, 'L')} />
                    </>
                  ) : (
                    <span className="w-[186px] rounded-[7px] bg-card py-1 text-center text-[13px] text-soft">
                      {item.variants.map((v) => (v.label ? `${v.label} ${v.price}` : v.price)).join(' · ')}
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
