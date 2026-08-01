import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Logo } from '../../components/Logo'
import { formatINR, isOpenNow } from '../../lib/format'
import { useShift } from '../../lib/shift'
import { useAdminOrders, useAdminHomeContent } from './adminData'
import { LiveBoard } from './LiveBoard'
import { Kitchen } from './Kitchen'
import { MenuManager } from './MenuManager'
import { Sales } from './Sales'
import { Staff } from './Staff'
import { HomeScreen } from './HomeScreen'

type View = 'live' | 'kitchen' | 'stock' | 'home' | 'report' | 'staff'
type AuthState = 'checking' | 'signed-out' | 'not-staff' | 'staff'

function Login({ onSignedIn }: { onSignedIn: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return setError('Backend not configured.')
    setBusy(true)
    setError('')
    setNotice('')
    if (mode === 'signup') {
      // Signing up only creates the account — access still needs an existing
      // admin to add this email to the staff list.
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      })
      setBusy(false)
      if (err) return setError(err.message)
      if (data.session) return onSignedIn()
      setMode('signin')
      setNotice('Account made — confirm the emailed link, then sign in.')
      return
    }
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    setBusy(false)
    if (err) return setError(err.message)
    onSignedIn()
  }

  const inputClass =
    'w-full rounded-2xl border border-line bg-card px-4 py-3 text-sm outline-none placeholder:text-mut focus:border-brand'

  return (
    <div className="shift-night page-bg flex min-h-dvh items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-line bg-surface p-7">
        <div className="flex flex-col items-center">
          <Logo size="md" />
          <div className="font-display mt-2 text-[10px] font-extrabold tracking-[4px] text-mut">
            {mode === 'signin' ? 'KITCHEN LOGIN' : 'NEW STAFF ACCOUNT'}
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <input
            className={inputClass}
            type="email"
            placeholder="Email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={inputClass}
            type="password"
            placeholder={mode === 'signup' ? 'Choose a password (6+ characters)' : 'Password'}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {mode === 'signup' && (
          <p className="mt-3 text-[11px] leading-relaxed text-mut">
            Use the email an admin added under Staff — the account only works once you're on the list.
          </p>
        )}
        {error && <p className="mt-3 text-xs font-semibold text-brand">{error}</p>}
        {notice && <p className="mt-3 text-xs font-semibold text-veg">{notice}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-2xl bg-brand py-3.5 text-sm font-extrabold text-white disabled:opacity-50"
        >
          {busy ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setError('')
            setNotice('')
          }}
          className="mt-3 w-full text-center text-xs font-semibold text-mut hover:text-brand"
        >
          {mode === 'signin' ? 'New staff member? Create an account' : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  )
}

const NAV: Array<{ view: View; label: string; short: string }> = [
  { view: 'live', label: 'Orders', short: 'Orders' },
  { view: 'kitchen', label: 'Kitchen screen', short: 'Kitchen' },
  { view: 'stock', label: 'Menu & stock', short: 'Stock' },
  { view: 'home', label: 'App home', short: 'Home' },
  { view: 'report', label: 'Day report', short: 'Report' },
  { view: 'staff', label: 'Staff', short: 'Staff' },
]

