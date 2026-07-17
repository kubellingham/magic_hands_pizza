/** The square veg/non-veg mark used on Indian food packaging. */
export function VegDot({ isVeg, className = '' }: { isVeg: boolean; className?: string }) {
  const color = isVeg ? 'border-veg' : 'border-nonveg'
  const fill = isVeg ? 'bg-veg' : 'bg-nonveg'
  return (
    <span
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center border-2 ${color} ${className}`}
      title={isVeg ? 'Veg' : 'Non-Veg'}
      aria-label={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
    >
      <span className={`h-2 w-2 rounded-full ${fill}`} />
    </span>
  )
}
