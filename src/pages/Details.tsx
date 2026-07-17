import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadProfile, saveProfile } from '../lib/profile'
import { isValidIndianMobile } from '../lib/format'
import { RESTAURANT } from '../data/restaurant'
import { Logo } from '../components/Logo'

/**
 * Replaces the prototype's OTP login: same visual language, but details are
 * saved on-device and pre-fill checkout — no SMS provider needed.
 */
export function Details() {
  const navigate = useNavigate()
  const initial = loadProfile()
  const [name, setName] = useState(initial.name)
  const [phone, setPhone] = useState(initial.phone)
  const [address, setAddress] = useState(initial.address)
  const [error, setError] = useState('')

  const save = () => {
    if (name.trim().length < 2) return setError('Please enter your name.')
    if (!isValidIndianMobile(phone)) return setError('Please enter a valid 10-digit mobile number.')
    if (address.trim().length < 5) return setError('Please enter your full address (hostel/PG, room, landmark).')
    saveProfile({ name: name.trim(), phone, address: address.trim() })
    navigate(-1)
  }

  const inputClass =
    'w-full rounded-xl border border-line bg-card px-4 py-3.5 text-[15px] font-semibold text-white outline-none placeholder:font-normal placeholder:text-mut focus:border-brand'

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <div
        className="relative flex h-[190px] shrink-0 flex-col items-center justify-center"
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
        <div className="mt-3 text-xs text-mut">
          Meheru, LPU Low Gate · {RESTAURANT.hoursDisplay}
        </div>
      </div>

      <div className="px-6 pt-6">
        <h1 className="font-cond text-2xl leading-[1.05] font-bold">Let&rsquo;s get you fed</h1>
        <p className="mt-1.5 text-xs text-mut">
          Saved on your phone only — used to fill your order details.
        </p>
      </div>

      <div className="flex flex-col gap-3 px-6 pt-4">
        <input className={inputClass} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex items-center gap-2.5 rounded-xl border border-line bg-card px-4 py-3.5">
          <span className="text-[15px] font-bold text-soft">+91</span>
          <span className="h-5 w-px bg-line" />
          <input
            className="w-full bg-transparent text-[15px] font-bold tracking-wide text-white outline-none placeholder:font-normal placeholder:text-mut"
            placeholder="Mobile number"
            inputMode="tel"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
          />
        </div>
        <textarea
          className={inputClass}
          placeholder="Delivery address (hostel/PG, room, landmark…)"
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
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
