import { useNavigate, useSearchParams } from 'react-router-dom'
import { itemsInCategory } from '../data/menu'
import { MENU_GROUPS, CATEGORY_TITLES } from '../data/groups'
import type { CategoryId, MenuItem } from '../data/types'
import { useAvailability, isAvailable } from '../lib/availability'
import { usePriceOverrides, effectivePrice, type OverrideMap } from '../lib/livePrices'
import { VegDot } from '../components/VegDot'
import { StickyCartBar } from '../components/StickyCartBar'

const PIZZA_CATS: CategoryId[] = ['veg-pizza', 'nonveg-pizza']

function priceCols(item: MenuItem, overrides: OverrideMap): { s?: number; m?: number; l?: number } {
  const find = (id: string) => {
    const variant = item.variants.find((v) => v.id === id)
    return variant ? effectivePrice(overrides, item.id, variant) : undefined
  }
  return { s: find('S'), m: find('M'), l: find('L') }
}

function flatPriceLabel(item: MenuItem, overrides: OverrideMap): string {
  const prices = item.variants.map((v) => effectivePrice(overrides, item.id, v))
  if (prices.length === 1) return `₹${prices[0]}`
  return prices.join(' / ')
}

export function Menu() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const availability = useAvailability()
  const overrides = usePriceOverrides()
  const activeGroup = params.get('group') ?? 'all'
  const groups = activeGroup === 'all' ? MENU_GROUPS : MENU_GROUPS.filter((g) => g.id === activeGroup)

  const openItem = (item: MenuItem, available: boolean) => {
    if (available) navigate(`/item/${item.id}`)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button type="button" onClick={() => navigate('/')} aria-label="Back" className="text-xl text-white">
          ‹
        </button>
        <span className="font-cond text-[22px] font-bold">Full Menu</span>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/5 px-5 pb-2.5">
        {[{ id: 'all', label: 'All' }, ...MENU_GROUPS].map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setParams(g.id === 'all' ? {} : { group: g.id })}
            className={`rounded-full px-[15px] py-2 text-[13px] font-bold whitespace-nowrap ${
              g.id === activeGroup ? 'bg-brand text-white' : 'bg-chip text-soft'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {groups.map((group) =>
          group.categories.map((cat) => {
            const items = itemsInCategory(cat)
            if (items.length === 0) return null
            const isPizza = PIZZA_CATS.includes(cat)
            return (
              <section key={cat}>
                <div className="flex items-center justify-between px-5 pt-4 pb-1">
                  <span className="font-cond text-xl font-bold text-brand">{CATEGORY_TITLES[cat]}</span>
                  {isPizza && (
                    <span className="font-anton flex gap-3 text-xs text-mut">
                      <span className="w-[26px] text-center">S</span>
                      <span className="w-[26px] text-center">M</span>
                      <span className="w-[30px] text-center">L</span>
                    </span>
                  )}
                </div>
                {items.map((item) => {
                  const available = isAvailable(availability, item.id)
                  const cols = priceCols(item, overrides)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openItem(item, available)}
                      className={`flex w-full items-center gap-3 border-b border-white/5 px-5 py-[11px] text-left ${
                        available ? '' : 'opacity-45'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-[7px]">
                          <VegDot isVeg={item.isVeg} />
                          <span className="truncate text-sm font-bold">
                            {item.name}
                            {!available && (
                              <span className="ml-1.5 text-[11px] font-bold text-brand">· OUT OF STOCK</span>
                            )}
                          </span>
                        </div>
                        {item.description && (
                          <div className="mt-0.5 truncate text-[11px] text-mut">{item.description}</div>
                        )}
                      </div>
                      {isPizza ? (
                        <span className="font-cond flex gap-3 text-[15px] font-bold text-soft">
                          <span className="w-[26px] text-center">{cols.s ?? '—'}</span>
                          <span className="w-[26px] text-center">{cols.m ?? '—'}</span>
                          <span className="w-[30px] text-center">{cols.l ?? '—'}</span>
                        </span>
                      ) : (
                        <span className="font-cond min-w-10 text-right text-[15px] font-bold whitespace-nowrap text-soft">
                          {flatPriceLabel(item, overrides)}
                        </span>
                      )}
                      <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-brand text-lg text-white">
                        +
                      </span>
                    </button>
                  )
                })}
              </section>
            )
          }),
        )}
        <div className="h-4" />
      </div>
      <StickyCartBar />
    </div>
  )
}
