import { useMemo, useState } from 'react'
import { loadTailorSettings, saveTailorSettings } from '../../../lib/settings'
import { subscriptionPlans, type BillingCycle, type PaidPlan } from '../../../lib/subscriptionPlans'
import { formatRelativeDate, getDefaultManagePlan, getManagePlanOptions } from './managePlanUtils'

export function useManagePlanState() {
  const [settings, setSettings] = useState(() => loadTailorSettings())
  const [cycle, setCycle] = useState<BillingCycle>(settings.subscription.billingCycle)
  const [cancelOpen, setCancelOpen] = useState(false)
  const plan = settings.subscription.plan
  const [selectedPlanState, setSelectedPlanState] = useState(() => ({
    plan,
    selectedPlan: getDefaultManagePlan(plan),
  }))
  const currentPlan = useMemo(() => subscriptionPlans.find((item) => item.id === plan) ?? subscriptionPlans[0], [plan])
  const changePlanOptions = useMemo(() => getManagePlanOptions(plan), [plan])
  const isPaidPlan = plan === 'starter' || plan === 'pro'
  const cancelScheduled = settings.subscription.cancelAtPeriodEnd
  const trialEndDate = formatRelativeDate(14)
  const renewalDate = formatRelativeDate(cycle === 'yearly' ? 365 : 30)
  const selectedPlan = selectedPlanState.plan === plan ? selectedPlanState.selectedPlan : getDefaultManagePlan(plan)

  function choosePlan(nextPlan: PaidPlan) {
    setSelectedPlanState({ plan: nextPlan, selectedPlan: nextPlan })
    const nextSettings = saveTailorSettings({
      ...settings,
      subscription: { ...settings.subscription, plan: nextPlan, billingCycle: cycle, cancelAtPeriodEnd: false },
      updatedAt: new Date().toISOString(),
    })
    setSettings(nextSettings)
  }

  function confirmCancel() {
    const nextSettings = saveTailorSettings({
      ...settings,
      subscription: { ...settings.subscription, cancelAtPeriodEnd: true },
      updatedAt: new Date().toISOString(),
    })
    setSettings(nextSettings)
    setCancelOpen(false)
  }

  function keepPlanActive() {
    const nextSettings = saveTailorSettings({
      ...settings,
      subscription: { ...settings.subscription, cancelAtPeriodEnd: false },
      updatedAt: new Date().toISOString(),
    })
    setSettings(nextSettings)
  }

  return {
    actions: {
      choosePlan,
      confirmCancel,
      keepPlanActive,
      setCancelOpen,
      setCycle,
      setSelectedPlan: (nextPlan: PaidPlan) => setSelectedPlanState({ plan, selectedPlan: nextPlan }),
    },
    state: {
      cancelOpen,
      cancelScheduled,
      changePlanOptions,
      currentPlan,
      cycle,
      isPaidPlan,
      plan,
      renewalDate,
      selectedPlan,
      trialEndDate,
    },
  }
}
