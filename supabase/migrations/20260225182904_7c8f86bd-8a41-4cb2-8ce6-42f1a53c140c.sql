
-- Add "Errors" column to board
INSERT INTO public.board_columns (name, position, color)
VALUES ('Errors', 5, '#ef4444');

-- DB function: auto-create board card from error_events (deduplicated by fingerprint)
CREATE OR REPLACE FUNCTION public.auto_create_error_card()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_errors_col_id uuid;
  v_existing_count integer;
  v_title text;
BEGIN
  -- Only trigger for error/fatal level
  IF NEW.level NOT IN ('error', 'fatal') THEN
    RETURN NEW;
  END IF;

  -- Find the Errors column
  SELECT id INTO v_errors_col_id
  FROM public.board_columns
  WHERE name = 'Errors'
  LIMIT 1;

  IF v_errors_col_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Deduplicate: skip if a card with same fingerprint already exists and is not done
  IF NEW.fingerprint IS NOT NULL THEN
    SELECT COUNT(*) INTO v_existing_count
    FROM public.board_cards
    WHERE column_id != (SELECT id FROM public.board_columns WHERE name = 'Done' LIMIT 1)
      AND labels @> ARRAY['auto-error']
      AND description LIKE '%' || NEW.fingerprint || '%';

    IF v_existing_count > 0 THEN
      RETURN NEW;
    END IF;
  END IF;

  v_title := LEFT(NEW.message, 80);
  IF length(NEW.message) > 80 THEN
    v_title := v_title || '...';
  END IF;

  INSERT INTO public.board_cards (
    column_id, title, description, priority, position, labels
  ) VALUES (
    v_errors_col_id,
    '🚨 ' || v_title,
    E'**Source:** ' || COALESCE(NEW.source, 'unknown') ||
    E'\n**Component:** ' || COALESCE(NEW.component, '—') ||
    E'\n**Page:** ' || COALESCE(NEW.page_url, '—') ||
    E'\n**Fingerprint:** ' || COALESCE(NEW.fingerprint, '—') ||
    E'\n**Level:** ' || NEW.level ||
    E'\n\n```\n' || LEFT(COALESCE(NEW.stack, NEW.message), 1000) || E'\n```',
    CASE WHEN NEW.level = 'fatal' THEN 'critical' ELSE 'high' END,
    0,
    ARRAY['auto-error', NEW.level]
  );

  RETURN NEW;
END;
$$;

-- Attach trigger
CREATE TRIGGER trg_auto_error_card
AFTER INSERT ON public.error_events
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_error_card();
