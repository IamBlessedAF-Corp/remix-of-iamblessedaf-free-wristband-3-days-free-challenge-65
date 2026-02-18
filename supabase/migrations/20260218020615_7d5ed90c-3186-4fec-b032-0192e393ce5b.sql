
-- Add referred_by_user_id to store the actual user_id of the referrer
ALTER TABLE public.creator_profiles 
ADD COLUMN IF NOT EXISTS referred_by_user_id uuid;

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_creator_profiles_referred_by_user_id 
ON public.creator_profiles(referred_by_user_id);
