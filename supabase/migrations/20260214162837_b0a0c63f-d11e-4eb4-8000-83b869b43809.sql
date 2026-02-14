
-- Add phone column to smart_wristband_waitlist for SMS notifications
ALTER TABLE public.smart_wristband_waitlist
ADD COLUMN phone text DEFAULT NULL;
