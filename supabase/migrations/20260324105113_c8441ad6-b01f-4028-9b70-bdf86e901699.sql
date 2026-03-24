
CREATE TABLE public.sms_automation_employees (
  hn_user_id INTEGER PRIMARY KEY,
  employee_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  added_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sms_automation_employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on sms_automation_employees"
  ON public.sms_automation_employees FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated read sms_automation_employees"
  ON public.sms_automation_employees FOR SELECT TO authenticated USING (true);

GRANT ALL ON public.sms_automation_employees TO service_role;
GRANT SELECT ON public.sms_automation_employees TO authenticated;
