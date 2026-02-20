
-- Fix RLS policies for roadmap_items to include super_admin and developer roles
DROP POLICY IF EXISTS "Admins can manage roadmap_items" ON public.roadmap_items;
DROP POLICY IF EXISTS "Authenticated can view roadmap_items" ON public.roadmap_items;

-- Full CRUD for admin, super_admin, and developer
CREATE POLICY "Admins can manage roadmap_items"
  ON public.roadmap_items FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'developer'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'developer'::app_role)
  );

-- Read-only for all authenticated users
CREATE POLICY "Authenticated can view roadmap_items"
  ON public.roadmap_items FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Fix roadmap_completions too while we're at it
DROP POLICY IF EXISTS "Admins can manage roadmap_completions" ON public.roadmap_completions;
DROP POLICY IF EXISTS "Authenticated can view roadmap_completions" ON public.roadmap_completions;

CREATE POLICY "Admins can manage roadmap_completions"
  ON public.roadmap_completions FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'developer'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'developer'::app_role)
  );

CREATE POLICY "Authenticated can view roadmap_completions"
  ON public.roadmap_completions FOR SELECT
  USING (auth.uid() IS NOT NULL);
