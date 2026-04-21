-- 1. Udvid daily_time_registrations
ALTER TABLE public.daily_time_registrations
  ADD COLUMN hn_work_type_id INTEGER,
  ADD COLUMN hn_appointment_category_id INTEGER;

CREATE INDEX idx_daily_reg_worktype ON public.daily_time_registrations(hn_work_type_id);
CREATE INDEX idx_daily_reg_appcat ON public.daily_time_registrations(hn_appointment_category_id);

-- 2. appointment_categories
CREATE TABLE public.appointment_categories (
  hn_appointment_category_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.appointment_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on appointment_categories"
  ON public.appointment_categories FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read appointment_categories"
  ON public.appointment_categories FOR SELECT TO authenticated USING (true);
GRANT ALL ON public.appointment_categories TO service_role;
GRANT SELECT ON public.appointment_categories TO authenticated;

-- 3. appointment_worktypes
CREATE TABLE public.appointment_worktypes (
  hn_work_type_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  api_internal BOOLEAN NOT NULL DEFAULT FALSE,
  hidden BOOLEAN NOT NULL DEFAULT FALSE,
  synced_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.appointment_worktypes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on appointment_worktypes"
  ON public.appointment_worktypes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read appointment_worktypes"
  ON public.appointment_worktypes FOR SELECT TO authenticated USING (true);
GRANT ALL ON public.appointment_worktypes TO service_role;
GRANT SELECT ON public.appointment_worktypes TO authenticated;

-- 4. time_utilization_settings
CREATE TABLE public.time_utilization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_appointment_category_ids INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
  intern_work_type_ids INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
  updated_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO public.time_utilization_settings (
  intern_appointment_category_ids,
  intern_work_type_ids
) VALUES (
  ARRAY[2257, 9744],
  ARRAY[4326, 11591]
);
ALTER TABLE public.time_utilization_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access on time_utilization_settings"
  ON public.time_utilization_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on time_utilization_settings"
  ON public.time_utilization_settings FOR ALL TO service_role USING (true) WITH CHECK (true);
GRANT ALL ON public.time_utilization_settings TO service_role;
GRANT ALL ON public.time_utilization_settings TO authenticated;

-- 5. time_utilization_employees
CREATE TABLE public.time_utilization_employees (
  hn_user_id INTEGER PRIMARY KEY,
  employee_name TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.time_utilization_employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access on time_utilization_employees"
  ON public.time_utilization_employees FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on time_utilization_employees"
  ON public.time_utilization_employees FOR ALL TO service_role USING (true) WITH CHECK (true);
GRANT ALL ON public.time_utilization_employees TO service_role;
GRANT ALL ON public.time_utilization_employees TO authenticated;