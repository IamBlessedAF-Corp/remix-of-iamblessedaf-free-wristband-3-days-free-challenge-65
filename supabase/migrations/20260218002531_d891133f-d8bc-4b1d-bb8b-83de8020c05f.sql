
DROP POLICY "Admins can manage role_permissions" ON public.role_permissions;

CREATE POLICY "Admins can manage role_permissions"
ON public.role_permissions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
