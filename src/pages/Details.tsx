import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadProfile, saveProfile, MAX_ADDRESSES, type Profile } from '../lib/profile'
import { isValidIndianMobile } from '../lib/format'
import { RESTAURANT } from '../data/restaurant'
import { Logo } from '../components/Logo'

/**
 * Profile: name, phone, and up to 5 saved delivery addresses (all stored
 * on-device only). Doubles as the first-run details form during checkout.
 */
export function Details() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile>(loadProfile)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  const setField = (patch: Partial<Profile>) => setProfile((p) => ({ ...p, ...patch }))

  const addAddress = () => {
    const text = draft.trim()
    if (text.length < 5) return setError('Please enter the full address (hostel/PG, room, landmark).')
    if (profile.addresses.length >= MAX_ADDRESSES) return setError(`You can save up to ${MAX_ADDRESSES} addresses.`)
    setField({ addresses: [...profile.addresses, text], selected: profile.addresses.length })
    setDraft('')
    setError('')
  }

  const removeAddress = (i: number) => {
    const addresses = profile.addresses.filter((_, idx) => idx !== i)
    const selected = Math.min(profile.selected > i ? profile.selected - 1 : profile.selected, Math.max(0, addresses.length - 1))
    setField({ addresses, selected })
  }

  const save = () => {
    if (profile.name.trim().length < 2) return setError('Please enter your name.')
    if (!isValidIndianMobile(profile.phone)) return setError('Please enter a valid 10-digit mobile number.')
    const pendingDraft = draft.trim()
    let final = profile
    if (profile.addresses.length === 0 && pendingDraft.length >= 5) {
      final = { ...profile, addresses: [pendingDraft], selected: 0 }
    }
    if (final.addresses.length === 0) return setError('Please add at least one delivery address.')
    saveProfile({ ...final, name: final.name.trim() })
    navigate(-1)
  }

  const inputClass =
    'w-full rounded-xl border border-line bg-card px-4 py-3.5 text-[15px] font-semibold text-white outline-none placeholder:font-normal placeholder:text-mut focus:border-brand'

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <div
        className="relative flex h-[170px] shrink-0 flex-col items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #3a1512, #141210)' }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="absolute top-3.5 left-4 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-black/35 text-lg text-white"
        >
          ‹
        </button>
        <Logo size="lg" />
        <div className="mt-2 text-xs text-mut">Meheru, LPU Low Gate · {RESTAURANT.hoursDisplay}</div>
      </div>

      <div className="px-6 pt-5">
        <h1 className="font-cond text-2xl leading-[1.05] font-bold">Your details</h1>
        <p className="mt-1.5 text-xs text-mut">Saved on your phone only — used to fill your orders.</p>
      </div>

      <div className="flex flex-col gap-3 px-6 pt-4">
        <input
          className={inputClass}
          placeholder="Your name"
          value={profile.name}
          onChange={(e) => setField({ name: e.target.value })}
        />
        <div className="flex items-center gap-2.5 rounded-xl border border-line bg-card px-4 py-3.5">
          <span className="text-[15px] font-bold text-soft">+91</span>
          <span className="h-5 w-px bg-line" />
          <input
            className="w-full bg-transparent text-[15px] font-bold tracking-wide text-white outline-none placeholder:font-normal placeholder:text-mut"
            placeholder="Mobile number"
            inputMode="tel"
            maxLength={10}
            value={profile.phone}
            onChange={(e) => setField({ phone: e.target.value.replace(/\D/g, '') })}
          />
        </div>

        <div className="mt-1 text-[11px] font-bold tracking-wide text-mut">
          SAVED ADDRESSES ({profile.addresses.length}/{MAX_ADDRESSES})
        </div>
        {profile.addresses.map((address, i) => (
          <div
            key={`${i}-${address.slice(0, 12)}`}
            className={`flex items-start gap-3 rounded-xl border p-3 ${
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
                  ? 'Delivery address (hostel/PG, room, landmark…)'
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

      {error && <p className="px-6 pt-3 text-xs font-semibold text-brand">{error}</p>}

      <div className="mt-auto px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={save}
          className="w-full rounded-[14px] bg-brand py-[15px] text-center text-sm font-extrabold text-white shadow-[0_6px_16px_rgba(216,31,26,.4)]"
        >
          Save &amp; Continue
        </button>
      </div>
    </div>
  )
}
