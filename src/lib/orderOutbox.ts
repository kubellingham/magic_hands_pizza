import { supabase } from './supabase'

/**
 * An order that failed to reach Supabase waits here until it lands.
 *
 * WhatsApp is the fulfilment channel, so a failed insert never used to block
 * the customer — but it also meant the kitchen board silently missed the
 * order. Now every failure is parked on the device and replayed on the next
 * chance: back online, app reopened, or the retry tick.
 */

const KEY = 'mhp-order-outbox-v1'
const MAX_AGE_MS = 12 * 60 * 60 * 1000
const RETRY_MS = 15_000
const INSERT_TIMEOUT_MS = 10_000

export type OrderRow = Record<string, unknown> & { order_code: string }

interface Entry {
  row: OrderRow
  queuedAt: number
  attempts: number
  lastError: string
}

const listeners = new Set<() => void>()

function read(): Entry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Entry[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter((e) => e?.row?.order_code && Date.now() - e.queuedAt < MAX_AGE_MS)
  } catch {
    return []
  }
}

function write(entries: Entry[]): void {
  try {
    if (entries.length === 0) localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, JSON.stringify(entries))
  } catch {
    // storage full or blocked — nothing more we can do on-device
  }
  for (const fn of listeners) fn()
}

/** Subscribe to queue changes (used by the order-placed screen). */
export function onOutboxChange(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Everything still waiting — shown on /diag. */
export function outboxEntries(): Array<{ code: string; attempts: number; lastError: string; queuedAt: number }> {
  return read().map((e) => ({
    code: e.row.order_code,
    attempts: e.attempts,
    lastError: e.lastError,
    queuedAt: e.queuedAt,
  }))
}

export function isQueued(orderCode: string): boolean {
  return read().some((e) => e.row.order_code === orderCode)
}

export function queueOrder(row: OrderRow, lastError: string): void {
  const entries = read().filter((e) => e.row.order_code !== row.order_code)
  entries.push({ row, queuedAt: Date.now(), attempts: 1, lastError })
  write(entries)
}

/**
 * One insert attempt. A duplicate key means an earlier attempt already landed,
 * which is a success from the customer's point of view.
 */
export async function insertOrderRow(row: OrderRow): Promise<{ ok: boolean; error: string }> {
  if (!supabase) return { ok: false, error: 'Backend not configured' }
  try {
    const insert = supabase.from('orders').insert(row)
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), INSERT_TIMEOUT_MS),
    )
    const { error } = await Promise.race([insert, timeout])
    if (!error) return { ok: true, error: '' }
    if (error.code === '23505') return { ok: true, error: '' }
    return { ok: false, error: `${error.code ?? ''} ${error.message}`.trim() }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'network error' }
  }
}

let flushing = false

/** Retry every parked order. Returns how many are still waiting. */
export async function flushOutbox(): Promise<number> {
  if (flushing || !navigator.onLine) return read().length
  flushing = true
  try {
    const pending = read()
    if (pending.length === 0) return 0
    const stillPending: Entry[] = []
    for (const entry of pending) {
      const { ok, error } = await insertOrderRow(entry.row)
      if (!ok) stillPending.push({ ...entry, attempts: entry.attempts + 1, lastError: error })
    }
    write(stillPending)
    return stillPending.length
  } finally {
    flushing = false
  }
}

let started = false

/** Wire the retry triggers once, at app start. */
export function startOutboxFlusher(): void {
  if (started) return
  started = true
  const attempt = () => {
    void flushOutbox()
  }
  attempt()
  window.addEventListener('online', attempt)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') attempt()
  })
  setInterval(attempt, RETRY_MS)
}
