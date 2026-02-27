
-- ══════════════════════════════════════════════════
-- Joy Keys Challenge — Tables
-- ══════════════════════════════════════════════════

-- 1) keys_status — tracks which keys a user has unlocked
CREATE TABLE public.keys_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  key0_at TIMESTAMPTZ DEFAULT NULL,
  key1_at TIMESTAMPTZ DEFAULT NULL,
  key1_referrer_id UUID DEFAULT NULL,
  key2_at TIMESTAMPTZ DEFAULT NULL,
  key2_proof_type TEXT DEFAULT NULL,
  key2_proof_url TEXT DEFAULT NULL,
  key3_at TIMESTAMPTZ DEFAULT NULL,
  key3_friends_invited INT NOT NULL DEFAULT 0,
  key3_friends_accepted INT NOT NULL DEFAULT 0,
  master_key_at TIMESTAMPTZ DEFAULT NULL,
  shipping_credit_applied BOOLEAN NOT NULL DEFAULT false,
  timer_expires_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.keys_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own keys_status"
  ON public.keys_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own keys_status"
  ON public.keys_status FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_keys_status_updated_at
  BEFORE UPDATE ON public.keys_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) challenge_friends — friends invited by a user for key3
CREATE TABLE public.challenge_friends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id UUID NOT NULL,
  friend_user_id UUID DEFAULT NULL,
  friend_name TEXT DEFAULT NULL,
  friend_phone TEXT DEFAULT NULL,
  friend_email TEXT DEFAULT NULL,
  invite_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'invited',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at TIMESTAMPTZ DEFAULT NULL
);

ALTER TABLE public.challenge_friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenge_friends"
  ON public.challenge_friends FOR SELECT
  USING (auth.uid() = inviter_id OR auth.uid() = friend_user_id);

-- 3) joy_invites — invite codes generated
CREATE TABLE public.joy_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  method TEXT NOT NULL DEFAULT 'link',
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_by UUID DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ DEFAULT NULL
);

ALTER TABLE public.joy_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own joy_invites"
  ON public.joy_invites FOR SELECT
  USING (auth.uid() = inviter_id);

-- ══════════════════════════════════════════════════
-- Joy Keys Challenge — RPC Functions
-- ══════════════════════════════════════════════════

