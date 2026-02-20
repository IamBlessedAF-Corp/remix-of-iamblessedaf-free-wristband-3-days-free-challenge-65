
-- Fix RLS on roadmap_items: allow admins full CRUD
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage roadmap_items" ON public.roadmap_items;
DROP POLICY IF EXISTS "Admins can insert roadmap_items" ON public.roadmap_items;
DROP POLICY IF EXISTS "Admins can update roadmap_items" ON public.roadmap_items;
DROP POLICY IF EXISTS "Admins can delete roadmap_items" ON public.roadmap_items;
DROP POLICY IF EXISTS "Admins can view roadmap_items" ON public.roadmap_items;
DROP POLICY IF EXISTS "Authenticated can view roadmap_items" ON public.roadmap_items;

-- Admins: full access
CREATE POLICY "Admins can manage roadmap_items"
  ON public.roadmap_items
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users: read-only (for portal/roadmap views)
CREATE POLICY "Authenticated can view roadmap_items"
  ON public.roadmap_items
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Fix RLS on roadmap_completions too
ALTER TABLE public.roadmap_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage roadmap_completions" ON public.roadmap_completions;
DROP POLICY IF EXISTS "Authenticated can view roadmap_completions" ON public.roadmap_completions;
DROP POLICY IF EXISTS "Authenticated can insert roadmap_completions" ON public.roadmap_completions;
DROP POLICY IF EXISTS "Authenticated can delete roadmap_completions" ON public.roadmap_completions;

CREATE POLICY "Admins can manage roadmap_completions"
  ON public.roadmap_completions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view roadmap_completions"
  ON public.roadmap_completions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert roadmap_completions"
  ON public.roadmap_completions
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete roadmap_completions"
  ON public.roadmap_completions
  FOR DELETE
  USING (auth.uid() IS NOT NULL);
