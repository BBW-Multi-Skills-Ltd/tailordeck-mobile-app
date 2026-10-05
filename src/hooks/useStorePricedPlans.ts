import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { SubscriptionPlanCard } from '../lib/subscriptionPlans'
import {
  getGooglePlaySubscriptionPrices,
  isGooglePlayBillingRuntime,
  toGooglePlayProductId,
} from '../services/googlePlayBillingService'
import { queryKeys } from './queryKeys'

/**
 * On Android, swaps the hard-coded plan prices for the prices Google Play will actually charge,
 * so the card can never disagree with the Play purchase sheet. Web shows the list prices below.
 */
export function useStorePricedPlans<TPlan extends SubscriptionPlanCard>(plans: TPlan[]): TPlan[] {
  const pricesQuery = useQuery({
    queryKey: queryKeys.googlePlayPrices,
    queryFn: getGooglePlaySubscriptionPrices,
    enabled: isGooglePlayBillingRuntime(),
    staleTime: 30 * 60 * 1000,
    retry: 1,
  })
  const prices = pricesQuery.data

  return useMemo(() => {
    if (!prices?.length) return plans

    return plans.map((plan) => {
      if (plan.id === 'free') return plan
      const productId = toGooglePlayProductId(plan.id)
      const price = { ...plan.price }
      for (const item of prices) {
        if (item.productId === productId && item.formattedPrice) price[item.basePlanId] = item.formattedPrice
      }
      return { ...plan, price }
    })
  }, [plans, prices])
}
