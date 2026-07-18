import { Link, useNavigate } from 'react-router-dom'
import { getMenuItem } from '../data/menu'
import { RESTAURANT } from '../data/restaurant'
import { formatINR, isOpenNow } from '../lib/format'
import { usePriceOverrides, effectiveMinPrice } from '../lib/livePrices'
import { foodGradient } from '../lib/foodArt'
import { useAvailability, isAvailable } from '../lib/availability'
import { VegDot } from '../components/VegDot'
import { Logo } from '../components/Logo'
import { StickyCartBar } from '../components/StickyCartBar'

const TRENDING_IDS = ['overload-veg', 'chicken-tikka-pizza', 'farmhouse', 'chicken-burger']

const CATEGORY_CHIPS = [
  { label: 'Pizza', group: 'pizza' },
  { label: 'Burgers', group: 'burgers' },
  { label: 'Chicken', group: 'chicken' },
  { label: 'Shakes', group: 'shakes' },
  { label: 'More', group: 'all' },
]

export function Home() {
  const navigate = useNavigate()
  const availability = useAvailability()
  const overrides = usePriceOverrides()
  const open = isOpenNow()
  const trending = TRENDING_IDS.map((id) => getMenuItem(id)).filter(
    (i): i is NonNullable<typeof i> => !!i && isAvailable(availability, i.id),
  )

  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{
        background:
          'radial-gradient(130% 55% at 50% -12%, rgba(216,31,26,.32), transparent 62%), radial-gradient(95% 55% at 112% 108%, rgba(201,119,47,.22), transparent 60%), radial-gradient(80% 40% at -10% 40%, rgba(247,148,29,.12), transparent 60%), #100d0b',
      }}
    >
      <div className="flex items-center justify-between px-5 pt-4">
        <div>
          <div className="text-[11px] font-semibold text-mut">DELIVER TO</div>
          <div className="text-sm font-bold">
            Meheru, LPU <span className="text-brand">▾</span>
          </div>
        </div>
        <Link
          to="/profile"
          aria-label="Your details"
          className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-white/20 bg-white/10 text-[15px] font-extrabold"
        >
          M
        </Link>
      </div>

      <div className="px-5 pt-3.5 pb-2">
        <Logo />
        <div className="mt-1 text-center text-[11px] text-mut">
          {open ? (
            <span className="font-semibold text-veg">● Open now</span>
          ) : (
            <span className="font-semibold text-brand">● Closed · opens 11 AM</span>
          )}{' '}
          · {RESTAURANT.hoursDisplay}
        </div>
      </div>

      {/* Hero offer card */}
      <div className="px-5 pt-1.5 pb-3">
        <button
          type="button"
          onClick={() => navigate('/menu?group=pizza')}
          className="relative block h-[190px] w-full overflow-hidden rounded-[20px] text-left shadow-[0_10px_30px_rgba(0,0,0,.5)]"
          style={{ background: 'linear-gradient(180deg, #3a1512, #1c0f0d)' }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'repeating-linear-gradient(45deg, rgba(255,255,255,.02) 0 12px, transparent 12px 24px)',
            }}
          />
          <span className="font-anton absolute top-4 left-[18px] rounded-md bg-gold px-2.5 py-1 text-[11px] text-brand-dark">
            TUESDAY ONLY
          </span>
          <span className="font-cond absolute bottom-14 left-[18px] w-[60%] text-[30px] leading-[0.95] font-bold text-white">
            2 LARGE + 1 SMALL PIZZA FREE
          </span>
          <span className="font-cond absolute bottom-4 left-[18px] rounded-full bg-brand px-5 py-2.5 text-[15px] font-bold tracking-wide text-white shadow-[0_6px_18px_rgba(216,31,26,.55)]">
            ORDER NOW
          </span>
          <span
            className="absolute -right-6 -bottom-6 h-[150px] w-[150px] rounded-full shadow-[inset_0_0_30px_rgba(0,0,0,.4)]"
            style={{ background: 'radial-gradient(circle at 40% 35%, #c9772f, #6b3410)' }}
          />
        </button>
      </div>

      {/* Category chips */}
      <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-5 pb-3">
        {CATEGORY_CHIPS.map((chip, i) => (
          <button
            key={chip.group}
            type="button"
            onClick={() => navigate(chip.group === 'all' ? '/menu' : `/menu?group=${chip.group}`)}
            className={`shrink-0 rounded-full px-[15px] py-2 text-[13px] font-bold whitespace-nowrap ${
              i === 0 ? 'bg-brand text-white' : 'bg-chip text-soft'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Trending */}
      <div className="flex items-baseline justify-between px-5 pb-2.5">
        <span className="font-cond text-[22px] font-bold">Trending Now</span>
        <Link to="/menu" className="text-xs font-bold text-brand">
          See all ›
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3.5 px-5 pb-5">
        {trending.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(`/item/${item.id}`)}
            className="overflow-hidden rounded-[18px] border border-white/5 bg-card text-left"
          >
            <div className="relative h-[92px]" style={{ background: foodGradient(item.id, item.category) }}>
              <VegDot isVeg={item.isVeg} className="absolute top-2 left-2" />
            </div>
            <div className="px-3 pt-2.5 pb-3">
              <div className="text-[13px] font-bold">{item.name.replace(/ Pizza$/, '')}</div>
              <div className="mt-0.5 truncate text-[10px] text-mut">{item.description ?? ''}</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-cond text-[17px] font-bold text-gold">
                  {formatINR(effectiveMinPrice(overrides, item))}
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-brand text-lg text-white">
                  +
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-auto">
        <div className="px-5 pb-3 text-center text-[10px] text-mut">
          {RESTAURANT.deliveryNote} · {RESTAURANT.prepTimeNote} ·{' '}
          <Link to="/about" className="font-bold text-brand">
            Contact & info
          </Link>
        </div>
        <StickyCartBar />
      </div>
    </div>
  )
}
