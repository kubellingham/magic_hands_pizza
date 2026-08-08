import { useEffect, useState } from 'react'
import type { AdminOrder } from './adminData'
import type { OrderStatus } from '../../lib/tracking'
import type { OrderRecord } from '../../lib/orderHistory'
import { downloadReceiptPdf, buildReceiptMessage, buildCustomerWaLink } from '../../lib/receipt'
import { ContactLink } from '../../components/ContactLink'
import { formatINR } from '../../lib/format'

interface Props {
  orders: AdminOrder[]
  setStatus: (id: string, status: OrderStatus) => void
}

/** Promised door time — the countdown chips keep the 25–30 min honest. */
const PROMISE_MS = 28 * 60 * 1000

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

function ago(iso: string, now: number): string {
  const secs = Math.floor((now - new Date(iso).getTime()) / 1000)
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

/** Time left against the promise, "12:40 left" or "4:05 over". */
function countdown(iso: string, now: number): { label: string; over: boolean } {
  const left = new Date(iso).getTime() + PROMISE_MS - now
  const abs = Math.abs(left)
  const m = Math.floor(abs / 60000)
  const s = Math.floor((abs % 60000) / 1000)
  const clock = `${m}:${String(s).padStart(2, '0')}`
  return left >= 0 ? { label: `${clock} left`, over: false } : { label: `${clock} over`, over: true }
}

function itemLines(order: AdminOrder) {
  return order.items.map((it, i) => (
    <div key={i} className="leading-relaxed">
      <span className="font-bold">
        {it.qty}× {it.item.replace(/ Pizza$/, '')}
      </span>
      {it.variant && <span className="text-mut"> ({it.variant[0]})</span>}
      {it.addOns?.length > 0 && <span className="text-accent"> + {it.addOns.join(', ')}</span>}
    </div>
  ))
}

type Column = 'new' | 'oven' | 'road'

export function LiveBoard({ orders, setStatus }: Props) {
  const [receiptFor, setReceiptFor] = useState<AdminOrder | null>(null)
  const [now, setNow] = useState(() => Date.now())
  // Phones show one column at a time; desktop shows all three side by side.
  const [column, setColumn] = useState<Column>('new')

  // one ticking clock drives every card's countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const nu = orders.filter((o) => o.status === 'new')
  const oven = orders.filter((o) => o.status === 'preparing' || o.status === 'ready')
  const road = orders.filter((o) => o.status === 'out')

  const deliver = async (order: AdminOrder) => {
    setStatus(order.id, 'delivered')
    setReceiptFor(order)
    try {
      await downloadReceiptPdf(toReceiptRecord(order))
    } catch {
      // the dialog still offers a retry
    }
  }

  const tabs: Array<{ key: Column; label: string; count: number; dot: string }> = [
    { key: 'new', label: 'New', count: nu.length, dot: 'bg-accent' },
    { key: 'oven', label: 'In the oven', count: oven.length, dot: 'bg-brand' },
    { key: 'road', label: 'On the road', count: road.length, dot: 'bg-veg' },
  ]
  const show = (key: Column) => (column === key ? 'flex' : 'hidden')

  return (
    <>
      {/* Phone column switcher */}
      <div className="flex gap-2 px-4 pt-3 lg:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setColumn(tab.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-extrabold ${
              column === tab.key ? 'bg-card text-ink ring-1 ring-line' : 'text-mut'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${tab.dot}`} />
            {tab.label}
            <span className={column === tab.key ? 'text-accent' : ''}>{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 lg:flex-row lg:overflow-x-auto lg:p-5">
      {/* ── NEW ─────────────────────────────────────────────────────── */}
      <section className={`${show('new')} lg:flex min-w-0 flex-1 flex-col gap-3 lg:min-w-[290px]`}>
        <header className="hidden items-center gap-2 lg:flex">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <h2 className="text-[13px] font-extrabold tracking-wide">NEW · {nu.length}</h2>
        </header>
        <div className="flex flex-col gap-3 overflow-y-auto">
          {nu.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border-2 border-brand bg-card p-4 shadow-[0_0_0_4px_rgba(230,51,42,.14)]"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[17px] font-extrabold text-accent">#{order.order_code}</span>
                <span className="text-[11px] text-mut">{ago(order.created_at, now)}</span>
              </div>
              <div className="mt-2.5 text-[13px] text-soft">{itemLines(order)}</div>
              {order.notes && <div className="mt-2 text-[11px] text-accent">✎ {order.notes}</div>}
              <div className="mt-2.5 text-[11px] text-mut">
                {order.fulfilment === 'delivery' ? order.address : 'Pickup · pay at counter'} ·{' '}
                {order.payment === 'upi' ? 'UPI' : 'COD'} ·{' '}
                <span className="font-bold text-ink">{formatINR(order.total ?? order.subtotal)}</span>
              </div>
              <div className="mt-3.5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus(order.id, 'preparing')}
                  className="flex-1 rounded-xl bg-brand py-3 text-[15px] font-extrabold text-white"
                >
                  Fire it 🔥
                </button>
                <button
                  type="button"
                  aria-label="Reject order"
                  onClick={() => setStatus(order.id, 'cancelled')}
                  className="w-12 rounded-xl border border-line bg-chip text-lg text-mut"
                >
                  ✕
                </button>
              </div>
            </article>
          ))}
          {nu.length === 0 && (
            <p className="rounded-2xl border border-dashed border-line p-5 text-center text-xs text-mut">
              Quiet for now.
            </p>
          )}
        </div>
      </section>

      {/* ── IN THE OVEN ─────────────────────────────────────────────── */}
      <section className={`${show('oven')} lg:flex min-w-0 flex-1 flex-col gap-3 lg:min-w-[290px]`}>
        <header className="hidden items-center gap-2 lg:flex">
          <span className="h-2 w-2 rounded-full bg-brand" />
          <h2 className="text-[13px] font-extrabold tracking-wide">IN THE OVEN · {oven.length}</h2>
        </header>
        <div className="flex flex-col gap-3 overflow-y-auto">
          {oven.map((order) => {
            const c = countdown(order.created_at, now)
            const ready = order.status === 'ready'
            return (
              <article
                key={order.id}
                className="rounded-2xl border border-line bg-card p-4"
                style={{ borderLeft: `3px solid ${ready ? '#2e9e4b' : '#ffb524'}` }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-[17px] font-extrabold text-accent">#{order.order_code}</span>
                  <span
                    className={`rounded-lg px-2 py-0.5 text-[11px] font-extrabold ${
                      c.over ? 'bg-brand text-white' : 'bg-accent/15 text-accent'
                    }`}
                  >
                    {c.label}
                  </span>
                </div>
                <div className="mt-2.5 text-[13px] text-soft">{itemLines(order)}</div>
                {order.notes && <div className="mt-2 text-[11px] text-accent">✎ {order.notes}</div>}
                <div className="mt-2.5 text-[11px] text-mut">
                  {order.fulfilment === 'delivery' ? order.address : 'Pickup'} ·{' '}
                  {order.payment === 'upi' ? 'UPI' : 'COD'} ·{' '}
                  <span className="font-bold text-ink">{formatINR(order.total ?? order.subtotal)}</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    order.fulfilment === 'pickup' && ready
                      ? deliver(order)
                      : setStatus(order.id, ready ? 'out' : 'ready')
                  }
                  className={`mt-3.5 w-full rounded-xl py-3 text-[15px] font-extrabold ${
                    ready ? 'bg-veg text-white' : 'border border-accent text-accent'
                  }`}
                >
                  {ready
                    ? order.fulfilment === 'pickup'
                      ? 'Handed over ✓'
                      : 'Boxed → hand to rider'
                    : 'Mark boxed'}
                </button>
              </article>
            )
          })}
          {oven.length === 0 && (
            <p className="rounded-2xl border border-dashed border-line p-5 text-center text-xs text-mut">
              Oven's empty.
            </p>
          )}
        </div>
      </section>

      {/* ── ON THE ROAD ─────────────────────────────────────────────── */}
      <section className={`${show('road')} lg:flex min-w-0 flex-1 flex-col gap-3 lg:min-w-[290px]`}>
        <header className="hidden items-center gap-2 lg:flex">
          <span className="h-2 w-2 rounded-full bg-veg" />
          <h2 className="text-[13px] font-extrabold tracking-wide">ON THE ROAD · {road.length}</h2>
        </header>
        <div className="flex flex-col gap-3 overflow-y-auto">
          {road.map((order) => (
            <article key={order.id} className="rounded-2xl border border-line bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="font-display text-[17px] font-extrabold text-accent">#{order.order_code}</span>
                <span className="text-[11px] text-mut">{ago(order.created_at, now)}</span>
              </div>
              <div className="mt-2.5 text-[13px] text-soft">{itemLines(order)}</div>
              <div className="mt-2.5 text-[11px] text-mut">
                {order.address} · <span className="font-bold text-ink">{formatINR(order.total ?? order.subtotal)}</span>
              </div>
              <button
                type="button"
                onClick={() => deliver(order)}
                className="mt-3.5 w-full rounded-xl bg-veg py-3 text-[15px] font-extrabold text-white"
              >
                Delivered ✓
              </button>
            </article>
          ))}
          {road.length === 0 && (
            <p className="rounded-2xl border border-dashed border-line p-5 text-center text-xs text-mut">
              Nobody out right now.
            </p>
          )}
        </div>
      </section>

      </div>

      {/* Receipt hand-off after Delivered */}
      {receiptFor && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-6" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/70"
            onClick={() => setReceiptFor(null)}
          />
          <div className="relative w-full max-w-sm rounded-3xl border border-line bg-surface p-6">
            <div className="text-3xl">🧾</div>
            <h2 className="font-display mt-2 text-xl font-extrabold">Receipt ready · {receiptFor.order_code}</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-mut">
              The PDF just downloaded. Send {receiptFor.customer_name} the message and{' '}
              <b className="text-soft">attach the PDF</b> in the chat.
            </p>
            <ContactLink
              href={buildCustomerWaLink(receiptFor.phone, buildReceiptMessage(toReceiptRecord(receiptFor)))}
              className="mt-5 block w-full rounded-2xl bg-veg py-3.5 text-center text-sm font-extrabold text-white"
            >
              Send receipt on WhatsApp
            </ContactLink>
            <button
              type="button"
              onClick={() => downloadReceiptPdf(toReceiptRecord(receiptFor))}
              className="mt-2 w-full rounded-2xl border border-line bg-chip py-2.5 text-center text-xs font-bold text-soft"
            >
              Download PDF again
            </button>
            <button
              type="button"
              onClick={() => setReceiptFor(null)}
              className="mt-2 w-full py-1.5 text-center text-xs font-semibold text-mut"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  )
}
