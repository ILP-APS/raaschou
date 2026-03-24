GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_time_registrations TO service_role;
GRANT SELECT ON public.daily_time_registrations TO anon;
GRANT SELECT ON public.daily_time_registrations TO authenticated;