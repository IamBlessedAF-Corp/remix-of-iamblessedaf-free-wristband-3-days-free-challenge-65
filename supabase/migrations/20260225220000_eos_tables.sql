-- ============================================================
-- EOS (Entrepreneurial Operating System) TABLES
-- Co-Founder Hub for IamBlessedAF
-- ============================================================

-- ── EOS Organizations (single-tenant for now) ──
CREATE TABLE
IF NOT EXISTS eos_organizations
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  name VARCHAR
(255) NOT NULL,
  slug VARCHAR
(100) UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users
(id),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  updated_at TIMESTAMPTZ DEFAULT NOW
()
);

-- ── EOS Members (team members within an org) ──
CREATE TABLE
IF NOT EXISTS eos_members
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  org_id UUID NOT NULL REFERENCES eos_organizations
(id) ON
DELETE CASCADE,
  user_id UUID
REFERENCES auth.users
(id),
  full_name VARCHAR
(255) NOT NULL,
  email VARCHAR
(255),
  role VARCHAR
(50) DEFAULT 'member',
  seat VARCHAR
(50) DEFAULT 'team_member',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  updated_at TIMESTAMPTZ DEFAULT NOW
()
);

-- ── V/TO (Vision/Traction Organizer) ──
CREATE TABLE
IF NOT EXISTS eos_vto
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  org_id UUID NOT NULL REFERENCES eos_organizations
(id) ON
DELETE CASCADE,
  core_values JSONB DEFAULT '[]',
  core_focus_purpose TEXT,
  core_focus_niche TEXT,
  ten_year_target TEXT,
  marketing_strategy JSONB
DEFAULT '{}',
  three_year_picture JSONB DEFAULT '{}',
  one_year_plan JSONB DEFAULT '{}',
  version INTEGER DEFAULT 1,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  updated_at TIMESTAMPTZ DEFAULT NOW
()
);

-- ── Quarters ──
CREATE TABLE
IF NOT EXISTS eos_quarters
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  org_id UUID NOT NULL REFERENCES eos_organizations
(id) ON
DELETE CASCADE,
  name VARCHAR(50)
NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW
()
);

-- ── Scorecard Measurables ──
CREATE TABLE
IF NOT EXISTS eos_scorecard_measurables
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  org_id UUID NOT NULL REFERENCES eos_organizations
(id) ON
DELETE CASCADE,
  owner_id UUID
NOT NULL REFERENCES eos_members
(id),
  title VARCHAR
(255) NOT NULL,
  description TEXT,
  goal DECIMAL
(15,2) NOT NULL,
  goal_type VARCHAR
(10) DEFAULT 'gte',
  unit VARCHAR
(50) DEFAULT 'number',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  updated_at TIMESTAMPTZ DEFAULT NOW
()
);

-- ── Scorecard Entries (weekly values) ──
CREATE TABLE
IF NOT EXISTS eos_scorecard_entries
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  measurable_id UUID NOT NULL REFERENCES eos_scorecard_measurables
(id) ON
DELETE CASCADE,
  org_id UUID
NOT NULL REFERENCES eos_organizations
(id) ON
DELETE CASCADE,
  week_start DATE
NOT NULL,
  value DECIMAL
(15,2),
  is_on_track BOOLEAN,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  UNIQUE
(measurable_id, week_start)
);

-- ── Rocks (quarterly priorities) ──
CREATE TABLE
IF NOT EXISTS eos_rocks
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  org_id UUID NOT NULL REFERENCES eos_organizations
(id) ON
DELETE CASCADE,
  quarter_id UUID
NOT NULL REFERENCES eos_quarters
(id) ON
DELETE CASCADE,
  owner_id UUID
NOT NULL REFERENCES eos_members
(id),
  title VARCHAR
(500) NOT NULL,
  description TEXT,
  status VARCHAR
(20) DEFAULT 'on_track',
  is_company_rock BOOLEAN DEFAULT false,
  completion_percentage INTEGER DEFAULT 0 CHECK
(completion_percentage BETWEEN 0 AND 100),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  updated_at TIMESTAMPTZ DEFAULT NOW
()
);

