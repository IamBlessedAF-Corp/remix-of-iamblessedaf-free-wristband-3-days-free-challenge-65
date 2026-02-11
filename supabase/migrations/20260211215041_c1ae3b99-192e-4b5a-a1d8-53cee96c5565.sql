-- Allow anyone to read basic profile info (needed for referral personalization)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.creator_profiles;

-- Users can view any profile's public fields (the view limits columns exposed)
CREATE POLICY "Anyone can view public profile data"
ON public.creator_profiles
FOR SELECT
USING (true);
