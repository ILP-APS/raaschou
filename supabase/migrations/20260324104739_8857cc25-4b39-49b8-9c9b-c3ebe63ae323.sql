
-- Set up cron jobs for SMS reminder edge functions
-- These contain project-specific URLs and keys

SELECT cron.schedule(
  'check-today-mon-thu',
  '10 13 * * 1-4',
  $$
  SELECT net.http_post(
    url:='https://femtmeufuuwrwachkjux.supabase.co/functions/v1/check-today',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXRtZXVmdXV3cndhY2hranV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTIxOTYsImV4cCI6MjA4OTQ4ODE5Nn0.HwvWpC_Pp4zgVByTeEKmXHU3bsgw-tEGbNUo4Ouvc_U"}'::jsonb,
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
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXRtZXVmdXV3cndhY2hranV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTIxOTYsImV4cCI6MjA4OTQ4ODE5Nn0.HwvWpC_Pp4zgVByTeEKmXHU3bsgw-tEGbNUo4Ouvc_U"}'::jsonb,
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
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXRtZXVmdXV3cndhY2hranV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTIxOTYsImV4cCI6MjA4OTQ4ODE5Nn0.HwvWpC_Pp4zgVByTeEKmXHU3bsgw-tEGbNUo4Ouvc_U"}'::jsonb,
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
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXRtZXVmdXV3cndhY2hranV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTIxOTYsImV4cCI6MjA4OTQ4ODE5Nn0.HwvWpC_Pp4zgVByTeEKmXHU3bsgw-tEGbNUo4Ouvc_U"}'::jsonb,
    body:='{"time": "scheduled"}'::jsonb
  ) AS request_id;
  $$
);
