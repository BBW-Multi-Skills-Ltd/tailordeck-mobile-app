# TailorDeck Architecture

## Product Shape

TailorDeck is a Vite React PWA for Nigerian tailors and fashion designers. The app supports onboarding, shop setup, client/job creation, measurements, costing, deadline reminders, dashboards, subscriptions, invoices, receipts, and account settings.

## Frontend Stack

- React + TypeScript
- Vite
- Tailwind CSS v4
- React Router
- React Query
- Zod for client-side validation
- Supabase JS client
- Supabase Auth
- Supabase Storage
- Supabase Edge Functions
- Paystack checkout through Edge Functions
- Optional Sentry monitoring via `VITE_SENTRY_DSN`

## Runtime Entry

- `src/main.tsx` initializes theme, monitoring, React Query, auth context, feedback context, router, and app shell.
- `src/App.tsx` owns route registration and lazy-loaded route-level splitting.
- `src/components/layout/RouteGuard.tsx` protects authenticated app routes and onboarding/subscription gates.
- `src/components/layout/AppLayout.tsx` owns the authenticated shell, header, bottom nav, and route outlet.

## Folder Boundaries

- `src/pages`: route-level screens only.
- `src/components`: reusable UI and feature components.
- `src/components/<feature>`: feature-specific components/hooks/helpers.
- `src/hooks`: React Query hooks and reusable app hooks.
- `src/services`: Supabase service layer. Pages should not call Supabase directly.
- `src/services/mappers`: database-row to UI-domain mapping.
- `src/services/jobs`: job-specific persistence builders and relation persistence.
- `src/lib`: low-level utilities and infrastructure clients.
- `src/validation`: Zod schemas and validation helpers.
- `src/types`: shared frontend domain types.
- `supabase/migrations`: versioned database schema, policy, function, and constraint changes.
- `supabase/functions`: server-side Edge Functions for privileged integrations.

## Data Access Rules

- UI components do not call Supabase directly.
- Pages use hooks from `src/hooks`.
- Hooks call services from `src/services`.
- Services return frontend domain shapes, not raw database rows.
- Mappers isolate backend column names from UI components.
- Money is stored in kobo and displayed in naira.
- Nigerian phone numbers are normalized before storage.
- Soft delete is used for user-owned records where history matters.

## Backend Security Model

- Supabase Auth owns identity and password hashing.
- RLS must stay enabled on every user-owned table.
- Browser code only uses the anon key.
- Service-role access is restricted to Supabase Edge Functions and migrations.
- User-owned rows must include `user_id`.
- Policies must scope reads/writes with `auth.uid() = user_id`.
- Child records must also verify referenced parent ownership, not just their own `user_id`.
- Storage buckets stay private.
- Storage object paths should begin with the authenticated user id.
- Plan and feature configuration is read-only from frontend.

## Payments

- Frontend never talks to Paystack with a secret key.
- Checkout initialization goes through `paystack-initialize-subscription`.
- Payment verification goes through `paystack-verify-transaction`.
- Paystack webhook uses HMAC signature validation before changing subscription state.
- Subscription state is read through Supabase services and feature-access hooks.

## Validation

- Frontend Zod validation improves UX and catches errors early.
- Backend constraints and RLS remain the authority.
- Never trust frontend validation for security.
- Required production constraints must be validated before launch.

## Migrations

- Every database change must be represented in `supabase/migrations`.
- Use `npx supabase db push` to apply local migrations to the linked project.
- If a manual SQL change is made in Supabase Dashboard, pull it back with `npx supabase db pull` and commit the migration.
- Do not delete or edit already-applied migrations unless the project is intentionally reset.

## Rollback Discipline

- For every risky migration, write a small rollback note in the PR/commit message.
- Prefer additive migrations over destructive migrations.
- For destructive changes, first ship a compatibility migration, then update code, then clean old schema later.
- Take a Supabase backup before launch-critical schema changes.
- If a production migration fails, stop, inspect dirty data, and fix with a forward migration.

## Scaling Notes

- Dashboard analytics should use server-side RPCs, not full-row frontend aggregation.
- List pages should use pagination or capped reads.
- Common filters must have indexes before launch traffic grows.
- Large documents/PDF libraries should stay route-split away from first app load.
- Images should be compressed before upload.

## Observability

- Configure `VITE_SENTRY_DSN` in Vercel for frontend error reporting.
- Monitor Supabase Auth logs during signup/OTP testing.
- Monitor Edge Function logs during Paystack testing.
- Record manual QA findings in `LAUNCH_READINESS.md` before each release.
