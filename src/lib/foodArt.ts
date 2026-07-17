/**
 * The prototype uses warm radial-gradient tiles as food imagery placeholders.
 * Hash the item id to a stable gradient so every item gets a consistent tile
 * (swap for real photos later without touching layout).
 */
const PALETTES: Array<[string, string]> = [
  ['#caa15f', '#7a5220'],
  ['#b8703a', '#5c2d13'],
  ['#e5bd72', '#a56f28'],
  ['#d98f56', '#7a3f1c'],
  ['#d99a4e', '#7a4a18'],
  ['#c9772f', '#6b3410'],
]

const DRINK_PALETTE: [string, string] = ['#3a6a8f', '#16324a']

export function foodGradient(itemId: string, category?: string): string {
  if (category === 'cold-drinks' || category === 'shakes') {
    const [a, b] = category === 'cold-drinks' ? DRINK_PALETTE : PALETTES[2]
    return `radial-gradient(circle at 50% 40%, ${a}, ${b})`
  }
  let hash = 0
  for (let i = 0; i < itemId.length; i++) hash = (hash * 31 + itemId.charCodeAt(i)) >>> 0
  const [a, b] = PALETTES[hash % PALETTES.length]
  return `radial-gradient(circle at 50% 40%, ${a}, ${b})`
}
