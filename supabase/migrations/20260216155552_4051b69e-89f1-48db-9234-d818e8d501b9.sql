
-- Add unique constraint on email to prevent duplicate waitlist entries
ALTER TABLE public.smart_wristband_waitlist ADD CONSTRAINT smart_wristband_waitlist_email_unique UNIQUE (email);
