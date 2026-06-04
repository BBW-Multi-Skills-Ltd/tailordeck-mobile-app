import { useEffect, useState } from 'react'
import { loadNotifications, type AppNotification } from '../../lib/notifications'
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

export function useSyncedNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadNotifications())

  useEffect(() => {
    function syncNotifications() {
      setNotifications(loadNotifications())
    }

    window.addEventListener('storage', syncNotifications)
    window.addEventListener('tailordeck-notifications-updated', syncNotifications)
    return () => {
      window.removeEventListener('storage', syncNotifications)
      window.removeEventListener('tailordeck-notifications-updated', syncNotifications)
    }
  }, [])

  return { notifications, setNotifications }
}
