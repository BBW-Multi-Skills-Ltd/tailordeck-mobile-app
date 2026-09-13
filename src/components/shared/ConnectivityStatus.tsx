import { useEffect, useState } from 'react'

type NetworkState = 'online' | 'offline' | 'restored'

export default function ConnectivityStatus() {
  const [state, setState] = useState<NetworkState>(() => {
    if (typeof navigator === 'undefined') return 'online'
    return navigator.onLine ? 'online' : 'offline'
  })

  useEffect(() => {
    let restoreTimer: number | undefined

    const handleOffline = () => {
      window.clearTimeout(restoreTimer)
      setState('offline')
    }

    const handleOnline = () => {
      setState('restored')
      restoreTimer = window.setTimeout(() => setState('online'), 2600)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.clearTimeout(restoreTimer)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (state === 'online') return null

  return (
    <div className={`connectivity-banner ${state === 'restored' ? 'is-restored' : ''}`} role="status" aria-live="polite">
      <span className="connectivity-dot" aria-hidden="true" />
      <span>
        {state === 'offline'
          ? 'No internet connection. TailorDeck will reconnect when your network returns.'
          : 'Back online. TailorDeck is reconnecting.'}
      </span>
    </div>
  )
}
