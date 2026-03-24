
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 1. employee_work_schedules
CREATE TABLE public.employee_work_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hn_user_id INTEGER NOT NULL UNIQUE,
  employee_name TEXT NOT NULL,
  monday DECIMAL DEFAULT 7.5,
  tuesday DECIMAL DEFAULT 7.5,
  wednesday DECIMAL DEFAULT 7.5,
  thursday DECIMAL DEFAULT 7.5,
  friday DECIMAL DEFAULT 7.0,
  saturday DECIMAL DEFAULT 0,
  sunday DECIMAL DEFAULT 0,
  is_custom BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.employee_work_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on employee_work_schedules"
  ON public.employee_work_schedules FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated read employee_work_schedules"
  ON public.employee_work_schedules FOR SELECT TO authenticated USING (true);

-- 2. daily_time_registrations
CREATE TABLE public.daily_time_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hn_user_id INTEGER NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('work', 'internal', 'sickness', 'vacation', 'private')),
  duration DECIMAL NOT NULL,
  hn_appointment_id INTEGER,
  appointment_subject TEXT,
  appointment_project TEXT,
  description TEXT,
  synced_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(hn_user_id, date, category, hn_appointment_id)
);

CREATE INDEX idx_daily_reg_user_date ON public.daily_time_registrations(hn_user_id, date);

ALTER TABLE public.daily_time_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on daily_time_registrations"
  ON public.daily_time_registrations FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated read daily_time_registrations"
  ON public.daily_time_registrations FOR SELECT TO authenticated USING (true);

-- 3. sms_reminder_cases
CREATE TABLE public.sms_reminder_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hn_user_id INTEGER NOT NULL,
  missing_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  hours_expected DECIMAL NOT NULL,
  hours_registered_at_resolution DECIMAL,
  resolved_after_reminder TEXT CHECK (resolved_after_reminder IN ('same_day', 'next_morning', 'next_midday', 'friday_summary', 'self')),
  week_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  UNIQUE(hn_user_id, missing_date)
);

CREATE INDEX idx_cases_status ON public.sms_reminder_cases(status, missing_date);

ALTER TABLE public.sms_reminder_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on sms_reminder_cases"
  ON public.sms_reminder_cases FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated read sms_reminder_cases"
  ON public.sms_reminder_cases FOR SELECT TO authenticated USING (true);

-- 4. sms_reminder_logs
CREATE TABLE public.sms_reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.sms_reminder_cases(id),
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('same_day', 'next_morning', 'next_midday', 'friday_summary')),
  sent_at TIMESTAMPTZ DEFAULT now(),
  sms_status TEXT,
  phone_number TEXT NOT NULL
);

CREATE INDEX idx_logs_case ON public.sms_reminder_logs(case_id);

ALTER TABLE public.sms_reminder_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on sms_reminder_logs"
  ON public.sms_reminder_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated read sms_reminder_logs"
  ON public.sms_reminder_logs FOR SELECT TO authenticated USING (true);

-- Grant permissions
GRANT ALL ON public.employee_work_schedules TO service_role;
GRANT SELECT ON public.employee_work_schedules TO authenticated;
GRANT ALL ON public.daily_time_registrations TO service_role;
GRANT SELECT ON public.daily_time_registrations TO authenticated;
GRANT ALL ON public.sms_reminder_cases TO service_role;
GRANT SELECT ON public.sms_reminder_cases TO authenticated;
GRANT ALL ON public.sms_reminder_logs TO service_role;
GRANT SELECT ON public.sms_reminder_logs TO authenticated;
