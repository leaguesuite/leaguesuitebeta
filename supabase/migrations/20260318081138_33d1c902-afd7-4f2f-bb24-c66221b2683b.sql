
-- ============================================
-- Migration 3: Teams, Members, Rosters
-- ============================================

CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  conference_id UUID REFERENCES public.conferences(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  primary_color TEXT,
  secondary_color TEXT,
  logo_url TEXT,
  team_photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender gender_type,
  avatar_url TEXT,
  status member_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.team_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  role roster_role NOT NULL DEFAULT 'player',
  jersey_number INTEGER,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, member_id)
);

CREATE TABLE public.emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Org members can view teams"
  ON public.teams FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), public.get_division_org_id(division_id)));

CREATE POLICY "Org admins can manage teams"
  ON public.teams FOR ALL TO authenticated
  USING (public.get_org_role(auth.uid(), public.get_division_org_id(division_id)) IN ('owner', 'admin', 'manager', 'staff'));

-- Members policies
CREATE POLICY "Org members can view members"
  ON public.members FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Org staff can insert members"
  ON public.members FOR INSERT TO authenticated
  WITH CHECK (public.get_org_role(auth.uid(), org_id) IN ('owner', 'admin', 'manager', 'staff'));

CREATE POLICY "Org staff can update members"
  ON public.members FOR UPDATE TO authenticated
  USING (public.get_org_role(auth.uid(), org_id) IN ('owner', 'admin', 'manager', 'staff'));

CREATE POLICY "Org admins can delete members"
  ON public.members FOR DELETE TO authenticated
  USING (public.get_org_role(auth.uid(), org_id) IN ('owner', 'admin'));

-- Helper: get org_id from team
CREATE OR REPLACE FUNCTION public.get_team_org_id(_team_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_division_org_id(division_id)
  FROM public.teams WHERE id = _team_id LIMIT 1
$$;

-- Team players policies
CREATE POLICY "Org members can view team players"
  ON public.team_players FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), public.get_team_org_id(team_id)));

CREATE POLICY "Org staff can manage team players"
  ON public.team_players FOR ALL TO authenticated
  USING (public.get_org_role(auth.uid(), public.get_team_org_id(team_id)) IN ('owner', 'admin', 'manager', 'staff'));

-- Helper: get org_id from member
CREATE OR REPLACE FUNCTION public.get_member_org_id(_member_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.members WHERE id = _member_id LIMIT 1
$$;

-- Emergency contacts policies
CREATE POLICY "Org members can view emergency contacts"
  ON public.emergency_contacts FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), public.get_member_org_id(member_id)));

CREATE POLICY "Org staff can manage emergency contacts"
  ON public.emergency_contacts FOR ALL TO authenticated
  USING (public.get_org_role(auth.uid(), public.get_member_org_id(member_id)) IN ('owner', 'admin', 'manager', 'staff'));

-- Indexes
CREATE INDEX idx_teams_division_id ON public.teams(division_id);
CREATE INDEX idx_members_org_id ON public.members(org_id);
CREATE INDEX idx_members_user_id ON public.members(user_id);
CREATE INDEX idx_members_email ON public.members(email);
CREATE INDEX idx_team_players_team_id ON public.team_players(team_id);
CREATE INDEX idx_team_players_member_id ON public.team_players(member_id);
CREATE INDEX idx_emergency_contacts_member_id ON public.emergency_contacts(member_id);
