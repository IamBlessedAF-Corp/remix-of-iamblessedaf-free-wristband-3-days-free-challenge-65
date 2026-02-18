
-- Attach audit_log_trigger_fn to critical tables (using DROP IF EXISTS to be safe)
DROP TRIGGER IF EXISTS audit_trigger_orders ON public.orders;
CREATE TRIGGER audit_trigger_orders
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger_fn();

DROP TRIGGER IF EXISTS audit_trigger_creator_profiles ON public.creator_profiles;
CREATE TRIGGER audit_trigger_creator_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.creator_profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger_fn();

DROP TRIGGER IF EXISTS audit_trigger_campaign_config ON public.campaign_config;
CREATE TRIGGER audit_trigger_campaign_config
  AFTER INSERT OR UPDATE OR DELETE ON public.campaign_config
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger_fn();

DROP TRIGGER IF EXISTS audit_trigger_clip_submissions ON public.clip_submissions;
CREATE TRIGGER audit_trigger_clip_submissions
  AFTER INSERT OR UPDATE OR DELETE ON public.clip_submissions
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger_fn();

DROP TRIGGER IF EXISTS audit_trigger_changelog_entries ON public.changelog_entries;
CREATE TRIGGER audit_trigger_changelog_entries
  AFTER INSERT OR UPDATE OR DELETE ON public.changelog_entries
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger_fn();

DROP TRIGGER IF EXISTS audit_trigger_board_cards ON public.board_cards;
CREATE TRIGGER audit_trigger_board_cards
  AFTER INSERT OR UPDATE OR DELETE ON public.board_cards
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger_fn();
