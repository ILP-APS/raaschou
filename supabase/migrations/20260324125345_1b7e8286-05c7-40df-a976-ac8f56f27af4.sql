-- First unschedule old cron jobs that use anon key
SELECT cron.unschedule('check-today-mon-thu');
SELECT cron.unschedule('remind-yesterday-morning');
SELECT cron.unschedule('remind-yesterday-midday');
SELECT cron.unschedule('friday-summary');

-- Recreate cron jobs with x-cron-secret header
-- The CRON_SECRET value needs to be inserted via vault
-- For now, use a placeholder that will be updated via edge function
SELECT cron.schedule(
  'check-today-mon-thu',
  '10 13 * * 1-4',
  $$
  SELECT net.http_post(
    url:='https://femtmeufuuwrwachkjux.supabase.co/functions/v1/check-today',
    headers:='{"Content-Type": "application/json", "x-cron-secret": "PLACEHOLDER"}'::jsonb,
    body:='{"time": "scheduled"}'::jsonb
  ) AS request_id;
  $$
);

SELECT cron.schedule(
  'remind-yesterday-morning',
  '0 5 * * 2-5',
  $$
  SELECT net.http_post(
    url:='https://femtmeufuuwrwachkjux.supabase.co/functions/v1/remind-yesterday',
    headers:='{"Content-Type": "application/json", "x-cron-secret": "PLACEHOLDER"}'::jsonb,
    body:='{"time": "scheduled"}'::jsonb
  ) AS request_id;
  $$
);

SELECT cron.schedule(
  'remind-yesterday-midday',
  '50 9 * * 2-5',
  $$
  SELECT net.http_post(
    url:='https://femtmeufuuwrwachkjux.supabase.co/functions/v1/remind-yesterday',
    headers:='{"Content-Type": "application/json", "x-cron-secret": "PLACEHOLDER"}'::jsonb,
    body:='{"time": "scheduled"}'::jsonb
  ) AS request_id;
  $$
);

SELECT cron.schedule(
  'friday-summary',
  '40 12 * * 5',
  $$
  SELECT net.http_post(
    url:='https://femtmeufuuwrwachkjux.supabase.co/functions/v1/friday-summary',
    headers:='{"Content-Type": "application/json", "x-cron-secret": "PLACEHOLDER"}'::jsonb,
    body:='{"time": "scheduled"}'::jsonb
  ) AS request_id;
  $$
);