
-- Add email opt-out column for weekly digest unsubscribe
ALTER TABLE public.creator_profiles 
ADD COLUMN IF NOT EXISTS digest_opted_out BOOLEAN NOT NULL DEFAULT false;
