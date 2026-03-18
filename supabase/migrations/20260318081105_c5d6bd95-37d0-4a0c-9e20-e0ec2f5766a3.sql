
-- ============================================
-- Migration 2: League Structure
-- ============================================

CREATE TABLE public.leagues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sport_type TEXT NOT NULL DEFAULT 'flag_football',
  status TEXT NOT NULL DEFAULT 'active',
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_leagues_updated_at
  BEFORE UPDATE ON public.leagues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rules JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.seasons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  status season_status NOT NULL DEFAULT 'draft',
  registration_open BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_seasons_updated_at
  BEFORE UPDATE ON public.seasons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.divisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  team_cap INTEGER,
  qb_cap INTEGER,
  status division_status NOT NULL DEFAULT 'setup',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.conferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conferences ENABLE ROW LEVEL SECURITY;

-- Helper: get org_id from league
CREATE OR REPLACE FUNCTION public.get_league_org_id(_league_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.leagues WHERE id = _league_id LIMIT 1
$$;

-- Leagues policies
CREATE POLICY "Org members can view leagues"
  ON public.leagues FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Org admins can insert leagues"
  ON public.leagues FOR INSERT TO authenticated
  WITH CHECK (public.get_org_role(auth.uid(), org_id) IN ('owner', 'admin', 'manager'));

CREATE POLICY "Org admins can update leagues"
  ON public.leagues FOR UPDATE TO authenticated
  USING (public.get_org_role(auth.uid(), org_id) IN ('owner', 'admin', 'manager'));

CREATE POLICY "Org admins can delete leagues"
  ON public.leagues FOR DELETE TO authenticated
  USING (public.get_org_role(auth.uid(), org_id) IN ('owner', 'admin'));

-- Categories policies
CREATE POLICY "Org members can view categories"
  ON public.categories FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), public.get_league_org_id(league_id)));

CREATE POLICY "Org admins can manage categories"
  ON public.categories FOR ALL TO authenticated
  USING (public.get_org_role(auth.uid(), public.get_league_org_id(league_id)) IN ('owner', 'admin', 'manager'));

-- Helper: get org_id from season
CREATE OR REPLACE FUNCTION public.get_season_org_id(_season_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT l.org_id FROM public.seasons s
  JOIN public.leagues l ON l.id = s.league_id
  WHERE s.id = _season_id LIMIT 1
$$;

-- Seasons policies
CREATE POLICY "Org members can view seasons"
  ON public.seasons FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), public.get_league_org_id(league_id)));

CREATE POLICY "Org admins can manage seasons"
  ON public.seasons FOR ALL TO authenticated
  USING (public.get_org_role(auth.uid(), public.get_league_org_id(league_id)) IN ('owner', 'admin', 'manager'));

-- Helper: get org_id from division
CREATE OR REPLACE FUNCTION public.get_division_org_id(_division_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT l.org_id FROM public.divisions d
  JOIN public.seasons s ON s.id = d.season_id
  JOIN public.leagues l ON l.id = s.league_id
  WHERE d.id = _division_id LIMIT 1
$$;

-- Divisions policies
CREATE POLICY "Org members can view divisions"
  ON public.divisions FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), public.get_season_org_id(season_id)));

CREATE POLICY "Org admins can manage divisions"
  ON public.divisions FOR ALL TO authenticated
  USING (public.get_org_role(auth.uid(), public.get_season_org_id(season_id)) IN ('owner', 'admin', 'manager'));

-- Conferences policies
CREATE POLICY "Org members can view conferences"
  ON public.conferences FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), public.get_division_org_id(division_id)));

CREATE POLICY "Org admins can manage conferences"
  ON public.conferences FOR ALL TO authenticated
  USING (public.get_org_role(auth.uid(), public.get_division_org_id(division_id)) IN ('owner', 'admin', 'manager'));

-- Indexes
CREATE INDEX idx_leagues_org_id ON public.leagues(org_id);
CREATE INDEX idx_categories_league_id ON public.categories(league_id);
CREATE INDEX idx_seasons_league_id ON public.seasons(league_id);
CREATE INDEX idx_divisions_season_id ON public.divisions(season_id);
CREATE INDEX idx_divisions_category_id ON public.divisions(category_id);
CREATE INDEX idx_conferences_division_id ON public.conferences(division_id);
