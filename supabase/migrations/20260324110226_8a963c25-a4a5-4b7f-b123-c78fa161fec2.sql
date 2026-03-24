
-- Allow anon role to read/insert/update/delete sms_automation_employees (dev preview uses anon)
CREATE POLICY "Anon read sms_automation_employees"
  ON public.sms_automation_employees FOR SELECT TO anon USING (true);

CREATE POLICY "Anon insert sms_automation_employees"
  ON public.sms_automation_employees FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon update sms_automation_employees"
  ON public.sms_automation_employees FOR UPDATE TO anon USING (true);

CREATE POLICY "Anon delete sms_automation_employees"
  ON public.sms_automation_employees FOR DELETE TO anon USING (true);

GRANT ALL ON public.sms_automation_employees TO anon;

-- Same for employee_work_schedules
CREATE POLICY "Anon read employee_work_schedules"
  ON public.employee_work_schedules FOR SELECT TO anon USING (true);

CREATE POLICY "Anon insert employee_work_schedules"
  ON public.employee_work_schedules FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon update employee_work_schedules"
  ON public.employee_work_schedules FOR UPDATE TO anon USING (true);

GRANT ALL ON public.employee_work_schedules TO anon;

-- Same for read access on cases and logs
CREATE POLICY "Anon read sms_reminder_cases"
  ON public.sms_reminder_cases FOR SELECT TO anon USING (true);

CREATE POLICY "Anon read sms_reminder_logs"
  ON public.sms_reminder_logs FOR SELECT TO anon USING (true);

GRANT SELECT ON public.sms_reminder_cases TO anon;
GRANT SELECT ON public.sms_reminder_logs TO anon;
