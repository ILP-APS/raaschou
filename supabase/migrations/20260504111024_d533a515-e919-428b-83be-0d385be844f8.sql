CREATE OR REPLACE VIEW public.sms_log_summary_per_case AS
SELECT
  case_id,
  COUNT(*)::int as sms_count,
  MAX(sent_at) as last_sent_at
FROM public.sms_reminder_logs
WHERE case_id IS NOT NULL
GROUP BY case_id;

GRANT SELECT ON public.sms_log_summary_per_case TO authenticated;
GRANT SELECT ON public.sms_log_summary_per_case TO service_role;