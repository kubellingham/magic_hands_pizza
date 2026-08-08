import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loadProfile, saveProfile, MAX_ADDRESSES, type Profile } from '../lib/profile'
import { isValidIndianMobile } from '../lib/format'
import { RESTAURANT } from '../data/restaurant'
import { Logo } from '../components/Logo'

/** Name, phone and up to five saved addresses — all on-device, no login. */
export function Details() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile>(loadProfile)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  const setField = (patch: Partial<Profile>) => setProfile((p) => ({ ...p, ...patch }))

  const addAddress = () => {
    const text = draft.trim()
    if (text.length < 5) return setError('Give us the full address — hostel/PG, room, landmark.')
    if (profile.addresses.length >= MAX_ADDRESSES) return setError('Five saved spots is the max.')
    setField({ addresses: [...profile.addresses, text], selected: profile.addresses.length })
    setDraft('')
    setError('')
  }

  const removeAddress = (i: number) => {
    const addresses = profile.addresses.filter((_, idx) => idx !== i)
    const selected = Math.min(
      profile.selected > i ? profile.selected - 1 : profile.selected,
      Math.max(0, addresses.length - 1),
    )
    setField({ addresses, selected })
  }

  const save = () => {
    if (profile.name.trim().length < 2) return setError('We need a name for the order.')
    if (!isValidIndianMobile(profile.phone)) return setError('A valid 10-digit mobile number, please.')
    const pending = draft.trim()
    let final = profile
    if (profile.addresses.length === 0 && pending.length >= 5) {
      final = { ...profile, addresses: [pending], selected: 0 }
    }
    if (final.addresses.length === 0) return setError('Add at least one address so we know where to go.')
    saveProfile({ ...final, name: final.name.trim() })
    navigate(-1)
  }

  const inputClass =
    'w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-[15px] font-semibold outline-none placeholder:font-normal placeholder:text-mut focus:border-brand'

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <div className="hero-bg relative flex shrink-0 flex-col items-center px-5 pt-12 pb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card text-lg"
        >
          ‹
        </button>
        <Link
          to="/orders"
          className="absolute top-4 right-4 rounded-xl border border-line bg-card px-3 py-2 text-[11px] font-bold"
        >
          🧾 Orders
        </Link>
        <Logo size="lg" />
        <div className="mt-2 text-[11px] text-mut">Campus Road · {RESTAURANT.hoursDisplay}</div>
      </div>

      <div className="px-5 pt-6">
        <h1 className="font-display text-[26px] leading-[1.05] font-extrabold tracking-[-.5px]">Your details</h1>
        <p className="mt-1.5 text-[13px] text-mut">
          Stays on your phone. We only use it to fill out your order.
        </p>
      </div>

      <div className="flex flex-col gap-3 px-5 pt-5">
        <input
          className={inputClass}
          placeholder="Your name"
          value={profile.name}
          onChange={(e) => setField({ name: e.target.value })}
        />
        <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-card px-4 py-3.5">
          <span className="text-[15px] font-bold text-soft">+91</span>
          <span className="h-5 w-px bg-line" />
          <input
            className="w-full bg-transparent text-[15px] font-bold tracking-wide outline-none placeholder:font-normal placeholder:text-mut"
            placeholder="Mobile number"
            inputMode="tel"
            maxLength={10}
            value={profile.phone}
            onChange={(e) => setField({ phone: e.target.value.replace(/\D/g, '') })}
          />
        </div>

        <div className="mt-2 text-[10px] font-extrabold tracking-[1px] text-mut">
          SAVED ADDRESSES ({profile.addresses.length}/{MAX_ADDRESSES})
        </div>
        {profile.addresses.map((address, i) => (
          <div
            key={`${i}-${address.slice(0, 12)}`}
            className={`flex items-start gap-3 rounded-2xl border p-3.5 ${
              i === profile.selected ? 'border-brand bg-brand/10' : 'border-line bg-card'
            }`}
          >
            <button
              type="button"
              onClick={() => setField({ selected: i })}
              className="flex flex-1 items-start gap-2.5 text-left"
            >
              <span className="mt-0.5 text-brand">📍</span>
              <span className="flex-1 text-[13px] leading-snug">
                {address}
                {i === profile.selected && <span className="ml-1.5 text-[11px] font-bold text-brand">· current</span>}
              </span>
            </button>
            <button
              type="button"
              aria-label={`Remove address ${i + 1}`}
              onClick={() => removeAddress(i)}
              className="text-xs font-bold text-mut hover:text-brand"
            >
              ✕
            </button>
          </div>
        ))}
        {profile.addresses.length < MAX_ADDRESSES && (
          <div>
            <textarea
              className={inputClass}
              placeholder={
                profile.addresses.length === 0
                  ? 'Delivery address — hostel/PG, room, landmark'
                  : 'Add another address…'
              }
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            {draft.trim().length >= 5 && (
              <button type="button" onClick={addAddress} className="mt-2 text-xs font-bold text-brand">
                + Save this address
              </button>
            )}
          </div>
        )}
      </div>

      {error && <p className="px-5 pt-3 text-xs font-semibold text-brand">{error}</p>}

      <div className="mt-auto px-5 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={save}
          className="w-full rounded-2xl bg-brand py-4 text-center text-[15px] font-extrabold text-white shadow-[0_8px_24px_rgba(230,51,42,.4)]"
        >
          Save &amp; continue
        </button>
      </div>
    </div>
  )
}
