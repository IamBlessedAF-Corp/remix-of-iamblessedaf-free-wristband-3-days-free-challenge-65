-- Add streak tracking columns to challenge_participants
ALTER TABLE public.challenge_participants
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;