import { useEffect, useRef, useState } from 'react'
import { MENU } from '../../data/menu'
import {
  removeItemPhoto,
  uploadItemPhoto,
  useMenuPhotos,
  UPI_QR_KEY,
} from '../../lib/menuPhotos'
import { useAdminHomeContent } from './adminData'

/**
 * Controls what customers see on the home screen: the special hero card text
 * and the three Trending Now picks (the 4th card is always Full Menu).
 */
export function HomeScreen() {
  const { content, saveSpecial, saveTrending } = useAdminHomeContent()
  const photos = useMenuPhotos()
  const [badge, setBadge] = useState(content.special.badge)
  const [title, setTitle] = useState(content.special.title)
  const [picks, setPicks] = useState<string[]>(content.trending)
  const [status, setStatus] = useState('')
  const [qrBusy, setQrBusy] = useState(false)
  const qrInput = useRef<HTMLInputElement>(null)
  const qrUrl = photos[UPI_QR_KEY]

  // sync form when the store finishes loading
  useEffect(() => {
    setBadge(content.special.badge)
    setTitle(content.special.title)
    setPicks(content.trending)
  }, [content])

  const flash = (message: string) => {
    setStatus(message)
    setTimeout(() => setStatus(''), 2500)
  }

  const submitSpecial = async () => {
    if (!title.trim()) return flash('⚠ The special needs a title.')
    flash((await saveSpecial(badge, title)) ? '✓ Special card saved' : '⚠ Save failed')
  }

  const submitTrending = async (index: number, itemId: string) => {
    const next = [...picks]
    next[index] = itemId
    if (new Set(next).size !== next.length) return flash('⚠ Pick three different items.')
    setPicks(next)
    flash((await saveTrending(next)) ? '✓ Trending updated' : '⚠ Save failed')
  }

  const inputClass =
    'w-full rounded-xl border border-line bg-card px-4 py-2.5 text-sm outline-none placeholder:text-mut focus:border-brand'

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 lg:px-6 lg:py-4">
        <span className="font-display text-[19px] font-extrabold lg:text-2xl">Home Screen</span>
        <span className="text-xs font-semibold text-veg">{status}</span>
      </div>

      <div className="max-w-2xl overflow-y-auto px-4 py-5 lg:px-6">
        <h2 className="text-[11px] font-bold tracking-wide text-mut">TODAY'S SPECIAL CARD</h2>
        <div className="mt-2.5 flex flex-col gap-2.5">
          <input
            className={inputClass}
            placeholder="Badge (e.g. TUESDAY ONLY) — leave empty for none"
            value={badge}
            maxLength={20}
            onChange={(e) => setBadge(e.target.value.toUpperCase())}
          />
          <textarea
            className={inputClass}
            placeholder="Headline (e.g. Buy 2 large, small one rides free.)"
            rows={2}
            maxLength={60}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            type="button"
            onClick={submitSpecial}
            className="self-start rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white"
          >
            Save special
          </button>
        </div>

        {/* Live preview of the card customers see */}
        <div className="hero-bg relative mt-5 w-[320px] overflow-hidden rounded-2xl border border-brand/30 p-4">
          {badge && (
            <span className="font-display absolute top-0 right-0 rounded-bl-xl bg-accent px-3 py-1 text-[10px] font-extrabold tracking-wide text-bg">
              {badge}
            </span>
          )}
          <div className="font-display max-w-[78%] text-[21px] leading-[1.12] font-extrabold">
            {title || '—'}
          </div>
          <div className="my-3 border-t border-dashed border-line" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-mut">Auto-applied at checkout</span>
            <span className="rounded-full bg-brand px-4 py-2 text-xs font-bold text-white">Order now</span>
          </div>
        </div>

        <h2 className="mt-8 text-[10px] font-extrabold tracking-[1px] text-mut">
          HOME RAIL — THREE PICKS (ALSO BADGED "BESTSELLER" ON THE MENU)
        </h2>
        <div className="mt-2.5 flex flex-col gap-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="font-display w-6 text-center text-lg text-mut">{i + 1}</span>
              <select
                value={picks[i] ?? ''}
                onChange={(e) => submitTrending(i, e.target.value)}
                className="flex-1 rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              >
                {MENU.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-mut">
          Changes go live for customers on their next visit — no redeploy needed.
        </p>

        <h2 className="mt-8 text-[10px] font-extrabold tracking-[1px] text-mut">
          UPI QR — SHOWN TO CUSTOMERS WHO CHOOSE UPI
        </h2>
        <div className="mt-2.5 flex items-start gap-4">
          <div className="flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-2xl border border-line bg-white">
            {qrUrl ? (
              <img src={qrUrl} alt="Current UPI QR" className="max-h-[108px] max-w-[108px]" />
            ) : (
              <span className="px-2 text-center text-[10px] font-semibold text-[#8c7a5e]">No QR yet</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={qrInput}
              type="file"
              accept="image/*"
              className="hidden"
              aria-label="UPI QR image"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (!file) return
                setQrBusy(true)
                const message = await uploadItemPhoto(UPI_QR_KEY, file)
                setQrBusy(false)
                flash(message ? `⚠ ${message}` : '✓ UPI QR saved')
              }}
            />
            <button
              type="button"
              disabled={qrBusy}
              onClick={() => qrInput.current?.click()}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {qrBusy ? 'Uploading…' : qrUrl ? 'Replace QR' : 'Upload QR'}
            </button>
            {qrUrl && (
              <button
                type="button"
                disabled={qrBusy}
                onClick={async () => {
                  setQrBusy(true)
                  const message = await removeItemPhoto(UPI_QR_KEY)
                  setQrBusy(false)
                  flash(message ? `⚠ ${message}` : '✓ UPI QR removed')
                }}
                className="rounded-xl border border-line bg-card px-5 py-2.5 text-sm font-bold text-mut"
              >
                Remove
              </button>
            )}
            <p className="max-w-[260px] text-[11px] leading-relaxed text-mut">
              A screenshot of the shop's QR from any UPI app works. Check it scans afterwards — this is
              what customers pay against.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