function Dashboard({ onSignOut, currentEmail }: { onSignOut: () => void; currentEmail: string | null }) {
  const [view, setView] = useState<View>('live')
  const { orders, error, setStatus } = useAdminOrders()
  const { content, setPaused } = useAdminHomeContent()
  const shift = useShift()
  const open = isOpenNow()

  const liveCount = orders.filter((o) => ['new', 'preparing', 'ready', 'out'].includes(o.status)).length
  const newCount = orders.filter((o) => o.status === 'new').length
  const done = orders.filter((o) => o.status === 'delivered')
  const takings = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total ?? o.subtotal), 0)
  const avg = orders.filter((o) => o.status !== 'cancelled').length
    ? Math.round(takings / orders.filter((o) => o.status !== 'cancelled').length)
    : 0

  const pauseButton = (
    <button
      type="button"
      onClick={() => setPaused(!content.paused)}
      className={`shrink-0 rounded-xl px-3 py-2 text-[11px] font-extrabold whitespace-nowrap lg:px-4 lg:py-2.5 lg:text-xs ${
        content.paused ? 'bg-brand text-white' : 'border border-line bg-card text-soft'
      }`}
    >
      {content.paused ? '▶ Resume' : '⏸ Pause'}
      <span className="hidden lg:inline">{content.paused ? ' orders' : ' new orders'}</span>
    </button>
  )

  return (
    <div className="shift-night flex min-h-dvh flex-col bg-bg lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-[218px] shrink-0 flex-col border-r border-line bg-surface py-5 lg:flex">
        <div className="flex items-center gap-2.5 px-5 pb-5">
          <Logo size="sm" />
          <div>
            <div className="font-display text-[14px] leading-none font-extrabold">Magic Hand&rsquo;s</div>
            <div className="mt-1 text-[9px] font-bold tracking-[1.5px] text-mut">
              {shift === 'night' ? 'NIGHT SHIFT' : 'DAY SHIFT'} ·{' '}
              {new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {NAV.map((item) => {
          const on = view === item.view
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => setView(item.view)}
              className={`flex items-center gap-3 px-5 py-3 text-left text-[14px] ${
                on
                  ? 'border-l-[3px] border-brand bg-brand/10 font-extrabold'
                  : 'border-l-[3px] border-transparent font-semibold text-mut'
              }`}
            >
              {item.label}
              {item.view === 'live' && liveCount > 0 && (
                <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-[10px] font-extrabold text-white">
                  {liveCount}
                </span>
              )}
            </button>
          )
        })}

        <div className="mx-5 mt-auto rounded-2xl border border-line bg-card p-4">
          <div className="text-[9px] font-extrabold tracking-[1.5px] text-mut">TONIGHT SO FAR</div>
          <div className="font-display mt-1 text-[26px] leading-none font-extrabold text-accent">
            {formatINR(takings)}
          </div>
          <div className="mt-1 text-[11px] text-mut">
            {orders.filter((o) => o.status !== 'cancelled').length} orders · avg {formatINR(avg)}
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-[11px]">
            <span className={`h-2 w-2 rounded-full ${content.paused ? 'bg-brand' : open ? 'bg-veg' : 'bg-mut'}`} />
            <span className="text-soft">
              {content.paused ? 'Paused' : open ? 'Store open · closes 4 AM' : 'Closed'}
            </span>
          </div>
        </div>

        <button type="button" onClick={onSignOut} className="px-5 pt-4 text-left text-xs font-semibold text-mut">
          Sign out
        </button>
      </aside>

      {/* Phone top bar: identity, takings, pause */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-surface px-4 py-2.5 lg:hidden">
        <Logo size="sm" className="h-8 w-8 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="font-display truncate text-[13px] leading-none font-extrabold">
            {formatINR(takings)} <span className="text-mut">tonight</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-mut">
            <span className={`h-1.5 w-1.5 rounded-full ${content.paused ? 'bg-brand' : open ? 'bg-veg' : 'bg-mut'}`} />
            {content.paused ? 'Paused' : open ? 'Open · closes 4 AM' : 'Closed'}
          </div>
        </div>
        {pauseButton}
        <button type="button" onClick={onSignOut} aria-label="Sign out" className="shrink-0 text-xs font-semibold text-mut">
          Exit
        </button>
      </header>

      <main className="flex min-w-0 flex-1 flex-col pb-[68px] lg:pb-0">
        {view === 'live' && (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 lg:px-6 lg:py-4">
              <div className="min-w-0">
                <h1 className="font-display text-[19px] leading-none font-extrabold lg:text-[22px]">Live orders</h1>
                <p className="mt-1 truncate text-[11px] text-mut lg:text-xs">
                  App orders land here automatically · refreshes itself
                  {newCount > 0 && <span className="font-bold text-brand"> · {newCount} waiting</span>}
                </p>
              </div>
              <div className="hidden items-center gap-3 lg:flex">
                {error && <span className="text-xs font-semibold text-brand">⚠ {error}</span>}
                {pauseButton}
              </div>
            </div>
            {content.paused && (
              <div className="border-b border-brand/30 bg-brand/10 px-4 py-2.5 text-[11px] font-semibold text-brand lg:px-6 lg:text-xs">
                New orders are paused — customers see "kitchen's catching up" and can't check out.
              </div>
            )}
            <LiveBoard orders={orders} setStatus={setStatus} />
            <footer className="border-t border-line px-4 py-3 text-[11px] text-mut lg:px-6">
              Delivered tonight: <b className="text-soft">{done.length}</b>
            </footer>
          </>
        )}
        {view === 'kitchen' && <Kitchen orders={orders} setStatus={setStatus} />}
        {view === 'stock' && <MenuManager orders={orders} />}
        {view === 'home' && <HomeScreen />}
        {view === 'report' && <Sales orders={orders} />}
        {view === 'staff' && <Staff currentEmail={currentEmail} />}
      </main>

      {/* Phone bottom nav */}
      <nav className="no-scrollbar fixed inset-x-0 bottom-0 z-20 flex overflow-x-auto border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
        {NAV.map((item) => {
          const on = view === item.view
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => setView(item.view)}
              className={`relative min-w-0 flex-1 px-1 py-3 text-[10px] font-bold whitespace-nowrap ${
                on ? 'border-t-2 border-brand text-brand' : 'border-t-2 border-transparent text-mut'
              }`}
            >
              {item.short}
              {item.view === 'live' && liveCount > 0 && (
                <span className="absolute top-1 right-1.5 rounded-full bg-brand px-1 text-[9px] font-extrabold text-white">
                  {liveCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default function Admin() {
  const [auth, setAuth] = useState<AuthState>('checking')
  const [currentEmail, setCurrentEmail] = useState<string | null>(null)

  const check = async () => {
    if (!supabase) return setAuth('signed-out')
    const { data } = await supabase.auth.getSession()
    if (!data.session) return setAuth('signed-out')
    setCurrentEmail(data.session.user.email?.toLowerCase() ?? null)
    const { data: isAdmin } = await supabase.rpc('is_admin')
    setAuth(isAdmin ? 'staff' : 'not-staff')
  }

  useEffect(() => {
    check()
  }, [])

  const signOut = async () => {
    await supabase?.auth.signOut()
    setAuth('signed-out')
  }

  if (auth === 'checking') {
    return (
      <div className="shift-night flex min-h-dvh items-center justify-center bg-bg text-mut">Checking access…</div>
    )
  }
  if (auth === 'signed-out') return <Login onSignedIn={check} />
  if (auth === 'not-staff') {
    return (
      <div className="shift-night flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-8 text-center">
        <p className="font-display text-lg font-extrabold">Not on the staff list.</p>
        <p className="max-w-xs text-xs text-mut">
          Ask an admin to add {currentEmail ?? 'your email'} under Staff, then reload.
        </p>
        <button type="button" onClick={signOut} className="text-sm font-bold text-brand">
          Sign in with another account
        </button>
      </div>
    )
  }
  return <Dashboard onSignOut={signOut} currentEmail={currentEmail} />
}
