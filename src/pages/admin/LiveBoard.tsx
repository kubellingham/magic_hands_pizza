import { useState } from 'react'
import type { AdminOrder } from './adminData'
import type { OrderStatus } from '../../lib/tracking'
import type { OrderRecord } from '../../lib/orderHistory'
import { downloadReceiptPdf, buildReceiptMessage, buildCustomerWaLink } from '../../lib/receipt'
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

function toReceiptRecord(order: AdminOrder): OrderRecord {
  return {
    code: order.order_code,
    placedAt: new Date(order.created_at).getTime(),
    items: order.items.map((it) => ({
      name: it.item,
      variant: it.variant,
      addOns: it.addOns ?? [],
      qty: it.qty,
      lineTotal: it.lineTotal,
    })),
    itemTotal: order.subtotal,
    discount: order.discount,
    total: order.total ?? order.subtotal,
    payment: order.payment,
    fulfilment: order.fulfilment,
    customerName: order.customer_name,
  }
}

function Action({ label, className, onClick }: { label: string; className: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex-1 rounded-[9px] py-2 text-center text-xs font-bold ${className}`}>
      {label}
    </button>
  )
}

export function LiveBoard({ orders, setStatus }: Props) {
  const [receiptFor, setReceiptFor] = useState<AdminOrder | null>(null)

  // Delivered/picked-up: mark it, build the PDF right away, then offer the
  // WhatsApp message to send it to the customer.
  const deliver = async (order: AdminOrder) => {
    setStatus(order.id, 'delivered')
    setReceiptFor(order)
    try {
      await downloadReceiptPdf(toReceiptRecord(order))
    } catch {
      // dialog still offers a retry download
    }
  }

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
                        <Action label="Picked up ✓" className="bg-veg text-white" onClick={() => deliver(order)} />
                      ))}
                    {order.status === 'out' && (
                      <Action label="Delivered ✓" className="bg-veg text-white" onClick={() => deliver(order)} />
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

      {/* Receipt dialog after Delivered */}
      {receiptFor && (
        <div className="fixed inset-0 z-40 flex items-center justify-center" role="dialog" aria-modal="true">
          <button type="button" aria-label="Close" className="absolute inset-0 bg-black/60" onClick={() => setReceiptFor(null)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-surface p-6">
            <div className="text-3xl">🧾</div>
            <h2 className="font-cond mt-2 text-xl font-bold text-white">
              Receipt ready — {receiptFor.order_code}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-mut">
              The PDF receipt just downloaded. Send {receiptFor.customer_name} the receipt message on
              WhatsApp and <b className="text-soft">attach the PDF</b> in the chat.
            </p>
            <a
              href={buildCustomerWaLink(receiptFor.phone, buildReceiptMessage(toReceiptRecord(receiptFor)))}
              target="_blank"
              rel="noopener"
              className="mt-4 block w-full rounded-xl bg-veg py-3 text-center text-sm font-extrabold text-white"
            >
              💬 Send receipt on WhatsApp
            </a>
            <button
              type="button"
              onClick={() => downloadReceiptPdf(toReceiptRecord(receiptFor))}
              className="mt-2 w-full rounded-xl bg-chip py-2.5 text-center text-xs font-bold text-soft"
            >
              Download PDF again
            </button>
            <button
              type="button"
              onClick={() => setReceiptFor(null)}
              className="mt-2 w-full py-1 text-center text-xs font-semibold text-mut"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
