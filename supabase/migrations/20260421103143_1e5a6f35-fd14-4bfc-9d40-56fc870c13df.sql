ALTER TABLE public.time_utilization_settings
  ADD COLUMN target_utilization DECIMAL NOT NULL DEFAULT 0.85;