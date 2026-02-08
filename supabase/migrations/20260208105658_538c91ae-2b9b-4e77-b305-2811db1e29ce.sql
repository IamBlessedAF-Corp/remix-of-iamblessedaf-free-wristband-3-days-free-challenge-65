
-- Drop the overly permissive policy that lets ANY authenticated user read ALL profiles
DROP POLICY IF EXISTS "Anonymous users cannot access creator_profiles" ON public.creator_profiles;

-- The existing "Users can view their own profile" policy already correctly restricts:
-- USING ((auth.uid() IS NOT NULL) AND (auth.uid() = user_id))
-- No new policy needed — just removing the leak.
