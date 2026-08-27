import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/authContextCore'
import { useProfileQuery } from '../../hooks/useProfileQueries'
import { useSubscriptionQuery } from '../../hooks/useFeatureAccess'
import { hasStartedDeviceOnboarding } from '../../lib/auth'

const ROUTE_GUARD_DATA_TIMEOUT_MS = 6000
const ACCOUNT_ACTION_SIGNING_OUT_KEY = 'tailordeck-account-action-signing-out'

function RouteGuardFallback() {
  return (
    <main className="page-full route-guard-loading">
      <span className="onboarding-brand-icon" aria-hidden>
        <img
          src="/branding/TailorDeck%20app%20logo%20for%20splac%20screen.png"
          alt=""
          className="onboarding-brand-logo"
          decoding="async"
          loading="eager"
        />
      </span>
      <p>Getting things ready...</p>
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
  if (!auth.session) {
    const nextPath = hasStartedDeviceOnboarding() ? '/auth/signin' : '/onboarding'
    return <Navigate to={nextPath} replace state={{ from: location.pathname }} />
  }
  if ((profile.isLoading || subscription.isLoading) && !dataWaitTimedOut) return <RouteGuardFallback />

  if (!profile.isError && profile.data?.account_status === 'pending_verification') {
    return <Navigate to="/auth/verify-email" replace />
  }

  const accountLocked = profile.data?.account_status === 'deactivated' || profile.data?.account_status === 'pending_deletion'
  const accountActionSigningOut = window.sessionStorage.getItem(ACCOUNT_ACTION_SIGNING_OUT_KEY) === 'true'
  if (!profile.isError && accountLocked && accountActionSigningOut) return <RouteGuardFallback />
  if (!profile.isError && accountLocked && location.pathname !== '/account-status') {
    return <Navigate to="/account-status" replace />
  }

  const onboardingComplete = profile.data?.onboarding_complete === true
  const isBillingCallback = location.pathname.startsWith('/billing/callback')
  if (!profile.isError && profile.data && !onboardingComplete && !location.pathname.startsWith('/onboarding') && !isBillingCallback) {
    return <Navigate to="/onboarding/setup" replace />
  }

  const subscriptionData = subscription.data
  const isExpiredPaidPlan =
    subscriptionData?.plan_name !== 'free' &&
    (subscriptionData?.status === 'expired' || subscriptionData?.status === 'past_due')
  if (!subscription.isError && isExpiredPaidPlan && location.pathname !== '/settings/subscription' && !isBillingCallback) {
    return <Navigate to="/settings/subscription" replace />
  }

  return <Outlet />
}
