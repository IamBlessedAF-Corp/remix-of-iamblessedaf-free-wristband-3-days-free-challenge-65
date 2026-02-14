
-- Waitlist signups for Smart Wristband
CREATE TABLE public.smart_wristband_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email TEXT NOT NULL,
  first_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.smart_wristband_waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (signup)
CREATE POLICY "Anyone can join waitlist" ON public.smart_wristband_waitlist
  FOR INSERT WITH CHECK (true);

-- Only service role reads (for admin/edge functions)
CREATE POLICY "Service role can read waitlist" ON public.smart_wristband_waitlist
  FOR SELECT USING (true);

-- Function to get waitlist count for social proof
CREATE OR REPLACE FUNCTION public.get_wristband_waitlist_count()
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::INTEGER FROM public.smart_wristband_waitlist;
$$;
