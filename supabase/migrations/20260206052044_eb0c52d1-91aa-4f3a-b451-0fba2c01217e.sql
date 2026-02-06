-- Add explicit authentication-required SELECT policies to prevent anonymous access
-- These complement the existing user-specific policies to ensure no data leaks

-- Add policy to deny anonymous access to creator_profiles
CREATE POLICY "Anonymous users cannot access creator_profiles"
ON creator_profiles FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Add policy to deny anonymous access to blessings
CREATE POLICY "Anonymous users cannot access blessings"
ON blessings FOR SELECT
USING (auth.uid() IS NOT NULL);