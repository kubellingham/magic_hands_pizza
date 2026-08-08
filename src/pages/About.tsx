import { useNavigate } from 'react-router-dom'
import { ContactLink } from '../components/ContactLink'
import { RESTAURANT, telHref, whatsappHref } from '../data/restaurant'
import { isOpenNow } from '../lib/format'
import { Logo } from '../components/Logo'

export function About() {
  const navigate = useNavigate()
  const open = isOpenNow()
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back" className="text-xl">
          ‹
        </button>
        <h1 className="font-display text-[22px] font-extrabold">The shop</h1>
      </div>

      <div className="px-5 pt-4">
        <div className="flex flex-col items-center">
          <Logo size="lg" />
          <p className="font-display mt-4 text-center text-[24px] leading-[1.1] font-extrabold tracking-[-.5px]">
            The light that&rsquo;s
            <br />
            <span className="text-accent">still on.</span>
          </p>
          <p className="mt-3 max-w-[280px] text-center text-[13px] leading-relaxed text-mut">
            When every other kitchen on the street goes dark at 11, we&rsquo;re still firing till 4 AM.
          </p>
        </div>

        <div className="mt-7 rounded-2xl border border-line bg-card p-5">
          <div className="flex flex-col gap-3 text-[13px]">
            <div className="flex items-center gap-3">
              <span className="w-5">🕚</span>
              <span>
                {RESTAURANT.hoursDisplay}{' '}
                <span className={`font-bold ${open ? 'text-veg' : 'text-brand'}`}>
                  · {open ? 'open now' : 'closed'}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5">🛵</span>
              <span>Free delivery around campus (conditions apply)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5">⏱️</span>
              <span>Hot in 25–30 minutes. Every time.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5">📍</span>
              <span className="flex-1">{RESTAURANT.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5">🍽️</span>
              <span>Also on Zomato &amp; Swiggy</span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <ContactLink
              href={telHref()}
              className="block rounded-2xl border border-brand py-3 text-center text-sm font-bold text-brand"
            >
              Call us
            </ContactLink>
            <ContactLink
              href={whatsappHref()}
              className="block rounded-2xl bg-veg py-3 text-center text-sm font-bold text-white"
            >
              WhatsApp
            </ContactLink>
          </div>
          <a
            href={RESTAURANT.mapsUrl}
            target="_blank"
            rel="noopener"
            className="mt-3 block rounded-2xl border border-line bg-chip py-3 text-center text-sm font-semibold text-soft"
          >
            Open in Google Maps
          </a>
        </div>
      </div>

      <p className="mt-auto px-5 py-6 text-center text-[11px] text-mut">
        {RESTAURANT.name} · demo build · no live phone line
      </p>
    </div>
  )
}
