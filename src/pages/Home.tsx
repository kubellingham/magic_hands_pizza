import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMenuItem } from '../data/menu'
import { MENU_GROUPS, groupCount } from '../data/groups'
import { RESTAURANT } from '../data/restaurant'
import { formatINR, isOpenNow } from '../lib/format'
import { usePriceOverrides, effectiveMinPrice } from '../lib/livePrices'
import { useHomeContent } from '../lib/homeContent'
import { useAvailability, isAvailable } from '../lib/availability'
import { loadProfile, currentAddress, addressLabel, type Profile } from '../lib/profile'
import { useShift, copyFor } from '../lib/shift'
import { VegDot } from '../components/VegDot'
import { Logo } from '../components/Logo'
import { StickyCartBar } from '../components/StickyCartBar'
import { ActiveOrderBanner } from '../components/ActiveOrderBanner'
import { AddressSheet } from '../components/AddressSheet'
import { ItemImage } from '../components/ItemImage'

export function Home() {
  const navigate = useNavigate()
  const shift = useShift()
  const copy = copyFor(shift)
  const availability = useAvailability()
  const overrides = usePriceOverrides()
  const { special, trending } = useHomeContent()
  const [profile, setProfile] = useState<Profile>(loadProfile)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [query, setQuery] = useState('')
  const open = isOpenNow()

  const address = currentAddress(profile)
  const favourites = trending
    .map((id) => getMenuItem(id))
    .filter((i): i is NonNullable<typeof i> => !!i)

  const search = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(query.trim() ? `/menu?q=${encodeURIComponent(query.trim())}` : '/menu')
  }

  return (
    <div className="page-bg flex min-h-dvh flex-col pb-28">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          <Logo size="sm" className="shrink-0" />
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold tracking-wide text-mut">DELIVERING TO</span>
            <span className="flex items-center gap-1 text-[15px] font-bold">
              <span className="truncate">{address ? addressLabel(address) : 'Set your address'}</span>
              <span className="shrink-0 text-brand">▾</span>
            </span>
          </span>
        </button>
        <div className="flex items-center gap-2">
          <Link
            to="/orders"
            aria-label="My orders"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card text-sm"
          >
            🧾
          </Link>
          <Link
            to="/profile"
            aria-label="Your details"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card text-sm font-extrabold"
          >
            {profile.name ? profile.name[0].toUpperCase() : 'A'}
          </Link>
        </div>
      </div>

      {/* Greeting */}
      <div className="px-5 pt-5">
        <h1 className="font-display text-[34px] leading-[1.02] font-extrabold tracking-[-1px]">
          {copy.greetingTop}
          <br />
          <span className="text-accent">{copy.greetingBottom}</span>
        </h1>
        <div
          className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-bold tracking-wide ${
            open ? 'border-accent/40 bg-accent/10 text-accent' : 'border-line bg-chip text-mut'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${open ? 'bg-accent' : 'bg-mut'}`} />
          {open ? copy.statusPill : 'CLOSED · BACK AT 11 AM'}
        </div>
      </div>

      {/* Search */}
      <form onSubmit={search} className="px-5 pt-4">
        <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-card px-4 py-3">
          <span className="text-sm text-brand">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.searchPlaceholder}
            className="w-full bg-transparent text-sm outline-none placeholder:text-mut"
          />
        </div>
      </form>

      {/* Deal card */}
      <div className="px-5 pt-4">
        <button
          type="button"
          onClick={() => navigate('/menu?group=pizza')}
          className="hero-bg relative block w-full overflow-hidden rounded-2xl border border-brand/30 p-4 text-left shadow-[var(--sh-glow)]"
        >
          {special.badge && (
            <span className="font-display absolute top-0 right-0 rounded-bl-xl bg-accent px-3 py-1 text-[10px] font-extrabold tracking-wide text-bg">
              {special.badge}
            </span>
          )}
          <div className="font-display max-w-[78%] text-[21px] leading-[1.12] font-extrabold">
            {special.title}
          </div>
          <div className="my-3 border-t border-dashed border-line" />
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-mut">Auto-applied at checkout</span>
            <span className="rounded-full bg-brand px-4 py-2 text-xs font-bold text-white">Order now</span>
          </div>
        </button>
      </div>

      {/* Category chips with counts */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pt-4">
        {MENU_GROUPS.map((group) => (
          <button
            key={group.id}
            type="button"
            onClick={() => navigate(`/menu?group=${group.id}`)}
            className="shrink-0 rounded-full border border-line bg-card px-4 py-2 text-[13px] font-bold whitespace-nowrap"
          >
            {group.label} <span className="text-mut">{groupCount(group)}</span>
          </button>
        ))}
      </div>

      {/* Favourites rail */}
      <div className="flex items-baseline justify-between gap-3 px-5 pt-6 pb-3">
        <h2 className="font-display truncate text-[19px] font-extrabold tracking-[-.3px]">{copy.railTitle}</h2>
        <Link to="/menu" className="shrink-0 text-xs font-bold whitespace-nowrap text-brand">
          Full menu ›
        </Link>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-2">
        {favourites.map((item) => {
          const available = isAvailable(availability, item.id)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => available && navigate(`/item/${item.id}`)}
              className={`w-[152px] shrink-0 overflow-hidden rounded-2xl border border-line bg-card text-left ${
                available ? '' : 'opacity-50'
              }`}
            >
              <ItemImage itemId={item.id} category={item.category} className="h-[104px]">
                <VegDot isVeg={item.isVeg} className="absolute top-2 left-2" />
              </ItemImage>
              <div className="p-3">
                <div className="truncate text-[13px] font-bold">{item.name.replace(/ Pizza$/, '')}</div>
                <div className="mt-0.5 truncate text-[10px] text-mut">
                  {available ? (item.description ?? 'Fresh from the oven') : 'Back tomorrow'}
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="font-display text-[15px] font-extrabold text-accent">
                    from {formatINR(effectiveMinPrice(overrides, item))}
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-base leading-none text-white">
                    +
                  </span>
                </div>
              </div>
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="flex w-[132px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-brand/50 bg-brand/5"
        >
          <span className="text-2xl">📋</span>
          <span className="font-display text-sm leading-tight font-extrabold">Full menu</span>
          <span className="text-[10px] font-bold text-brand">90+ items ›</span>
        </button>
      </div>

      <p className="mt-auto px-5 pt-6 text-center text-[10px] text-mut">
        {RESTAURANT.deliveryNote} · hot in 25–30, every time ·{' '}
        <Link to="/about" className="font-bold text-brand">
          Contact & info
        </Link>
      </p>

      <ActiveOrderBanner />
      <StickyCartBar />
      {sheetOpen && <AddressSheet onClose={() => setSheetOpen(false)} onChanged={setProfile} />}
    </div>
  )
}
