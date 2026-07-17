import { RESTAURANT } from '../data/restaurant'
import { isOpenNow } from '../lib/format'

export function About() {
  const open = isOpenNow()
  return (
    <div className="px-4 pb-4">
      <div className="mt-4 rounded-xl bg-white p-5 shadow-sm">
        <h1 className="font-display text-lg font-bold">{RESTAURANT.name}</h1>
        <p className="mt-1 text-sm text-ink/70">{RESTAURANT.address}</p>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span>🕚</span>
            <span>
              {RESTAURANT.hoursDisplay}{' '}
              <span className={`font-semibold ${open ? 'text-veg' : 'text-brand'}`}>
                · {open ? 'Open now' : 'Closed'}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>🛵</span>
            <span>{RESTAURANT.deliveryNote}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⏱️</span>
            <span>{RESTAURANT.prepTimeNote}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🍽️</span>
            <span>Also on Zomato & Swiggy</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <a
            href={RESTAURANT.telLink}
            className="rounded-xl border border-brand py-2.5 text-center text-sm font-bold text-brand"
          >
            📞 Call us
          </a>
          <a
            href={`https://wa.me/${RESTAURANT.whatsappNumber}`}
            target="_blank"
            rel="noopener"
            className="rounded-xl bg-veg py-2.5 text-center text-sm font-bold text-white"
          >
            💬 WhatsApp
          </a>
        </div>
        <a
          href={RESTAURANT.mapsUrl}
          target="_blank"
          rel="noopener"
          className="mt-3 block rounded-xl bg-cream-dark py-2.5 text-center text-sm font-semibold"
        >
          📍 Open in Google Maps
        </a>
      </div>

      <p className="mt-6 text-center text-[11px] text-ink/40">
        Made with ❤️ for {RESTAURANT.name} · Order line: {RESTAURANT.phoneDisplay}
      </p>
    </div>
  )
}
