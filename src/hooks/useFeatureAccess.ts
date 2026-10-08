import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  checkFeatureAccess,
  getEnabledFeatures,
  getJobCreationEntitlement,
  getSubscription,
  setFreeTrialCancellation,
  startPaidPlanUpgrade,
} from '../services/subscriptionService'
import { queryKeys } from './queryKeys'

export function useSubscriptionQuery(enabled = true) {
  return useQuery({ queryKey: queryKeys.subscription, queryFn: getSubscription, enabled })
}

/** All enabled feature keys for the current plan, fetched once and shared by every useFeatureAccess call. */
function useEnabledFeaturesQuery(enabled: boolean) {
  const subscriptionQuery = useSubscriptionQuery(enabled)
  const subscription = subscriptionQuery.data
  return useQuery({
    queryKey: [
      'feature-access',
      'enabled',
      subscription?.plan_name ?? 'no-plan',
      subscription?.status ?? 'unknown',
      subscription?.trial_ends_at ?? null,
      subscription?.tester_trial_ends_at ?? null,
      subscription?.current_period_ends_at ?? null,
      subscription?.updated_at ?? null,
    ],
    queryFn: () => (subscription ? getEnabledFeatures() : Promise.resolve([] as string[])),
    enabled: enabled && subscriptionQuery.isSuccess,
  })
}

export type FeatureAccess = {
  /** true / false once known; undefined while loading. */
  data: boolean | undefined
  isLoading: boolean
}

export function useFeatureAccess(featureKey: string): FeatureAccess {
  const featuresQuery = useEnabledFeaturesQuery(Boolean(featureKey))
  const needsFallback = featuresQuery.isSuccess && featuresQuery.data === null

  // Fallback while the get_my_enabled_features migration is not applied: one check per feature, as before.
  const fallbackQuery = useQuery({
    queryKey: [...queryKeys.feature(featureKey), 'fallback'],
    queryFn: () => checkFeatureAccess(featureKey),
    enabled: Boolean(featureKey) && needsFallback,
  })

  if (needsFallback) return { data: fallbackQuery.data, isLoading: fallbackQuery.isLoading }
  return {
    data: Array.isArray(featuresQuery.data) ? featuresQuery.data.includes(featureKey) : undefined,
    isLoading: featuresQuery.isLoading,
  }
}

export function useJobCreationEntitlementQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.jobCreationEntitlement,
    queryFn: getJobCreationEntitlement,
    enabled,
  })
}

export function useFreeTrialCancellationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setFreeTrialCancellation,
    onSuccess: () => invalidateSubscriptionQueries(queryClient),
  })
}

export function useStartSubscriptionCheckoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: startPaidPlanUpgrade,
    onSuccess: () => invalidateSubscriptionQueries(queryClient),
  })
}

export function invalidateSubscriptionQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: queryKeys.subscription })
  void queryClient.invalidateQueries({ queryKey: queryKeys.settings })
  void queryClient.invalidateQueries({ queryKey: ['feature-access'] })
  void queryClient.invalidateQueries({ queryKey: queryKeys.jobCreationEntitlement })
}
