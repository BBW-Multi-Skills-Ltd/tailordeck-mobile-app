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
npx supabase functions deploy google-play-verify-subscription
npx supabase functions deploy google-play-rtdn --no-verify-jwt
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
3. Check Supabase Edge Function logs for Google Play verification errors.
4. Check Supabase Database logs for RLS or constraint errors.
5. If Sentry is configured, inspect the latest frontend exceptions.
6. Reproduce on a test account before changing production data.

## Secrets

- Frontend may only use `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and public DSNs.
- Never put `SUPABASE_SERVICE_ROLE_KEY` in Vercel frontend env.
- The Google Play service account JSON must stay in Supabase Edge Function secrets.
- Set `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` as a single line. A multi-line JSON pasted into a shell or `.env` file gets truncated to `{` and breaks all Google Play verification:

```bash
node -e "console.log('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=' + JSON.stringify(require('./play-key.json')))" > play.env
npx supabase secrets set --env-file play.env   # then delete play.env
```

## Google Play daily sync

Without Pub/Sub, `google-play-daily-sync` is the server-side safety net. pg_cron job `google-play-daily-sync` calls it at 02:00 UTC (03:00 Lagos). It re-reads every linked Google Play purchase, updates renewals/cancellations/failed payments/refunds, then runs `process_due_subscription_downgrades`.

- Auth: header `x-sync-secret` must equal the `GOOGLE_PLAY_SYNC_SECRET` function secret. The cron job reads the same value from Vault secret `google_play_sync_secret`. To rotate, set both to the same new value.
- Deploy: `npx supabase functions deploy google-play-daily-sync --no-verify-jwt`
- Check the last runs: `select id, status_code, content, created from net._http_response order by id desc limit 5;`
- Run once now: execute the job's command (`select command from cron.job where jobname = 'google-play-daily-sync';`).

## Account deletion cleanup

pg_cron job `process-due-account-deletions` runs daily at 03:00 UTC (04:00 Lagos) with `dryRun: false`. It permanently deletes accounts whose 14-day grace period has ended (storage files, then the auth user) and writes an `account_audit_logs` row. Responses contain counts and user ids only, no emails or names.

- Auth: header `x-cleanup-secret` must equal the `ACCOUNT_CLEANUP_SECRET` function secret; the cron job reads the same value from Vault secret `account_cleanup_secret`. Rotate both together.
- Deploy: `npx supabase functions deploy process-due-account-deletions --no-verify-jwt`
- Practice run (deletes nothing): send the same request with body `{"dryRun": true}`.
- Google Play renewal is stopped when an account is scheduled for deletion (no refund): immediately via `google-play-cancel-for-deletion` (called by the app), daily by `google-play-daily-sync` as a backup, and again by this job before deleting. If Google cannot be reached the account is skipped and retried the next day.

## Google Play Real-time Developer Notifications

1. Google Cloud (same project as the Play service account): enable the Cloud Pub/Sub API and create topic `tailordeck-play-rtdn`.
2. On the topic, grant `google-play-developer-notifications@system.gserviceaccount.com` the **Pub/Sub Publisher** role.
3. Create a **push** subscription on the topic:
   - Endpoint: `https://eebwrtrrslouqlfoxhkw.supabase.co/functions/v1/google-play-rtdn`
   - Enable authentication, service account = the Play service account (`client_email` in the key), audience = the endpoint URL.
4. Play Console → Monetize with Play → Monetization setup → Real-time developer notifications: topic `projects/<project-id>/topics/tailordeck-play-rtdn`, then **Send test notification**. The function logs `test notification received`.
5. Overrides (optional secrets): `GOOGLE_RTDN_AUDIENCE`, `GOOGLE_RTDN_PUSH_SERVICE_ACCOUNT`.

## Rate Limits

- Supabase Auth owns OTP/email rate limits.
- Add new Edge Function actions to the same rate-limit helper before exposing them to the frontend.
