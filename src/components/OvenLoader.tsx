import { Logo } from './Logo'

/** Full-screen hand-off moment while the order is being sent. */
export function OvenLoader({ label = 'Sending your order to the kitchen…' }: { label?: string }) {
  return (
    <div className="page-bg fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-10 text-center">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
        <span className="absolute inset-3 rounded-full bg-accent/10" />
        <Logo size="md" className="relative" />
      </div>
      <div>
        <div className="font-display text-[11px] font-extrabold tracking-[3px] text-accent">
          FIRING UP THE OVEN
        </div>
        <p className="mt-2 text-sm text-soft">{label}</p>
      </div>
    </div>
  )
}
