import { useEffect, useMemo, useRef, useState } from 'react'
import { useCancelAtPeriodEndMutation, useStartSubscriptionCheckoutMutation, useSubscriptionQuery } from '../../../hooks/useFeatureAccess'
import { loadTailorSettings, saveTailorSettings } from '../../../lib/settings'
import { subscriptionPlans, type BillingCycle, type PaidPlan } from '../../../lib/subscriptionPlans'
import { getServiceErrorMessage } from '../../../services/serviceHelpers'
import { formatIsoDate, formatRelativeDate, getDefaultManagePlan, getManagePlanOptions } from './managePlanUtils'

export function useManagePlanState() {
  const subscriptionQuery = useSubscriptionQuery()
  const checkoutMutation = useStartSubscriptionCheckoutMutation()
  const cancelMutation = useCancelAtPeriodEndMutation()
  const noticeTimerRef = useRef<number | null>(null)
  const [settings, setSettings] = useState(() => loadTailorSettings())
  const [cycleOverride, setCycleOverride] = useState<BillingCycle | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionNotice, setActionNotice] = useState('')
  const plan = subscriptionQuery.data?.plan_name ?? settings.subscription.plan
  const cycle = cycleOverride ?? subscriptionQuery.data?.billing_cycle ?? settings.subscription.billingCycle
  const [selectedPlanState, setSelectedPlanState] = useState(() => ({
    plan: settings.subscription.plan,
    selectedPlan: getDefaultManagePlan(settings.subscription.plan),
  }))
  const currentPlan = useMemo(() => subscriptionPlans.find((item) => item.id === plan) ?? subscriptionPlans[0], [plan])
  const changePlanOptions = useMemo(() => getManagePlanOptions(plan), [plan])
  const isPaidPlan = plan === 'starter' || plan === 'pro'
  const cancelScheduled = subscriptionQuery.data?.cancel_at_period_end ?? settings.subscription.cancelAtPeriodEnd
  const trialEndDate = formatIsoDate(subscriptionQuery.data?.tester_trial_ends_at || subscriptionQuery.data?.trial_ends_at) || formatRelativeDate(14)
  const renewalDate = formatIsoDate(subscriptionQuery.data?.current_period_ends_at) || formatRelativeDate(cycle === 'yearly' ? 365 : 30)
  const selectedPlan = selectedPlanState.plan === plan ? selectedPlanState.selectedPlan : getDefaultManagePlan(plan)

  useEffect(() => () => {
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current)
  }, [])

  function showNotice(message: string) {
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current)
    setActionNotice(message)
    noticeTimerRef.current = window.setTimeout(() => {
      setActionNotice('')
      noticeTimerRef.current = null
    }, 5000)
  }

  async function choosePlan(nextPlan: PaidPlan) {
    setActionError('')
    setActionNotice('')
    setSelectedPlanState({ plan: nextPlan, selectedPlan: nextPlan })

    try {
      const checkout = await checkoutMutation.mutateAsync({ planName: nextPlan, billingCycle: cycle })
      setSettings(saveTailorSettings({
        ...settings,
        subscription: { ...settings.subscription, billingCycle: cycle },
        updatedAt: new Date().toISOString(),
      }))
      window.sessionStorage.setItem('tailordeck-paystack-return', '/settings/subscription/manage')
      window.location.assign(checkout.authorizationUrl)
    } catch (error) {
      const message = getServiceErrorMessage(error, 'Unable to start checkout.')
      setActionError(message)
    }
  }

  async function confirmCancel() {
    setActionError('')
    setActionNotice('')
    try {
      await cancelMutation.mutateAsync(true)
      const nextSettings = saveTailorSettings({
        ...settings,
        subscription: { ...settings.subscription, cancelAtPeriodEnd: true },
        updatedAt: new Date().toISOString(),
      })
      setSettings(nextSettings)
      setCancelOpen(false)
      showNotice('Cancellation scheduled. Access stays active until the period ends.')
    } catch (error) {
      const message = getServiceErrorMessage(error, 'Unable to schedule cancellation.')
      setActionError(message)
    }
  }

  async function keepPlanActive() {
    setActionError('')
    setActionNotice('')
    try {
      await cancelMutation.mutateAsync(false)
      const nextSettings = saveTailorSettings({
        ...settings,
        subscription: { ...settings.subscription, cancelAtPeriodEnd: false },
        updatedAt: new Date().toISOString(),
      })
      setSettings(nextSettings)
      showNotice('Plan kept active.')
    } catch (error) {
      const message = getServiceErrorMessage(error, 'Unable to keep plan active.')
      setActionError(message)
    }
  }

  return {
    actions: {
      choosePlan,
      confirmCancel,
      keepPlanActive,
      setCancelOpen,
      setCycle: setCycleOverride,
      setSelectedPlan: (nextPlan: PaidPlan) => setSelectedPlanState({ plan, selectedPlan: nextPlan }),
    },
    state: {
      actionError,
      actionNotice,
      cancelOpen,
      cancelScheduled,
      changePlanOptions,
      currentPlan,
      cycle,
      isBusy: checkoutMutation.isPending || cancelMutation.isPending,
      isPaidPlan,
      plan,
      renewalDate,
      selectedPlan,
      trialEndDate,
    },
  }
}

