import { useNavigate } from 'react-router-dom'
import { RESTAURANT } from '../data/restaurant'
import { isOpenNow } from '../lib/format'
import { Logo } from '../components/Logo'

export function About() {
  const navigate = useNavigate()
  const open = isOpenNow()
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back" className="text-xl text-white">
          ‹
        </button>
        <span className="font-cond text-[22px] font-bold">About</span>
      </div>

      <div className="mx-5 mt-2 rounded-[18px] bg-card p-5">
        <Logo />
        <p className="mt-3 text-center text-sm text-soft">{RESTAURANT.address}</p>

        <div className="mt-5 flex flex-col gap-2.5 text-sm">
          <div className="flex items-center gap-2.5">
            <span>🕚</span>
            <span>
              {RESTAURANT.hoursDisplay}{' '}
              <span className={`font-bold ${open ? 'text-veg' : 'text-brand'}`}>
                · {open ? 'Open now' : 'Closed'}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span>🛵</span>
            <span>{RESTAURANT.deliveryNote}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span>⏱️</span>
            <span>{RESTAURANT.prepTimeNote}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span>🍽️</span>
            <span>Also on Zomato &amp; Swiggy</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <a
            href={RESTAURANT.telLink}
            className="rounded-[14px] border border-brand py-2.5 text-center text-sm font-bold text-brand"
          >
            📞 Call us
          </a>
          <a
            href={`https://wa.me/${RESTAURANT.whatsappNumber}`}
            target="_blank"
            rel="noopener"
            className="rounded-[14px] bg-veg py-2.5 text-center text-sm font-bold text-white"
          >
            💬 WhatsApp
          </a>
        </div>
        <a
          href={RESTAURANT.mapsUrl}
          target="_blank"
          rel="noopener"
          className="mt-3 block rounded-[14px] bg-chip py-2.5 text-center text-sm font-semibold text-soft"
        >
          📍 Open in Google Maps
        </a>
      </div>

      <p className="mt-auto px-5 py-5 text-center text-[11px] text-mut">
        Made with ❤️ for {RESTAURANT.name} · Order line: {RESTAURANT.phoneDisplay}
      </p>
    </div>
  )
}
