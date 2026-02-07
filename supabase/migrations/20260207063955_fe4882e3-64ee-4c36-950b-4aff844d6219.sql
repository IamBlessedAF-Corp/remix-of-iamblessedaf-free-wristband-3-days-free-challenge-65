-- Revoke direct access to confirm_blessing from public and anon roles
-- Only service_role (used by the edge function) should be able to call it
REVOKE EXECUTE ON FUNCTION public.confirm_blessing(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.confirm_blessing(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.confirm_blessing(UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_blessing(UUID) TO service_role;