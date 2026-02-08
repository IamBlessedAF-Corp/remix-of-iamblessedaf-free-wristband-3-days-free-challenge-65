
-- Add stage tag and decision matrix scoring columns to board_cards
ALTER TABLE public.board_cards
  ADD COLUMN IF NOT EXISTS stage text DEFAULT 'stage-1',
  ADD COLUMN IF NOT EXISTS vs_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cc_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hu_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS r_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ad_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delegation_score numeric DEFAULT 0;

-- Create a trigger to auto-compute delegation_score on insert/update
CREATE OR REPLACE FUNCTION public.compute_delegation_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.delegation_score := ROUND(
    (COALESCE(NEW.vs_score, 0) * 0.3 +
     COALESCE(NEW.cc_score, 0) * 0.25 +
     (5 - COALESCE(NEW.hu_score, 0)) * 0.3 +
     COALESCE(NEW.r_score, 0) * 0.15 +
     COALESCE(NEW.ad_score, 0) * 0.3) * 100 / (5 * (0.3 + 0.25 + 0.3 + 0.15 + 0.3))
  , 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER compute_delegation_score_trigger
  BEFORE INSERT OR UPDATE ON public.board_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_delegation_score();
