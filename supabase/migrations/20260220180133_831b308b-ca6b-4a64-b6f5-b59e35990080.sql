
-- Add customer_phone and 15-min SMS tracking columns to abandoned_carts
ALTER TABLE public.abandoned_carts
  ADD COLUMN IF NOT EXISTS customer_phone text,
  ADD COLUMN IF NOT EXISTS sms_15min_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS sms_15min_status text;

-- Index to efficiently find carts needing 15-min SMS
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_15min_sms
  ON public.abandoned_carts (status, created_at, sms_15min_sent_at)
  WHERE status = 'pending' AND sms_15min_sent_at IS NULL;
