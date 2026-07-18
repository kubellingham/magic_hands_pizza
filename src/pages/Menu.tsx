import { useNavigate, useSearchParams } from 'react-router-dom'
import { itemsInCategory } from '../data/menu'
import { MENU_GROUPS, CATEGORY_TITLES } from '../data/groups'
import type { MenuItem } from '../data/types'
import { useAvailability, isAvailable } from '../lib/availability'
import { usePriceOverrides, effectivePrice, type OverrideMap } from '../lib/livePrices'
import { formatINR } from '../lib/format'
import { useCart } from '../cart/CartContext'
import { VegDot } from '../components/VegDot'
import { ItemImage } from '../components/ItemImage'
import { StickyCartBar } from '../components/StickyCartBar'

/** The advertised card price: Medium when the item has sizes, else its first option. */
function displayVariant(item: MenuItem) {
  return item.variants.find((v) => v.id === 'M') ?? item.variants[0]
}

function priceTag(item: MenuItem, overrides: OverrideMap): string {
  const variant = displayVariant(item)
  const price = formatINR(effectivePrice(overrides, item.id, variant))
  if (item.variants.length === 1) return price
  return `${price} · ${variant.label || 'from'}`
}

export function Menu() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const availability = useAvailability()
  const overrides = usePriceOverrides()
  const { dispatch } = useCart()
  const activeGroup = params.get('group') ?? 'all'
  const groups = activeGroup === 'all' ? MENU_GROUPS : MENU_GROUPS.filter((g) => g.id === activeGroup)

  const hasChoices = (item: MenuItem) => item.variants.length > 1 || item.supportsAddOns

  const quickAdd = (item: MenuItem) => {
    if (hasChoices(item)) {
      navigate(`/item/${item.id}`)
      return
    }
    // simple item: straight into the cart, stay on the menu
    dispatch({ type: 'add', itemId: item.id, variantId: item.variants[0].id, addOnIds: [] })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface pb-24">
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button type="button" onClick={() => navigate('/')} aria-label="Back" className="text-xl text-white">
          ‹
        </button>
        <span className="font-cond text-[22px] font-bold">Full Menu</span>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-white/5 px-5 pb-2.5">
        {[{ id: 'all', label: 'All' }, ...MENU_GROUPS].map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setParams(g.id === 'all' ? {} : { group: g.id })}
            className={`shrink-0 rounded-full px-[15px] py-2 text-[13px] font-bold whitespace-nowrap ${
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
            return (
              <section key={cat}>
                <div className="px-5 pt-4 pb-2">
                  <span className="font-cond text-xl font-bold text-brand">{CATEGORY_TITLES[cat]}</span>
                </div>
                <div className="flex flex-col gap-3 px-5">
                  {items.map((item) => {
                    const available = isAvailable(availability, item.id)
                    return (
                      <div
                        key={item.id}
                        className={`flex items-stretch gap-3 overflow-hidden rounded-[18px] border border-white/5 bg-card ${
                          available ? '' : 'opacity-45'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => available && navigate(`/item/${item.id}`)}
                          className="flex min-w-0 flex-1 items-stretch gap-3 text-left"
                        >
                          <ItemImage itemId={item.id} category={item.category} className="h-[88px] w-[88px] shrink-0 rounded-r-[14px]">
                            <VegDot isVeg={item.isVeg} className="absolute top-1.5 left-1.5 scale-90" />
                          </ItemImage>
                          <div className="min-w-0 flex-1 py-2.5 pr-1">
                            <div className="truncate text-sm font-bold">
                              {item.name}
                              {!available && <span className="ml-1.5 text-[11px] font-bold text-brand">· OUT OF STOCK</span>}
                            </div>
                            {item.description && (
                              <div className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-mut">{item.description}</div>
                            )}
                            <div className="font-cond mt-1.5 text-base font-bold text-gold">
                              {priceTag(item, overrides)}
                            </div>
                          </div>
                        </button>
                        <div className="flex items-center pr-3">
                          <button
                            type="button"
                            aria-label={`Add ${item.name}`}
                            disabled={!available}
                            onClick={() => quickAdd(item)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-xl text-white shadow-[0_4px_12px_rgba(216,31,26,.4)] disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
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
