import { useState } from 'react'
import { foodGradient } from '../lib/foodArt'
import { useMenuPhotos } from '../lib/menuPhotos'

interface Props {
  itemId: string
  category?: string
  className?: string
  children?: React.ReactNode
}

/**
 * Picture for a menu item, in order of preference: the photo the shop
 * uploaded from the admin dashboard, then a file committed to
 * public/images/menu/<itemId>.jpg, then warm oven-glow art.
 */
export function ItemImage({ itemId, category, className = '', children }: Props) {
  const photos = useMenuPhotos()
  const [localFailed, setLocalFailed] = useState(false)
  const uploaded = photos[itemId]
  const src = uploaded ?? (localFailed ? null : `/images/menu/${itemId}.jpg`)

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: foodGradient(itemId, category) }}
    >
      {src && (
        <img
          key={src}
          src={src}
          alt=""
          loading="lazy"
          onError={() => setLocalFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {children}
    </div>
  )
}
