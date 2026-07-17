import type { AdminOrder } from './adminData'
import type { OrderStatus } from '../../lib/tracking'
import { OrderCard } from './OrderCard'

interface Props {
  orders: AdminOrder[]
  setStatus: (id: string, status: OrderStatus) => void
}

const COLUMNS: Array<{
  key: string
  title: string
  statuses: OrderStatus[]
  badge: string
}> = [
  { key: 'new', title: 'NEW', statuses: ['new'], badge: 'bg-brand text-white' },
  { key: 'preparing', title: 'PREPARING', statuses: ['preparing'], badge: 'bg-warn text-bg' },
  { key: 'ready', title: 'READY', statuses: ['ready'], badge: 'bg-veg text-white' },
  { key: 'out', title: 'OUT', statuses: ['out'], badge: 'bg-chip text-soft' },
]

function Action({ label, className, onClick }: { label: string; className: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex-1 rounded-[9px] py-2 text-center text-xs font-bold ${className}`}>
      {label}
    </button>
  )
}

export function LiveBoard({ orders, setStatus }: Props) {
  return (
    <div className="flex flex-1 gap-3.5 overflow-x-auto p-5">
      {COLUMNS.map((col) => {
        const colOrders = orders.filter((o) => col.statuses.includes(o.status))
        return (
          <div key={col.key} className="flex min-w-[230px] flex-1 flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-white">{col.title}</span>
              <span className={`rounded-full px-2 text-[11px] font-bold ${col.badge}`}>{colOrders.length}</span>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto">
              {colOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  highlight={order.status === 'new'}
                  accent={order.status === 'preparing' ? '#f7941d' : order.status === 'ready' ? '#2e9e4b' : undefined}
                  meta={order.status === 'out' ? `to ${order.address.slice(0, 22)}…` : undefined}
                >
                  <div className="mt-3 flex gap-2">
                    {order.status === 'new' && (
                      <>
                        <Action label="Accept" className="bg-veg text-white" onClick={() => setStatus(order.id, 'preparing')} />
                        <Action label="Reject" className="bg-chip text-soft" onClick={() => setStatus(order.id, 'cancelled')} />
                      </>
                    )}
                    {order.status === 'preparing' && (
                      <Action label="Mark Ready" className="bg-warn text-bg" onClick={() => setStatus(order.id, 'ready')} />
                    )}
                    {order.status === 'ready' &&
                      (order.fulfilment === 'delivery' ? (
                        <Action label="Hand to rider" className="bg-veg text-white" onClick={() => setStatus(order.id, 'out')} />
                      ) : (
                        <Action label="Picked up" className="bg-veg text-white" onClick={() => setStatus(order.id, 'delivered')} />
                      ))}
                    {order.status === 'out' && (
                      <Action label="Delivered" className="bg-veg text-white" onClick={() => setStatus(order.id, 'delivered')} />
                    )}
                  </div>
                </OrderCard>
              ))}
              {colOrders.length === 0 && (
                <div className="rounded-[14px] border border-dashed border-line p-4 text-center text-xs text-mut">
                  Nothing here
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
