interface Props {
  qty: number
  onChange: (qty: number) => void
  min?: number
}

export function QtyStepper({ qty, onChange, min = 0 }: Props) {
  return (
    <div className="inline-flex items-center rounded-lg border border-brand text-brand">
      <button
        type="button"
        aria-label="Decrease quantity"
        className="px-3 py-1 text-lg font-bold active:bg-brand/10"
        onClick={() => onChange(Math.max(min, qty - 1))}
      >
        −
      </button>
      <span className="min-w-8 text-center text-sm font-semibold">{qty}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        className="px-3 py-1 text-lg font-bold active:bg-brand/10"
        onClick={() => onChange(qty + 1)}
      >
        +
      </button>
    </div>
  )
}
