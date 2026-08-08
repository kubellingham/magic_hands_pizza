import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { flushOutbox, insertOrderRow, outboxEntries } from '../lib/orderOutbox'
import { loadProfile } from '../lib/profile'
import { loadOrderHistory } from '../lib/orderHistory'

/**
 * Self-service check at /diag. When an order doesn't reach the kitchen board
 * this says exactly why: which bundle the phone is running, whether the
 * backend is wired up, what the network says, and what's still queued.
 */

interface Row {
  label: string
  value: string
  bad?: boolean
}

function Line({ label, value, bad }: Row) {
  return (
    <div className="flex gap-3 border-b border-line py-2 text-[12px]">
      <span className="w-[104px] shrink-0 text-mut">{label}</span>
      <span className={`min-w-0 flex-1 break-all font-semibold ${bad ? 'text-brand' : ''}`}>{value}</span>
    </div>
  )
}

export function Diag() {
  const [sw, setSw] = useState('checking…')
  const [probe, setProbe] = useState('')
  const [busy, setBusy] = useState(false)
  const [queued, setQueued] = useState(outboxEntries())

  const profile = loadProfile()
  const history = loadOrderHistory()
  const supabaseHost = (() => {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
    try {
      return url ? new URL(url).host : 'MISSING'
    } catch {
      return 'INVALID'
    }
  })()

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return setSw('not supported')
    navigator.serviceWorker.getRegistrations().then((regs) => {
      if (regs.length === 0) return setSw('none registered')
      const r = regs[0]
      const script = (r.active?.scriptURL ?? '—').split('/').pop()
      setSw(`${script} · ${r.waiting ? 'UPDATE WAITING — reopen the app' : 'up to date'}`)
    })
  }, [])

  // Sends a real order row so the exact server response is visible
  const runProbe = async () => {
    setBusy(true)
    setProbe('sending…')
    const started = Date.now()
    const { ok, error } = await insertOrderRow({
      order_code: 'CO-TEST' + Date.now().toString(36).toUpperCase().slice(-3),
      customer_name: 'DIAGNOSTIC — safe to delete',
      phone: profile.phone && /^[6-9][0-9]{9}$/.test(profile.phone) ? profile.phone : '9000000000',
      address: 'Diagnostic check from /diag',
      notes: null,
      items: [{ item: 'Diagnostic', variant: null, addOns: [], qty: 1, lineTotal: 1 }],
      subtotal: 1,
      discount: 0,
      total: 1,
      fulfilment: 'delivery',
      payment: 'cod',
      offer_note: null,
    })
    const ms = Date.now() - started
    setProbe(ok ? `✓ reached the kitchen board in ${ms}ms` : `✗ failed after ${ms}ms — ${error}`)
    setBusy(false)
  }

  const retryQueued = async () => {
    setBusy(true)
    const left = await flushOutbox()
    setQueued(outboxEntries())
    setProbe(left === 0 ? '✓ everything queued has now landed' : `${left} still waiting`)
    setBusy(false)
  }

  // Clears the precached bundle so the phone stops running an old version
  const resetApp = async () => {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((r) => r.unregister()))
    }
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    }
    window.location.replace('/')
  }

  const button = 'w-full rounded-2xl py-3.5 text-center text-[14px] font-extrabold disabled:opacity-40'

  return (
    <div className="flex min-h-dvh flex-col bg-surface px-5 pt-6 pb-10">
      <div className="flex items-center gap-3">
        <Link to="/" aria-label="Back" className="text-xl">
          ‹
        </Link>
        <h1 className="font-display text-[22px] font-extrabold">Connection check</h1>
      </div>
      <p className="mt-1.5 text-[12px] text-mut">
        Screenshot this page if an order doesn't show up on the kitchen board.
      </p>

      <div className="mt-5">
        <Line label="Build" value={`${__BUILD_ID__} · ${__BUILD_TIME__.slice(0, 16).replace('T', ' ')}`} />
        <Line label="Service worker" value={sw} bad={sw.includes('WAITING')} />
        <Line label="Site" value={window.location.host} />
        <Line label="Backend" value={supabaseHost} bad={supabaseHost !== 'MISSING' ? false : true} />
        <Line label="Client" value={supabase ? 'ready' : 'NOT CONFIGURED'} bad={!supabase} />
        <Line label="Network" value={navigator.onLine ? 'online' : 'OFFLINE'} bad={!navigator.onLine} />
        <Line
          label="Profile"
          value={`${profile.name || '(no name)'} · ${profile.phone || '(no phone)'} · ${profile.addresses.length} address(es)`}
          bad={!/^[6-9][0-9]{9}$/.test(profile.phone)}
        />
        <Line label="On this phone" value={`${history.length} past order(s)`} />
        <Line
          label="Waiting to send"
          value={
            queued.length === 0
              ? 'nothing queued'
              : queued.map((q) => `${q.code} · try ${q.attempts} · ${q.lastError}`).join(' | ')
          }
          bad={queued.length > 0}
        />
      </div>

      {probe && (
        <div className="mt-4 rounded-2xl border border-line bg-card px-4 py-3 text-[12px] break-all">
          {probe}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2.5">
        <button type="button" onClick={runProbe} disabled={busy} className={`${button} bg-brand text-white`}>
          Send a test order
        </button>
        <button
          type="button"
          onClick={retryQueued}
          disabled={busy || queued.length === 0}
          className={`${button} border border-line bg-card`}
        >
          Retry what's waiting
        </button>
        <button
          type="button"
          onClick={resetApp}
          disabled={busy}
          className={`${button} border border-accent/40 bg-accent/10 text-accent`}
        >
          Clear the app cache &amp; reload
        </button>
      </div>
    </div>
  )
}
