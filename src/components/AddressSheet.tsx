import { useState } from 'react'
import { loadProfile, saveProfile, MAX_ADDRESSES, type Profile } from '../lib/profile'

interface Props {
  onClose: () => void
  onChanged: (profile: Profile) => void
}

/** Bottom sheet: pick the delivery address, add a new one (max 5), remove. */
export function AddressSheet({ onClose, onChanged }: Props) {
  const [profile, setProfile] = useState<Profile>(loadProfile)
  const [adding, setAdding] = useState(profile.addresses.length === 0)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  const update = (next: Profile) => {
    saveProfile(next)
    setProfile(next)
    onChanged(next)
  }

  const select = (i: number) => {
    update({ ...profile, selected: i })
    onClose()
  }

  const addAddress = () => {
    const text = draft.trim()
    if (text.length < 5) return setError('Give us the full address — hostel/PG, room, landmark.')
    if (profile.addresses.length >= MAX_ADDRESSES) return setError(`Five saved spots is the max.`)
    const addresses = [...profile.addresses, text]
    update({ ...profile, addresses, selected: addresses.length - 1 })
    setDraft('')
    setError('')
    setAdding(false)
  }

  const remove = (i: number) => {
    const addresses = profile.addresses.filter((_, idx) => idx !== i)
    const selected = Math.min(
      profile.selected > i ? profile.selected - 1 : profile.selected,
      Math.max(0, addresses.length - 1),
    )
    update({ ...profile, addresses, selected })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal="true">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-3xl bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        <h2 className="font-display text-xl font-extrabold">Where are we bringing it?</h2>

        <div className="mt-3 flex max-h-[40vh] flex-col gap-2 overflow-y-auto">
          {profile.addresses.map((address, i) => (
            <div
              key={`${i}-${address.slice(0, 12)}`}
              className={`flex items-start gap-3 rounded-2xl border p-3 ${
                i === profile.selected ? 'border-brand bg-brand/10' : 'border-line bg-card'
              }`}
            >
              <button type="button" onClick={() => select(i)} className="flex flex-1 items-start gap-2.5 text-left">
                <span className="mt-0.5 text-brand">📍</span>
                <span className="flex-1 text-[13px] leading-snug">
                  {address}
                  {i === profile.selected && (
                    <span className="ml-1.5 text-[11px] font-bold text-brand">· current</span>
                  )}
                </span>
              </button>
              {profile.addresses.length > 1 && (
                <button
                  type="button"
                  aria-label={`Remove address ${i + 1}`}
                  onClick={() => remove(i)}
                  className="text-xs font-bold text-mut hover:text-brand"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {adding ? (
          <div className="mt-3">
            <textarea
              autoFocus
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Hostel/PG, room number, landmark…"
              className="w-full rounded-2xl border border-line bg-card px-3.5 py-2.5 text-[13px] outline-none placeholder:text-mut focus:border-brand"
            />
            {error && <p className="mt-1 text-xs font-semibold text-brand">{error}</p>}
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={addAddress}
                className="flex-1 rounded-2xl bg-brand py-2.5 text-sm font-bold text-white"
              >
                Save address
              </button>
              {profile.addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setAdding(false)
                    setError('')
                  }}
                  className="rounded-2xl bg-chip px-4 text-sm font-bold text-soft"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ) : (
          profile.addresses.length < MAX_ADDRESSES && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="mt-3 w-full rounded-2xl border border-dashed border-line py-2.5 text-center text-xs font-bold text-brand"
            >
              + Add new address ({profile.addresses.length}/{MAX_ADDRESSES})
            </button>
          )
        )}
      </div>
    </div>
  )
}
