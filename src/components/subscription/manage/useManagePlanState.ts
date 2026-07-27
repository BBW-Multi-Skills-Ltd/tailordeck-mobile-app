import { useMemo, useState } from 'react'
import { useCancelAtPeriodEndMutation, useSelectSubscriptionPlanMutation, useSubscriptionQuery } from '../../../hooks/useFeatureAccess'
import { loadTailorSettings, saveTailorSettings } from '../../../lib/settings'
import { subscriptionPlans, type BillingCycle, type PaidPlan } from '../../../lib/subscriptionPlans'
import { getServiceErrorMessage } from '../../../services/serviceHelpers'
import { useAppFeedback } from '../../shared/appFeedbackCore'
import { formatIsoDate, formatRelativeDate, getDefaultManagePlan, getManagePlanOptions } from './managePlanUtils'

export function useManagePlanState() {
  const feedback = useAppFeedback()
  const subscriptionQuery = useSubscriptionQuery()
  const selectPlanMutation = useSelectSubscriptionPlanMutation()
  const cancelMutation = useCancelAtPeriodEndMutation()
  const [settings, setSettings] = useState(() => loadTailorSettings())
  const [cycleOverride, setCycleOverride] = useState<BillingCycle | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [actionError, setActionError] = useState('')
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

  async function choosePlan(nextPlan: PaidPlan) {
    setActionError('')
    setSelectedPlanState({ plan: nextPlan, selectedPlan: nextPlan })

    try {
      await selectPlanMutation.mutateAsync({ planName: nextPlan, billingCycle: cycle })
      const nextSettings = saveTailorSettings({
        ...settings,
        subscription: { ...settings.subscription, plan: nextPlan, billingCycle: cycle, cancelAtPeriodEnd: false },
        updatedAt: new Date().toISOString(),
      })
      setSettings(nextSettings)
      feedback.toast(`${nextPlan === 'pro' ? 'Pro' : 'Starter'} selected.`, 'success')
    } catch (error) {
      const message = getServiceErrorMessage(error, 'Unable to update plan.')
      setActionError(message)
      feedback.toast(message, 'error')
    }
  }

  async function confirmCancel() {
    setActionError('')
    try {
      await cancelMutation.mutateAsync(true)
      const nextSettings = saveTailorSettings({
        ...settings,
        subscription: { ...settings.subscription, cancelAtPeriodEnd: true },
        updatedAt: new Date().toISOString(),
      })
      setSettings(nextSettings)
      setCancelOpen(false)
      feedback.toast('Cancellation scheduled.', 'success')
    } catch (error) {
      const message = getServiceErrorMessage(error, 'Unable to schedule cancellation.')
      setActionError(message)
      feedback.toast(message, 'error')
    }
  }

  async function keepPlanActive() {
    setActionError('')
    try {
      await cancelMutation.mutateAsync(false)
      const nextSettings = saveTailorSettings({
        ...settings,
        subscription: { ...settings.subscription, cancelAtPeriodEnd: false },
        updatedAt: new Date().toISOString(),
      })
      setSettings(nextSettings)
      feedback.toast('Plan kept active.', 'success')
    } catch (error) {
      const message = getServiceErrorMessage(error, 'Unable to keep plan active.')
      setActionError(message)
      feedback.toast(message, 'error')
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
      cancelOpen,
      cancelScheduled,
      changePlanOptions,
      currentPlan,
      cycle,
      isBusy: selectPlanMutation.isPending || cancelMutation.isPending,
      isPaidPlan,
      plan,
      renewalDate,
      selectedPlan,
      trialEndDate,
    },
  }
}
