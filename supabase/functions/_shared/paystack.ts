import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.107.0'

export type BillingCycle = 'monthly' | 'yearly'
export type PaidPlanName = 'starter' | 'pro'

export type PaystackVerifyResponse = {
  status: boolean
  message: string
  data?: {
    status: string
    reference: string
    amount: number
    paid_at?: string
    metadata?: {
      user_id?: string
      plan_name?: PaidPlanName
      billing_cycle?: BillingCycle
    }
    customer?: {
      customer_code?: string
      email?: string
    }
    authorization?: {
      authorization_code?: string
    }
    subscription?: {
      subscription_code?: string
    }
    plan?: {
      plan_code?: string
    }
  }
}

export const paidPlanPricesKobo: Record<PaidPlanName, Record<BillingCycle, number>> = {
  starter: { monthly: 250000, yearly: 2400000 },
  pro: { monthly: 450000, yearly: 4200000 },
}

export function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

export function createUserClient(authHeader: string) {
  return createClient(getRequiredEnv('SUPABASE_URL'), getRequiredEnv('SUPABASE_ANON_KEY'), {
    global: { headers: { Authorization: authHeader } },
  })
}

export function createAdminClient() {
  return createClient(getRequiredEnv('SUPABASE_URL'), getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'))
}

export function getPaystackPlanCode(planName: PaidPlanName, billingCycle: BillingCycle): string | undefined {
  const key = `PAYSTACK_${planName.toUpperCase()}_${billingCycle.toUpperCase()}_PLAN_CODE`
  return Deno.env.get(key) || undefined
}

export function getPeriodEndIso(billingCycle: BillingCycle, from = new Date()): string {
  const next = new Date(from)
  next.setDate(next.getDate() + (billingCycle === 'yearly' ? 365 : 30))
  return next.toISOString()
}

export async function updateSubscriptionFromCharge(data: NonNullable<PaystackVerifyResponse['data']>) {
  const userId = data.metadata?.user_id
  const planName = data.metadata?.plan_name
  const billingCycle = data.metadata?.billing_cycle

  if (!userId || !planName || !billingCycle) {
    throw new Error('Payment metadata is incomplete.')
  }

  const admin = createAdminClient()
  const paidAt = data.paid_at || new Date().toISOString()
  const { data: subscription, error } = await admin
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        plan_name: planName,
        status: 'active',
        billing_cycle: billingCycle,
        cancel_at_period_end: false,
        current_period_ends_at: getPeriodEndIso(billingCycle, new Date(paidAt)),
        trial_ends_at: null,
        payment_status: 'paid',
        pending_payment_reference: null,
        last_payment_reference: data.reference,
        last_payment_at: paidAt,
        paystack_customer_code: data.customer?.customer_code ?? null,
        paystack_subscription_code: data.subscription?.subscription_code ?? null,
        paystack_plan_code: data.plan?.plan_code ?? getPaystackPlanCode(planName, billingCycle) ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single()

  if (error) throw error
  return subscription
}
