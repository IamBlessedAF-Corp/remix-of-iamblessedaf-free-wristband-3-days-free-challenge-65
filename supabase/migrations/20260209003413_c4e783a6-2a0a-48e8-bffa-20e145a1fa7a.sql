
-- Activity feed table for real portal events
CREATE TABLE public.portal_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,          -- 'blessing', 'streak', 'milestone', 'join', 'donation'
  display_text text NOT NULL,
  icon_name text NOT NULL DEFAULT 'activity',  -- lucide icon key
  user_id uuid,                       -- nullable: some events may be anonymous
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast recent queries
CREATE INDEX idx_portal_activity_created ON public.portal_activity (created_at DESC);

-- Auto-cleanup: keep last 500 rows max (via trigger)
CREATE OR REPLACE FUNCTION public.trim_portal_activity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.portal_activity
  WHERE id NOT IN (
    SELECT id FROM public.portal_activity
    ORDER BY created_at DESC
    LIMIT 500
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trim_portal_activity_trigger
AFTER INSERT ON public.portal_activity
FOR EACH STATEMENT
EXECUTE FUNCTION public.trim_portal_activity();

-- Enable RLS
ALTER TABLE public.portal_activity ENABLE ROW LEVEL SECURITY;

-- Anyone can read activity (it's a public feed)
CREATE POLICY "Anyone can read activity feed"
ON public.portal_activity
FOR SELECT
USING (true);

-- Only service role / triggers can insert (not end users directly)
-- We'll use SECURITY DEFINER functions to insert

-- Function to log activity from triggers
CREATE OR REPLACE FUNCTION public.log_portal_activity(
  p_event_type text,
  p_display_text text,
  p_icon_name text DEFAULT 'activity',
  p_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.portal_activity (event_type, display_text, icon_name, user_id)
  VALUES (p_event_type, p_display_text, p_icon_name, p_user_id);
END;
$$;

-- Trigger: log when a blessing is confirmed
CREATE OR REPLACE FUNCTION public.on_blessing_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  sender_name text;
BEGIN
  IF OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    SELECT COALESCE(display_name, 'Someone') INTO sender_name
    FROM public.creator_profiles WHERE user_id = NEW.sender_id LIMIT 1;
    
    PERFORM public.log_portal_activity(
      'blessing',
      sender_name || ' just blessed ' || COALESCE(NEW.recipient_name, 'a friend') || ' 🎁',
      'gift',
      NEW.sender_id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER blessing_confirmed_activity
AFTER UPDATE ON public.blessings
FOR EACH ROW
EXECUTE FUNCTION public.on_blessing_confirmed();

-- Trigger: log when a new creator profile is created (someone joins)
CREATE OR REPLACE FUNCTION public.on_creator_joined()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  PERFORM public.log_portal_activity(
    'join',
    COALESCE(NEW.display_name, 'A new ambassador') || ' just joined the community 🙌',
    'users',
    NEW.user_id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER creator_joined_activity
AFTER INSERT ON public.creator_profiles
FOR EACH ROW
EXECUTE FUNCTION public.on_creator_joined();

-- Trigger: log streak milestones (3, 7, 14, 30 days)
CREATE OR REPLACE FUNCTION public.on_streak_milestone()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_name text;
BEGIN
  IF NEW.streak_days IN (3, 7, 14, 30) AND (OLD.streak_days IS NULL OR OLD.streak_days < NEW.streak_days) THEN
    SELECT COALESCE(display_name, 'Someone') INTO user_name
    FROM public.creator_profiles WHERE user_id = NEW.user_id LIMIT 1;
    
    PERFORM public.log_portal_activity(
      'streak',
      user_name || ' started a ' || NEW.streak_days || '-day streak 🔥',
      'activity',
      NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER streak_milestone_activity
AFTER UPDATE ON public.bc_wallets
FOR EACH ROW
EXECUTE FUNCTION public.on_streak_milestone();

-- Enable realtime for the activity table
ALTER PUBLICATION supabase_realtime ADD TABLE public.portal_activity;
