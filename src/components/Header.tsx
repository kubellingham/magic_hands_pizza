import { Link } from 'react-router-dom'
import { RESTAURANT } from '../data/restaurant'
import { isOpenNow } from '../lib/format'

export function Header() {
  const open = isOpenNow()
  return (
    <header className="sticky top-0 z-20 bg-brand text-white shadow-md">
      <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">🍕</span>
          <div>
            <div className="font-display text-lg leading-tight font-bold">{RESTAURANT.name}</div>
            <div className="text-[11px] leading-tight opacity-90">Meheru, LPU · {RESTAURANT.hoursDisplay}</div>
          </div>
        </Link>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            open ? 'bg-green-600' : 'bg-black/40'
          }`}
        >
          {open ? 'Open now' : 'Closed'}
        </span>
      </div>
    </header>
  )
}
