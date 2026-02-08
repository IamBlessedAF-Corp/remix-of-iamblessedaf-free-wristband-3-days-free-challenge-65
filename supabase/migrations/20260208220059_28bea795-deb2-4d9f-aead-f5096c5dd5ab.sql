
-- =====================================================
-- Blessed Coins (BC) Currency System — Database Schema
-- =====================================================

-- BC Wallets — one per authenticated user
CREATE TABLE public.bc_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_login_bonus_at DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bc_wallets ENABLE ROW LEVEL SECURITY;

-- Users can view their own wallet
CREATE POLICY "Users can view own wallet"
ON public.bc_wallets FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own wallet (on first sync)
CREATE POLICY "Users can create own wallet"
ON public.bc_wallets FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own wallet
CREATE POLICY "Users can update own wallet"
ON public.bc_wallets FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all wallets
CREATE POLICY "Admins can view all wallets"
ON public.bc_wallets FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_bc_wallets_updated_at
BEFORE UPDATE ON public.bc_wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- BC Transactions — immutable ledger of all coin events
-- =====================================================

-- Transaction types
-- earn: checkout, daily_login, share, referral, streak_bonus, manual
-- spend: store_redeem, discount_applied

CREATE TABLE public.bc_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_id UUID NOT NULL REFERENCES public.bc_wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend')),
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  balance_after INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bc_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
ON public.bc_transactions FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions"
ON public.bc_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
ON public.bc_transactions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes
CREATE INDEX idx_bc_transactions_user ON public.bc_transactions(user_id, created_at DESC);
CREATE INDEX idx_bc_transactions_wallet ON public.bc_transactions(wallet_id);
CREATE INDEX idx_bc_transactions_type ON public.bc_transactions(type);

-- =====================================================
-- BC Store Items — redeemable rewards
-- =====================================================

CREATE TABLE public.bc_store_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cost_bc INTEGER NOT NULL,
  category TEXT NOT NULL DEFAULT 'perk',
  reward_type TEXT NOT NULL DEFAULT 'discount',
  reward_value JSONB NOT NULL DEFAULT '{}',
  image_url TEXT,
  stock INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS — store items are publicly viewable
ALTER TABLE public.bc_store_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active store items"
ON public.bc_store_items FOR SELECT
USING (is_active = true);

-- Admins can manage store items
CREATE POLICY "Admins can manage store items"
ON public.bc_store_items FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- BC Redemptions — tracks when users redeem store items
-- =====================================================

CREATE TABLE public.bc_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  store_item_id UUID NOT NULL REFERENCES public.bc_store_items(id),
  cost_bc INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
  redemption_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bc_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemptions"
ON public.bc_redemptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own redemptions"
ON public.bc_redemptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage redemptions"
ON public.bc_redemptions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_bc_redemptions_user ON public.bc_redemptions(user_id, created_at DESC);
