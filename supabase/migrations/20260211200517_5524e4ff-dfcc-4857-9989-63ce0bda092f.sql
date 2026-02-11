
-- OTP codes table for phone-based login and 2FA
CREATE TABLE public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('login', '2fa', 'password_reset')),
  user_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Only service role can access (edge functions use service role)
CREATE POLICY "No direct client access to otp_codes"
  ON public.otp_codes
  FOR ALL
  USING (false);

-- Index for lookups
CREATE INDEX idx_otp_codes_phone_active ON public.otp_codes (phone, purpose, created_at DESC)
  WHERE verified_at IS NULL;

-- Auto-cleanup expired codes (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.otp_codes WHERE expires_at < now() - interval '1 hour';
$$;
