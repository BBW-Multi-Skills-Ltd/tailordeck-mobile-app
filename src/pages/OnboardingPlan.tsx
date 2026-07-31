import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { queryKeys } from '../hooks/queryKeys'
import { useStartSubscriptionCheckoutMutation } from '../hooks/useFeatureAccess'
import PageHeader from '../components/shared/PageHeader'
import SegmentedControl from '../components/shared/SegmentedControl'
import { SubscriptionPlanCarousel } from '../components/subscription/SubscriptionPlanCarousel'
import { markOnboardingCompleted } from '../lib/auth'
import { loadTailorSettings, saveTailorSettings, type SubscriptionPlan } from '../lib/settings'
import { billingCycles, subscriptionPlans, type BillingCycle } from '../lib/subscriptionPlans'
import { updateProfile } from '../services/profileService'
import { getServiceErrorMessage } from '../services/serviceHelpers'
import { selectSubscriptionPlan } from '../services/subscriptionService'

export default function OnboardingPlan() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [settings, setSettings] = useState(() => loadTailorSettings())
  const [cycle, setCycle] = useState<BillingCycle>(settings.subscription.billingCycle)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('free')
  const [savingPlan, setSavingPlan] = useState<SubscriptionPlan | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const checkoutMutation = useStartSubscriptionCheckoutMutation()

  async function activatePlan(plan: SubscriptionPlan) {
    setErrorMessage('')
    setSelectedPlan(plan)
    setSavingPlan(plan)
    try {
      if (plan === 'free') {
        const next = saveTailorSettings({
          ...settings,
          subscription: { ...settings.subscription, plan, billingCycle: cycle, cancelAtPeriodEnd: false },
          updatedAt: new Date().toISOString(),
        })
        setSettings(next)
        await selectSubscriptionPlan(plan, cycle)
        await updateProfile({ onboarding_complete: true })
        markOnboardingCompleted()
      } else {
        setSettings(saveTailorSettings({
          ...settings,
          subscription: { ...settings.subscription, billingCycle: cycle },
          updatedAt: new Date().toISOString(),
        }))
        const checkout = await checkoutMutation.mutateAsync({ planName: plan, billingCycle: cycle })
        window.sessionStorage.setItem('tailordeck-paystack-return', '/onboarding/plan')
        window.location.assign(checkout.authorizationUrl)
        return
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
        queryClient.invalidateQueries({ queryKey: queryKeys.subscription }),
      ])
      markOnboardingCompleted()
      navigate('/')
    } catch (error) {
      console.error('Unable to activate onboarding plan:', error)
      setErrorMessage(getServiceErrorMessage(error, 'Unable to activate plan.'))
    } finally {
      setSavingPlan(null)
    }
  }

  return (
    <main className="page-full onboarding-page onboarding-page-step">
      <section className="section stack gap-10 subscription-page subscription-page-onboarding">
        <PageHeader title="Subscription" centered />

        <section className="wizard-progress-card onboarding-plan-progress" aria-label="Onboarding plan progress 75% complete">
          <div className="row-between wizard-progress-head">
            <p className="wizard-progress-step">Almost done</p>
            <span className="wizard-progress-percent onboarding-plan-progress-percent">75% done</span>
          </div>
          <div className="wizard-progress-track" aria-hidden>
            <span className="wizard-progress-fill" style={{ width: '75%' }} />
          </div>
          <p className="onboarding-plan-progress-copy">Your shop basics are saved. Choose a plan.</p>
        </section>

        <h3 className="subscription-section-title">Choose the plan that's right for you</h3>

        <SegmentedControl label="Billing cycle" options={billingCycles} value={cycle} onChange={setCycle} className="subscription-billing-toggle" />
        {errorMessage ? <p className="auth-feedback error" role="alert">{errorMessage}</p> : null}
        <SubscriptionPlanCarousel
          ariaLabel="Onboarding pricing plans"
          busyPlanId={savingPlan}
          className="onboarding-plan-carousel"
          cycle={cycle}
          disabled={savingPlan !== null}
          getCtaLabel={(plan) => plan.cta}
          plans={subscriptionPlans}
          selectedPlan={selectedPlan}
          onChoosePlan={(plan) => activatePlan(plan.id)}
          onSelectedPlanChange={setSelectedPlan}
        />
      </section>
    </main>
  )
}

