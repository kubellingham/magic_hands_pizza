import type { AdminOrder } from './adminData'
import type { OrderStatus } from '../../lib/tracking'

interface Props {
  orders: AdminOrder[]
  setStatus: (id: string, status: OrderStatus) => void
}

function ticketAge(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Big-type tickets for the kitchen: new + preparing orders only. */
export function Kitchen({ orders, setStatus }: Props) {
  const tickets = orders
    .filter((o) => o.status === 'new' || o.status === 'preparing')
    .sort((a, b) => a.created_at.localeCompare(b.created_at))

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 lg:px-6 lg:py-4">
        <span className="font-display text-[19px] font-extrabold lg:text-2xl">Kitchen Display</span>
        <span className="text-xs text-mut">{tickets.length} active tickets</span>
      </div>
      <div className="grid flex-1 auto-rows-min grid-cols-1 gap-3.5 overflow-y-auto p-4 md:grid-cols-2 lg:p-5 xl:grid-cols-3">
        {tickets.map((order) => {
          const isNew = order.status === 'new'
          return (
            <div
              key={order.id}
              className="flex flex-col rounded-[14px] bg-card p-4"
              style={{ borderTop: `5px solid ${isNew ? '#8a8378' : '#f7941d'}` }}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xl">{order.order_code}</span>
                <span
                  className={`rounded-lg px-2.5 py-0.5 text-sm font-bold ${
                    isNew ? 'bg-chip text-soft' : 'bg-warn text-bg'
                  }`}
                >
                  {ticketAge(order.created_at)}
                </span>
              </div>
              <div className="my-3 h-px bg-line" />
              <div className="text-[15px] leading-[1.9] font-bold">
                {order.items.map((it, i) => (
                  <span key={i}>
                    {it.qty}× {it.item} {it.variant && <span className="text-[13px] text-mut">({it.variant[0]})</span>}
                    {it.addOns?.length > 0 && (
                      <>
                        <br />
                        <span className="text-xs font-semibold text-accent">+ {it.addOns.join(', ')}</span>
                      </>
                    )}
                    <br />
                  </span>
                ))}
              </div>
              {order.notes && <div className="mt-1 text-xs text-warn">✎ {order.notes}</div>}
              <button
                type="button"
                onClick={() => setStatus(order.id, isNew ? 'preparing' : 'ready')}
                className={`mt-4 rounded-[10px] py-[11px] text-center text-[13px] font-bold ${
                  isNew ? 'bg-brand text-white' : 'bg-veg text-white'
                }`}
              >
                {isNew ? 'Start Cooking' : 'Mark Ready'}
              </button>
            </div>
          )
        })}
        {tickets.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-mut">No active tickets — kitchen is clear 🎉</div>
        )}
      </div>
    </div>
  )
}
