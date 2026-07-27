import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SubscriptionBillingCycle, SubscriptionPlan } from '../lib/settingsTypes'
import { checkFeatureAccess, getSubscription, selectSubscriptionPlan, setCancelAtPeriodEnd } from '../services/subscriptionService'
import { queryKeys } from './queryKeys'

export function useSubscriptionQuery(enabled = true) {
  return useQuery({ queryKey: queryKeys.subscription, queryFn: getSubscription, enabled })
}

export function useFeatureAccess(featureKey: string) {
  return useQuery({
    queryKey: queryKeys.feature(featureKey),
    queryFn: () => checkFeatureAccess(featureKey),
    enabled: Boolean(featureKey),
  })
}

export function useSelectSubscriptionPlanMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ billingCycle, planName }: { planName: SubscriptionPlan; billingCycle: SubscriptionBillingCycle }) =>
      selectSubscriptionPlan(planName, billingCycle),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.subscription })
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings })
      void queryClient.invalidateQueries({ queryKey: ['feature-access'] })
    },
  })
}

export function useCancelAtPeriodEndMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setCancelAtPeriodEnd,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.subscription })
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings })
    },
  })
}
