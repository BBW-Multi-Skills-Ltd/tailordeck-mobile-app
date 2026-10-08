import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/authContextCore'
import { useSubscriptionQuery } from '../../hooks/useFeatureAccess'
import { setMonitoringRouteContext, setMonitoringUser } from '../../lib/monitoring'

export default function MonitoringBridge() {
  const auth = useAuth()
  const location = useLocation()
  const plan = useSubscriptionQuery(Boolean(auth.user)).data?.plan_name

  useEffect(() => {
    setMonitoringUser(auth.user, auth.loading)
  }, [auth.loading, auth.user])

  useEffect(() => {
    setMonitoringRouteContext({
      authState: auth.loading ? 'loading' : auth.user ? 'authenticated' : 'anonymous',
      path: location.pathname,
      plan: plan ?? 'unknown',
    })
  }, [auth.loading, auth.user, location.pathname, plan])

  return null
}
