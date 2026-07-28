import { useEffect, useState } from 'react'
import { loadTailorSettings } from '../../lib/settings'

export function useSyncedHeaderSettings() {
  const [settings, setSettings] = useState(() => loadTailorSettings())

  useEffect(() => {
    function syncSettings() {
      setSettings(loadTailorSettings())
    }

    window.addEventListener('storage', syncSettings)
    window.addEventListener('tailordeck-settings-updated', syncSettings)
    return () => {
      window.removeEventListener('storage', syncSettings)
      window.removeEventListener('tailordeck-settings-updated', syncSettings)
    }
  }, [])

  return settings
}
