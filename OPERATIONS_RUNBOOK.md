# TailorDeck Operations Runbook

## Release Checklist

1. Run local checks.

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

2. Push database migrations.

```bash
npx supabase db push
```

3. Deploy changed Edge Functions.

```bash
npx supabase functions deploy paystack-initialize-subscription
npx supabase functions deploy paystack-verify-transaction
npx supabase functions deploy paystack-webhook
```

4. Commit and push frontend changes so Vercel deploys.

5. Test the live Vercel URL on desktop and installed mobile PWA.

## Supabase Backup Discipline

- Before launch-critical migrations, create a Supabase backup from Dashboard if the plan supports it.
- Export a schema snapshot before high-risk changes.

```bash
npx supabase db pull
```

- Keep every SQL change in `supabase/migrations`.
- Never rely on Dashboard-only SQL as the source of truth.

## Rollback Rules

- Prefer forward fixes. Do not edit migrations already applied to production.
- For a failed migration, stop and inspect the exact failing row or constraint.
- If a frontend release breaks, rollback the Vercel deployment first.
- If an Edge Function breaks, redeploy the last known-good function source.
- If a database migration causes bad data behavior, ship a corrective migration instead of manually changing production rows unless it is an emergency.

## Incident Response

1. Check Vercel deployment logs.
2. Check Supabase Auth logs for login/signup/OTP issues.
3. Check Supabase Edge Function logs for Paystack errors.
4. Check Supabase Database logs for RLS or constraint errors.
5. If Sentry is configured, inspect the latest frontend exceptions.
6. Reproduce on a test account before changing production data.

## Secrets

- Frontend may only use `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and public DSNs.
- Never put `SUPABASE_SERVICE_ROLE_KEY` in Vercel frontend env.
- Paystack secret keys must stay in Supabase Edge Function secrets.

## Rate Limits

- Supabase Auth owns OTP/email rate limits.
- Paystack initialize is limited per user in `edge_rate_limits`.
- Paystack verify is limited per user in `edge_rate_limits`.
- Add new Edge Function actions to the same rate-limit helper before exposing them to the frontend.
