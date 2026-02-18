
-- Fix RLS policies on roadmap_completions to include super_admin
DROP POLICY IF EXISTS "Admins can manage roadmap_completions" ON public.roadmap_completions;
CREATE POLICY "Admins can manage roadmap_completions"
ON public.roadmap_completions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