-- RPC 1: joy_activate_key0 — creates keys_status row + timestamps key0
CREATE OR REPLACE FUNCTION public.joy_activate_key0(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.keys_status (user_id, key0_at, timer_expires_at)
  VALUES (p_user_id, now(), now() + interval '72 hours')
  ON CONFLICT (user_id) DO UPDATE
    SET key0_at = COALESCE(keys_status.key0_at, now()),
        timer_expires_at = COALESCE(keys_status.timer_expires_at, now() + interval '72 hours'),
        updated_at = now();

  -- Award 50 BC
  PERFORM public.bc_earn_coins(50, 'joy_key0');
END;
$$;

-- RPC 2: joy_unlock_key1 — unlock via referral/clip
CREATE OR REPLACE FUNCTION public.joy_unlock_key1(
  p_user_id UUID,
  p_referrer_id UUID DEFAULT NULL,
  p_source TEXT DEFAULT 'organic',
  p_platform TEXT DEFAULT 'web',
  p_clip_id TEXT DEFAULT ''
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.keys_status
  SET key1_at = COALESCE(key1_at, now()),
      key1_referrer_id = COALESCE(key1_referrer_id, p_referrer_id),
      updated_at = now()
  WHERE user_id = p_user_id AND key0_at IS NOT NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Key0 must be activated first';
  END IF;

  -- Award 100 BC
  PERFORM public.bc_earn_coins(100, 'joy_key1');
END;
$$;

-- RPC 3: joy_unlock_key2 — submit story proof
CREATE OR REPLACE FUNCTION public.joy_unlock_key2(
  p_user_id UUID,
  p_proof_type TEXT,
  p_proof_url TEXT
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.keys_status
  SET key2_at = COALESCE(key2_at, now()),
      key2_proof_type = p_proof_type,
      key2_proof_url = p_proof_url,
      updated_at = now()
  WHERE user_id = p_user_id AND key1_at IS NOT NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Key1 must be unlocked first';
  END IF;

  -- Award 150 BC
  PERFORM public.bc_earn_coins(150, 'joy_key2');
END;
$$;

-- RPC 4: joy_send_invite — create an invite for key3
CREATE OR REPLACE FUNCTION public.joy_send_invite(
  p_inviter_id UUID,
  p_friend_name TEXT,
  p_friend_phone TEXT DEFAULT '',
  p_friend_email TEXT DEFAULT '',
  p_method TEXT DEFAULT 'link'
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_friend_id UUID;
BEGIN
  -- Generate a unique 8-char invite code
  v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));

  -- Insert invite record
  INSERT INTO public.joy_invites (inviter_id, code, method)
  VALUES (p_inviter_id, v_code, p_method)
  RETURNING id INTO v_friend_id;

  -- Insert challenge_friends record
  INSERT INTO public.challenge_friends (inviter_id, friend_name, friend_phone, friend_email, invite_code)
  VALUES (p_inviter_id, p_friend_name, p_friend_phone, p_friend_email, v_code);

  -- Increment invited count
  UPDATE public.keys_status
  SET key3_friends_invited = key3_friends_invited + 1,
      updated_at = now()
  WHERE user_id = p_inviter_id;

  RETURN jsonb_build_object('success', true, 'invite_code', v_code);
END;
$$;

-- RPC 5: joy_accept_invite — friend accepts the invite
CREATE OR REPLACE FUNCTION public.joy_accept_invite(
  p_invite_code TEXT,
  p_friend_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_inviter_id UUID;
  v_accepted INT;
BEGIN
  -- Mark invite as used
  UPDATE public.joy_invites
  SET is_used = true, used_by = p_friend_user_id, used_at = now()
  WHERE code = p_invite_code AND is_used = false
  RETURNING inviter_id INTO v_inviter_id;

  IF v_inviter_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or already-used invite code';
  END IF;

  -- Update challenge_friends
  UPDATE public.challenge_friends
  SET friend_user_id = p_friend_user_id, status = 'joined', joined_at = now()
  WHERE invite_code = p_invite_code AND inviter_id = v_inviter_id;

  -- Increment accepted count
  UPDATE public.keys_status
  SET key3_friends_accepted = key3_friends_accepted + 1,
      updated_at = now()
  WHERE user_id = v_inviter_id
  RETURNING key3_friends_accepted INTO v_accepted;

  -- If 3 friends accepted, unlock key3
  IF v_accepted >= 3 THEN
    UPDATE public.keys_status
    SET key3_at = COALESCE(key3_at, now()),
        updated_at = now()
    WHERE user_id = v_inviter_id AND key3_at IS NULL;

    IF FOUND THEN
      -- Award 200 BC for key3
      PERFORM public.bc_earn_coins(200, 'joy_key3');
    END IF;
  END IF;
END;
$$;

-- RPC 6: joy_check_master_key — check if all keys complete, unlock master
CREATE OR REPLACE FUNCTION public.joy_check_master_key(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_status public.keys_status%ROWTYPE;
  v_bc_awarded INT := 0;
BEGIN
  SELECT * INTO v_status FROM public.keys_status WHERE user_id = p_user_id;

  IF v_status IS NULL THEN
    RETURN jsonb_build_object(
      'unlocked', false,
      'shipping_credit', false,
      'keys_completed', jsonb_build_object('key0', false, 'key1', false, 'key2', false, 'key3', false),
      'bc_awarded', 0
    );
  END IF;

  -- Check if all 4 keys are done and master not yet awarded
  IF v_status.key0_at IS NOT NULL AND v_status.key1_at IS NOT NULL
     AND v_status.key2_at IS NOT NULL AND v_status.key3_at IS NOT NULL
     AND v_status.master_key_at IS NULL THEN

    UPDATE public.keys_status
    SET master_key_at = now(),
        shipping_credit_applied = true,
        updated_at = now()
    WHERE user_id = p_user_id;

    -- Award 500 BC
    PERFORM public.bc_earn_coins(500, 'joy_master_key');
    v_bc_awarded := 500;
  END IF;

  -- Re-read after potential update
  SELECT * INTO v_status FROM public.keys_status WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'unlocked', v_status.master_key_at IS NOT NULL,
    'shipping_credit', v_status.shipping_credit_applied,
    'keys_completed', jsonb_build_object(
      'key0', v_status.key0_at IS NOT NULL,
      'key1', v_status.key1_at IS NOT NULL,
      'key2', v_status.key2_at IS NOT NULL,
      'key3', v_status.key3_at IS NOT NULL
    ),
    'bc_awarded', v_bc_awarded
  );
END;
$$;
