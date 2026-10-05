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
