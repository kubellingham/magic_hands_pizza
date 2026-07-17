import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Logo } from '../../components/Logo'
import { useAdminOrders } from './adminData'
import { LiveBoard } from './LiveBoard'
import { Kitchen } from './Kitchen'
import { MenuManager } from './MenuManager'
import { Sales } from './Sales'

type View = 'live' | 'kitchen' | 'menu' | 'sales'
type AuthState = 'checking' | 'signed-out' | 'not-staff' | 'staff'

function Login({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return setError('Backend not configured.')
    setBusy(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (err) return setError(err.message)
    onSignedIn()
  }

  const inputClass =
    'w-full rounded-xl border border-line bg-card px-4 py-3 text-sm text-white outline-none placeholder:text-mut focus:border-brand'

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-white/5 bg-surface p-7">
        <Logo />
        <div className="font-anton mt-1 text-center text-[10px] tracking-[5px] text-mut">STAFF LOGIN</div>
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
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="mt-3 text-xs font-semibold text-brand">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-[14px] bg-brand py-3 text-sm font-extrabold text-white disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

const NAV: Array<{ view: View; label: string; icon: string }> = [
  { view: 'live', label: 'Live Orders', icon: '📱' },
  { view: 'kitchen', label: 'Kitchen Display', icon: '🍳' },
  { view: 'menu', label: 'Menu & Prices', icon: '📝' },
  { view: 'sales', label: 'Sales', icon: '📊' },
]

function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const [view, setView] = useState<View>('live')
  const { orders, error, setStatus } = useAdminOrders()
  const newCount = orders.filter((o) => o.status === 'new').length

  return (
    <div className="flex min-h-dvh bg-bg text-white">
      <aside className="flex w-[220px] shrink-0 flex-col border-r border-white/5 bg-surface py-5">
        <div className="px-[22px] pb-5">
          <div className="font-cond text-[22px] leading-none font-bold italic">Magic Hand&rsquo;s</div>
          <div className="font-anton text-[9px] tracking-[5px] text-brand">PIZZA ADMIN</div>
        </div>
        {NAV.map((item) => {
          const on = view === item.view
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => setView(item.view)}
              className={`flex items-center gap-3 px-[22px] py-3 text-left text-sm ${
                on
                  ? 'border-l-[3px] border-brand bg-brand/10 font-bold text-white'
                  : 'border-l-[3px] border-transparent font-semibold text-mut'
              }`}
            >
              <span>{item.icon}</span> {item.label}
              {item.view === 'live' && newCount > 0 && (
                <span className="ml-auto rounded-full bg-brand px-[7px] text-[11px] text-white">{newCount}</span>
              )}
            </button>
          )
        })}
        <div className="mt-auto flex flex-col gap-3 px-[22px] py-3">
          <div className="flex items-center gap-2.5 text-[13px] text-soft">
            <span className="h-[9px] w-[9px] rounded-full bg-veg" /> Store Online
          </div>
          <button type="button" onClick={onSignOut} className="text-left text-xs font-semibold text-mut hover:text-brand">
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        {view === 'live' && (
          <>
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <div>
                <div className="font-cond text-2xl leading-none font-bold">Live Orders</div>
                <div className="mt-0.5 text-xs text-mut">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · auto-refreshes
                </div>
              </div>
              {error && <span className="text-xs font-semibold text-brand">⚠ {error}</span>}
            </div>
            <LiveBoard orders={orders} setStatus={setStatus} />
          </>
        )}
        {view === 'kitchen' && <Kitchen orders={orders} setStatus={setStatus} />}
        {view === 'menu' && <MenuManager />}
        {view === 'sales' && <Sales orders={orders} />}
      </main>
    </div>
  )
}

export default function Admin() {
  const [auth, setAuth] = useState<AuthState>('checking')

  const check = async () => {
    if (!supabase) return setAuth('signed-out')
    const { data } = await supabase.auth.getSession()
    if (!data.session) return setAuth('signed-out')
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
    return <div className="flex min-h-dvh items-center justify-center bg-bg text-mut">Checking access…</div>
  }
  if (auth === 'signed-out') return <Login onSignedIn={check} />
  if (auth === 'not-staff') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-8 text-center text-white">
        <p className="text-sm">This account isn&rsquo;t on the staff list.</p>
        <button type="button" onClick={signOut} className="text-sm font-bold text-brand">
          Sign in with a different account
        </button>
      </div>
    )
  }
  return <Dashboard onSignOut={signOut} />
}
