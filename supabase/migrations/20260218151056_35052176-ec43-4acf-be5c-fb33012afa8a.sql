
-- Fix 1: Update audit_log_trigger_fn to redact sensitive fields
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
  sensitive_fields text[] := ARRAY[
    'password', 'token', 'api_key', 'secret', 'credit_card',
    'confirmation_token', 'stripe_customer_id', 'stripe_session_id',
    'phone', 'ip_hash', 'user_agent'
  ];
BEGIN
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
    changed := ARRAY[]::text[];
    FOR k IN SELECT jsonb_object_keys(new_j)
    LOOP
      IF old_j->k IS DISTINCT FROM new_j->k THEN
        changed := array_append(changed, k);
      END IF;
    END LOOP;
  END IF;

  -- Redact sensitive fields
  FOR k IN SELECT unnest(sensitive_fields) LOOP
    IF old_j IS NOT NULL AND old_j ? k THEN
      old_j := old_j || jsonb_build_object(k, '***REDACTED***');
    END IF;
    IF new_j IS NOT NULL AND new_j ? k THEN
      new_j := new_j || jsonb_build_object(k, '***REDACTED***');
    END IF;
  END LOOP;

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

-- Fix 2: Add validation constraints (length-based, compatible with existing data)
ALTER TABLE public.challenge_participants
  ADD CONSTRAINT valid_phone_length CHECK (length(phone) BETWEEN 1 AND 50),
  ADD CONSTRAINT valid_friend1_length CHECK (length(friend_1_name) BETWEEN 1 AND 100),
  ADD CONSTRAINT valid_friend2_length CHECK (friend_2_name IS NULL OR length(friend_2_name) BETWEEN 1 AND 100),
  ADD CONSTRAINT valid_friend3_length CHECK (friend_3_name IS NULL OR length(friend_3_name) BETWEEN 1 AND 100),
  ADD CONSTRAINT valid_display_name_length CHECK (display_name IS NULL OR length(display_name) BETWEEN 1 AND 100);

ALTER TABLE public.expert_leads
  ADD CONSTRAINT valid_lead_email CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 255),
  ADD CONSTRAINT valid_lead_name CHECK (length(full_name) BETWEEN 1 AND 200),
  ADD CONSTRAINT valid_lead_niche CHECK (niche IS NULL OR length(niche) <= 200);

ALTER TABLE public.exit_intent_events
  ADD CONSTRAINT valid_event_type_length CHECK (length(event_type) <= 50),
  ADD CONSTRAINT valid_page_length CHECK (length(page) <= 500),
  ADD CONSTRAINT valid_session_id_length CHECK (session_id IS NULL OR length(session_id) <= 100);

ALTER TABLE public.error_events
  ADD CONSTRAINT valid_error_message_length CHECK (length(message) <= 5000),
  ADD CONSTRAINT valid_error_stack_length CHECK (stack IS NULL OR length(stack) <= 20000);

-- Fix 3: Tighten smart_wristband_waitlist SELECT policy
DROP POLICY IF EXISTS "Service role can read waitlist" ON public.smart_wristband_waitlist;

CREATE POLICY "Admins can view all waitlist entries"
  ON public.smart_wristband_waitlist
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own waitlist entry"
  ON public.smart_wristband_waitlist
  FOR SELECT
  USING (auth.uid() = user_id);

-- Fix 4: Replace permissive short_links INSERT policy with admin-only
DROP POLICY IF EXISTS "Authenticated users can create short links" ON public.short_links;

CREATE POLICY "Admins can create short links"
  ON public.short_links FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix 5: Drop the old overly permissive orders policy if it still exists
DROP POLICY IF EXISTS "Service role can manage orders" ON public.orders;
