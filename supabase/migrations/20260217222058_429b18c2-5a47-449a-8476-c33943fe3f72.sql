
-- Budget cycles (weekly governance periods)
CREATE TABLE public.budget_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending_approval',
  approved_at timestamptz,
  approved_by uuid,
  global_weekly_limit_cents integer NOT NULL DEFAULT 500000,
  global_monthly_limit_cents integer NOT NULL DEFAULT 2000000,
  emergency_reserve_cents integer NOT NULL DEFAULT 50000,
  max_payout_per_clip_cents integer NOT NULL DEFAULT 50000,
  max_payout_per_clipper_week_cents integer NOT NULL DEFAULT 100000,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending_approval','approved','locked','killed'))
);

-- Budget segments (configurable spend groups)
CREATE TABLE public.budget_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rules jsonb NOT NULL DEFAULT '{}',
  weekly_limit_cents integer NOT NULL DEFAULT 100000,
  monthly_limit_cents integer NOT NULL DEFAULT 400000,
  priority integer NOT NULL DEFAULT 1,
  soft_throttle_config jsonb NOT NULL DEFAULT '{"reduce_rpm": true, "raise_thresholds": false, "pause_bonuses": true, "limit_new_clips": false}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Budget segment cycles (per-segment per-cycle tracking)
CREATE TABLE public.budget_segment_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id uuid NOT NULL REFERENCES public.budget_segments(id) ON DELETE CASCADE,
  cycle_id uuid NOT NULL REFERENCES public.budget_cycles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  approved_at timestamptz,
  approved_by uuid,
  spent_cents integer NOT NULL DEFAULT 0,
  projected_cents integer NOT NULL DEFAULT 0,
  remaining_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(segment_id, cycle_id),
  CONSTRAINT valid_seg_status CHECK (status IN ('pending','approved','throttled','killed'))
);

-- Clipper segment membership
CREATE TABLE public.clipper_segment_membership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  segment_id uuid NOT NULL REFERENCES public.budget_segments(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid,
  UNIQUE(user_id, segment_id)
);

-- Budget events log (audit trail with rollback)
CREATE TABLE public.budget_events_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  actor uuid,
  action text NOT NULL,
  before_state jsonb,
  after_state jsonb,
  impacted_segments uuid[],
  rollback_token uuid DEFAULT gen_random_uuid(),
  estimated_impact_cents integer DEFAULT 0,
  notes text
);

-- Enable RLS on all tables
ALTER TABLE public.budget_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_segment_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clipper_segment_membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_events_log ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for all budget tables
CREATE POLICY "Admins can manage budget_cycles" ON public.budget_cycles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage budget_segments" ON public.budget_segments FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage budget_segment_cycles" ON public.budget_segment_cycles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage clipper_segment_membership" ON public.clipper_segment_membership FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage budget_events_log" ON public.budget_events_log FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Timestamp triggers
CREATE TRIGGER update_budget_cycles_updated_at BEFORE UPDATE ON public.budget_cycles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_budget_segments_updated_at BEFORE UPDATE ON public.budget_segments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_budget_segment_cycles_updated_at BEFORE UPDATE ON public.budget_segment_cycles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
