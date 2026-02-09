CREATE OR REPLACE FUNCTION public.on_blessing_confirmed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  sender_name text;
BEGIN
  IF OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    SELECT COALESCE(display_name, 'Someone') INTO sender_name
    FROM public.creator_profiles WHERE user_id = NEW.sender_id LIMIT 1;
    
    -- Handle case where sender has no creator profile
    IF sender_name IS NULL THEN
      sender_name := 'Someone';
    END IF;
    
    PERFORM public.log_portal_activity(
      'blessing',
      sender_name || ' just blessed ' || COALESCE(NEW.recipient_name, 'a friend') || ' 🎁',
      'gift',
      NEW.sender_id
    );
  END IF;
  RETURN NEW;
END;
$function$