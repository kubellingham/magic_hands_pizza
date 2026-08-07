import { fetchOrderStatus } from './tracking'
import { loadOrderHistory } from './orderHistory'

/**
 * "Add to home screen", asked once, after the shop has earned it.
 *
 * Chrome fires beforeinstallprompt on the first visit; we swallow it and hold
 * the event until the customer has actually had an order delivered. Asking a
 * stranger to install something before they have tasted the pizza is how the
 * prompt gets dismissed forever. iOS has no install API at all, so there the
 * prompt becomes a coach mark pointing at Safari's Share button.
 */

interface InstallEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const ASKED_KEY = 'mhp-install-asked-v1'
const DELIVERED_KEY = 'mhp-had-delivery-v1'

let deferred: InstallEvent | null = null
const listeners = new Set<() => void>()

function emit() {
  for (const cb of listeners) cb()
}

export function subscribeInstall(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/** Must run before Chrome fires the event, so main.tsx imports this early. */
export function watchForInstall(): void {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferred = event as InstallEvent
    emit()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    markAsked()
    emit()
  })
}

export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  )
}

export function isIos(): boolean {
  const ua = navigator.userAgent
  // iPadOS 13+ reports as Macintosh, so check for touch as well
  const ipad = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1
  if (!/iPhone|iPad|iPod/.test(ua) && !ipad) return false
  // Chrome and Firefox on iOS cannot add to the home screen at all
  return !/CriOS|FxiOS|EdgiOS/.test(ua)
}

function read(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function write(key: string): void {
  try {
    localStorage.setItem(key, '1')
  } catch {
    // private mode — we just risk asking twice
  }
}

export const wasAsked = () => read(ASKED_KEY)
export const markAsked = () => write(ASKED_KEY)

/**
 * True once an order of theirs has actually been delivered. Cached, because
 * the answer never goes back to false and the RPC costs a round trip.
 */
export async function hasHadDelivery(): Promise<boolean> {
  if (read(DELIVERED_KEY)) return true
  const history = loadOrderHistory()
  if (history.length === 0) return false
  const latest = await fetchOrderStatus(history[0].code)
  if (latest?.status !== 'delivered') return false
  write(DELIVERED_KEY)
  return true
}

export type InstallKind = 'none' | 'android' | 'ios'

/** Which prompt this device can actually act on right now. */
export function installKind(): InstallKind {
  if (isStandalone() || wasAsked()) return 'none'
  if (deferred) return 'android'
  if (isIos()) return 'ios'
  return 'none'
}

/** Hands the captured event back to Chrome. Returns true if they installed. */
export async function acceptInstall(): Promise<boolean> {
  markAsked()
  if (!deferred) return false
  const event = deferred
  deferred = null
  emit()
  await event.prompt()
  const { outcome } = await event.userChoice
  return outcome === 'accepted'
}
