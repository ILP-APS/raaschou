DROP POLICY IF EXISTS "Authenticated read hidden_employees" ON public.hidden_employees;
DROP POLICY IF EXISTS "Authenticated insert hidden_employees" ON public.hidden_employees;
DROP POLICY IF EXISTS "Authenticated delete hidden_employees" ON public.hidden_employees;

CREATE POLICY "Allow all read hidden_employees" ON public.hidden_employees
  FOR SELECT USING (true);

CREATE POLICY "Allow all insert hidden_employees" ON public.hidden_employees
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all delete hidden_employees" ON public.hidden_employees
  FOR DELETE USING (true);