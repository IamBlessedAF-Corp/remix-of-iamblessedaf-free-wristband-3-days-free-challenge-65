
-- Attach audit_log_trigger_fn to the 6 critical tables
-- Using IF NOT EXISTS pattern via DO blocks to be idempotent

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_orders') THEN
    CREATE TRIGGER audit_orders
      AFTER INSERT OR UPDATE OR DELETE ON public.orders
      FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger_fn();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_creator_profiles') THEN
    CREATE TRIGGER audit_creator_profiles
      AFTER INSERT OR UPDATE OR DELETE ON public.creator_profiles
      FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger_fn();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_campaign_config') THEN
    CREATE TRIGGER audit_campaign_config
      AFTER INSERT OR UPDATE OR DELETE ON public.campaign_config
      FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger_fn();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_clip_submissions') THEN
    CREATE TRIGGER audit_clip_submissions
      AFTER INSERT OR UPDATE OR DELETE ON public.clip_submissions
      FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger_fn();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_board_cards') THEN
    CREATE TRIGGER audit_board_cards
      AFTER INSERT OR UPDATE OR DELETE ON public.board_cards
      FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger_fn();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_budget_cycles') THEN
    CREATE TRIGGER audit_budget_cycles
      AFTER INSERT OR UPDATE OR DELETE ON public.budget_cycles
      FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger_fn();
  END IF;
END $$;
