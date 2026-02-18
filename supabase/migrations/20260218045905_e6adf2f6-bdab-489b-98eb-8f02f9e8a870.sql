
-- =============================================
-- DATABASE INDEX OPTIMIZATION PASS
-- Indexes on frequently filtered/joined columns
-- =============================================

-- orders: filtered by status, referral_code, tier, customer_email
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_referral_code ON public.orders (referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_tier ON public.orders (tier);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders (customer_email) WHERE customer_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

-- link_clicks: joined on link_id, filtered by clicked_at, ip_hash for uniques
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON public.link_clicks (link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked_at ON public.link_clicks (clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_link_clicks_ip_hash ON public.link_clicks (ip_hash) WHERE ip_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_link_clicks_utm_source ON public.link_clicks (utm_source) WHERE utm_source IS NOT NULL;

-- short_links: looked up by short_code, filtered by created_by, campaign
CREATE INDEX IF NOT EXISTS idx_short_links_short_code ON public.short_links (short_code);
CREATE INDEX IF NOT EXISTS idx_short_links_created_by ON public.short_links (created_by) WHERE created_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_short_links_campaign ON public.short_links (campaign) WHERE campaign IS NOT NULL;

-- clip_submissions: filtered by user_id, status, payout_week
CREATE INDEX IF NOT EXISTS idx_clip_submissions_user_id ON public.clip_submissions (user_id);
CREATE INDEX IF NOT EXISTS idx_clip_submissions_status ON public.clip_submissions (status);
CREATE INDEX IF NOT EXISTS idx_clip_submissions_payout_week ON public.clip_submissions (payout_week) WHERE payout_week IS NOT NULL;

-- creator_profiles: looked up by user_id, referral_code, email
CREATE INDEX IF NOT EXISTS idx_creator_profiles_user_id ON public.creator_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_referral_code ON public.creator_profiles (referral_code);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_email ON public.creator_profiles (email);

-- sms_audit_log: filtered by status, template_key, created_at
CREATE INDEX IF NOT EXISTS idx_sms_audit_log_status ON public.sms_audit_log (status);
CREATE INDEX IF NOT EXISTS idx_sms_audit_log_created_at ON public.sms_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_audit_log_template_key ON public.sms_audit_log (template_key);

-- board_cards: filtered by column_id, priority, labels (GIN)
CREATE INDEX IF NOT EXISTS idx_board_cards_column_id ON public.board_cards (column_id);
CREATE INDEX IF NOT EXISTS idx_board_cards_priority ON public.board_cards (priority) WHERE priority IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_board_cards_labels ON public.board_cards USING GIN (labels);

-- audit_log: filtered by table_name, operation, created_at
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log (table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_operation ON public.audit_log (operation);

-- challenge_participants: looked up by phone, user_id
CREATE INDEX IF NOT EXISTS idx_challenge_participants_phone ON public.challenge_participants (phone);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON public.challenge_participants (user_id) WHERE user_id IS NOT NULL;

-- otp_codes: looked up by phone+purpose combo, expiry
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_purpose ON public.otp_codes (phone, purpose);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON public.otp_codes (expires_at);

-- bc_wallets: looked up by user_id
CREATE INDEX IF NOT EXISTS idx_bc_wallets_user_id ON public.bc_wallets (user_id);

-- bc_transactions: filtered by user_id, wallet_id, created_at
CREATE INDEX IF NOT EXISTS idx_bc_transactions_user_id ON public.bc_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_bc_transactions_wallet_id ON public.bc_transactions (wallet_id);
CREATE INDEX IF NOT EXISTS idx_bc_transactions_created_at ON public.bc_transactions (created_at DESC);

-- clipper_payouts: filtered by user_id, week_key, status
CREATE INDEX IF NOT EXISTS idx_clipper_payouts_user_id ON public.clipper_payouts (user_id);
CREATE INDEX IF NOT EXISTS idx_clipper_payouts_week_key ON public.clipper_payouts (week_key);
CREATE INDEX IF NOT EXISTS idx_clipper_payouts_status ON public.clipper_payouts (status);

-- portal_activity: filtered by created_at, event_type
CREATE INDEX IF NOT EXISTS idx_portal_activity_created_at ON public.portal_activity (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portal_activity_event_type ON public.portal_activity (event_type);

-- query_performance_logs: filtered by severity, created_at
CREATE INDEX IF NOT EXISTS idx_query_perf_logs_severity ON public.query_performance_logs (severity);
CREATE INDEX IF NOT EXISTS idx_query_perf_logs_created_at ON public.query_performance_logs (created_at DESC);

-- scheduled_gratitude_messages: filtered by participant_id, status
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_participant ON public.scheduled_gratitude_messages (participant_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_status ON public.scheduled_gratitude_messages (status);

-- followup_sequences: filtered by participant_id, status
CREATE INDEX IF NOT EXISTS idx_followup_sequences_participant ON public.followup_sequences (participant_id);
CREATE INDEX IF NOT EXISTS idx_followup_sequences_status ON public.followup_sequences (status);

-- blessings: filtered by sender_id, confirmation_token
CREATE INDEX IF NOT EXISTS idx_blessings_sender_id ON public.blessings (sender_id);
CREATE INDEX IF NOT EXISTS idx_blessings_token ON public.blessings (confirmation_token);

-- expert_leads: filtered by status, email
CREATE INDEX IF NOT EXISTS idx_expert_leads_status ON public.expert_leads (status);
CREATE INDEX IF NOT EXISTS idx_expert_leads_email ON public.expert_leads (email);

-- budget_segment_cycles: filtered by cycle_id, segment_id
CREATE INDEX IF NOT EXISTS idx_budget_seg_cycles_cycle ON public.budget_segment_cycles (cycle_id);
CREATE INDEX IF NOT EXISTS idx_budget_seg_cycles_segment ON public.budget_segment_cycles (segment_id);

-- clipper_segment_membership: filtered by user_id, segment_id
CREATE INDEX IF NOT EXISTS idx_clipper_seg_membership_user ON public.clipper_segment_membership (user_id);
CREATE INDEX IF NOT EXISTS idx_clipper_seg_membership_segment ON public.clipper_segment_membership (segment_id);

-- =============================================
-- ROADMAP COMPLETION TRACKING TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.roadmap_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_title text NOT NULL,
  phase text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  completed_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.roadmap_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage roadmap_completions"
  ON public.roadmap_completions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can read roadmap_completions"
  ON public.roadmap_completions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE UNIQUE INDEX idx_roadmap_completions_unique ON public.roadmap_completions (item_title, phase);
