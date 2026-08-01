import { useState } from 'react'
import { foodGradient } from '../lib/foodArt'

interface Props {
  itemId: string
  category?: string
  className?: string
  children?: React.ReactNode
}

/**
 * Shows /images/menu/<itemId>.jpg when the owner has dropped a photo in
 * public/images/menu/, otherwise falls back to warm oven-glow art.
 */
export function ItemImage({ itemId, category, className = '', children }: Props) {
  const [hasPhoto, setHasPhoto] = useState(true)
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: foodGradient(itemId, category) }}
    >
      {hasPhoto && (
        <img
          src={`/images/menu/${itemId}.jpg`}
          alt=""
          loading="lazy"
          onError={() => setHasPhoto(false)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {children}
    </div>
  )
}
