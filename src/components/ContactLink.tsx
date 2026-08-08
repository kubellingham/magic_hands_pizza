import type { ReactNode } from 'react'

/**
 * Renders a real link when there is somewhere to go, and an inert chip when
 * there isn't. In the demo build every outbound contact href is null, so the
 * button still shows what the app does without dialling anyone.
 */
export function ContactLink({
  href,
  className = '',
  children,
  demoLabel = 'Demo build',
}: {
  href: string | null
  className?: string
  children: ReactNode
  demoLabel?: string
}) {
  if (!href) {
    return (
      <span
        title={`${demoLabel} — this would open WhatsApp in the live app`}
        aria-disabled="true"
        className={`${className} cursor-not-allowed opacity-45`}
      >
        {children}
      </span>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener" className={className}>
      {children}
    </a>
  )
}
