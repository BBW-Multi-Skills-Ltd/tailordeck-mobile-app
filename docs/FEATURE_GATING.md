# TailorDeck Feature Gating

TailorDeck feature access is enforced by Supabase, not by frontend-only checks.

## Source Of Truth

- Plans are stored in `public.plans`.
- Plan permissions are stored in `public.plan_features`.
- Frontend reads access through `public.has_feature_access(feature_key_value text)`.
- Frontend must not decide paid access from local storage alone.

## Current Feature Keys

| Feature key | Free trial | Starter | Pro | Purpose |
| --- | --- | --- | --- | --- |
| `pdf_export` | Yes, while active | No | Yes | Export generated invoice/receipt PDF. |
| `document_sending` | Yes, while active | No | Yes | Share/send invoice and receipt PDFs. |
| `dashboard_analytics` | Yes, while active | No | Yes | Revenue, expenses, profit, and status analytics. |
| `full_document_setup` | Yes, while active | No | Yes | Logo, signature, and full business details on documents. |

## Product Rules

- Active free trial users get Pro-level access until `trial_ends_at` or `tester_trial_ends_at`.
- Starter users keep core shop operations: jobs, clients created from jobs, measurements, costing, expenses, reminders, and basic records.
- Pro users get all Starter features plus PDF export, document sending, dashboard analytics, and full document setup.
- Expired or past-due users must be redirected to subscription recovery before using protected app areas.
- Paid users with `cancel_at_period_end = true` keep access until `current_period_ends_at`.

## Frontend Rules

- Use `useFeatureAccess(featureKeys.someFeature)` for gated UI.
- Treat loading/unknown access as pending, not locked.
- Only show upgrade locks when access query returns `false`.
- Invalidate `queryKeys.subscription`, `queryKeys.settings`, and `['feature-access']` after subscription changes.

## Backend Rules

- `plans` and `plan_features` are read-only to frontend roles.
- Only migrations/service-role backend code should modify plan configuration.
- RLS and the `has_feature_access` RPC remain the security boundary.
