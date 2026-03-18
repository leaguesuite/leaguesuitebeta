
-- ============================================
-- Migration 5: Stats Engine
-- ============================================

CREATE TABLE public.stat_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  stat_key TEXT NOT NULL,
  label TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  category stat_category NOT NULL,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, stat_key)
);

CREATE TABLE public.stat_tracking_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  stat_definition_id UUID NOT NULL REFERENCES public.stat_definitions(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(category_id, stat_definition_id)
);

CREATE TABLE public.player_game_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  stat_key TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.member_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  offensive NUMERIC DEFAULT 0,
  defensive NUMERIC DEFAULT 0,
  qb NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(member_id, season_id)
);

-- RLS
ALTER TABLE public.stat_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stat_tracking_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_ratings ENABLE ROW LEVEL SECURITY;

-- Stat definitions policies
CREATE POLICY "Org members can view stat definitions"
  ON public.stat_definitions FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Org admins can manage stat definitions"
  ON public.stat_definitions FOR ALL TO authenticated
  USING (public.get_org_role(auth.uid(), org_id) IN ('owner', 'admin', 'manager'));

-- Helper: get org_id from category
CREATE OR REPLACE FUNCTION public.get_category_org_id(_category_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.get_league_org_id(league_id)
  FROM public.categories WHERE id = _category_id LIMIT 1
$$;

-- Stat tracking config policies
CREATE POLICY "Org members can view stat tracking config"
  ON public.stat_tracking_config FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), public.get_category_org_id(category_id)));

CREATE POLICY "Org admins can manage stat tracking config"
  ON public.stat_tracking_config FOR ALL TO authenticated
  USING (public.get_org_role(auth.uid(), public.get_category_org_id(category_id)) IN ('owner', 'admin', 'manager'));

-- Helper: get org_id from game
CREATE OR REPLACE FUNCTION public.get_game_org_id(_game_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.get_division_org_id(division_id)
  FROM public.games WHERE id = _game_id LIMIT 1
$$;

-- Player game stats policies
CREATE POLICY "Org members can view player game stats"
  ON public.player_game_stats FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), public.get_game_org_id(game_id)));

CREATE POLICY "Org staff can manage player game stats"
  ON public.player_game_stats FOR ALL TO authenticated
  USING (public.get_org_role(auth.uid(), public.get_game_org_id(game_id)) IN ('owner', 'admin', 'manager', 'staff'));

-- Member ratings policies
CREATE POLICY "Org members can view member ratings"
  ON public.member_ratings FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), public.get_member_org_id(member_id)));

CREATE POLICY "Org staff can manage member ratings"
  ON public.member_ratings FOR ALL TO authenticated
  USING (public.get_org_role(auth.uid(), public.get_member_org_id(member_id)) IN ('owner', 'admin', 'manager', 'staff'));

-- Indexes
CREATE INDEX idx_stat_definitions_org_id ON public.stat_definitions(org_id);
CREATE INDEX idx_stat_definitions_category ON public.stat_definitions(category);
CREATE INDEX idx_stat_tracking_config_category_id ON public.stat_tracking_config(category_id);
CREATE INDEX idx_player_game_stats_game_id ON public.player_game_stats(game_id);
CREATE INDEX idx_player_game_stats_member_id ON public.player_game_stats(member_id);
CREATE INDEX idx_player_game_stats_game_member ON public.player_game_stats(game_id, member_id);
CREATE INDEX idx_player_game_stats_stat_key ON public.player_game_stats(stat_key);
CREATE INDEX idx_member_ratings_member_id ON public.member_ratings(member_id);
CREATE INDEX idx_member_ratings_season_id ON public.member_ratings(season_id);
