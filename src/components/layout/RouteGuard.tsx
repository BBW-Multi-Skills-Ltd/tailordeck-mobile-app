import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/authContextCore'
import { useProfileQuery } from '../../hooks/useProfileQueries'
import { useSubscriptionQuery } from '../../hooks/useFeatureAccess'

const ROUTE_GUARD_DATA_TIMEOUT_MS = 6000

function RouteGuardFallback() {
  return (
    <main className="page-full route-guard-loading">
      <img src="/branding/TailorDeck%20app%20logo%20for%20splac%20screen.png" alt="TailorDeck" />
      <p>Opening TailorDeck...</p>
    </main>
  )
}

export function RouteGuard() {
  const location = useLocation()
  const auth = useAuth()
  const hasSession = Boolean(auth.session)
  const profile = useProfileQuery(hasSession)
  const subscription = useSubscriptionQuery(hasSession)
  const dataWaitKey = `${location.pathname}:${hasSession}:${profile.isLoading}:${subscription.isLoading}`
  const [dataWaitTimeout, setDataWaitTimeout] = useState({ key: '', timedOut: false })
  const dataWaitTimedOut = dataWaitTimeout.key === dataWaitKey && dataWaitTimeout.timedOut

  useEffect(() => {
    if (!hasSession) return undefined
    if (!profile.isLoading && !subscription.isLoading) return undefined

    const timeoutId = window.setTimeout(() => {
      setDataWaitTimeout({ key: dataWaitKey, timedOut: true })
    }, ROUTE_GUARD_DATA_TIMEOUT_MS)

    return () => window.clearTimeout(timeoutId)
  }, [dataWaitKey, hasSession, profile.isLoading, subscription.isLoading])

  if (auth.loading) return <RouteGuardFallback />
  if (!auth.session) return <Navigate to="/auth/signin" replace state={{ from: location.pathname }} />
  if ((profile.isLoading || subscription.isLoading) && !dataWaitTimedOut) return <RouteGuardFallback />

  const onboardingComplete = profile.data?.onboarding_complete === true
  if (!profile.isError && profile.data && !onboardingComplete && !location.pathname.startsWith('/onboarding')) {
    return <Navigate to="/onboarding/setup" replace />
  }

  const isExpired = subscription.data?.status === 'expired' || subscription.data?.status === 'past_due'
  if (!subscription.isError && isExpired && location.pathname !== '/settings/subscription') {
    return <Navigate to="/settings/subscription" replace />
  }

  return <Outlet />
}
