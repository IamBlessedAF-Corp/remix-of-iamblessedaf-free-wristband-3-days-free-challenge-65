
-- Add RLS policies for user_roles management by super_admin and admin
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admins can delete roles"
ON public.user_roles
FOR DELETE
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));
