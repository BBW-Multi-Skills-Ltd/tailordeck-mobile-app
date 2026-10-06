-- Daily permanent deletion of accounts whose 14-day deletion grace period has ended.
-- pg_cron calls process-due-account-deletions at 03:00 UTC (04:00 Lagos) with dryRun = false.
--
-- The shared secret is NOT stored here. It must match in:
--   1. Edge function secret:  ACCOUNT_CLEANUP_SECRET
--   2. Vault:                 account_cleanup_secret
-- See OPERATIONS_RUNBOOK.md ("Account deletion cleanup").

select cron.unschedule(jobid)
from cron.job
where jobname = 'process-due-account-deletions';

select cron.schedule(
  'process-due-account-deletions',
  '0 3 * * *',
  $job$
  select net.http_post(
    url := 'https://eebwrtrrslouqlfoxhkw.supabase.co/functions/v1/process-due-account-deletions',
    headers := jsonb_build_object(
      'content-type', 'application/json',
      'x-cleanup-secret', (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'account_cleanup_secret'
        limit 1
      )
    ),
    body := '{"dryRun": false, "batchSize": 100}'::jsonb,
    timeout_milliseconds := 120000
  );
  $job$
);
