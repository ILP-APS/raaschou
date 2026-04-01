-- Sommertid-rettelse (CEST/UTC+2) fra 29. marts 2026

SELECT cron.unschedule('check-today-mon-thu');
SELECT cron.unschedule('remind-yesterday-morning');
SELECT cron.unschedule('remind-yesterday-midday');
SELECT cron.unschedule('friday-summary');

-- check-today: 15:10 dansk tid = 13:10 UTC (sommertid)
SELECT cron.schedule(
  'check-today-mon-thu',
  '10 13 * * 1-4',
  $$
  SELECT net.http_post(
    url:='https://femtmeufuuwrwachkjux.supabase.co/functions/v1/check-today',
    headers:='{"Content-Type": "application/json", "x-cron-secret": "CD2qKNR+K2bk0+6ElJn3XbdYTQF+lRt0Vo5Yu44RaXo="}'::jsonb,
    body:='{"time": "scheduled"}'::jsonb
  ) AS request_id;
  $$
);

-- remind-yesterday morgen: 07:00 dansk tid = 05:00 UTC (sommertid)
SELECT cron.schedule(
  'remind-yesterday-morning',
  '0 5 * * 2-5',
  $$
  SELECT net.http_post(
    url:='https://femtmeufuuwrwachkjux.supabase.co/functions/v1/remind-yesterday',
    headers:='{"Content-Type": "application/json", "x-cron-secret": "CD2qKNR+K2bk0+6ElJn3XbdYTQF+lRt0Vo5Yu44RaXo="}'::jsonb,
    body:='{"time": "scheduled"}'::jsonb
  ) AS request_id;
  $$
);

-- remind-yesterday middag: 11:50 dansk tid = 09:50 UTC (sommertid)
SELECT cron.schedule(
  'remind-yesterday-middag',
  '50 9 * * 2-5',
  $$
  SELECT net.http_post(
    url:='https://femtmeufuuwrwachkjux.supabase.co/functions/v1/remind-yesterday',
    headers:='{"Content-Type": "application/json", "x-cron-secret": "CD2qKNR+K2bk0+6ElJn3XbdYTQF+lRt0Vo5Yu44RaXo="}'::jsonb,
    body:='{"time": "scheduled"}'::jsonb
  ) AS request_id;
  $$
);

-- friday-summary: 14:40 dansk tid = 12:40 UTC (sommertid)
SELECT cron.schedule(
  'friday-summary',
  '40 12 * * 5',
  $$
  SELECT net.http_post(
    url:='https://femtmeufuuwrwachkjux.supabase.co/functions/v1/friday-summary',
    headers:='{"Content-Type": "application/json", "x-cron-secret": "CD2qKNR+K2bk0+6ElJn3XbdYTQF+lRt0Vo5Yu44RaXo="}'::jsonb,
    body:='{"time": "scheduled"}'::jsonb
  ) AS request_id;
  $$
);