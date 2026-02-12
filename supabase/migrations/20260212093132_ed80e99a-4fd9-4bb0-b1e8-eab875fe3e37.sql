
-- Create exit-intent analytics tracking table
CREATE TABLE public.exit_intent_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('shown', 'accepted', 'declined', 'closed')),
  user_id UUID,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exit_intent_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (anonymous tracking)
CREATE POLICY "Anyone can insert exit intent events"
ON public.exit_intent_events
FOR INSERT
WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read exit intent events"
ON public.exit_intent_events
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Index for analytics queries
CREATE INDEX idx_exit_intent_page_type ON public.exit_intent_events (page, event_type, created_at);
