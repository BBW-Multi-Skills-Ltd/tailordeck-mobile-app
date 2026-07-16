import { useQuery } from '@tanstack/react-query'
import { checkFeatureAccess, getSubscription } from '../services/subscriptionService'
import { queryKeys } from './queryKeys'

export function useSubscriptionQuery(enabled = true) {
  return useQuery({ queryKey: queryKeys.subscription, queryFn: getSubscription, enabled })
}

export function useFeatureAccess(featureKey: string) {
  return useQuery({ queryKey: queryKeys.feature(featureKey), queryFn: () => checkFeatureAccess(featureKey), enabled: Boolean(featureKey) })
}
