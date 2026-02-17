
-- Campaign configuration key-value table (singleton-ish: one row per key)
CREATE TABLE public.campaign_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  label text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  description text,
  affected_areas text[] NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage campaign_config"
ON public.campaign_config
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read campaign_config"
ON public.campaign_config
FOR SELECT
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_campaign_config_updated_at
BEFORE UPDATE ON public.campaign_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default values
INSERT INTO public.campaign_config (key, value, label, category, description, affected_areas) VALUES
  ('min_views', '1000', 'Minimum Views', 'thresholds', 'Clips below this view count are not monetized', '{"Clipper Dashboard","Risk Engine","Clip Activation Gate","process-weekly-payout","verify-clip","Campaign Settings KPIs"}'),
  ('min_ctr', '0.01', 'Minimum CTR', 'thresholds', 'Click-through rate floor for clip activation', '{"Risk Engine","RiskThrottleIndicator","Clip Activation Gate","verify-clip","Clipper Dashboard metrics"}'),
  ('min_reg_rate', '0.15', 'Minimum Reg Rate', 'thresholds', 'Registration rate floor for clip activation', '{"Risk Engine","RiskThrottleIndicator","Clip Activation Gate","verify-clip","Clipper Dashboard metrics","Contest page disclaimers"}'),
  ('min_day1_rate', '0.25', 'Minimum Day-1 Rate', 'thresholds', 'Day-1 retention floor for clip activation', '{"Risk Engine","RiskThrottleIndicator","Clip Activation Gate","verify-clip","Clipper Dashboard metrics"}'),
  ('rpm', '0.22', 'RPM (per 1K views)', 'economics', 'Revenue per mille — base rate paid per 1K verified views', '{"Clipper Dashboard earnings","process-weekly-payout","Forecast AI projections","Clipper Calculator","Contest page copy","Earnings Slider"}'),
  ('min_payout_cents', '222', 'Minimum Payout', 'economics', 'Minimum threshold before a payout is issued', '{"process-weekly-payout","Clipper Dashboard","Payout History","Payments tab"}'),
  ('bonus_100k_cents', '5000', 'Bonus: 100K Views/mo', 'bonuses', 'Monthly bonus at 100K views milestone', '{"Clipper Dashboard bonuses","MonthlyBonusTracker","BonusLadder component","Contest page"}'),
  ('bonus_500k_cents', '20000', 'Bonus: 500K Views/mo', 'bonuses', 'Monthly bonus at 500K views milestone', '{"Clipper Dashboard bonuses","MonthlyBonusTracker","BonusLadder component","Contest page"}'),
  ('bonus_1m_cents', '50000', 'Bonus: 1M Views/mo', 'bonuses', 'Monthly bonus at 1M views milestone', '{"Clipper Dashboard bonuses","MonthlyBonusTracker","BonusLadder component","Contest page"}'),
  ('weekly_cutoff', 'Monday 00:00 UTC', 'Weekly Cutoff', 'schedule', 'When the weekly payout cycle resets', '{"process-weekly-payout","PayoutCountdown","Clipper Dashboard","Budget Control cycles"}'),
  ('payout_day', 'Friday', 'Payout Day', 'schedule', 'Day of the week payouts are processed', '{"process-weekly-payout","PayoutCountdown","Clipper Dashboard","Payments tab"}'),
  ('throttle_rpm_override', '0.18', 'Throttle RPM Override', 'risk', 'RPM applied when protection mode activates', '{"Risk Engine","RiskThrottleIndicator","process-weekly-payout","Clipper Dashboard"}'),
  ('throttle_consecutive_days', '3', 'Throttle Trigger Days', 'risk', 'Days below threshold before protection activates', '{"Risk Engine","RiskThrottleIndicator","budget-alerts"}'),
  ('throttle_recovery_days', '3', 'Recovery Days Required', 'risk', 'Days above threshold before protection deactivates', '{"Risk Engine","RiskThrottleIndicator"}');
