CREATE POLICY "Anon read daily_time_registrations"
  ON public.daily_time_registrations
  FOR SELECT
  TO anon
  USING (true);