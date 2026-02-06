-- Fix public data exposure by recreating SELECT policies as PERMISSIVE
-- The current policies are RESTRICTIVE which causes RLS issues

-- Drop and recreate creator_profiles SELECT policy as PERMISSIVE
DROP POLICY IF EXISTS "Users can view their own profile" ON creator_profiles;
CREATE POLICY "Users can view their own profile" 
ON creator_profiles FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Drop and recreate blessings SELECT policy as PERMISSIVE  
DROP POLICY IF EXISTS "Users can view their own blessings" ON blessings;
CREATE POLICY "Users can view their own blessings" 
ON blessings FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = sender_id);