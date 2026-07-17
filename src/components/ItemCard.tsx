import type { MenuItem } from '../data/types'
import { minPrice } from '../data/menu'
import { formatINR } from '../lib/format'
import { VegDot } from './VegDot'

interface Props {
  item: MenuItem
  onAdd: (item: MenuItem) => void
}

export function ItemCard({ item, onAdd }: Props) {
  const hasChoices = item.variants.length > 1 || item.supportsAddOns
  const price = minPrice(item)
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <VegDot isVeg={item.isVeg} />
          <h3 className="truncate text-sm font-semibold">{item.name}</h3>
        </div>
        {item.description && <p className="mt-1 text-xs text-ink/60">{item.description}</p>}
        <div className="mt-1.5 text-sm font-bold text-ink">
          {hasChoices && <span className="font-normal text-ink/50">from </span>}
          {formatINR(price)}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onAdd(item)}
        className="shrink-0 rounded-lg border border-brand bg-brand/5 px-5 py-1.5 text-sm font-bold text-brand uppercase active:bg-brand active:text-white"
      >
        Add
      </button>
    </div>
  )
}
