
-- ═══════════════════════════════════════════════════════════════
-- K-FACTOR SCALING PLAN: Full Database Schema
-- Tables: nominations, nomination_chains, challenge_events, qr_scans
-- ═══════════════════════════════════════════════════════════════

-- 1. NOMINATIONS — Track individual nominations (the core viral engine)
CREATE TABLE public.nominations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT,
  recipient_email TEXT,
  gratitude_message TEXT NOT NULL,
  nomination_message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'sent',
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '11 hours 11 minutes'),
  referral_code TEXT,
  chain_id UUID,
  chain_depth INTEGER DEFAULT 0,
  reminder_1_sent_at TIMESTAMPTZ,
  reminder_2_sent_at TIMESTAMPTZ,
  reminder_3_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. NOMINATION CHAINS — Track viral tree growth
CREATE TABLE public.nomination_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  root_user_id UUID NOT NULL,
  root_user_name TEXT,
  total_nominations INTEGER DEFAULT 0,
  total_acceptances INTEGER DEFAULT 0,
  max_depth INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. CHALLENGE EVENTS — Seasonal campaign themes
CREATE TABLE public.challenge_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  theme TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  prize_description TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming',
  hero_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. QR SCANS — Track IRL wristband → digital bridge
CREATE TABLE public.qr_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wearer_user_id UUID,
  wearer_referral_code TEXT,
  scanner_ip_hash TEXT,
  scanner_user_agent TEXT,
  converted_to_signup BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. REFERRAL SPRINTS — Weekly competition leaderboards
CREATE TABLE public.referral_sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  prize_description TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. SPRINT ENTRIES — Track per-user sprint performance
CREATE TABLE public.sprint_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID NOT NULL REFERENCES public.referral_sprints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  nominations_count INTEGER DEFAULT 0,
  acceptances_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(sprint_id, user_id)
);

-- 7. AMBASSADOR TIERS V2 — Enhanced program with real incentives
CREATE TABLE public.ambassador_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_referrals INTEGER DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'starter',
  commission_rate NUMERIC(5,2) DEFAULT 0,
  total_earned_cents INTEGER DEFAULT 0,
  level_upgraded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══ INDEXES ═══
CREATE INDEX idx_nominations_sender ON public.nominations(sender_id);
CREATE INDEX idx_nominations_status ON public.nominations(status);
CREATE INDEX idx_nominations_chain ON public.nominations(chain_id);
CREATE INDEX idx_nominations_expires ON public.nominations(expires_at) WHERE status = 'sent';
CREATE INDEX idx_nomination_chains_root ON public.nomination_chains(root_user_id);
CREATE INDEX idx_qr_scans_wearer ON public.qr_scans(wearer_user_id);
CREATE INDEX idx_sprint_entries_sprint ON public.sprint_entries(sprint_id);
CREATE INDEX idx_sprint_entries_user ON public.sprint_entries(user_id);
CREATE INDEX idx_ambassador_levels_user ON public.ambassador_levels(user_id);

-- ═══ ENABLE RLS ═══
ALTER TABLE public.nominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nomination_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprint_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_levels ENABLE ROW LEVEL SECURITY;

-- ═══ RLS POLICIES ═══

-- NOMINATIONS
CREATE POLICY "Users can view own sent nominations"
  ON public.nominations FOR SELECT
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can create nominations"
  ON public.nominations FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Admins can manage all nominations"
  ON public.nominations FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- NOMINATION CHAINS
CREATE POLICY "Users can view own chains"
  ON public.nomination_chains FOR SELECT
  USING (auth.uid() = root_user_id);

CREATE POLICY "Users can create own chain"
  ON public.nomination_chains FOR INSERT
  WITH CHECK (auth.uid() = root_user_id);

CREATE POLICY "Admins can manage all chains"
  ON public.nomination_chains FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- CHALLENGE EVENTS (public read, admin manage)
CREATE POLICY "Anyone can view active events"
  ON public.challenge_events FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage events"
  ON public.challenge_events FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- QR SCANS (public insert for scanning, admin read)
CREATE POLICY "Anyone can record a scan"
  ON public.qr_scans FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view scans"
  ON public.qr_scans FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- REFERRAL SPRINTS (public read, admin manage)
CREATE POLICY "Anyone can view sprints"
  ON public.referral_sprints FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage sprints"
  ON public.referral_sprints FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- SPRINT ENTRIES
CREATE POLICY "Users can view own sprint entries"
  ON public.sprint_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view sprint leaderboard"
  ON public.sprint_entries FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage sprint entries"
  ON public.sprint_entries FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- AMBASSADOR LEVELS
CREATE POLICY "Users can view own level"
  ON public.ambassador_levels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own level"
  ON public.ambassador_levels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all levels"
  ON public.ambassador_levels FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ═══ ENABLE REALTIME for nomination tracking ═══
ALTER PUBLICATION supabase_realtime ADD TABLE public.nominations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.nomination_chains;

-- ═══ UPDATED_AT TRIGGERS ═══
CREATE TRIGGER update_nominations_updated_at
  BEFORE UPDATE ON public.nominations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nomination_chains_updated_at
  BEFORE UPDATE ON public.nomination_chains
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_challenge_events_updated_at
  BEFORE UPDATE ON public.challenge_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referral_sprints_updated_at
  BEFORE UPDATE ON public.referral_sprints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sprint_entries_updated_at
  BEFORE UPDATE ON public.sprint_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ambassador_levels_updated_at
  BEFORE UPDATE ON public.ambassador_levels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
