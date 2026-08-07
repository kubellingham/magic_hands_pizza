import { useEffect, useState } from 'react'
import { Logo } from './Logo'
import {
  acceptInstall,
  hasHadDelivery,
  installKind,
  markAsked,
  subscribeInstall,
  type InstallKind,
} from '../lib/install'

/**
 * Asked once, only after an order of theirs has been delivered.
 *
 * Every claim here has to be one the app actually keeps: it opens offline
 * because the shell is precached, the deal really does apply itself at
 * checkout, and Order again really does refill the cart. There is no push
 * notification anywhere in this app, so nothing promises one.
 */
const BENEFITS: Array<[string, string]> = [
  ['⚡', 'Opens instantly — even on hostel wifi'],
  ['🍕', "Tuesday's free pizza applies itself at checkout"],
  ['↺', 'Your last order, one tap to re-fire'],
]

export function InstallPrompt() {
  const [kind, setKind] = useState<InstallKind>('none')
  const [earned, setEarned] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const sync = () => setKind(installKind())
    sync()
    const stop = subscribeInstall(sync)
    hasHadDelivery().then(setEarned)
    return stop
  }, [])

  if (!earned || closing || kind === 'none') return null

  const dismiss = () => {
    markAsked()
    setClosing(true)
  }

  if (kind === 'ios') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg/95 px-8 backdrop-blur">
        <div className="rounded-3xl bg-card p-4 shadow-[0_0_60px_rgba(255,181,36,.28)]">
          <Logo size="lg" />
        </div>
        <h2 className="font-display mt-7 text-center text-[30px] leading-[1.1] font-extrabold">
          Keep us one tap
          <br />
          from the craving.
        </h2>
        <p className="mt-3 max-w-[300px] text-center text-[13px] leading-relaxed text-mut">
          Safari hides this well — two taps and we live on your home screen.
        </p>

        <ol className="mt-7 flex w-full max-w-[340px] flex-col gap-3">
          <li className="flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3.5 text-[14px]">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-extrabold text-white">
              1
            </span>
            <span>
              Tap the <b>Share</b> button{' '}
              <span aria-hidden className="mx-0.5 rounded border border-line px-1.5 py-0.5 text-[12px]">
                ⬆
              </span>{' '}
              below
            </span>
          </li>
          <li className="flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3.5 text-[14px]">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-extrabold text-white">
              2
            </span>
            <span>
              Choose <b>"Add to Home Screen"</b>
            </span>
          </li>
        </ol>

        <p className="mt-5 text-center text-[11px] text-mut">
          That's it — no app store, no sign-up, 0 MB.
        </p>

        {/* Points at Safari's real Share button, which sits in the bottom bar */}
        <div className="mt-auto mb-4 animate-bounce text-2xl text-accent" aria-hidden>
          ▼
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="mb-[calc(1rem+env(safe-area-inset-bottom))] w-full max-w-[340px] rounded-2xl border border-line bg-card py-3.5 text-sm font-bold text-soft"
        >
          Maybe later
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60">
      <button type="button" aria-label="Dismiss" onClick={dismiss} className="flex-1" />
      <div className="rounded-t-3xl border-t border-line bg-surface px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto h-1 w-10 rounded-full bg-line" />

        <div className="mt-5 flex items-start gap-3.5">
          <div className="relative shrink-0 rounded-2xl bg-card p-2.5">
            <Logo size="sm" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent" />
          </div>
          <div>
            <h2 className="font-display text-[19px] leading-[1.15] font-extrabold">
              Put the oven on
              <br />
              your home screen.
            </h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-mut">
              One tap from craving to cart. No app store, 0 MB.
            </p>
          </div>
        </div>

        <ul className="mt-4 flex flex-col gap-2.5 border-t border-line pt-4">
          {BENEFITS.map(([icon, text]) => (
            <li key={text} className="flex items-center gap-3 text-[13px]">
              <span aria-hidden className="w-5 text-center text-accent">
                {icon}
              </span>
              <span className="text-soft">{text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={() => {
              acceptInstall().finally(() => setClosing(true))
            }}
            className="flex-1 rounded-2xl bg-brand py-3.5 text-center text-[15px] font-extrabold text-white shadow-[0_8px_24px_rgba(230,51,42,.4)]"
          >
            Add to home screen
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-2xl border border-line bg-card px-6 text-sm font-bold text-mut"
          >
            Not now
          </button>
        </div>
        <p className="mt-2.5 text-center text-[11px] text-mut">We'll ask once. Promise.</p>
      </div>
    </div>
  )
}
