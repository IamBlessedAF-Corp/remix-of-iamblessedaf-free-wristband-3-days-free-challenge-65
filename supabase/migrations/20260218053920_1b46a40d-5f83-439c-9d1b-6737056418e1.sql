
-- Table to log backup verification results
CREATE TABLE public.backup_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  verified_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'success',
  total_tables_checked integer NOT NULL DEFAULT 0,
  total_rows_snapshot bigint NOT NULL DEFAULT 0,
  table_details jsonb NOT NULL DEFAULT '[]'::jsonb,
  anomalies jsonb NOT NULL DEFAULT '[]'::jsonb,
  duration_ms integer NOT NULL DEFAULT 0,
  alert_sent boolean NOT NULL DEFAULT false,
  notes text
);

-- Enable RLS
ALTER TABLE public.backup_verifications ENABLE ROW LEVEL SECURITY;

-- Only admins can read
CREATE POLICY "Admins can view backup verifications"
  ON public.backup_verifications FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- No client writes - only edge function via service role
CREATE POLICY "No client writes to backup_verifications"
  ON public.backup_verifications FOR ALL
  USING (false)
  WITH CHECK (false);
