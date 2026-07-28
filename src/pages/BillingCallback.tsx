import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../hooks/queryKeys'
import { useVerifySubscriptionPaymentMutation } from '../hooks/useFeatureAccess'
import { markOnboardingCompleted } from '../lib/auth'
import { loadTailorSettings, saveTailorSettings } from '../lib/settings'
import { updateProfile } from '../services/profileService'
import { getServiceErrorMessage } from '../services/serviceHelpers'
import type { SubscriptionRow } from '../services/types'

function syncSubscriptionToLocalSettings(subscription: SubscriptionRow) {
  const settings = loadTailorSettings()
  saveTailorSettings({
    ...settings,
    subscription: {
      ...settings.subscription,
      billingCycle: subscription.billing_cycle,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      plan: subscription.plan_name,
    },
    updatedAt: new Date().toISOString(),
  })
}

export default function BillingCallback() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const verifyMutation = useVerifySubscriptionPaymentMutation()
  const { isPending, isSuccess, mutateAsync: verifyPaymentMutation } = verifyMutation
  const hasVerified = useRef(false)
  const [message, setMessage] = useState('Verifying your payment...')
  const [returnTo, setReturnTo] = useState('/')
  const reference = useMemo(() => searchParams.get('reference') || searchParams.get('trxref') || '', [searchParams])

  useEffect(() => {
    if (hasVerified.current) return
    hasVerified.current = true

    async function verifyPayment() {
      if (!reference) {
        setMessage('Payment reference was not found.')
        return
      }

      try {
        const subscription = await verifyPaymentMutation(reference)
        syncSubscriptionToLocalSettings(subscription)
        await updateProfile({ onboarding_complete: true })
        markOnboardingCompleted()
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
          queryClient.invalidateQueries({ queryKey: queryKeys.subscription }),
          queryClient.invalidateQueries({ queryKey: queryKeys.settings }),
        ])

        const storedReturn = window.sessionStorage.getItem('tailordeck-paystack-return') || ''
        window.sessionStorage.removeItem('tailordeck-paystack-return')
        const nextReturn = storedReturn === '/onboarding/plan' ? '/' : storedReturn || '/settings/subscription'
        setReturnTo(nextReturn)
        setMessage('Payment confirmed. Your plan is active.')
      } catch (error) {
        setMessage(getServiceErrorMessage(error, 'Unable to verify payment.'))
      }
    }

    void verifyPayment()
  }, [location.key, queryClient, reference, verifyPaymentMutation])

  const isError = Boolean(message && !isPending && !isSuccess)

  return (
    <main className="section billing-callback-page">
      <article className="billing-callback-card">
        {isPending ? <Loader2 className="billing-callback-icon spinning" size={34} /> : null}
        {isSuccess ? <CheckCircle2 className="billing-callback-icon success" size={38} /> : null}
        {isError ? <AlertTriangle className="billing-callback-icon error" size={38} /> : null}

        <h1>{isSuccess ? 'Payment Confirmed' : isError ? 'Payment Not Confirmed' : 'Checking Payment'}</h1>
        <p>{message}</p>

        {isSuccess ? (
          <button type="button" className="btn btn-primary btn-full" onClick={() => navigate(returnTo, { replace: true })}>
            Continue
          </button>
        ) : null}

        {isError ? (
          <div className="stack gap-8 billing-callback-actions">
            <button type="button" className="btn btn-primary btn-full" onClick={() => window.location.reload()}>
              Try Again
            </button>
            <Link to="/settings/subscription" className="btn btn-secondary btn-full">
              Back to Subscription
            </Link>
          </div>
        ) : null}
      </article>
    </main>
  )
}
