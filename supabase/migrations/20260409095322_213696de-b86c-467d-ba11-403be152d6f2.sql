
CREATE TABLE public.hidden_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hn_user_id INTEGER NOT NULL,
  filter TEXT NOT NULL CHECK (filter IN ('inventar', 'byg')),
  hidden_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(hn_user_id, filter)
);

ALTER TABLE public.hidden_employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read hidden_employees" ON public.hidden_employees
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated insert hidden_employees" ON public.hidden_employees
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated delete hidden_employees" ON public.hidden_employees
  FOR DELETE TO authenticated USING (true);
