-- ============================================================
-- JOY KEYS VIRAL ENGINE
-- 4-Key System: JOYKEY (K0) → Wristband (K1) → Commitment (K2) → Invite (K3) → Master Key
-- IamBlessedAF — Sprint 1
-- ============================================================

-- ── 1. KEYS STATUS (core per-user Joy Keys tracking) ──
CREATE TABLE IF NOT EXISTS keys_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Key 0: JOYKEY (auto-activated on signup via challenge)
  key0_activated_at TIMESTAMPTZ,

  -- Key 1: Wristband Key (referral-based)
  key1_unlocked_at TIMESTAMPTZ,
  key1_referrer_id UUID REFERENCES auth.users(id),
  key1_source TEXT CHECK (key1_source IN ('referral_link', 'qr_code', 'social_share', 'direct')),
  key1_clip_id TEXT, -- video/content clip that drove the referral
  key1_platform TEXT CHECK (key1_platform IN ('instagram', 'tiktok', 'whatsapp', 'facebook', 'twitter', 'youtube', 'other')),

  -- Key 2: Commitment Key (story proof)
  key2_unlocked_at TIMESTAMPTZ,
  key2_proof_type TEXT CHECK (key2_proof_type IN ('instagram_story', 'whatsapp_status', 'tiktok_video', 'facebook_story', 'screenshot')),
  key2_proof_url TEXT,

  -- Key 3: Invite Key (3 friends join)
  key3_unlocked_at TIMESTAMPTZ,
  key3_invites_sent INTEGER DEFAULT 0,
  key3_invites_accepted INTEGER DEFAULT 0,

  -- Master Key: all 3 keys unlocked = FREE shipping
  master_key_at TIMESTAMPTZ,
  shipping_credit_applied BOOLEAN DEFAULT false,

  -- Urgency timer (72h countdown from key0)
  timer_expires_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_keys_status_user_id ON keys_status(user_id);
CREATE INDEX IF NOT EXISTS idx_keys_status_referrer ON keys_status(key1_referrer_id);
CREATE INDEX IF NOT EXISTS idx_keys_status_master ON keys_status(master_key_at) WHERE master_key_at IS NOT NULL;

-- ── 2. CHALLENGE FRIENDS (Key 3 friend tracking) ──
CREATE TABLE IF NOT EXISTS challenge_friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_name TEXT,
  friend_phone TEXT,
  friend_email TEXT,
  invite_method TEXT CHECK (invite_method IN ('sms', 'whatsapp', 'email', 'link')),
  invite_sent_at TIMESTAMPTZ DEFAULT NOW(),
  invite_accepted_at TIMESTAMPTZ,
  friend_user_id UUID REFERENCES auth.users(id), -- linked after friend signs up
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenge_friends_inviter ON challenge_friends(inviter_id);
CREATE INDEX IF NOT EXISTS idx_challenge_friends_phone ON challenge_friends(friend_phone) WHERE friend_phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_challenge_friends_email ON challenge_friends(friend_email) WHERE friend_email IS NOT NULL;

-- ── 3. INVITES (shareable invite links + tracking) ──
CREATE TABLE IF NOT EXISTS joy_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE,
  invite_type TEXT CHECK (invite_type IN ('key1_share', 'key3_friend', 'master_key_flex')),
  channel TEXT CHECK (channel IN ('sms', 'whatsapp', 'email', 'instagram', 'tiktok', 'facebook', 'twitter', 'link')),
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  activated_by UUID REFERENCES auth.users(id), -- first person to use it
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_joy_invites_code ON joy_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_joy_invites_inviter ON joy_invites(inviter_id);

-- ── 4. SMS QUEUE (scheduled messages for nudges + reminders) ──
CREATE TABLE IF NOT EXISTS sms_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN (
    'key0_welcome', 'key1_nudge', 'key2_reminder', 'key3_almost_there',
    'master_key_congrats', 'timer_warning_24h', 'timer_warning_6h',
    'timer_expired', 'friend_invite'
  )),
  message_body TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  error_message TEXT,
  twilio_sid TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_queue_scheduled ON sms_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_sms_queue_user ON sms_queue(user_id);

