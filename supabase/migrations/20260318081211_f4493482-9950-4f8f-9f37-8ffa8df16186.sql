
-- ============================================
-- Migration 4: Venues, Games, Brackets
-- ============================================

CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  google_maps_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  home_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  away_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  field_id UUID REFERENCES public.fields(id) ON DELETE SET NULL,
  scheduled_date DATE,
  scheduled_time TIME,
  status game_status NOT NULL DEFAULT 'scheduled',
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.brackets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  team_count INTEGER NOT NULL DEFAULT 0,
  status bracket_status NOT NULL DEFAULT 'setup',
  is_reseeding BOOLEAN NOT NULL DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_brackets_updated_at
  BEFORE UPDATE ON public.brackets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.bracket_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bracket_id UUID NOT NULL REFERENCES public.brackets(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  team1_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  team2_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  team1_score INTEGER,
  team2_score INTEGER,
  winner_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  scheduled_date DATE,
  venue TEXT,
  status match_status NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bracket_matches ENABLE ROW LEVEL SECURITY;

-- Locations policies
CREATE POLICY "Org members can view locations"
  ON public.locations FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Org staff can manage locations"
  ON public.locations FOR ALL TO authenticated
  USING (public.get_org_role(auth.uid(), org_id) IN ('owner', 'admin', 'manager', 'staff'));

-- Helper: get org_id from location
CREATE OR REPLACE FUNCTION public.get_location_org_id(_location_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT org_id FROM public.locations WHERE id = _location_id LIMIT 1
$$;

-- Fields policies
CREATE POLICY "Org members can view fields"
  ON public.fields FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), public.get_location_org_id(location_id)));

CREATE POLICY "Org staff can manage fields"
  ON public.fields FOR ALL TO authenticated
  USING (public.get_org_role(auth.uid(), public.get_location_org_id(location_id)) IN ('owner', 'admin', 'manager', 'staff'));

-- Games policies
CREATE POLICY "Org members can view games"
  ON public.games FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), public.get_division_org_id(division_id)));

CREATE POLICY "Org staff can manage games"
  ON public.games FOR ALL TO authenticated
  USING (public.get_org_role(auth.uid(), public.get_division_org_id(division_id)) IN ('owner', 'admin', 'manager', 'staff'));

-- Helper: get org_id from bracket
CREATE OR REPLACE FUNCTION public.get_bracket_org_id(_bracket_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.get_division_org_id(division_id)
  FROM public.brackets WHERE id = _bracket_id LIMIT 1
$$;

-- Brackets policies
CREATE POLICY "Org members can view brackets"
  ON public.brackets FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), public.get_division_org_id(division_id)));

CREATE POLICY "Org staff can manage brackets"
  ON public.brackets FOR ALL TO authenticated
  USING (public.get_org_role(auth.uid(), public.get_division_org_id(division_id)) IN ('owner', 'admin', 'manager', 'staff'));

-- Bracket matches policies
CREATE POLICY "Org members can view bracket matches"
  ON public.bracket_matches FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), public.get_bracket_org_id(bracket_id)));

CREATE POLICY "Org staff can manage bracket matches"
  ON public.bracket_matches FOR ALL TO authenticated
  USING (public.get_org_role(auth.uid(), public.get_bracket_org_id(bracket_id)) IN ('owner', 'admin', 'manager', 'staff'));

-- Indexes
CREATE INDEX idx_locations_org_id ON public.locations(org_id);
CREATE INDEX idx_fields_location_id ON public.fields(location_id);
CREATE INDEX idx_games_division_id ON public.games(division_id);
CREATE INDEX idx_games_home_team ON public.games(home_team_id);
CREATE INDEX idx_games_away_team ON public.games(away_team_id);
CREATE INDEX idx_games_field_id ON public.games(field_id);
CREATE INDEX idx_games_date ON public.games(scheduled_date);
CREATE INDEX idx_brackets_division_id ON public.brackets(division_id);
CREATE INDEX idx_bracket_matches_bracket_id ON public.bracket_matches(bracket_id);
