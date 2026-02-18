
-- Changelog entries for tracking code changes/prompts
CREATE TABLE public.changelog_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  prompt_summary text NOT NULL,
  affected_areas text[] NOT NULL DEFAULT '{}',
  change_details text,
  code_changes jsonb DEFAULT '[]'::jsonb,
  created_by uuid,
  tags text[] DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.changelog_entries ENABLE ROW LEVEL SECURITY;

-- Admins can manage
CREATE POLICY "Admins can manage changelog"
ON public.changelog_entries FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Developers can read
CREATE POLICY "Developers can read changelog"
ON public.changelog_entries FOR SELECT
USING (has_role(auth.uid(), 'developer'::app_role));

-- Seed with recent changes
INSERT INTO public.changelog_entries (created_at, prompt_summary, affected_areas, change_details, code_changes, tags) VALUES
(now() - interval '2 hours', 'Migrar permisos de roles de localStorage a base de datos', 
 ARRAY['RolesTab', 'AdminHub', 'role_permissions table'], 
 'Se creó la tabla role_permissions para persistir los permisos de cada rol en la base de datos en vez de localStorage. Se actualizó RolesTab para usar upsert de Supabase y React Query. AdminHub ahora precarga los permisos al inicio.',
 '[{"file": "src/components/admin/RolesTab.tsx", "action": "edited", "summary": "Replaced localStorage with Supabase upsert + React Query", "diff": "- localStorage.setItem(''role_perms_'' + role, JSON.stringify(sections));\n+ await supabase.from(''role_permissions'').upsert({ role, allowed_sections: sections });"}, {"file": "src/pages/AdminHub.tsx", "action": "edited", "summary": "Added fetchRolePermissions preload query", "diff": "+ useQuery({ queryKey: [''role-permissions''], queryFn: fetchRolePermissions });"}]'::jsonb,
 ARRAY['database', 'security', 'permissions']),

(now() - interval '3 hours', 'Fix password reset en Operations → Roles', 
 ARRAY['manage-user edge function'], 
 'Se corrigió un error donde adminClient.auth.admin.updateUser no era reconocido. Se reemplazó con una llamada REST directa al endpoint de auth admin de Supabase.',
 '[{"file": "supabase/functions/manage-user/index.ts", "action": "edited", "summary": "Switched from SDK to direct REST API for password reset", "diff": "- const { error } = await adminClient.auth.admin.updateUser(user_id, { password: new_password });\n+ const updateRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user_id}`, {\n+   method: ''PUT'',\n+   headers: { Authorization: `Bearer ${serviceKey}` },\n+   body: JSON.stringify({ password: new_password })\n+ });"}]'::jsonb,
 ARRAY['edge-function', 'auth', 'bugfix']),

(now() - interval '4 hours', 'Fix RLS policy para role_permissions - permitir super_admin', 
 ARRAY['role_permissions RLS policies'], 
 'La política RLS original solo permitía el rol admin. Se actualizó para incluir super_admin, permitiendo al usuario principal gestionar los permisos.',
 '[{"file": "supabase/migrations/", "action": "created", "summary": "Updated RLS policy to include super_admin", "diff": "- USING (has_role(auth.uid(), ''admin''::app_role))\n+ USING (has_role(auth.uid(), ''admin''::app_role) OR has_role(auth.uid(), ''super_admin''::app_role))"}]'::jsonb,
 ARRAY['database', 'security', 'rls']),

(now() - interval '1 hour', 'Crear usuario admin suritabtc@gmail.com', 
 ARRAY['user_roles', 'creator_profiles', 'auth.users'], 
 'Se creó un nuevo usuario con rol admin usando la función invite-user desde el panel de Operations → Roles. El usuario recibe email con credenciales temporales.',
 '[{"file": "invite-user (edge function)", "action": "executed", "summary": "Created user + assigned admin role + creator profile", "diff": "POST /invite-user\n{\n  email: suritabtc@gmail.com,\n  role: admin,\n  display_name: Surita BTC\n}"}]'::jsonb,
 ARRAY['users', 'admin', 'onboarding']);
