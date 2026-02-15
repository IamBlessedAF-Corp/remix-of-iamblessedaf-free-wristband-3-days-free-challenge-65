
-- Add referral_code to orders for attribution
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS referral_code text;

-- Create affiliate tiers table
CREATE TABLE public.affiliate_tiers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  current_tier text NOT NULL DEFAULT 'starter',
  wristbands_distributed integer NOT NULL DEFAULT 0,
  credit_amount integer NOT NULL DEFAULT 3300,
  tier_unlocked_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliate_tiers ENABLE ROW LEVEL SECURITY;

-- Users can view their own tier
CREATE POLICY "Users can view own tier" ON public.affiliate_tiers
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert own tier
CREATE POLICY "Users can insert own tier" ON public.affiliate_tiers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update own tier
CREATE POLICY "Users can update own tier" ON public.affiliate_tiers
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all tiers
CREATE POLICY "Admins can view all tiers" ON public.affiliate_tiers
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_affiliate_tiers_updated_at
  BEFORE UPDATE ON public.affiliate_tiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to count wristbands for an affiliate by referral code
CREATE OR REPLACE FUNCTION public.get_affiliate_wristband_count(p_referral_code text)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(SUM(
    CASE tier
      WHEN 'free-wristband' THEN 1
      WHEN 'wristband-22' THEN 3
      WHEN 'pack-111' THEN 3
      WHEN 'pack-444' THEN 14
      WHEN 'pack-1111' THEN 111
      WHEN 'pack-4444' THEN 444
      ELSE 0
    END
  ), 0)::integer
  FROM public.orders
  WHERE referral_code = p_referral_code AND status = 'completed';
$$;
