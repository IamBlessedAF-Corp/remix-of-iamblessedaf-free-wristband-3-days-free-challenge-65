
-- Fix 1: Make board-screenshots bucket private
UPDATE storage.buckets SET public = false WHERE id = 'board-screenshots';

-- Fix 2: Remove public read policy on campaign_config
DROP POLICY IF EXISTS "Anyone can read campaign_config" ON public.campaign_config;
