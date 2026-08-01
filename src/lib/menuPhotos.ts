import { useEffect, useSyncExternalStore } from 'react'
import { supabase } from './supabase'

/**
 * Photos the shop uploads from the admin dashboard, kept in Supabase Storage.
 *
 * The map records which items actually have one, so the customer app never
 * fires a request that 404s, and carries the upload time as a cache-buster —
 * replacing a photo has to beat the CDN and the phone's own image cache.
 */

export type PhotoMap = Record<string, string>

const BUCKET = 'menu-photos'
/** Uploads are downscaled to this before leaving the phone. */
const MAX_EDGE = 900
const JPEG_QUALITY = 0.82

let map: PhotoMap = {}
let loadStarted = false
const listeners = new Set<() => void>()

function emit() {
  for (const cb of listeners) cb()
}

function publicUrl(path: string, version: string): string {
  if (!supabase) return ''
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return `${data.publicUrl}?v=${encodeURIComponent(version)}`
}

export async function loadPhotos(): Promise<void> {
  if (!supabase) return
  try {
    const { data, error } = await supabase.from('item_photos').select('item_id, path, updated_at')
    if (error || !data) return
    const next: PhotoMap = {}
    for (const row of data) {
      next[row.item_id as string] = publicUrl(row.path as string, String(row.updated_at))
    }
    map = next
    emit()
  } catch {
    // fall back to bundled art
  }
}

function ensureLoaded() {
  if (loadStarted) return
  loadStarted = true
  loadPhotos()
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const EMPTY: PhotoMap = {}

/** Reactive item-id → photo URL map. */
export function useMenuPhotos(): PhotoMap {
  useEffect(ensureLoaded, [])
  return useSyncExternalStore(subscribe, () => map, () => EMPTY)
}

/** Reserved key: the shop's UPI QR, uploaded the same way as a food photo. */
export const UPI_QR_KEY = 'payment-upi-qr'

/**
 * Shrinks a picked photo in the browser. A modern phone camera file is 3–8 MB;
 * this gets a typical one under ~150 KB so uploading over patchy hostel wifi
 * is quick and the customer app stays fast.
 *
 * Food photos are centre-cropped square to match the card slots. A payment QR
 * is only scaled — cropping one would cut off the corner markers and make it
 * unscannable.
 */
export async function prepareImage(file: File, mode: 'square' | 'fit' = 'square'): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')

  if (mode === 'square') {
    const edge = Math.min(bitmap.width, bitmap.height)
    const size = Math.min(edge, MAX_EDGE)
    canvas.width = size
    canvas.height = size
    ctx.drawImage(bitmap, (bitmap.width - edge) / 2, (bitmap.height - edge) / 2, edge, edge, 0, 0, size, size)
  } else {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    // white behind the QR so transparent PNGs stay scannable
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  }
  bitmap.close()

  const quality = mode === 'square' ? JPEG_QUALITY : 0.94
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!blob) throw new Error('Could not read that image')
  return blob
}

/** Uploads a photo for one item. Returns '' on success, else a message. */
export async function uploadItemPhoto(itemId: string, file: File): Promise<string> {
  if (!supabase) return 'Backend not configured.'
  if (!file.type.startsWith('image/')) return 'That file is not an image.'
  try {
    const blob = await prepareImage(file, itemId === UPI_QR_KEY ? 'fit' : 'square')
    const path = `${itemId}.jpg`
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: 'image/jpeg', upsert: true })
    if (upErr) return upErr.message
    const { error: rowErr } = await supabase
      .from('item_photos')
      .upsert({ item_id: itemId, path, updated_at: new Date().toISOString() })
    if (rowErr) return rowErr.message
    await loadPhotos()
    return ''
  } catch (err) {
    return err instanceof Error ? err.message : 'Upload failed.'
  }
}

/** Removes the uploaded photo so the item falls back to the drawn art. */
export async function removeItemPhoto(itemId: string): Promise<string> {
  if (!supabase) return 'Backend not configured.'
  const { error: rowErr } = await supabase.from('item_photos').delete().eq('item_id', itemId)
  if (rowErr) return rowErr.message
  await supabase.storage.from(BUCKET).remove([`${itemId}.jpg`])
  await loadPhotos()
  return ''
}
