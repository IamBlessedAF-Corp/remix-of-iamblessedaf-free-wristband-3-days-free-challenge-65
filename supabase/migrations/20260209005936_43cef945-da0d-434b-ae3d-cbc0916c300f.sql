
-- Tighten RLS: drop the overly permissive policy, replace with service-role-only insert
DROP POLICY "Service role can manage orders" ON public.orders;

-- No public policies at all — only service_role can access this table
-- This is the most secure approach for a webhook-only table