-- ── Rock Milestones ──
CREATE TABLE
IF NOT EXISTS eos_rock_milestones
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  rock_id UUID NOT NULL REFERENCES eos_rocks
(id) ON
DELETE CASCADE,
  title VARCHAR(500)
NOT NULL,
  is_complete BOOLEAN DEFAULT false,
  due_date DATE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW
()
);

-- ── Issues (IDS: Identify, Discuss, Solve) ──
CREATE TABLE
IF NOT EXISTS eos_issues
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  org_id UUID NOT NULL REFERENCES eos_organizations
(id) ON
DELETE CASCADE,
  created_by UUID
NOT NULL REFERENCES eos_members
(id),
  assigned_to UUID REFERENCES eos_members
(id),
  title VARCHAR
(500) NOT NULL,
  description TEXT,
  issue_type VARCHAR
(20) DEFAULT 'company',
  priority VARCHAR
(20) DEFAULT 'important',
  status VARCHAR
(20) DEFAULT 'open',
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  updated_at TIMESTAMPTZ DEFAULT NOW
()
);

-- ── To-Dos (7-day action items) ──
CREATE TABLE
IF NOT EXISTS eos_todos
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  org_id UUID NOT NULL REFERENCES eos_organizations
(id) ON
DELETE CASCADE,
  owner_id UUID
NOT NULL REFERENCES eos_members
(id),
  title VARCHAR
(500) NOT NULL,
  description TEXT,
  is_complete BOOLEAN DEFAULT false,
  due_date DATE,
  source_type VARCHAR
(50),
  source_id UUID,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  updated_at TIMESTAMPTZ DEFAULT NOW
()
);

-- ── L10 Meetings ──
CREATE TABLE
IF NOT EXISTS eos_l10_meetings
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  org_id UUID NOT NULL REFERENCES eos_organizations
(id) ON
DELETE CASCADE,
  title VARCHAR(255)
DEFAULT 'Level 10 Meeting',
  meeting_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  status VARCHAR
(20) DEFAULT 'scheduled',
  facilitator_id UUID REFERENCES eos_members
(id),
  segue_notes TEXT,
  scorecard_notes TEXT,
  rock_review_notes TEXT,
  customer_employee_headlines TEXT,
  todo_review_notes TEXT,
  ids_notes TEXT,
  conclude_notes TEXT,
  conclude_rating DECIMAL
(3,1),
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  updated_at TIMESTAMPTZ DEFAULT NOW
()
);

-- ── L10 Attendees ──
CREATE TABLE
IF NOT EXISTS eos_l10_attendees
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  meeting_id UUID NOT NULL REFERENCES eos_l10_meetings
(id) ON
DELETE CASCADE,
  member_id UUID
NOT NULL REFERENCES eos_members
(id),
  is_present BOOLEAN DEFAULT true,
  rating INTEGER CHECK
(rating BETWEEN 1 AND 10),
  UNIQUE
(meeting_id, member_id)
);

-- ── Accountability Chart (seats) ──
CREATE TABLE
IF NOT EXISTS eos_accountability_seats
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  org_id UUID NOT NULL REFERENCES eos_organizations
(id) ON
DELETE CASCADE,
  parent_seat_id UUID
REFERENCES eos_accountability_seats
(id),
  title VARCHAR
(255) NOT NULL,
  department VARCHAR
(100),
  roles JSONB DEFAULT '[]',
  member_id UUID REFERENCES eos_members
(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  updated_at TIMESTAMPTZ DEFAULT NOW
()
);

-- ── People Analyzer ──
CREATE TABLE
IF NOT EXISTS eos_people_analyses
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  org_id UUID NOT NULL REFERENCES eos_organizations
(id) ON
DELETE CASCADE,
  member_id UUID
NOT NULL REFERENCES eos_members
(id),
  analyzer_id UUID NOT NULL REFERENCES eos_members
(id),
  quarter_id UUID REFERENCES eos_quarters
(id),
  core_values_ratings JSONB DEFAULT '[]',
  gets_it BOOLEAN,
  wants_it BOOLEAN,
  has_capacity BOOLEAN,
  is_right_person BOOLEAN,
  is_right_seat BOOLEAN,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  updated_at TIMESTAMPTZ DEFAULT NOW
