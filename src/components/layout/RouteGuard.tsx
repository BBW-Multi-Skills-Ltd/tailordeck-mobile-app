import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useProfileQuery } from '../../hooks/useProfileQueries'
import { useSubscriptionQuery } from '../../hooks/useFeatureAccess'

function RouteGuardFallback() {
  return (
    <main className="app-shell">
      <div className="app-main">
        <section className="section stack gap-12">
          <div className="skeleton" style={{ height: 34, width: '54%' }} />
          <div className="skeleton" style={{ height: 92 }} />
          <div className="skeleton" style={{ height: 92 }} />
        </section>
      </div>
    </main>
  )
}

export function RouteGuard() {
  const location = useLocation()
  const auth = useAuth()
  const profile = useProfileQuery()
  const subscription = useSubscriptionQuery()

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
