import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/authContextCore'
import { loadTailorSettings } from '../../lib/settings'
import { setMonitoringRouteContext, setMonitoringUser } from '../../lib/monitoring'

export default function MonitoringBridge() {
  const auth = useAuth()
  const location = useLocation()

  useEffect(() => {
    setMonitoringUser(auth.user, auth.loading)
  }, [auth.loading, auth.user])

  useEffect(() => {
    const syncContext = () => {
      const settings = loadTailorSettings()
      setMonitoringRouteContext({
        authState: auth.loading ? 'loading' : auth.user ? 'authenticated' : 'anonymous',
        path: location.pathname,
        plan: settings.subscription.plan,
      })
    }

    syncContext()
    window.addEventListener('tailordeck-settings-updated', syncContext)
    return () => window.removeEventListener('tailordeck-settings-updated', syncContext)
  }, [auth.loading, auth.user, location.pathname])

  return null
}
