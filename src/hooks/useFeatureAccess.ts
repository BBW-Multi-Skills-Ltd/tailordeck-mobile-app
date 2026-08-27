import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SubscriptionBillingCycle, SubscriptionPlan } from '../lib/settingsTypes'
import {
  checkFeatureAccess,
  getJobCreationEntitlement,
  getSubscription,
  selectSubscriptionPlan,
  setCancelAtPeriodEnd,
  startSubscriptionCheckout,
  verifySubscriptionPayment,
} from '../services/subscriptionService'
import { queryKeys } from './queryKeys'

export function useSubscriptionQuery(enabled = true) {
  return useQuery({ queryKey: queryKeys.subscription, queryFn: getSubscription, enabled })
}

export function useFeatureAccess(featureKey: string) {
  const subscriptionQuery = useSubscriptionQuery(Boolean(featureKey))
  const subscription = subscriptionQuery.data

  return useQuery({
    queryKey: [
      ...queryKeys.feature(featureKey),
      subscription?.plan_name ?? 'no-plan',
      subscription?.status ?? 'unknown',
      subscription?.trial_ends_at ?? null,
      subscription?.tester_trial_ends_at ?? null,
      subscription?.current_period_ends_at ?? null,
      subscription?.updated_at ?? null,
    ],
    queryFn: () => (subscription ? checkFeatureAccess(featureKey) : false),
    enabled: Boolean(featureKey) && subscriptionQuery.isSuccess,
  })
}

export function useJobCreationEntitlementQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.jobCreationEntitlement,
    queryFn: getJobCreationEntitlement,
    enabled,
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
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobCreationEntitlement })
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
      void queryClient.invalidateQueries({ queryKey: ['feature-access'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobCreationEntitlement })
    },
  })
}

export function useStartSubscriptionCheckoutMutation() {
  return useMutation({
    mutationFn: startSubscriptionCheckout,
  })
}

export function useVerifySubscriptionPaymentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: verifySubscriptionPayment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.subscription })
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings })
      void queryClient.invalidateQueries({ queryKey: ['feature-access'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobCreationEntitlement })
    },
  })
}
