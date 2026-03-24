
-- Allow authenticated users to insert/update/delete sms_automation_employees (for admin UI)
CREATE POLICY "Authenticated insert sms_automation_employees"
  ON public.sms_automation_employees FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated update sms_automation_employees"
  ON public.sms_automation_employees FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated delete sms_automation_employees"
  ON public.sms_automation_employees FOR DELETE TO authenticated USING (true);

-- Allow authenticated users to insert/update employee_work_schedules
CREATE POLICY "Authenticated insert employee_work_schedules"
  ON public.employee_work_schedules FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated update employee_work_schedules"
  ON public.employee_work_schedules FOR UPDATE TO authenticated USING (true);

GRANT INSERT, UPDATE, DELETE ON public.sms_automation_employees TO authenticated;
GRANT INSERT, UPDATE ON public.employee_work_schedules TO authenticated;
