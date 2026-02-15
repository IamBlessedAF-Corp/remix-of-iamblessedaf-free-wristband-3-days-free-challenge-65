
-- Repost tracking for Content Vault
CREATE TABLE public.repost_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  clip_id TEXT NOT NULL,
  clip_title TEXT,
  referral_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.repost_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reposts"
  ON public.repost_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reposts"
  ON public.repost_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_repost_logs_user ON public.repost_logs (user_id);
CREATE INDEX idx_repost_logs_clip ON public.repost_logs (clip_id);
