-- A: Allow 'late_backfill' as resolved_after_reminder value
ALTER TABLE public.sms_reminder_cases
  DROP CONSTRAINT IF EXISTS sms_reminder_cases_resolved_after_reminder_check;

ALTER TABLE public.sms_reminder_cases
  ADD CONSTRAINT sms_reminder_cases_resolved_after_reminder_check
  CHECK (resolved_after_reminder IS NULL OR resolved_after_reminder IN (
    'same_day',
    'next_morning',
    'next_midday',
    'friday_summary',
    'self',
    'late_backfill'
  ));

-- B: Bulk-resolve eksisterende stale cases hvor timer reelt er fyldt op
WITH case_hours AS (
  SELECT
    c.id,
    c.hours_expected,
    COALESCE(SUM(r.duration), 0) as registered
  FROM public.sms_reminder_cases c
  LEFT JOIN public.daily_time_registrations r
    ON r.hn_user_id = c.hn_user_id AND r.date = c.missing_date
  WHERE c.status = 'open'
  GROUP BY c.id, c.hours_expected
)
UPDATE public.sms_reminder_cases c
SET
  status = 'resolved',
  resolved_at = now(),
  hours_registered_at_resolution = case_hours.registered,
  resolved_after_reminder = 'late_backfill'
FROM case_hours
WHERE c.id = case_hours.id
  AND case_hours.registered >= case_hours.hours_expected;

-- Cron-job: daglig cleanup kl. 02:00 UTC (04:00 CET), før remind-yesterday morgen
SELECT cron.schedule(
  'cleanup-stale-cases-daily',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url:='https://femtmeufuuwrwachkjux.supabase.co/functions/v1/cleanup-stale-cases',
    headers:='{"Content-Type": "application/json", "x-cron-secret": "CD2qKNR+K2bk0+6ElJn3XbdYTQF+lRt0Vo5Yu44RaXo="}'::jsonb,
    body:='{"time": "scheduled"}'::jsonb
  ) AS request_id;
  $$
);