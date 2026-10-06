-- Daily Google Play subscription sync (renewals, cancellations, failed payments, refunds).
-- pg_cron calls the google-play-daily-sync edge function at 02:00 UTC (03:00 Lagos) via pg_net.
--
-- The shared secret is NOT stored in this file. Before this job can succeed, set the same random value in:
--   1. Edge function secret:  GOOGLE_PLAY_SYNC_SECRET
--   2. Vault:                 select vault.create_secret('<value>', 'google_play_sync_secret');
-- See OPERATIONS_RUNBOOK.md ("Google Play daily sync").

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

grant usage on schema cron to postgres;

select cron.unschedule(jobid)
from cron.job
where jobname = 'google-play-daily-sync';

select cron.schedule(
  'google-play-daily-sync',
  '0 2 * * *',
  $job$
  select net.http_post(
    url := 'https://eebwrtrrslouqlfoxhkw.supabase.co/functions/v1/google-play-daily-sync',
    headers := jsonb_build_object(
      'content-type', 'application/json',
      'x-sync-secret', (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'google_play_sync_secret'
        limit 1
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
  $job$
);
