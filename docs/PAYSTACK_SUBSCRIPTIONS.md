# Paystack Subscriptions

TailorDeck paid plans must use Paystack recurring plans, not one-time transactions.

## Required Supabase Secrets

Set these secrets for the linked Supabase project:

```powershell
npx supabase secrets set PAYSTACK_STARTER_MONTHLY_PLAN_CODE=PLN_xxx
npx supabase secrets set PAYSTACK_STARTER_YEARLY_PLAN_CODE=PLN_xxx
npx supabase secrets set PAYSTACK_PRO_MONTHLY_PLAN_CODE=PLN_xxx
npx supabase secrets set PAYSTACK_PRO_YEARLY_PLAN_CODE=PLN_xxx
```

Existing required secrets:

```powershell
npx supabase secrets set PAYSTACK_SECRET_KEY=sk_test_or_live_xxx
npx supabase secrets set APP_URL=https://tailor-deck.vercel.app
```

## Paystack Dashboard Setup

Create one Paystack plan for each TailorDeck paid plan and billing cycle:

- Starter monthly: NGN 2,500 monthly
- Starter yearly: NGN 24,000 yearly
- Pro monthly: NGN 4,500 monthly
- Pro yearly: NGN 42,000 yearly

Copy each Paystack plan code into the matching Supabase secret.

## Webhook

Set the Paystack webhook URL to:

```text
https://eebwrtrrslouqlfoxhkw.supabase.co/functions/v1/paystack-webhook
```

## Safety Rule

The checkout Edge Function intentionally fails when a plan code is missing. This prevents a user from paying once without a real recurring subscription being created.

## Test Checklist

- Start Starter monthly checkout and confirm subscription becomes active.
- Cancel Starter monthly and confirm cancellation is scheduled.
- Keep Starter monthly active and confirm cancellation is removed.
- Start Pro monthly checkout and confirm subscription becomes active.
- Start Starter yearly checkout and confirm `billing_cycle = yearly`.
- Start Pro yearly checkout and confirm `billing_cycle = yearly`.
- Confirm Paystack returns `subscription_code` and `email_token` after payment.
