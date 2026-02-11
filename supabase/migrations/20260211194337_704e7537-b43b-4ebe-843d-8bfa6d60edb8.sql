
-- SMS Audit Log for A2P 10DLC compliance tracking
CREATE TABLE public.sms_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recipient_phone TEXT NOT NULL,
  traffic_type TEXT NOT NULL CHECK (traffic_type IN ('otp', 'transactional', 'marketing')),
  template_key TEXT NOT NULL,
  messaging_service_sid TEXT NOT NULL,
  twilio_sid TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.sms_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/read (edge functions use service role)
CREATE POLICY "Service role full access on sms_audit_log"
  ON public.sms_audit_log
  FOR ALL
  USING (false);

-- Admin read access
CREATE POLICY "Admins can read sms_audit_log"
  ON public.sms_audit_log
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Index for compliance queries
CREATE INDEX idx_sms_audit_traffic_type ON public.sms_audit_log (traffic_type, created_at DESC);
CREATE INDEX idx_sms_audit_template ON public.sms_audit_log (template_key, created_at DESC);
