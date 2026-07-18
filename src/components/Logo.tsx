import { useState } from 'react'

/**
 * The brand logo: uses the real logo image (public/images/brand/logo.png)
 * and falls back to the typographic wordmark if it's missing.
 */
export function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const [hasImage, setHasImage] = useState(true)

  if (hasImage) {
    const px = size === 'lg' ? 120 : 92
    return (
      <img
        src="/images/brand/logo.png"
        alt="Magic Hand's Pizza"
        onError={() => setHasImage(false)}
        style={{ height: px, width: px }}
        className="mx-auto object-contain"
      />
    )
  }

  const nameCls = size === 'lg' ? 'text-[34px]' : 'text-[26px]'
  const subCls = size === 'lg' ? 'text-[15px] tracking-[9px]' : 'text-xs tracking-[7px]'
  return (
    <div className="text-center">
      <div className={`font-cond leading-none font-bold italic ${nameCls}`}>Magic Hand&rsquo;s</div>
      <div className={`font-anton text-brand ${subCls}`}>PIZZA</div>
    </div>
  )
}
