/**
 * Placeholder food art until real photos land in public/images/menu/.
 * Warm oven tones, hashed per item so each one is stable.
 */
const PALETTES: Array<[string, string]> = [
  ['#d9a05b', '#7a4a18'],
  ['#c9772f', '#6b3410'],
  ['#e0b269', '#8a5a20'],
  ['#d98f56', '#7a3f1c'],
  ['#caa15f', '#7a5220'],
  ['#b8703a', '#5c2d13'],
]

const DRINK_PALETTE: [string, string] = ['#3a6a8f', '#16324a']
const SHAKE_PALETTE: [string, string] = ['#e5cfa8', '#a8895a']

export function foodGradient(itemId: string, category?: string): string {
  if (category === 'cold-drinks') {
    const [a, b] = DRINK_PALETTE
    return `radial-gradient(circle at 50% 38%, ${a}, ${b})`
  }
  if (category === 'shakes') {
    const [a, b] = SHAKE_PALETTE
    return `radial-gradient(circle at 50% 38%, ${a}, ${b})`
  }
  let hash = 0
  for (let i = 0; i < itemId.length; i++) hash = (hash * 31 + itemId.charCodeAt(i)) >>> 0
  const [a, b] = PALETTES[hash % PALETTES.length]
  return `radial-gradient(circle at 50% 38%, ${a}, ${b})`
}
