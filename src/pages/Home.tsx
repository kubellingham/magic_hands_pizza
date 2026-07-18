import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMenuItem } from '../data/menu'
import { RESTAURANT } from '../data/restaurant'
import { formatINR, isOpenNow } from '../lib/format'
import { usePriceOverrides, effectiveMinPrice } from '../lib/livePrices'
import { useHomeContent } from '../lib/homeContent'
import { useAvailability, isAvailable } from '../lib/availability'
import { loadProfile, currentAddress, addressLabel, type Profile } from '../lib/profile'
import { VegDot } from '../components/VegDot'
import { Logo } from '../components/Logo'
import { StickyCartBar } from '../components/StickyCartBar'
import { ActiveOrderBanner } from '../components/ActiveOrderBanner'
import { AddressSheet } from '../components/AddressSheet'
import { ItemImage } from '../components/ItemImage'

export function Home() {
  const navigate = useNavigate()
  const availability = useAvailability()
  const overrides = usePriceOverrides()
  const { special, trending } = useHomeContent()
  const [profile, setProfile] = useState<Profile>(loadProfile)
  const [sheetOpen, setSheetOpen] = useState(false)
  const open = isOpenNow()

  const address = currentAddress(profile)
  const trendingItems = trending
    .map((id) => getMenuItem(id))
    .filter((i): i is NonNullable<typeof i> => !!i)
    .slice(0, 3)

  return (
    <div
      className="flex min-h-dvh flex-col pb-24"
      style={{
        background:
          'radial-gradient(130% 55% at 50% -12%, rgba(216,31,26,.32), transparent 62%), radial-gradient(95% 55% at 112% 108%, rgba(201,119,47,.22), transparent 60%), radial-gradient(80% 40% at -10% 40%, rgba(247,148,29,.12), transparent 60%), #100d0b',
      }}
    >
      {/* Header: deliver-to + profile */}
      <div className="flex items-center justify-between px-5 pt-4">
        <button type="button" onClick={() => setSheetOpen(true)} className="text-left">
          <div className="text-[11px] font-semibold text-mut">DELIVER TO</div>
          <div className="text-sm font-bold">
            {address ? addressLabel(address) : 'Tap to set your address'} <span className="text-brand">▾</span>
          </div>
        </button>
        <Link
          to="/profile"
          aria-label="Your details"
          className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-white/20 bg-white/10 text-[15px] font-extrabold"
        >
          {profile.name ? profile.name[0].toUpperCase() : 'M'}
        </Link>
      </div>

      {/* Logo + timings */}
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

      {/* Special card (admin-editable) */}
      <div className="px-5 pt-1.5 pb-4">
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
          {special.badge && (
            <span className="font-anton absolute top-4 left-[18px] rounded-md bg-gold px-2.5 py-1 text-[11px] text-brand-dark">
              {special.badge}
            </span>
          )}
          <span className="font-cond absolute bottom-14 left-[18px] w-[60%] text-[30px] leading-[0.95] font-bold text-white">
            {special.title}
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

      {/* Trending: 3 admin picks + Full Menu card */}
      <div className="px-5 pb-2.5">
        <span className="font-cond text-[22px] font-bold">Trending Now</span>
      </div>
      <div className="grid grid-cols-2 gap-3.5 px-5">
        {trendingItems.map((item) => {
          const available = isAvailable(availability, item.id)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => available && navigate(`/item/${item.id}`)}
              className={`overflow-hidden rounded-[18px] border border-white/5 bg-card text-left ${available ? '' : 'opacity-50'}`}
            >
              <ItemImage itemId={item.id} category={item.category} className="h-[92px]">
                <VegDot isVeg={item.isVeg} className="absolute top-2 left-2" />
              </ItemImage>
              <div className="px-3 pt-2.5 pb-3">
                <div className="truncate text-[13px] font-bold">{item.name.replace(/ Pizza$/, '')}</div>
                <div className="mt-0.5 truncate text-[10px] text-mut">
                  {available ? (item.description ?? '') : 'Out of stock'}
                </div>
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
          )
        })}

        {/* 4th card: full menu */}
        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="flex min-h-[170px] flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed border-brand/60 bg-brand/10 text-center"
        >
          <span className="text-3xl">📋</span>
          <span className="font-cond text-lg leading-tight font-bold text-white">
            Full
            <br />
            Menu
          </span>
          <span className="text-[11px] font-bold text-brand">90+ items ›</span>
        </button>
      </div>

      <div className="mt-auto px-5 pt-5 pb-2 text-center text-[10px] text-mut">
        {RESTAURANT.deliveryNote} · {RESTAURANT.prepTimeNote} ·{' '}
        <Link to="/about" className="font-bold text-brand">
          Contact & info
        </Link>
      </div>

      <ActiveOrderBanner />
      <StickyCartBar />
      {sheetOpen && <AddressSheet onClose={() => setSheetOpen(false)} onChanged={setProfile} />}
    </div>
  )
}
