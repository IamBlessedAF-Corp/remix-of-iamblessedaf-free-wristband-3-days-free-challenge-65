
-- Allow anyone to read verified clips for the public repost gallery
CREATE POLICY "Anyone can view verified clips for repost gallery"
ON public.clip_submissions
FOR SELECT
USING (status = 'verified');
