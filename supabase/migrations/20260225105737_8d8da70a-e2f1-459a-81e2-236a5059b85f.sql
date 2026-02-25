
-- Update all existing referral codes from BLESSED prefix to IAMBLESSED prefix
-- Only update codes that start with 'BLESSED' but NOT already 'IAMBLESSED'
UPDATE public.creator_profiles
SET referral_code = 'IAMBLESSED' || substring(referral_code FROM 8)
WHERE referral_code LIKE 'BLESSED%'
  AND referral_code NOT LIKE 'IAMBLESSED%';
