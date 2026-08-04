import { useEffect, useState } from 'react'
import { loadTailorSettings, saveTailorSettings } from '../../lib/settings'
import { useSettingsQuery } from '../../hooks/useSettingsQueries'

export function useSyncedHeaderSettings() {
  const [settings, setSettings] = useState(() => loadTailorSettings())
  const settingsQuery = useSettingsQuery()

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

  useEffect(() => {
    if (!settingsQuery.data) return
    saveTailorSettings(settingsQuery.data)
  }, [settingsQuery.data])

  return settings
}
