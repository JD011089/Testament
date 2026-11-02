-- Testament push dispatcher setup.
--
-- One-time prerequisites:
--   1. Store the shared dispatcher secret in Supabase Vault:
--        select vault.create_secret('<NOTIFICATION_CRON_SECRET>', 'testament_cron_secret');
--      The same value must exist as NOTIFICATION_CRON_SECRET in Vercel production.
--   2. Deploy the app so /api/notifications/dispatch is live.
--
-- Then run this file with:
--   supabase db query --linked --file supabase/push-dispatch-cron.sql
--
-- pg_cron wakes this every five minutes. pg_net calls the Vercel dispatcher,
-- which sends Web Push messages to every subscription whose local reminder
-- time is due. This is what allows notifications to arrive with the app closed.

do $$
begin
  if exists (select 1 from cron.job where jobname = 'testament-push-dispatch') then
    perform cron.unschedule('testament-push-dispatch');
  end if;
end $$;

select cron.schedule(
  'testament-push-dispatch',
  '*/5 * * * *',
  $job$
  select net.http_post(
    url := 'https://testament-bible-learning.vercel.app/api/notifications/dispatch',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'testament_cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 10000
  );
  $job$
);
