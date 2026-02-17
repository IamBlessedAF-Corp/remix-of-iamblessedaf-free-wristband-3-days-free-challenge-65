
ALTER TABLE public.creator_profiles 
ADD COLUMN congrats_completed text DEFAULT NULL;

COMMENT ON COLUMN public.creator_profiles.congrats_completed IS 'Tracks if user completed or skipped the Congrats Neuro-Hacker activation page. Values: completed, skipped, or NULL (not yet seen).';
