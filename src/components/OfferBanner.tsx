import { OFFERS } from '../data/restaurant'

export function OfferBanner() {
  return (
    <div className="flex snap-x gap-3 overflow-x-auto px-4 pb-1">
      {OFFERS.map((offer) => (
        <div
          key={offer.id}
          className="min-w-[240px] snap-start rounded-xl bg-gradient-to-br from-brand to-brand-dark p-4 text-white shadow"
        >
          <div className="text-sm font-bold">{offer.title}</div>
          <div className="mt-1 text-xs opacity-95">{offer.detail}</div>
        </div>
      ))}
    </div>
  )
}
