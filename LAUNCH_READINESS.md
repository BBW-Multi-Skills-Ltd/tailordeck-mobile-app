# TailorDeck Launch Readiness

## Security Controls In Place

- Supabase Auth owns user identity and password hashing.
- Frontend uses only `VITE_SUPABASE_ANON_KEY`; service-role access is limited to Edge Functions.
- Core user tables are protected by RLS and scoped by `auth.uid()`.
- Child tables now validate that linked jobs/clients belong to the same user.
- Storage buckets are private and storage paths are user-scoped.
- Subscription/payment writes are handled through Supabase Edge Functions.
- Paystack webhook verifies `x-paystack-signature` before updating subscription state.
- Paystack initialization and verification require an authenticated Supabase session.
- Public plan tables are read-only from the browser.
- App has a runtime error boundary and optional Sentry reporting through `VITE_SENTRY_DSN`.
- Vercel deployment has baseline security headers.

## Known Security Notes

- React Router currently has a high-severity npm advisory in the latest compatible `react-router-dom@7.18.2` dependency path. TailorDeck is a client-rendered SPA and does not use React Router SSR/RSC mode, but this should still be reviewed again before launch and upgraded as soon as a patched compatible release is available.
- Do not commit `.env` or any Paystack/Supabase service-role secrets.
- Keep Supabase RLS enabled on every new table before frontend wiring.

## Manual QA Before Each Release

- New install opens splash, then onboarding welcome, then setup, then signup, then email OTP, then plan, then home.
- Returning logged-out user opens sign-in, not onboarding.
- Signup rejects missing/invalid name, email, phone, password, and mismatched confirm password.
- Email OTP accepts the latest code, auto-verifies when complete, clears stale/invalid codes, and resends with rate-limit feedback.
- Free trial unlocks Pro-level trial features during trial.
- Starter only exposes Starter features.
- Pro exposes invoice/receipt PDF, sharing, dashboard analytics, and full document setup.
- New job required fields shake/show field-level errors before progressing.
- Save as draft persists draft and redirects to drafts/jobs view.
- Finalize job creates client, job, people, measurements, expenses, photos, and redirects correctly.
- Job details opens the exact created job and measurement page shows saved measurements.
- Invoice and receipt previews render, zoom, and share via WhatsApp without flashing broken layouts.
- Business/shop setup saves logo, signature, contact details, social handles, and RC number.
- Account & Security saves profile changes and password flows behave correctly.
- Dashboard values are account-specific and update after jobs are created/completed.
- Notifications open from the right drawer, mark read/delete/clear correctly.
- Sign out asks for confirmation and returns to sign-in.

## Backend Migration Rules

- Every SQL change must be committed under `supabase/migrations`.
- Push backend migrations with `npx supabase db push`.
- Deploy changed Edge Functions with `npx supabase functions deploy <function-name>`.
- Never change Supabase manually without pulling/recording the migration afterward.

## Launch Blockers To Recheck

- React Router advisory status.
- Real Paystack live keys and webhook URL.
- Custom TailorDeck domain and production SMTP sender.
- Sentry DSN configured on Vercel.
- Final mobile PWA install test on Android Chrome and iOS Safari.
