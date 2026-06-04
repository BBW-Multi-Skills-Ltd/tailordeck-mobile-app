import { useQuery } from '@tanstack/react-query'
import { checkFeatureAccess, getSubscription } from '../services/subscriptionService'
import { queryKeys } from './queryKeys'

export function useSubscriptionQuery() {
  return useQuery({ queryKey: queryKeys.subscription, queryFn: getSubscription })
}

export function useFeatureAccess(featureKey: string) {
  return useQuery({ queryKey: queryKeys.feature(featureKey), queryFn: () => checkFeatureAccess(featureKey), enabled: Boolean(featureKey) })
}
