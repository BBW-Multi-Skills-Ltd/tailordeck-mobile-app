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
      id?: number
    }
    authorization?: {
      authorization_code?: string
    }
    subscription?: {
      subscription_code?: string
      email_token?: string
    }
    plan?: {
      plan_code?: string
      id?: number
    }
    email_token?: string
  }
}

type PaystackSubscriptionListResponse = {
  status: boolean
  message: string
  data?: Array<{
    createdAt?: string
    customer?: {
      customer_code?: string
      email?: string
      id?: number
    }
    email_token?: string
    next_payment_date?: string
    plan?: {
      plan_code?: string
      id?: number
    }
    status?: string
    subscription_code?: string
    updatedAt?: string
  }>
}

export type PaystackSubscriptionRecord = NonNullable<PaystackSubscriptionListResponse['data']>[number]

export type PaystackSubscriptionEventData = {
  customer?: {
    customer_code?: string
    email?: string
    id?: number
  }
  email_token?: string
  next_payment_date?: string
  plan?: {
    plan_code?: string
    id?: number
  }
  status?: string
  subscription_code?: string
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

export function getRequiredPaystackPlanCode(planName: PaidPlanName, billingCycle: BillingCycle): string {
  const key = `PAYSTACK_${planName.toUpperCase()}_${billingCycle.toUpperCase()}_PLAN_CODE`
  const value = Deno.env.get(key)
  if (!value) throw new Error(`Missing ${key}`)
  return value
}

export function getPeriodEndIso(billingCycle: BillingCycle, from = new Date()): string {
  const next = new Date(from)
  next.setDate(next.getDate() + (billingCycle === 'yearly' ? 365 : 30))
  return next.toISOString()
}

function latestSubscription(subscriptions: PaystackSubscriptionRecord[]) {
  return subscriptions.sort((first, second) => {
    const firstDate = new Date(first.updatedAt || first.createdAt || 0).getTime()
    const secondDate = new Date(second.updatedAt || second.createdAt || 0).getTime()
    return secondDate - firstDate
  })[0]
}

export async function findPaystackSubscriptionForCustomerPlan(params: {
  customerCode?: string | null
  customerEmail?: string | null
  planCode?: string | null
}): Promise<PaystackSubscriptionRecord | null> {
  const { customerCode, customerEmail, planCode } = params
  if (!customerCode && !customerEmail) return null

  const response = await fetch('https://api.paystack.co/subscription?perPage=50', {
    headers: {
      Authorization: `Bearer ${getRequiredEnv('PAYSTACK_SECRET_KEY')}`,
    },
  })
  const body = (await response.json()) as PaystackSubscriptionListResponse
  if (!response.ok || !body.status || !body.data) return null

  const matches = body.data.filter((subscription) => {
    const sameCustomer =
      (customerCode && subscription.customer?.customer_code === customerCode) ||
      (customerEmail && subscription.customer?.email === customerEmail)
    const samePlan = planCode ? subscription.plan?.plan_code === planCode : true
    return sameCustomer && samePlan && subscription.subscription_code
  })

  return matches.length ? latestSubscription(matches) : null
}

async function findPaystackSubscriptionForCharge(data: NonNullable<PaystackVerifyResponse['data']>, planName: PaidPlanName, billingCycle: BillingCycle) {
  return findPaystackSubscriptionForCustomerPlan({
    customerCode: data.customer?.customer_code,
    customerEmail: data.customer?.email,
    planCode: data.plan?.plan_code ?? getPaystackPlanCode(planName, billingCycle),
  })
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
  const { data: existingSubscription } = await admin
    .from('subscriptions')
    .select('paystack_subscription_code,paystack_email_token,paystack_plan_code,current_period_ends_at')
    .eq('user_id', userId)
    .maybeSingle()
  const listedSubscription = await findPaystackSubscriptionForCharge(data, planName, billingCycle)
  const subscriptionCode = data.subscription?.subscription_code ?? listedSubscription?.subscription_code ?? existingSubscription?.paystack_subscription_code ?? null
  const emailToken = data.subscription?.email_token ?? data.email_token ?? listedSubscription?.email_token ?? existingSubscription?.paystack_email_token ?? null
  const periodEndsAt = listedSubscription?.next_payment_date || getPeriodEndIso(billingCycle, new Date(paidAt))
  const { data: subscription, error } = await admin
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        plan_name: planName,
        status: 'active',
        billing_cycle: billingCycle,
        cancel_at_period_end: false,
        current_period_ends_at: periodEndsAt,
        trial_ends_at: null,
        payment_status: 'paid',
        pending_payment_reference: null,
        last_payment_reference: data.reference,
        last_payment_at: paidAt,
        paystack_customer_code: data.customer?.customer_code ?? null,
        paystack_subscription_code: subscriptionCode,
        paystack_email_token: emailToken,
        paystack_plan_code: data.plan?.plan_code ?? existingSubscription?.paystack_plan_code ?? getPaystackPlanCode(planName, billingCycle) ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single()

  if (error) throw error
  return subscription
}

export async function updateSubscriptionFromPaystackSubscriptionEvent(data: PaystackSubscriptionEventData) {
  const customerCode = data.customer?.customer_code
  const planCode = data.plan?.plan_code
  const subscriptionCode = data.subscription_code

  if (!customerCode || !planCode || !subscriptionCode) return null

  const admin = createAdminClient()
  const updateValues: Record<string, unknown> = {
    paystack_email_token: data.email_token ?? null,
    paystack_subscription_code: subscriptionCode,
    paystack_plan_code: planCode,
    updated_at: new Date().toISOString(),
  }

  if (data.next_payment_date) updateValues.current_period_ends_at = data.next_payment_date

  const { data: subscription, error } = await admin
    .from('subscriptions')
    .update(updateValues)
    .eq('paystack_customer_code', customerCode)
    .eq('paystack_plan_code', planCode)
    .select('*')
    .maybeSingle()

  if (error) throw error
  return subscription
}
