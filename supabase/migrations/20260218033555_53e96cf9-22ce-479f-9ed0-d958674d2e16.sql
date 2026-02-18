
-- Table for logging slow/expensive queries and edge function performance
CREATE TABLE public.query_performance_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'edge_function',
  function_name text,
  query_duration_ms integer NOT NULL DEFAULT 0,
  row_count integer,
  severity text NOT NULL DEFAULT 'info',
  query_fingerprint text,
  metadata jsonb DEFAULT '{}'::jsonb,
  connection_info jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.query_performance_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read/manage
CREATE POLICY "Admins can manage query_performance_logs"
ON public.query_performance_logs
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Index for fast lookups
CREATE INDEX idx_qpl_created_at ON public.query_performance_logs (created_at DESC);
CREATE INDEX idx_qpl_severity ON public.query_performance_logs (severity);
CREATE INDEX idx_qpl_function_name ON public.query_performance_logs (function_name);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.query_performance_logs;
