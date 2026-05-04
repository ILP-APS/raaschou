ALTER TABLE public.sms_automation_employees
  ADD COLUMN eregnskab_cellphone TEXT,
  ADD COLUMN eregnskab_phone TEXT,
  ADD COLUMN manual_phone_number TEXT,
  ADD COLUMN phone_source TEXT NOT NULL DEFAULT 'cellphone'
    CHECK (phone_source IN ('cellphone', 'phone', 'manual'));

UPDATE public.sms_automation_employees
  SET eregnskab_cellphone = phone_number
  WHERE eregnskab_cellphone IS NULL;