()
);

-- ── Core Processes ──
CREATE TABLE
IF NOT EXISTS eos_processes
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  org_id UUID NOT NULL REFERENCES eos_organizations
(id) ON
DELETE CASCADE,
  title VARCHAR(255)
NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES eos_members
(id),
  steps JSONB DEFAULT '[]',
  is_documented BOOLEAN DEFAULT false,
  is_followed_by_all BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  updated_at TIMESTAMPTZ DEFAULT NOW
()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX
IF NOT EXISTS idx_eos_members_org ON eos_members
(org_id);
CREATE INDEX
IF NOT EXISTS idx_eos_vto_org ON eos_vto
(org_id);
CREATE INDEX
IF NOT EXISTS idx_eos_quarters_org ON eos_quarters
(org_id);
CREATE INDEX
IF NOT EXISTS idx_eos_measurables_org ON eos_scorecard_measurables
(org_id);
CREATE INDEX
IF NOT EXISTS idx_eos_entries_measurable ON eos_scorecard_entries
(measurable_id);
CREATE INDEX
IF NOT EXISTS idx_eos_rocks_org ON eos_rocks
(org_id);
CREATE INDEX
IF NOT EXISTS idx_eos_rocks_quarter ON eos_rocks
(quarter_id);
CREATE INDEX
IF NOT EXISTS idx_eos_issues_org ON eos_issues
(org_id);
CREATE INDEX
IF NOT EXISTS idx_eos_todos_org ON eos_todos
(org_id);
CREATE INDEX
IF NOT EXISTS idx_eos_todos_owner ON eos_todos
(owner_id);
CREATE INDEX
IF NOT EXISTS idx_eos_meetings_org ON eos_l10_meetings
(org_id);
CREATE INDEX
IF NOT EXISTS idx_eos_seats_org ON eos_accountability_seats
(org_id);
CREATE INDEX
IF NOT EXISTS idx_eos_people_org ON eos_people_analyses
(org_id);
CREATE INDEX
IF NOT EXISTS idx_eos_processes_org ON eos_processes
(org_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- Only admin/super_admin users (from user_roles) can access
-- ============================================================
ALTER TABLE eos_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE eos_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE eos_vto ENABLE ROW LEVEL SECURITY;
ALTER TABLE eos_quarters ENABLE ROW LEVEL SECURITY;
ALTER TABLE eos_scorecard_measurables ENABLE ROW LEVEL SECURITY;
ALTER TABLE eos_scorecard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE eos_rocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE eos_rock_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE eos_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE eos_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eos_l10_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE eos_l10_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE eos_accountability_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE eos_people_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE eos_processes ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin or super_admin
CREATE OR REPLACE FUNCTION is_eos_admin
()
RETURNS BOOLEAN AS $$
SELECT EXISTS
(
    SELECT 1
FROM user_roles
WHERE user_id = auth.uid()
  AND role IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Apply RLS policies to all EOS tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
  SELECT unnest(ARRAY[
      'eos_organizations', 'eos_members', 'eos_vto', 'eos_quarters',
      'eos_scorecard_measurables', 'eos_scorecard_entries',
      'eos_rocks', 'eos_rock_milestones', 'eos_issues', 'eos_todos',
      'eos_l10_meetings', 'eos_l10_attendees',
      'eos_accountability_seats', 'eos_people_analyses', 'eos_processes'
    ]
  )
  LOOP
  EXECUTE format
  ('CREATE POLICY "eos_admin_select_%1$s" ON %1$s FOR SELECT USING (is_eos_admin())', tbl);
  EXECUTE format
  ('CREATE POLICY "eos_admin_insert_%1$s" ON %1$s FOR INSERT WITH CHECK (is_eos_admin())', tbl);
  EXECUTE format
  ('CREATE POLICY "eos_admin_update_%1$s" ON %1$s FOR UPDATE USING (is_eos_admin())', tbl);
  EXECUTE format
  ('CREATE POLICY "eos_admin_delete_%1$s" ON %1$s FOR DELETE USING (is_eos_admin())', tbl);
END
LOOP;
END $$;
