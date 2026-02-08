
-- Create SMS delivery tracking table
CREATE TABLE public.sms_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_phone TEXT NOT NULL,
  recipient_name TEXT,
  message TEXT NOT NULL,
  twilio_sid TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  error_message TEXT,
  source_page TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sms_deliveries ENABLE ROW LEVEL SECURITY;

-- Admins can view all deliveries
CREATE POLICY "Admins can view sms deliveries"
ON public.sms_deliveries
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert deliveries (via edge functions using service role)
CREATE POLICY "Service role can insert sms deliveries"
ON public.sms_deliveries
FOR INSERT
WITH CHECK (true);

-- Admins can update deliveries
CREATE POLICY "Service role can update sms deliveries"
ON public.sms_deliveries
FOR UPDATE
USING (true);

-- Index for fast lookups
CREATE INDEX idx_sms_deliveries_status ON public.sms_deliveries(status);
CREATE INDEX idx_sms_deliveries_created ON public.sms_deliveries(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_sms_deliveries_updated_at
BEFORE UPDATE ON public.sms_deliveries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
