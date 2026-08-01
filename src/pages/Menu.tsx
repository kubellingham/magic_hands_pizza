import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MENU, itemsInCategory } from '../data/menu'
import { MENU_GROUPS, CATEGORY_TITLES } from '../data/groups'
import type { MenuItem } from '../data/types'
import { useAvailability, isAvailable } from '../lib/availability'
import { usePriceOverrides, effectiveMinPrice, type OverrideMap } from '../lib/livePrices'
import { useHomeContent } from '../lib/homeContent'
import { formatINR } from '../lib/format'
import { useCart } from '../cart/CartContext'
import { VegDot } from '../components/VegDot'
import { ItemImage } from '../components/ItemImage'
import { StickyCartBar } from '../components/StickyCartBar'

/** "S · M · L" — the sizes are visible before tapping in. */
function sizeLabel(item: MenuItem): string {
  if (item.variants.length === 1) return ''
  return item.variants
    .map((v) => {
      if (v.id === 'veg') return 'Veg'
      if (v.id === 'nonveg') return 'Non-veg'
      if (v.id === 'half') return 'Half'
      if (v.id === 'full') return 'Full'
      return v.id
    })
    .join(' · ')
}

interface RowProps {
  item: MenuItem
  overrides: OverrideMap
  available: boolean
  bestseller: boolean
  onOpen: () => void
  onAdd: () => void
}

function MenuRow({ item, overrides, available, bestseller, onOpen, onAdd }: RowProps) {
  const sizes = sizeLabel(item)
  return (
    <div className={`flex items-center gap-3 px-5 py-3 ${available ? '' : 'opacity-45'}`}>
      <button type="button" onClick={onOpen} disabled={!available} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <ItemImage itemId={item.id} category={item.category} className="h-[62px] w-[62px] shrink-0 rounded-xl">
          <VegDot isVeg={item.isVeg} className="absolute top-1 left-1 scale-[.8]" />
        </ItemImage>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-bold">{item.name.replace(/ Pizza$/, '')}</span>
            {bestseller && available && (
              <span className="shrink-0 rounded bg-accent/15 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-accent">
                BESTSELLER
              </span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-mut">
            {item.description ?? 'Fresh from the oven'}
          </span>
          <span className="mt-1 flex items-baseline gap-2">
            {available ? (
              <>
                <span className="font-display text-[15px] font-extrabold text-accent">
                  {formatINR(effectiveMinPrice(overrides, item))}
                </span>
                {sizes && <span className="text-[10px] font-semibold text-mut">{sizes}</span>}
              </>
            ) : (
              <span className="text-[11px] font-bold text-mut">Back tomorrow</span>
            )}
          </span>
        </span>
      </button>
      <button
        type="button"
        aria-label={`Add ${item.name}`}
        disabled={!available}
        onClick={onAdd}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-lg leading-none text-white shadow-[0_4px_14px_rgba(230,51,42,.4)] disabled:opacity-30 disabled:shadow-none"
      >
        +
      </button>
    </div>
  )
}

export function Menu() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const availability = useAvailability()
  const overrides = usePriceOverrides()
  const { trending } = useHomeContent()
  const { dispatch } = useCart()
  const activeGroup = params.get('group') ?? 'all'
  const initialQuery = params.get('q') ?? ''
  const [query, setQuery] = useState(initialQuery)

  const groups = activeGroup === 'all' ? MENU_GROUPS : MENU_GROUPS.filter((g) => g.id === activeGroup)

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return MENU.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.description ?? '').toLowerCase().includes(q) ||
        CATEGORY_TITLES[item.category].toLowerCase().includes(q),
    )
  }, [query])

  const add = (item: MenuItem) => {
    if (item.variants.length > 1 || item.supportsAddOns) {
      navigate(`/item/${item.id}`)
      return
    }
    dispatch({ type: 'add', itemId: item.id, variantId: item.variants[0].id, addOnIds: [] })
  }

  const rowFor = (item: MenuItem) => (
    <MenuRow
      key={item.id}
      item={item}
      overrides={overrides}
      available={isAvailable(availability, item.id)}
      bestseller={trending.includes(item.id)}
      onOpen={() => navigate(`/item/${item.id}`)}
      onAdd={() => add(item)}
    />
  )

  return (
    <div className="flex min-h-dvh flex-col bg-surface pb-28">
      <div className="sticky top-0 z-10 bg-surface pt-4 pb-2">
        <div className="flex items-center gap-3 px-5">
          <button type="button" onClick={() => navigate('/')} aria-label="Back" className="text-xl">
            ‹
          </button>
          <h1 className="font-display text-[22px] font-extrabold">Menu</h1>
          <div className="ml-auto flex flex-1 items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5">
            <span className="text-xs text-brand">🔍</span>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                const next = new URLSearchParams(params)
                if (e.target.value) next.set('q', e.target.value)
                else next.delete('q')
                setParams(next, { replace: true })
              }}
              placeholder="Search the menu…"
              className="w-full bg-transparent text-xs outline-none placeholder:text-mut"
            />
          </div>
        </div>

        {!searchResults && (
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto border-b border-line px-5 pb-3">
            {[{ id: 'all', label: 'All' }, ...MENU_GROUPS].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setParams(g.id === 'all' ? {} : { group: g.id })}
                className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-bold whitespace-nowrap ${
                  g.id === activeGroup ? 'bg-brand text-white' : 'border border-line bg-card text-soft'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 divide-y divide-line">
        {searchResults ? (
          searchResults.length > 0 ? (
            <section>
              <div className="px-5 pt-4 pb-1">
                <span className="font-display text-lg font-extrabold text-brand">
                  {searchResults.length} match{searchResults.length > 1 ? 'es' : ''}
                </span>
              </div>
              <div className="divide-y divide-line">{searchResults.map(rowFor)}</div>
            </section>
          ) : (
            <div className="px-8 py-16 text-center">
              <p className="font-display text-lg font-extrabold">Nothing by that name.</p>
              <p className="mt-1 text-sm text-mut">Try "paneer", "tikka" or "shake".</p>
            </div>
          )
        ) : (
          groups.map((group) =>
            group.categories.map((cat) => {
              const items = itemsInCategory(cat)
              if (items.length === 0) return null
              return (
                <section key={cat}>
                  <div className="flex items-baseline gap-2 px-5 pt-5 pb-1">
                    <span className="font-display text-lg font-extrabold text-brand">{CATEGORY_TITLES[cat]}</span>
                    <span className="text-[11px] text-mut">{items.length} items</span>
                  </div>
                  <div className="divide-y divide-line">{items.map(rowFor)}</div>
                </section>
              )
            }),
          )
        )}
        <div className="h-4" />
      </div>
      <StickyCartBar />
    </div>
  )
}
