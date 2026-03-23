
-- Create allowed_emails table
CREATE TABLE public.allowed_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read (for future admin page)
CREATE POLICY "Authenticated users can read allowed_emails"
  ON public.allowed_emails FOR SELECT TO authenticated
  USING (true);

-- Security definer function callable by anon
CREATE OR REPLACE FUNCTION public.is_email_allowed(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.allowed_emails
    WHERE lower(email) = lower(p_email)
  );
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.is_email_allowed(text) TO anon;
GRANT EXECUTE ON FUNCTION public.is_email_allowed(text) TO authenticated;
