
-- Create abandoned_carts table to track checkout starts
CREATE TABLE public.abandoned_carts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL,
  customer_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  recovery_sent_at TIMESTAMP WITH TIME ZONE,
  recovery_channel TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Index for the recovery cron query
CREATE INDEX idx_abandoned_carts_status_created ON public.abandoned_carts (status, created_at)
  WHERE status = 'pending';

-- Enable RLS
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Only admins can read; no client writes (edge functions use service role)
CREATE POLICY "Admins can view abandoned carts"
  ON public.abandoned_carts FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "No client writes to abandoned_carts"
  ON public.abandoned_carts FOR ALL
  USING (false)
  WITH CHECK (false);

-- Audit trigger
CREATE TRIGGER audit_trigger_abandoned_carts
  AFTER INSERT OR UPDATE OR DELETE ON public.abandoned_carts
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger_fn();
