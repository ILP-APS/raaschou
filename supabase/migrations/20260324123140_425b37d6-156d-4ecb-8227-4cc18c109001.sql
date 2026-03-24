-- Clean up duplicate worktime rows (vacation/sickness/private with null appointment_id)
-- Keep only the most recent row per (hn_user_id, date, category) where hn_appointment_id IS NULL
DELETE FROM daily_time_registrations
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY hn_user_id, date, category
      ORDER BY synced_at DESC NULLS LAST
    ) as rn
    FROM daily_time_registrations
    WHERE hn_appointment_id IS NULL
  ) sub
  WHERE rn > 1
)