interface Props {
  qty: number
  onChange: (qty: number) => void
  min?: number
  size?: 'sm' | 'lg'
}

export function QtyStepper({ qty, onChange, min = 0, size = 'sm' }: Props) {
  const pad = size === 'lg' ? 'gap-4 px-3.5 py-1.5' : 'gap-2.5 px-3 py-1'
  return (
    <div className={`inline-flex items-center rounded-full bg-card ${pad}`}>
      <button
        type="button"
        aria-label="Decrease quantity"
        className="text-xl font-bold text-brand"
        onClick={() => onChange(Math.max(min, qty - 1))}
      >
        −
      </button>
      <span className="min-w-4 text-center text-sm font-bold text-white">{qty}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        className="text-xl font-bold text-brand"
        onClick={() => onChange(qty + 1)}
      >
        +
      </button>
    </div>
  )
}