-- ── 5. ANALYTICS EVENTS (K-factor + viral metrics) ──
CREATE TABLE IF NOT EXISTS joy_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'key0_activated', 'key1_unlocked', 'key2_unlocked', 'key3_unlocked',
    'master_key_earned', 'invite_sent', 'invite_clicked', 'invite_converted',
    'story_shared', 'timer_started', 'timer_expired', 'checkout_started',
    'checkout_completed', 'shipping_credit_applied', 'page_view', 'funnel_step'
  )),
  event_data JSONB DEFAULT '{}',
  source_page TEXT,
  referrer_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_joy_analytics_type ON joy_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_joy_analytics_user ON joy_analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_joy_analytics_created ON joy_analytics_events(created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE keys_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE joy_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE joy_analytics_events ENABLE ROW LEVEL SECURITY;

-- Keys Status: users see own, admins see all
CREATE POLICY "users_own_keys" ON keys_status FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_update_own_keys" ON keys_status FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "system_insert_keys" ON keys_status FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin_all_keys" ON keys_status FOR ALL USING (is_eos_admin());

-- Challenge Friends: users see own invites
CREATE POLICY "users_own_friends" ON challenge_friends FOR SELECT USING (auth.uid() = inviter_id);
CREATE POLICY "users_insert_friends" ON challenge_friends FOR INSERT WITH CHECK (auth.uid() = inviter_id);
CREATE POLICY "users_update_friends" ON challenge_friends FOR UPDATE USING (auth.uid() = inviter_id);
CREATE POLICY "admin_all_friends" ON challenge_friends FOR ALL USING (is_eos_admin());

-- Joy Invites: users see own, anyone can view by code (for link resolution)
CREATE POLICY "users_own_invites" ON joy_invites FOR SELECT USING (auth.uid() = inviter_id);
CREATE POLICY "users_insert_invites" ON joy_invites FOR INSERT WITH CHECK (auth.uid() = inviter_id);
CREATE POLICY "public_read_invite_by_code" ON joy_invites FOR SELECT USING (true);
CREATE POLICY "admin_all_invites" ON joy_invites FOR ALL USING (is_eos_admin());

-- SMS Queue: admin only (system-managed)
CREATE POLICY "admin_all_sms" ON sms_queue FOR ALL USING (is_eos_admin());

-- Analytics: users insert own, admins read all
CREATE POLICY "users_insert_analytics" ON joy_analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "admin_read_analytics" ON joy_analytics_events FOR SELECT USING (is_eos_admin());

-- ============================================================
-- SERVER-SIDE FUNCTIONS (RPCs)
-- ============================================================

-- ── Activate Key 0 (JOYKEY — on challenge signup) ──
CREATE OR REPLACE FUNCTION joy_activate_key0(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_timer TIMESTAMPTZ;
BEGIN
  v_timer := NOW() + INTERVAL '72 hours';

  INSERT INTO keys_status (user_id, key0_activated_at, timer_expires_at)
  VALUES (p_user_id, NOW(), v_timer)
  ON CONFLICT (user_id) DO UPDATE SET
    key0_activated_at = COALESCE(keys_status.key0_activated_at, NOW()),
    timer_expires_at = COALESCE(keys_status.timer_expires_at, v_timer),
    updated_at = NOW();

  -- Log analytics event
  INSERT INTO joy_analytics_events (user_id, event_type, event_data)
  VALUES (p_user_id, 'key0_activated', jsonb_build_object('timer_expires', v_timer));

  -- Award 50 BC for starting the challenge
  PERFORM bc_earn_coins(p_user_id, 50, 'joy_key_0', 'JOYKEY activated — challenge started!');

  SELECT jsonb_build_object(
    'success', true,
    'timer_expires_at', v_timer,
    'bc_earned', 50
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Unlock Key 1 (Wristband Key — referral verified) ──
CREATE OR REPLACE FUNCTION joy_unlock_key1(
  p_user_id UUID,
  p_referrer_id UUID DEFAULT NULL,
  p_source TEXT DEFAULT 'direct',
  p_platform TEXT DEFAULT NULL,
  p_clip_id TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  UPDATE keys_status SET
    key1_unlocked_at = NOW(),
    key1_referrer_id = p_referrer_id,
    key1_source = p_source,
    key1_platform = p_platform,
    key1_clip_id = p_clip_id,
    updated_at = NOW()
  WHERE user_id = p_user_id AND key1_unlocked_at IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'already_unlocked_or_not_found');
  END IF;

  -- Log analytics
  INSERT INTO joy_analytics_events (user_id, event_type, event_data, referrer_id)
  VALUES (p_user_id, 'key1_unlocked', jsonb_build_object(
    'source', p_source, 'platform', p_platform, 'clip_id', p_clip_id
  ), p_referrer_id);

  -- Award 100 BC
  PERFORM bc_earn_coins(p_user_id, 100, 'joy_key_1', 'Wristband Key unlocked!');

  -- Also reward referrer with 75 BC
  IF p_referrer_id IS NOT NULL THEN
    PERFORM bc_earn_coins(p_referrer_id, 75, 'referral_key1', 'Someone used your referral!');
    -- Increment referrer's blessings count
    UPDATE creator_profiles SET blessings_confirmed = blessings_confirmed + 1 WHERE user_id = p_referrer_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'bc_earned', 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Unlock Key 2 (Commitment Key — story proof submitted) ──
CREATE OR REPLACE FUNCTION joy_unlock_key2(
  p_user_id UUID,
  p_proof_type TEXT,
  p_proof_url TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
BEGIN
  UPDATE keys_status SET
    key2_unlocked_at = NOW(),
    key2_proof_type = p_proof_type,
    key2_proof_url = p_proof_url,
    updated_at = NOW()
  WHERE user_id = p_user_id AND key2_unlocked_at IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'already_unlocked_or_not_found');
  END IF;

  INSERT INTO joy_analytics_events (user_id, event_type, event_data)
  VALUES (p_user_id, 'key2_unlocked', jsonb_build_object('proof_type', p_proof_type));

  -- Award 150 BC
  PERFORM bc_earn_coins(p_user_id, 150, 'joy_key_2', 'Commitment Key unlocked — you shared your story!');

  -- Check if master key is now complete
  PERFORM joy_check_master_key(p_user_id);

  RETURN jsonb_build_object('success', true, 'bc_earned', 150);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Record Key 3 invite sent ──
CREATE OR REPLACE FUNCTION joy_send_invite(
  p_inviter_id UUID,
  p_friend_name TEXT DEFAULT NULL,
  p_friend_phone TEXT DEFAULT NULL,
  p_friend_email TEXT DEFAULT NULL,
  p_method TEXT DEFAULT 'link'
)
RETURNS JSONB AS $$
DECLARE
  v_invite_code TEXT;
  v_friend_id UUID;
BEGIN
  -- Generate unique invite code
  v_invite_code := 'JOY' || upper(substr(md5(random()::text), 1, 6));

  -- Create friend record
  INSERT INTO challenge_friends (inviter_id, friend_name, friend_phone, friend_email, invite_method)
  VALUES (p_inviter_id, p_friend_name, p_friend_phone, p_friend_email, p_method)
  RETURNING id INTO v_friend_id;

  -- Create trackable invite link
  INSERT INTO joy_invites (inviter_id, invite_code, invite_type, channel)
  VALUES (p_inviter_id, v_invite_code, 'key3_friend', p_method);

  -- Update invites sent counter
  UPDATE keys_status SET
    key3_invites_sent = key3_invites_sent + 1,
    updated_at = NOW()
  WHERE user_id = p_inviter_id;

  -- Log analytics
  INSERT INTO joy_analytics_events (user_id, event_type, event_data)
  VALUES (p_inviter_id, 'invite_sent', jsonb_build_object('method', p_method, 'invite_code', v_invite_code));

  RETURN jsonb_build_object('success', true, 'invite_code', v_invite_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Record invite acceptance (called when friend signs up) ──
CREATE OR REPLACE FUNCTION joy_accept_invite(
  p_invite_code TEXT,
  p_friend_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_inviter_id UUID;
  v_accepted_count INTEGER;
BEGIN
  -- Find the invite and mark it used
  UPDATE joy_invites SET
    activated_by = p_friend_user_id,
    activated_at = NOW(),
    conversions = conversions + 1
  WHERE invite_code = p_invite_code AND activated_at IS NULL
  RETURNING inviter_id INTO v_inviter_id;

  IF v_inviter_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'invalid_or_used_invite');
  END IF;

  -- Link friend record
  UPDATE challenge_friends SET
    friend_user_id = p_friend_user_id,
    invite_accepted_at = NOW()
  WHERE inviter_id = v_inviter_id
    AND friend_user_id IS NULL
    AND invite_accepted_at IS NULL
  LIMIT 1; -- link to first unmatched friend slot

  -- Increment accepted counter
  UPDATE keys_status SET
    key3_invites_accepted = key3_invites_accepted + 1,
    updated_at = NOW()
  WHERE user_id = v_inviter_id
  RETURNING key3_invites_accepted INTO v_accepted_count;

  -- Log analytics
  INSERT INTO joy_analytics_events (user_id, event_type, event_data, referrer_id)
  VALUES (p_friend_user_id, 'invite_converted', jsonb_build_object(
    'invite_code', p_invite_code, 'total_accepted', v_accepted_count
  ), v_inviter_id);

  -- Award BC to inviter for each conversion
  PERFORM bc_earn_coins(v_inviter_id, 50, 'invite_accepted', 'A friend joined through your invite!');

  -- If 3+ accepted, unlock Key 3
  IF v_accepted_count >= 3 THEN
    UPDATE keys_status SET
      key3_unlocked_at = NOW(),
      updated_at = NOW()
    WHERE user_id = v_inviter_id AND key3_unlocked_at IS NULL;

    IF FOUND THEN
      INSERT INTO joy_analytics_events (user_id, event_type, event_data)
      VALUES (v_inviter_id, 'key3_unlocked', jsonb_build_object('total_friends', v_accepted_count));

      PERFORM bc_earn_coins(v_inviter_id, 200, 'joy_key_3', 'Invite Key unlocked — 3 friends joined!');

      -- Check master key
      PERFORM joy_check_master_key(v_inviter_id);
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true, 'inviter_id', v_inviter_id, 'accepted_count', v_accepted_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Check & Award Master Key ──
CREATE OR REPLACE FUNCTION joy_check_master_key(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_keys RECORD;
BEGIN
  SELECT key1_unlocked_at, key2_unlocked_at, key3_unlocked_at, master_key_at
  INTO v_keys FROM keys_status WHERE user_id = p_user_id;

  -- All 3 keys must be unlocked and master not yet awarded
  IF v_keys.key1_unlocked_at IS NOT NULL
     AND v_keys.key2_unlocked_at IS NOT NULL
     AND v_keys.key3_unlocked_at IS NOT NULL
     AND v_keys.master_key_at IS NULL THEN

    UPDATE keys_status SET
      master_key_at = NOW(),
      shipping_credit_applied = true,
      updated_at = NOW()
    WHERE user_id = p_user_id;

    INSERT INTO joy_analytics_events (user_id, event_type, event_data)
    VALUES (p_user_id, 'master_key_earned', jsonb_build_object(
      'key1_at', v_keys.key1_unlocked_at,
      'key2_at', v_keys.key2_unlocked_at,
      'key3_at', v_keys.key3_unlocked_at
    ));

    -- Award 500 BC for Master Key!!
    PERFORM bc_earn_coins(p_user_id, 500, 'master_key', '🔥 MASTER KEY earned — FREE shipping unlocked!');

    INSERT INTO joy_analytics_events (user_id, event_type, event_data)
    VALUES (p_user_id, 'shipping_credit_applied', jsonb_build_object('credit_amount', 7.97));

    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── K-Factor calculation (admin dashboard) ──
CREATE OR REPLACE FUNCTION joy_get_kfactor(p_days INTEGER DEFAULT 7)
RETURNS JSONB AS $$
DECLARE
  v_total_users INTEGER;
  v_total_invites_sent INTEGER;
  v_total_conversions INTEGER;
  v_kfactor NUMERIC;
  v_master_keys INTEGER;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE key0_activated_at >= NOW() - (p_days || ' days')::INTERVAL),
    COALESCE(SUM(key3_invites_sent) FILTER (WHERE key0_activated_at >= NOW() - (p_days || ' days')::INTERVAL), 0),
    COALESCE(SUM(key3_invites_accepted) FILTER (WHERE key0_activated_at >= NOW() - (p_days || ' days')::INTERVAL), 0),
    COUNT(*) FILTER (WHERE master_key_at >= NOW() - (p_days || ' days')::INTERVAL)
  INTO v_total_users, v_total_invites_sent, v_total_conversions, v_master_keys
  FROM keys_status;

  IF v_total_users > 0 AND v_total_invites_sent > 0 THEN
    v_kfactor := (v_total_invites_sent::NUMERIC / v_total_users) * (v_total_conversions::NUMERIC / GREATEST(v_total_invites_sent, 1));
  ELSE
    v_kfactor := 0;
  END IF;

  RETURN jsonb_build_object(
    'period_days', p_days,
    'total_users', v_total_users,
    'invites_sent', v_total_invites_sent,
    'conversions', v_total_conversions,
    'k_factor', ROUND(v_kfactor, 2),
    'master_keys_earned', v_master_keys,
    'conversion_rate', CASE WHEN v_total_invites_sent > 0
      THEN ROUND((v_total_conversions::NUMERIC / v_total_invites_sent) * 100, 1)
      ELSE 0 END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Updated_at trigger ──
CREATE OR REPLACE FUNCTION update_joy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_keys_status_updated
  BEFORE UPDATE ON keys_status
  FOR EACH ROW EXECUTE FUNCTION update_joy_updated_at();

-- ── Public view for invite resolution (no auth needed for link clicks) ──
CREATE OR REPLACE VIEW joy_invites_public AS
SELECT invite_code, inviter_id, invite_type, clicks, created_at, expires_at
FROM joy_invites
WHERE (expires_at IS NULL OR expires_at > NOW());

-- Grant anonymous access to resolve invite codes
GRANT SELECT ON joy_invites_public TO anon;
