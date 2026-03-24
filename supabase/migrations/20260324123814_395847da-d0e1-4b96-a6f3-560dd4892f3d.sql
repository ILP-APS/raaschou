-- 1. sms_automation_employees: drop anon policies, keep authenticated + service_role
DROP POLICY IF EXISTS "Anon delete sms_automation_employees" ON public.sms_automation_employees;
DROP POLICY IF EXISTS "Anon insert sms_automation_employees" ON public.sms_automation_employees;
DROP POLICY IF EXISTS "Anon read sms_automation_employees" ON public.sms_automation_employees;
DROP POLICY IF EXISTS "Anon update sms_automation_employees" ON public.sms_automation_employees;

-- 2. daily_time_registrations: drop anon SELECT, keep authenticated + service_role
DROP POLICY IF EXISTS "Anon read daily_time_registrations" ON public.daily_time_registrations;

-- 3. projects: replace public INSERT/UPDATE with authenticated-only
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.projects;
DROP POLICY IF EXISTS "Allow public read access" ON public.projects;

CREATE POLICY "Authenticated read projects" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update projects" ON public.projects FOR UPDATE TO authenticated USING (true);

-- 4. offer_line_items: replace public policies with authenticated-only
DROP POLICY IF EXISTS "Allow public read access" ON public.offer_line_items;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.offer_line_items;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.offer_line_items;

CREATE POLICY "Authenticated read offer_line_items" ON public.offer_line_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert offer_line_items" ON public.offer_line_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update offer_line_items" ON public.offer_line_items FOR UPDATE TO authenticated USING (true);

-- 5. settings: replace public policies with authenticated-only
DROP POLICY IF EXISTS "Allow public read access" ON public.settings;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.settings;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.settings;

CREATE POLICY "Authenticated read settings" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert settings" ON public.settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update settings" ON public.settings FOR UPDATE TO authenticated USING (true);

-- 6. employee_work_schedules: drop anon policies, keep authenticated + service_role
DROP POLICY IF EXISTS "Anon insert employee_work_schedules" ON public.employee_work_schedules;
DROP POLICY IF EXISTS "Anon read employee_work_schedules" ON public.employee_work_schedules;
DROP POLICY IF EXISTS "Anon update employee_work_schedules" ON public.employee_work_schedules;

-- 7. sms_reminder_cases: drop anon SELECT
DROP POLICY IF EXISTS "Anon read sms_reminder_cases" ON public.sms_reminder_cases;

-- 8. sms_reminder_logs: drop anon SELECT
DROP POLICY IF EXISTS "Anon read sms_reminder_logs" ON public.sms_reminder_logs;