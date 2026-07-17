import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/menu'
import { RESTAURANT } from '../data/restaurant'
import { OfferBanner } from '../components/OfferBanner'
import { isOpenNow } from '../lib/format'

export function Home() {
  const open = isOpenNow()
  return (
    <div className="pb-4">
      <section className="bg-gradient-to-b from-brand to-brand-dark px-4 pt-6 pb-8 text-center text-white">
        <div className="text-4xl">🍕</div>
        <h1 className="font-display mt-2 text-2xl font-bold">Fresh Base Pizza & More</h1>
        <p className="mt-1 text-sm opacity-95">
          {open ? 'We are open — order now!' : `Currently closed · opens at 11:00 AM`}
        </p>
        <p className="mt-1 text-xs opacity-80">
          {RESTAURANT.deliveryNote} · {RESTAURANT.prepTimeNote}
        </p>
        <Link
          to="/menu"
          className="mt-4 inline-block rounded-xl bg-white px-8 py-3 text-sm font-bold text-brand shadow"
        >
          Browse Menu
        </Link>
      </section>

      <section className="mt-5">
        <h2 className="px-4 pb-2 text-sm font-bold text-ink/70 uppercase">Offers</h2>
        <OfferBanner />
      </section>

      <section className="mt-5 px-4">
        <h2 className="pb-2 text-sm font-bold text-ink/70 uppercase">Categories</h2>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/menu?cat=${cat.id}`}
              className="flex flex-col items-center gap-1 rounded-xl bg-white p-3 text-center shadow-sm active:bg-cream-dark"
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-[11px] leading-tight font-medium">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
