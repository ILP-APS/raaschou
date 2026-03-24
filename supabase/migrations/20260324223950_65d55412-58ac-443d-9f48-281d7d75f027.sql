-- Delete SMS logs for the 19 wrong cases (employees who had 7.5h but got cases anyway)
DELETE FROM sms_reminder_logs
WHERE case_id IN (
  SELECT c.id FROM sms_reminder_cases c
  JOIN daily_time_registrations r ON r.hn_user_id = c.hn_user_id AND r.date = c.missing_date
  WHERE c.missing_date = '2026-03-24' AND c.status = 'open'
  GROUP BY c.id
  HAVING COALESCE(SUM(r.duration), 0) >= 7.5
);

-- Delete the 19 wrong cases themselves
DELETE FROM sms_reminder_cases
WHERE id IN (
  SELECT c.id FROM sms_reminder_cases c
  JOIN daily_time_registrations r ON r.hn_user_id = c.hn_user_id AND r.date = c.missing_date
  WHERE c.missing_date = '2026-03-24' AND c.status = 'open'
  GROUP BY c.id
  HAVING COALESCE(SUM(r.duration), 0) >= 7.5
);