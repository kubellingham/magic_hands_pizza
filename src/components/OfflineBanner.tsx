import { useEffect, useState } from 'react'

export function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])
  return online
}

export function OfflineBanner() {
  const online = useOnline()
  if (online) return null
  return (
    <div className="bg-ink px-4 py-2 text-center text-xs font-medium text-white">
      You're offline — you can browse the menu, but you'll need a connection to place an order.
    </div>
  )
}
