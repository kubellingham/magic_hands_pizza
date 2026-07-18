import { useEffect, useState } from 'react'
import { MENU } from '../../data/menu'
import { useAdminHomeContent } from './adminData'

/**
 * Controls what customers see on the home screen: the special hero card text
 * and the three Trending Now picks (the 4th card is always Full Menu).
 */
export function HomeScreen() {
  const { content, saveSpecial, saveTrending } = useAdminHomeContent()
  const [badge, setBadge] = useState(content.special.badge)
  const [title, setTitle] = useState(content.special.title)
  const [picks, setPicks] = useState<string[]>(content.trending)
  const [status, setStatus] = useState('')

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
    'w-full rounded-xl border border-line bg-card px-4 py-2.5 text-sm text-white outline-none placeholder:text-mut focus:border-brand'

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <span className="font-cond text-2xl font-bold text-white">Home Screen</span>
        <span className="text-xs font-semibold text-veg">{status}</span>
      </div>

      <div className="max-w-2xl overflow-y-auto px-6 py-5">
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
            placeholder="Headline (e.g. 2 LARGE + 1 SMALL PIZZA FREE)"
            rows={2}
            maxLength={60}
            value={title}
            onChange={(e) => setTitle(e.target.value.toUpperCase())}
          />
          <button
            type="button"
            onClick={submitSpecial}
            className="self-start rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white"
          >
            Save special
          </button>
        </div>

        {/* Preview */}
        <div
          className="relative mt-4 h-[150px] w-[300px] overflow-hidden rounded-[16px]"
          style={{ background: 'linear-gradient(180deg, #3a1512, #1c0f0d)' }}
        >
          {badge && (
            <span className="font-anton absolute top-3 left-3.5 rounded-md bg-gold px-2 py-0.5 text-[10px] text-brand-dark">
              {badge}
            </span>
          )}
          <span className="font-cond absolute bottom-11 left-3.5 w-[65%] text-[22px] leading-[0.95] font-bold text-white">
            {title || '—'}
          </span>
          <span className="font-cond absolute bottom-3 left-3.5 rounded-full bg-brand px-3.5 py-1.5 text-xs font-bold text-white">
            ORDER NOW
          </span>
        </div>

        <h2 className="mt-8 text-[11px] font-bold tracking-wide text-mut">
          TRENDING NOW — THREE PICKS (4TH CARD IS ALWAYS FULL MENU)
        </h2>
        <div className="mt-2.5 flex flex-col gap-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="font-anton w-6 text-center text-lg text-mut">{i + 1}</span>
              <select
                value={picks[i] ?? ''}
                onChange={(e) => submitTrending(i, e.target.value)}
                className="flex-1 rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm text-white outline-none focus:border-brand"
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
      </div>
    </div>
  )
}
