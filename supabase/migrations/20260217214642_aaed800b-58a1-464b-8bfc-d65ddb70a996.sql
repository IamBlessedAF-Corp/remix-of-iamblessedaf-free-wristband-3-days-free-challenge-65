
-- Add clip-level economy metrics to clip_submissions
ALTER TABLE public.clip_submissions
  ADD COLUMN IF NOT EXISTS ctr numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reg_rate numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS day1_post_rate numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_activated boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS payout_week text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS net_views integer DEFAULT 0;

-- Weekly payout records
CREATE TABLE public.clipper_payouts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  week_key text NOT NULL, -- e.g. '2026-W07'
  clips_count integer DEFAULT 0,
  total_net_views integer DEFAULT 0,
  base_earnings_cents integer DEFAULT 0,
  bonus_cents integer DEFAULT 0,
  total_cents integer DEFAULT 0,
  status text NOT NULL DEFAULT 'frozen', -- frozen, reviewing, approved, paid, adjusted
  frozen_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  paid_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_key)
);

ALTER TABLE public.clipper_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payouts" ON public.clipper_payouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage payouts" ON public.clipper_payouts
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Monthly bonus tracking
CREATE TABLE public.clipper_monthly_bonuses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  month_key text NOT NULL, -- e.g. '2026-02'
  monthly_views integer DEFAULT 0,
  lifetime_views integer DEFAULT 0,
  bonus_tier text DEFAULT 'none', -- none, verified, proven, super
  bonus_cents integer DEFAULT 0,
  paid boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_key)
);

ALTER TABLE public.clipper_monthly_bonuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bonuses" ON public.clipper_monthly_bonuses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage bonuses" ON public.clipper_monthly_bonuses
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Global risk throttle state (single-row config table)
CREATE TABLE public.clipper_risk_throttle (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_active boolean DEFAULT false,
  activated_at timestamp with time zone,
  deactivated_at timestamp with time zone,
  consecutive_low_days integer DEFAULT 0,
  consecutive_recovery_days integer DEFAULT 0,
  current_avg_ctr numeric DEFAULT 0,
  current_avg_reg_rate numeric DEFAULT 0,
  current_avg_day1_rate numeric DEFAULT 0,
  rpm_override numeric DEFAULT NULL, -- NULL = use default $0.22
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.clipper_risk_throttle ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read throttle status" ON public.clipper_risk_throttle
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage throttle" ON public.clipper_risk_throttle
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed initial throttle row
INSERT INTO public.clipper_risk_throttle (is_active, consecutive_low_days, consecutive_recovery_days)
VALUES (false, 0, 0);

-- Add updated_at trigger to new tables
CREATE TRIGGER update_clipper_payouts_updated_at
  BEFORE UPDATE ON public.clipper_payouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clipper_monthly_bonuses_updated_at
  BEFORE UPDATE ON public.clipper_monthly_bonuses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clipper_risk_throttle_updated_at
  BEFORE UPDATE ON public.clipper_risk_throttle
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
