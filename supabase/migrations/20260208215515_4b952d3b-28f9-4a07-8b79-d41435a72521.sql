
-- Fix overly permissive RLS policies on sms_deliveries
-- Edge functions use service role which bypasses RLS, so restrict client-side access to admins only

DROP POLICY "Service role can insert sms deliveries" ON public.sms_deliveries;
DROP POLICY "Service role can update sms deliveries" ON public.sms_deliveries;

CREATE POLICY "Admins can insert sms deliveries"
ON public.sms_deliveries
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update sms deliveries"
ON public.sms_deliveries
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));
