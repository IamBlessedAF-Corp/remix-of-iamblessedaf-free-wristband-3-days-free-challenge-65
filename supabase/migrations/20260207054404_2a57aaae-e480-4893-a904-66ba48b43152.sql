
-- Create a public-safe view of creator_profiles that excludes PII (email, social handles)
-- This prevents data harvesting if public access is ever enabled
CREATE VIEW public.creator_profiles_public
WITH (security_invoker = on) AS
  SELECT 
    id,
    user_id,
    display_name,
    referral_code,
    blessings_confirmed,
    created_at
  FROM public.creator_profiles;
-- Excludes: email, instagram_handle, tiktok_handle, twitter_handle, updated_at
