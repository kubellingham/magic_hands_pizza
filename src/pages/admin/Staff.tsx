import { useState } from 'react'
import { useStaff } from './adminData'

/**
 * Admins manage the staff allowlist. Being listed is what grants dashboard
 * access — the person also needs their own account, created via "Create
 * staff account" on the /admin login screen with this exact email.
 */
export function Staff({ currentEmail }: { currentEmail: string | null }) {
  const { staff, error, addStaff, removeStaff } = useStaff(currentEmail)
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const err = await addStaff(email)
    setBusy(false)
    setFormError(err)
    if (!err) setEmail('')
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <span className="font-display text-2xl font-extrabold">Staff</span>
        <span className="text-xs text-mut">Everyone listed here has full dashboard access</span>
      </div>

      <div className="max-w-xl px-6 py-5">
        <form onSubmit={submit} className="flex gap-2.5">
          <input
            type="email"
            placeholder="new-staff@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-xl border border-line bg-card px-4 py-2.5 text-sm outline-none placeholder:text-mut focus:border-brand"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {busy ? 'Adding…' : '+ Add staff'}
          </button>
        </form>
        {(formError || error) && <p className="mt-2 text-xs font-semibold text-brand">{formError || error}</p>}

        <div className="mt-3 rounded-[10px] border border-dashed border-line p-3 text-[11px] leading-relaxed text-mut">
          After adding someone: they open <span className="font-bold text-soft">/admin</span>, tap{' '}
          <span className="font-bold text-soft">Create staff account</span>, sign up with this exact email,
          confirm via the email link, and sign in.
        </div>

        <div className="mt-5 flex flex-col">
          {staff.map((member) => (
            <div key={member} className="flex items-center justify-between border-t border-line py-3">
              <span className="text-sm font-semibold">
                {member}
                {member === currentEmail && <span className="ml-2 text-[11px] font-bold text-veg">· you</span>}
              </span>
              {member !== currentEmail && (
                <button
                  type="button"
                  onClick={async () => setFormError(await removeStaff(member))}
                  className="rounded-lg bg-chip px-3 py-1.5 text-xs font-bold text-soft hover:bg-brand hover:text-white"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {staff.length === 0 && <p className="py-6 text-sm text-mut">Loading staff…</p>}
        </div>
      </div>
    </div>
  )
}
