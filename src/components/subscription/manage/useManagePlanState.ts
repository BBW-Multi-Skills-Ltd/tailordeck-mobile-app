import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  invalidateSubscriptionQueries,
  useFreeTrialCancellationMutation,
  useStartSubscriptionCheckoutMutation,
  useSubscriptionQuery,
} from '../../../hooks/useFeatureAccess'
import { usePurchaseFeedback } from '../../../hooks/usePurchaseFeedback'
import { useStorePricedPlans } from '../../../hooks/useStorePricedPlans'
import { subscriptionPlans, type BillingCycle, type PaidPlan } from '../../../lib/subscriptionPlans'
import {
  getEffectiveSubscriptionPlan,
  openGooglePlaySubscriptionManagement,
  refreshGooglePlaySubscription,
} from '../../../services/subscriptionService'
import { formatIsoDate, formatRelativeDate, getDefaultManagePlan, getManagePlanOptions } from './managePlanUtils'

export function useManagePlanState() {
  const subscriptionQuery = useSubscriptionQuery()
  const checkoutMutation = useStartSubscriptionCheckoutMutation()
  const trialCancellationMutation = useFreeTrialCancellationMutation()
  const queryClient = useQueryClient()
  const noticeTimerRef = useRef<number | null>(null)
  const awaitingPlayReturnRef = useRef(false)
  const [cycleOverride, setCycleOverride] = useState<BillingCycle | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const { message: actionError, showError, clear: clearActionError } = usePurchaseFeedback()
  const pricedPlans = useStorePricedPlans(subscriptionPlans)
  const [actionNotice, setActionNotice] = useState('')
  const plan = subscriptionQuery.data?.plan_name ?? 'free'
  const cycle = cycleOverride ?? subscriptionQuery.data?.billing_cycle ?? 'monthly'
  const [selectedPlanState, setSelectedPlanState] = useState(() => ({ plan, selectedPlan: getDefaultManagePlan(plan) }))
  const currentPlan = useMemo(() => pricedPlans.find((item) => item.id === plan) ?? pricedPlans[0], [plan, pricedPlans])
  const changePlanOptions = useStorePricedPlans(useMemo(() => getManagePlanOptions(plan), [plan]))
  const isPaidPlan = plan === 'starter' || plan === 'pro'
  const effectivePlan = subscriptionQuery.data ? getEffectiveSubscriptionPlan(subscriptionQuery.data) : plan
  const isTrialActive = effectivePlan === 'trial'
  const cancelScheduled = subscriptionQuery.data?.cancel_at_period_end ?? false
  const trialEndDate = formatIsoDate(subscriptionQuery.data?.tester_trial_ends_at || subscriptionQuery.data?.trial_ends_at) || formatRelativeDate(14)
  const renewalDate = formatIsoDate(subscriptionQuery.data?.current_period_ends_at) || formatRelativeDate(cycle === 'yearly' ? 365 : 30)
  const selectedPlan = selectedPlanState.plan === plan ? selectedPlanState.selectedPlan : getDefaultManagePlan(plan)

  useEffect(() => () => {
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current)
  }, [])

  // After the user returns from Google Play, re-read the subscription so a cancel/restore shows up.
  const subscription = subscriptionQuery.data
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState !== 'visible' || !awaitingPlayReturnRef.current) return
      awaitingPlayReturnRef.current = false
      void refreshGooglePlaySubscription(subscription).then((refreshed) => {
        if (refreshed) invalidateSubscriptionQueries(queryClient)
      })
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [queryClient, subscription])

  function showNotice(message: string) {
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current)
    setActionNotice(message)
    noticeTimerRef.current = window.setTimeout(() => {
      setActionNotice('')
      noticeTimerRef.current = null
    }, 5000)
  }

  async function choosePlan(nextPlan: PaidPlan) {
    clearActionError()
    setActionNotice('')
    setSelectedPlanState({ plan: nextPlan, selectedPlan: nextPlan })

    try {
      await checkoutMutation.mutateAsync({ planName: nextPlan, billingCycle: cycle })
      showNotice('Plan updated.')
    } catch (error) {
      showError(error, 'Unable to start checkout.')
    }
  }

  async function openGooglePlayManagement(): Promise<boolean> {
    try {
      await openGooglePlaySubscriptionManagement(subscriptionQuery.data)
      awaitingPlayReturnRef.current = true
      return true
    } catch (error) {
      showError(error, 'Unable to open Google Play.')
      return false
    }
  }

  async function confirmCancel() {
    clearActionError()
    setActionNotice('')

    if (isPaidPlan) {
      if (await openGooglePlayManagement()) {
        setCancelOpen(false)
        showNotice('Finish cancelling in Google Play. Your plan stays active until the billing period ends.')
      }
      return
    }

    try {
      await trialCancellationMutation.mutateAsync(true)
      setCancelOpen(false)
      showNotice('Cancellation successful')
    } catch (error) {
      showError(error, 'Unable to schedule cancellation.')
    }
  }

  async function keepPlanActive() {
    clearActionError()
    setActionNotice('')

    if (isPaidPlan) {
      if (await openGooglePlayManagement()) showNotice('Restore your subscription in Google Play to keep your plan active.')
      return
    }

    try {
      await trialCancellationMutation.mutateAsync(false)
      showNotice('Plan kept active.')
    } catch (error) {
      showError(error, 'Unable to keep plan active.')
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
      isBusy: checkoutMutation.isPending || trialCancellationMutation.isPending,
      isPaidPlan,
      isTrialActive,
      plan,
      renewalDate,
      selectedPlan,
      trialEndDate,
    },
  }
}

