
-- =============================================
-- FIX 1: creator_profiles public data exposure
-- =============================================

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view public profile data" ON public.creator_profiles;

-- Add owner-scoped policy
CREATE POLICY "Users can view own profile"
ON public.creator_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Add admin policy
CREATE POLICY "Admins can view all profiles"
ON public.creator_profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- FIX 2: BC Wallet client-side manipulation
-- =============================================

-- Remove user UPDATE policy on bc_wallets
DROP POLICY IF EXISTS "Users can update own wallet" ON public.bc_wallets;

-- Remove user INSERT on bc_transactions (should go through RPCs)
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.bc_transactions;

-- Add balance constraints
ALTER TABLE public.bc_wallets
  ADD CONSTRAINT check_balance_positive CHECK (balance >= 0),
  ADD CONSTRAINT check_balance_reasonable CHECK (balance <= 1000000);

-- bc_earn_coins RPC
CREATE OR REPLACE FUNCTION public.bc_earn_coins(
  p_amount integer,
  p_reason text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id uuid;
  v_new_balance integer;
BEGIN
  IF p_amount <= 0 OR p_amount > 10000 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  IF length(p_reason) > 100 THEN
    p_reason := left(p_reason, 100);
  END IF;

  SELECT id, balance + p_amount INTO v_wallet_id, v_new_balance
  FROM bc_wallets
  WHERE user_id = auth.uid()
  FOR UPDATE;

  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  UPDATE bc_wallets
  SET balance = v_new_balance,
      lifetime_earned = lifetime_earned + p_amount,
      updated_at = now()
  WHERE id = v_wallet_id;

  INSERT INTO bc_transactions (user_id, wallet_id, type, amount, reason, metadata, balance_after)
  VALUES (auth.uid(), v_wallet_id, 'earn', p_amount, p_reason, p_metadata, v_new_balance);

  RETURN jsonb_build_object('success', true, 'balance', v_new_balance);
END;
$$;

-- bc_spend_coins RPC
CREATE OR REPLACE FUNCTION public.bc_spend_coins(
  p_amount integer,
  p_reason text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id uuid;
  v_current_balance integer;
  v_new_balance integer;
BEGIN
  IF p_amount <= 0 OR p_amount > 100000 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  IF length(p_reason) > 100 THEN
    p_reason := left(p_reason, 100);
  END IF;

  SELECT id, balance INTO v_wallet_id, v_current_balance
  FROM bc_wallets
  WHERE user_id = auth.uid()
  FOR UPDATE;

  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  v_new_balance := v_current_balance - p_amount;

  UPDATE bc_wallets
  SET balance = v_new_balance,
      lifetime_spent = lifetime_spent + p_amount,
      updated_at = now()
  WHERE id = v_wallet_id;

  INSERT INTO bc_transactions (user_id, wallet_id, type, amount, reason, metadata, balance_after)
  VALUES (auth.uid(), v_wallet_id, 'spend', p_amount, p_reason, p_metadata, v_new_balance);

  RETURN jsonb_build_object('success', true, 'balance', v_new_balance);
END;
$$;

-- bc_redeem_item RPC
CREATE OR REPLACE FUNCTION public.bc_redeem_item(
  p_item_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item bc_store_items%ROWTYPE;
  v_wallet_id uuid;
  v_current_balance integer;
  v_new_balance integer;
  v_code text;
BEGIN
  SELECT * INTO v_item FROM bc_store_items WHERE id = p_item_id AND is_active = true;
  IF v_item IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found');
  END IF;

  IF v_item.stock IS NOT NULL AND v_item.stock <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Out of stock');
  END IF;

  SELECT id, balance INTO v_wallet_id, v_current_balance
  FROM bc_wallets WHERE user_id = auth.uid() FOR UPDATE;

  IF v_wallet_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Wallet not found');
  END IF;

  IF v_current_balance < v_item.cost_bc THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  v_new_balance := v_current_balance - v_item.cost_bc;
  v_code := 'BC-' || upper(to_hex(extract(epoch from now())::bigint));

  UPDATE bc_wallets
  SET balance = v_new_balance,
      lifetime_spent = lifetime_spent + v_item.cost_bc,
      updated_at = now()
  WHERE id = v_wallet_id;

  INSERT INTO bc_transactions (user_id, wallet_id, type, amount, reason, metadata, balance_after)
  VALUES (auth.uid(), v_wallet_id, 'spend', v_item.cost_bc, 'store_redeem',
    jsonb_build_object('store_item_id', p_item_id, 'item_name', v_item.name), v_new_balance);

  INSERT INTO bc_redemptions (user_id, store_item_id, cost_bc, status, redemption_code)
  VALUES (auth.uid(), p_item_id, v_item.cost_bc, 'pending', v_code);

  IF v_item.stock IS NOT NULL THEN
    UPDATE bc_store_items SET stock = stock - 1 WHERE id = p_item_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'balance', v_new_balance, 'redemption_code', v_code);
END;
$$;

-- bc_claim_daily_bonus RPC
CREATE OR REPLACE FUNCTION public.bc_claim_daily_bonus()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet bc_wallets%ROWTYPE;
  v_today date := current_date;
  v_yesterday date := current_date - 1;
  v_is_consecutive boolean;
  v_new_streak integer;
  v_bonus integer;
  v_new_balance integer;
BEGIN
  SELECT * INTO v_wallet FROM bc_wallets WHERE user_id = auth.uid() FOR UPDATE;
  IF v_wallet IS NULL THEN
    RETURN jsonb_build_object('awarded', false, 'amount', 0, 'streak', 0);
  END IF;

  IF v_wallet.last_login_bonus_at = v_today THEN
    RETURN jsonb_build_object('awarded', false, 'amount', 0, 'streak', v_wallet.streak_days);
  END IF;

  v_is_consecutive := v_wallet.last_login_bonus_at = v_yesterday;
  v_new_streak := CASE WHEN v_is_consecutive THEN v_wallet.streak_days + 1 ELSE 1 END;
  v_bonus := LEAST(10 + (v_new_streak - 1) * 5, 50);
  v_new_balance := v_wallet.balance + v_bonus;

  UPDATE bc_wallets
  SET balance = v_new_balance,
      lifetime_earned = lifetime_earned + v_bonus,
      streak_days = v_new_streak,
      last_login_bonus_at = v_today,
      updated_at = now()
  WHERE id = v_wallet.id;

  INSERT INTO bc_transactions (user_id, wallet_id, type, amount, reason, metadata, balance_after)
  VALUES (auth.uid(), v_wallet.id, 'earn', v_bonus, 'daily_login',
    jsonb_build_object('streak', v_new_streak, 'date', v_today::text), v_new_balance);

  RETURN jsonb_build_object('awarded', true, 'amount', v_bonus, 'streak', v_new_streak);
END;
$$;
