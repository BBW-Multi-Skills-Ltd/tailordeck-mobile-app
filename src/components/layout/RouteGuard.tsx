import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useProfileQuery } from '../../hooks/useProfileQueries'
import { useSubscriptionQuery } from '../../hooks/useFeatureAccess'

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

  if (auth.loading) return <RouteGuardFallback />
  if (!auth.session) return <Navigate to="/auth/signin" replace state={{ from: location.pathname }} />
  if (profile.isLoading || subscription.isLoading) return <RouteGuardFallback />

  const onboardingComplete = profile.data?.onboarding_complete === true
  if (!onboardingComplete && !location.pathname.startsWith('/onboarding')) {
    return <Navigate to="/onboarding/setup" replace />
  }

  const isExpired = subscription.data?.status === 'expired' || subscription.data?.status === 'past_due'
  if (isExpired && location.pathname !== '/settings/subscription') {
    return <Navigate to="/settings/subscription" replace />
  }

  return <Outlet />
}
