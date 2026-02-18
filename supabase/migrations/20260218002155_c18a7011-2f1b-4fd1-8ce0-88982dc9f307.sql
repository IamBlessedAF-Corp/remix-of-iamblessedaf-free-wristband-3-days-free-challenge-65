
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL UNIQUE,
  allowed_sections text[] NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage role_permissions"
ON public.role_permissions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can read role_permissions"
ON public.role_permissions FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Seed defaults
INSERT INTO public.role_permissions (role, allowed_sections) VALUES
('admin', ARRAY['dashboard','clippers','congrats','experts','leaderboard','blessings','affiliates','blocks','campaign','links','roadmap','waitlist','orders','payments','budget','challenge','sms','gamification','risk','fraud','forecast','alerts','board','logs']),
('developer', ARRAY['dashboard','board','logs','links','roadmap','blocks','campaign','forecast']);
