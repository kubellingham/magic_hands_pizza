import { useState } from 'react'

/**
 * The brand logo image, with a typographic wordmark as fallback if
 * public/images/brand/logo.png is missing.
 */
export function Logo({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const [hasImage, setHasImage] = useState(true)
  const px = size === 'lg' ? 116 : size === 'md' ? 84 : 40

  if (hasImage) {
    return (
      <img
        src="/images/brand/logo.png"
        alt="Corner Oven Pizza"
        onError={() => setHasImage(false)}
        style={{ height: px, width: px }}
        className={`object-contain ${className}`}
      />
    )
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="font-display text-xl leading-none font-extrabold">Corner Oven</div>
      <div className="font-display text-[10px] tracking-[6px] text-brand">PIZZA</div>
    </div>
  )
}
