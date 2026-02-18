
-- Error monitoring table (Sentry-style)
CREATE TABLE public.error_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source text NOT NULL DEFAULT 'frontend',
  level text NOT NULL DEFAULT 'error',
  message text NOT NULL,
  stack text,
  component text,
  page_url text,
  user_agent text,
  user_id uuid,
  session_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  fingerprint text,
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for admin queries
CREATE INDEX idx_error_events_created ON public.error_events (created_at DESC);
CREATE INDEX idx_error_events_fingerprint ON public.error_events (fingerprint);
CREATE INDEX idx_error_events_source ON public.error_events (source);

-- Enable RLS
ALTER TABLE public.error_events ENABLE ROW LEVEL SECURITY;

-- Admins can read and manage
CREATE POLICY "Admins can manage error_events"
  ON public.error_events FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can insert (for anonymous error capture)
CREATE POLICY "Anyone can insert error_events"
  ON public.error_events FOR INSERT
  WITH CHECK (true);
