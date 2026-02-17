
-- Add baseline_view_count to track views at submission time
ALTER TABLE public.clip_submissions 
ADD COLUMN baseline_view_count integer NOT NULL DEFAULT 0;

-- Add a comment for clarity
COMMENT ON COLUMN public.clip_submissions.baseline_view_count IS 'View count at the moment of submission. Net views = view_count - baseline_view_count';
