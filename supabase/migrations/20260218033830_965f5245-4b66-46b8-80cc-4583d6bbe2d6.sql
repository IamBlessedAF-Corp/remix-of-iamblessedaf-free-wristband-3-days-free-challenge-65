
-- Audit log table for row-level change tracking
CREATE TABLE public.audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  table_name text NOT NULL,
  operation text NOT NULL,
  row_id text,
  user_id uuid,
  old_data jsonb,
  new_data jsonb,
  changed_fields text[]
);

-- Enable RLS — admin only
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
ON public.audit_log
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- No insert/update/delete from client — only triggers (service role)
CREATE POLICY "No client writes to audit_log"
ON public.audit_log
FOR ALL
USING (false)
WITH CHECK (false);

-- Indexes for fast queries
CREATE INDEX idx_audit_log_created ON public.audit_log (created_at DESC);
CREATE INDEX idx_audit_log_table ON public.audit_log (table_name);
CREATE INDEX idx_audit_log_user ON public.audit_log (user_id);

-- Generic trigger function
CREATE OR REPLACE FUNCTION public.audit_log_trigger_fn()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rid text;
  uid uuid;
  changed text[];
  old_j jsonb;
  new_j jsonb;
  k text;
BEGIN
  -- Determine row ID
  IF TG_OP = 'DELETE' THEN
    rid := OLD.id::text;
    old_j := to_jsonb(OLD);
    new_j := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    rid := NEW.id::text;
    old_j := NULL;
    new_j := to_jsonb(NEW);
  ELSE
    rid := NEW.id::text;
    old_j := to_jsonb(OLD);
    new_j := to_jsonb(NEW);
    -- Compute changed fields
    changed := ARRAY[]::text[];
    FOR k IN SELECT jsonb_object_keys(new_j)
    LOOP
      IF old_j->k IS DISTINCT FROM new_j->k THEN
        changed := array_append(changed, k);
      END IF;
    END LOOP;
  END IF;

  -- Try to get user_id from auth context
  BEGIN
    uid := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    uid := NULL;
  END;

  INSERT INTO public.audit_log (table_name, operation, row_id, user_id, old_data, new_data, changed_fields)
  VALUES (TG_TABLE_NAME, TG_OP, rid, uid, old_j, new_j, changed);

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

-- Attach to critical tables
CREATE TRIGGER audit_orders
AFTER INSERT OR UPDATE OR DELETE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger_fn();

CREATE TRIGGER audit_creator_profiles
AFTER INSERT OR UPDATE OR DELETE ON public.creator_profiles
FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger_fn();

CREATE TRIGGER audit_campaign_config
AFTER INSERT OR UPDATE OR DELETE ON public.campaign_config
FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger_fn();

CREATE TRIGGER audit_clip_submissions
AFTER INSERT OR UPDATE OR DELETE ON public.clip_submissions
FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger_fn();

CREATE TRIGGER audit_board_cards
AFTER INSERT OR UPDATE OR DELETE ON public.board_cards
FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger_fn();

CREATE TRIGGER audit_budget_cycles
AFTER INSERT OR UPDATE OR DELETE ON public.budget_cycles
FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger_fn();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_log;
