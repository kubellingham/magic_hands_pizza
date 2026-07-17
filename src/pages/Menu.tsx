import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CATEGORIES, itemsInCategory, matchesVegFilter } from '../data/menu'
import type { MenuItem } from '../data/types'
import { ItemCard } from '../components/ItemCard'
import { VariantSheet } from '../components/VariantSheet'
import { useCart } from '../cart/CartContext'

type VegFilter = 'all' | 'veg' | 'nonveg'

export function Menu() {
  const [params, setParams] = useSearchParams()
  const activeCat = params.get('cat') ?? CATEGORIES[0].id
  const [vegFilter, setVegFilter] = useState<VegFilter>('all')
  const [sheetItem, setSheetItem] = useState<MenuItem | null>(null)
  const { dispatch } = useCart()

  const items = useMemo(
    () => itemsInCategory(activeCat).filter((item) => matchesVegFilter(item, vegFilter)),
    [activeCat, vegFilter],
  )

  const handleAdd = (item: MenuItem) => {
    // Single-variant items with no add-ons skip the sheet entirely
    if (item.variants.length === 1 && !item.supportsAddOns) {
      dispatch({ type: 'add', itemId: item.id, variantId: item.variants[0].id, addOnIds: [] })
      return
    }
    setSheetItem(item)
  }

  return (
    <div className="pb-4">
      <div className="sticky top-[58px] z-10 bg-cream pt-2 pb-1 shadow-sm">
        <div className="flex gap-2 overflow-x-auto px-4 pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setParams({ cat: cat.id })}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap ${
                cat.id === activeCat ? 'bg-brand text-white' : 'bg-white text-ink/70'
              }`}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2 px-4 pb-2">
          {(
            [
              ['all', 'All'],
              ['veg', '🟢 Veg'],
              ['nonveg', '🔴 Non-Veg'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setVegFilter(value)}
              className={`rounded-lg border px-3 py-1 text-xs font-medium ${
                vegFilter === value ? 'border-brand bg-brand/10 text-brand' : 'border-cream-dark bg-white text-ink/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 space-y-3 px-4">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} onAdd={handleAdd} />
        ))}
        {items.length === 0 && (
          <p className="py-10 text-center text-sm text-ink/50">No items match this filter.</p>
        )}
      </div>

      {sheetItem && <VariantSheet item={sheetItem} onClose={() => setSheetItem(null)} />}
    </div>
  )
}
