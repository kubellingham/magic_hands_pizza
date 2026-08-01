import type { AdminOrder } from './adminData'
import { formatINR } from '../../lib/format'

interface Props {
  orders: AdminOrder[]
}

function Stat({ label, value, sub, color = '' }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="flex-1 rounded-xl bg-card p-3.5">
      <div className="text-[11px] text-mut">{label}</div>
      <div className={`font-display text-[26px] ${color}`}>{value}</div>
      <div className="text-[11px] text-mut">{sub ?? '—'}</div>
    </div>
  )
}

/** Simple stats over the polled 24h window — no extra queries needed. */
export function Sales({ orders }: Props) {
  const active = orders.filter((o) => o.status !== 'cancelled')
  const revenue = active.reduce((sum, o) => sum + (o.total ?? o.subtotal), 0)
  const avg = active.length ? Math.round(revenue / active.length) : 0
  const pending = orders.filter((o) => ['new', 'preparing', 'ready'].includes(o.status)).length

  // Orders per 2-hour bucket across the last 24h
  const buckets = Array.from({ length: 12 }, () => 0)
  const now = Date.now()
  for (const o of active) {
    const hoursAgo = (now - new Date(o.created_at).getTime()) / 3_600_000
    const idx = 11 - Math.min(11, Math.floor(hoursAgo / 2))
    buckets[idx]++
  }
  const max = Math.max(1, ...buckets)

  const itemCounts = new Map<string, number>()
  for (const o of active) {
    for (const it of o.items) {
      if (it.lineTotal === 0) continue
      itemCounts.set(it.item, (itemCounts.get(it.item) ?? 0) + it.qty)
    }
  }
  const top = [...itemCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)

  const upi = active.filter((o) => o.payment === 'upi').length
  const upiPct = active.length ? Math.round((upi / active.length) * 100) : 0

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-3 lg:px-6 lg:py-4">
        <span className="font-display text-[19px] font-extrabold lg:text-2xl">Sales · last 24h</span>
        <span className="text-xs text-mut">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 px-4 pt-4 pb-2 lg:flex lg:px-6">
        <Stat label="Orders" value={String(active.length)} />
        <Stat label="Revenue" value={formatINR(revenue)} color="text-accent" />
        <Stat label="Avg order" value={active.length ? formatINR(avg) : '—'} />
        <Stat label="Pending" value={String(pending)} sub="in kitchen" color="text-brand" />
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pt-2 pb-6 lg:flex-row lg:overflow-hidden lg:px-6 lg:pb-5">
        <div className="flex min-h-[220px] flex-[1.5] flex-col rounded-xl bg-card p-4">
          <div className="mb-3.5 text-xs font-bold text-soft">Orders (2-hour buckets, last 24h)</div>
          <div className="flex flex-1 items-end gap-2">
            {buckets.map((count, i) => {
              const height = `${Math.max(6, (count / max) * 100)}%`
              const hot = count === max && count > 0
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className={`w-full rounded-[5px] ${hot ? 'bg-brand' : count > 0 ? 'bg-warn' : 'bg-line'}`}
                    style={{ height }}
                    title={`${count} orders`}
                  />
                  <span className="text-[9px] text-mut">{i === 11 ? 'now' : `-${(11 - i) * 2}h`}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2.5 rounded-xl bg-card p-4">
          <div className="text-xs font-bold text-soft">Top items</div>
          {top.map(([name, count]) => (
            <div key={name} className="flex justify-between text-xs">
              <span>{name}</span>
              <span className="text-mut">{count}</span>
            </div>
          ))}
          {top.length === 0 && <div className="text-xs text-mut">No orders yet</div>}
          <div className="my-0.5 h-px bg-line" />
          <div className="text-xs font-bold text-soft">Payment</div>
          <div className="flex h-2.5 overflow-hidden rounded-full">
            <div className="bg-veg" style={{ width: `${upiPct}%` }} />
            <div className="bg-warn" style={{ width: `${100 - upiPct}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-mut">
            <span>
              <span className="text-veg">●</span> UPI {upiPct}%
            </span>
            <span>
              <span className="text-warn">●</span> Cash {100 - upiPct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
