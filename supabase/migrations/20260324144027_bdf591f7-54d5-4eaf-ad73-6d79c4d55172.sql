-- Midlertidig vintertid-rettelse (CET/UTC+1) frem til 29. marts 2026
-- HUSK: Skift TILBAGE til sommertid-offsets (UTC+2) efter 29. marts

-- Fjern gamle cron-jobs
SELECT cron.unschedule('check-today-mon-thu');
SELECT cron.unschedule('remind-yesterday-morning');
SELECT cron.unschedule('remind-yesterday-midday');
SELECT cron.unschedule('friday-summary');

-- Opret nye med vintertid-offsets (UTC+1)
-- check-today: 15:10 dansk tid = 14:10 UTC (vintertid)
-- Sommertid (CEST/UTC+2) fra 29. marts — skift til 10 13 * * 1-4
SELECT cron.schedule(
  'check-today-mon-thu',
  '10 14 * * 1-4',
  $$
  SELECT net.http_post(
    url:='https://femtmeufuuwrwachkjux.supabase.co/functions/v1/check-today',
    headers:='{"Content-Type": "application/json", "x-cron-secret": "CD2qKNR+K2bk0+6ElJn3XbdYTQF+lRt0Vo5Yu44RaXo="}'::jsonb,
    body:='{"time": "scheduled"}'::jsonb
  ) AS request_id;
  $$
);

-- remind-yesterday morgen: 07:00 dansk tid = 06:00 UTC (vintertid)
-- Sommertid (CEST/UTC+2) fra 29. marts — skift til 0 5 * * 2-5
SELECT cron.schedule(
  'remind-yesterday-morning',
  '0 6 * * 2-5',
  $$
  SELECT net.http_post(
    url:='https://femtmeufuuwrwachkjux.supabase.co/functions/v1/remind-yesterday',
    headers:='{"Content-Type": "application/json", "x-cron-secret": "CD2qKNR+K2bk0+6ElJn3XbdYTQF+lRt0Vo5Yu44RaXo="}'::jsonb,
    body:='{"time": "scheduled"}'::jsonb
  ) AS request_id;
  $$
);

-- remind-yesterday middag: 11:50 dansk tid = 10:50 UTC (vintertid)
-- Sommertid (CEST/UTC+2) fra 29. marts — skift til 50 9 * * 2-5
SELECT cron.schedule(
  'remind-yesterday-midday',
  '50 10 * * 2-5',
  $$
  SELECT net.http_post(
    url:='https://femtmeufuuwrwachkjux.supabase.co/functions/v1/remind-yesterday',
    headers:='{"Content-Type": "application/json", "x-cron-secret": "CD2qKNR+K2bk0+6ElJn3XbdYTQF+lRt0Vo5Yu44RaXo="}'::jsonb,
    body:='{"time": "scheduled"}'::jsonb
  ) AS request_id;
  $$
);

-- friday-summary: 14:40 dansk tid = 13:40 UTC (vintertid)
-- Sommertid (CEST/UTC+2) fra 29. marts — skift til 40 12 * * 5
SELECT cron.schedule(
  'friday-summary',
  '40 13 * * 5',
  $$
  SELECT net.http_post(
    url:='https://femtmeufuuwrwachkjux.supabase.co/functions/v1/friday-summary',
    headers:='{"Content-Type": "application/json", "x-cron-secret": "CD2qKNR+K2bk0+6ElJn3XbdYTQF+lRt0Vo5Yu44RaXo="}'::jsonb,
    body:='{"time": "scheduled"}'::jsonb
  ) AS request_id;
  $$
);