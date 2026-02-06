-- Fix 1: Update RLS policies to explicitly require authentication
-- Drop existing policies and recreate with auth.uid() IS NOT NULL checks

DROP POLICY IF EXISTS "Users can view their own profile" ON public.creator_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.creator_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.creator_profiles;

-- Recreate with explicit authentication checks
CREATE POLICY "Users can view their own profile"
ON public.creator_profiles
FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.creator_profiles
FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.creator_profiles
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Fix 2: Create blessings table for tracking confirmations with unique tokens
CREATE TABLE IF NOT EXISTS public.blessings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  confirmation_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  recipient_name TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days')
);

-- Add index for token lookups
CREATE INDEX IF NOT EXISTS idx_blessings_confirmation_token ON public.blessings(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_blessings_sender_id ON public.blessings(sender_id);

-- Enable RLS on blessings
ALTER TABLE public.blessings ENABLE ROW LEVEL SECURITY;

-- Senders can view their own blessings
CREATE POLICY "Users can view their own blessings"
ON public.blessings
FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = sender_id);

-- Senders can create blessings
CREATE POLICY "Users can create blessings"
ON public.blessings
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = sender_id);

-- Anyone can confirm a blessing by token (public endpoint via edge function)
-- We'll handle confirmation via edge function with service role

-- Create function to confirm a blessing and increment sender's BC count
CREATE OR REPLACE FUNCTION public.confirm_blessing(token UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  blessing_record RECORD;
  result JSONB;
BEGIN
  -- Find the blessing by token
  SELECT * INTO blessing_record 
  FROM public.blessings 
  WHERE confirmation_token = token;
  
  -- Check if blessing exists
  IF blessing_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Blessing not found');
  END IF;
  
  -- Check if already confirmed
  IF blessing_record.confirmed_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already confirmed');
  END IF;
  
  -- Check if expired
  IF blessing_record.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Blessing link expired');
  END IF;
  
  -- Confirm the blessing
  UPDATE public.blessings 
  SET confirmed_at = now() 
  WHERE id = blessing_record.id;
  
  -- Increment the sender's blessings_confirmed count
  UPDATE public.creator_profiles 
  SET blessings_confirmed = blessings_confirmed + 1,
      updated_at = now()
  WHERE user_id = blessing_record.sender_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Blessing confirmed!');
END;
$$;

-- Get global blessing count for display
CREATE OR REPLACE FUNCTION public.get_global_blessing_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(blessings_confirmed), 0)::INTEGER FROM public.creator_profiles;
$$;