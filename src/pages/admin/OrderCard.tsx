import type { AdminOrder } from './adminData'
import { ageLabel } from './adminData'
import { formatINR } from '../../lib/format'

export function orderSummaryLines(order: AdminOrder) {
  return order.items.map((it, i) => (
    <span key={i}>
      {it.qty}× {it.item}
      {it.variant ? ` (${it.variant[0]})` : ''}
      {it.addOns?.length > 0 && <span className="text-accent text-[11px]"> + {it.addOns.join(', ')}</span>}
      <br />
    </span>
  ))
}

interface Props {
  order: AdminOrder
  highlight?: boolean
  accent?: string
  meta?: string
  children?: React.ReactNode
}

export function OrderCard({ order, highlight, accent, meta, children }: Props) {
  return (
    <div
      className={`rounded-[14px] bg-card p-3.5 ${
        highlight
          ? 'border-2 border-brand shadow-[0_0_0_4px_rgba(216,31,26,.15)]'
          : 'border border-line'
      }`}
      style={accent ? { borderLeft: `3px solid ${accent}` } : undefined}
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-[15px] text-accent">{order.order_code}</span>
        <span className="text-[11px] text-mut">{meta ?? ageLabel(order.created_at)}</span>
      </div>
      <div className="mt-2 text-xs leading-normal text-soft">{orderSummaryLines(order)}</div>
      <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2.5">
        <span className="text-[11px] text-mut">
          {order.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'} · {order.payment.toUpperCase()}
        </span>
        <span className="text-sm font-bold">{formatINR(order.total ?? order.subtotal)}</span>
      </div>
      {order.notes && <div className="mt-1.5 text-[11px] text-warn">✎ {order.notes}</div>}
      {children}
    </div>
  )
}
