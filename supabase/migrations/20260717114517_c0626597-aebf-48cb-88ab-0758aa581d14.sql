CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.get_org_role(_user_id uuid, _org_id uuid)
RETURNS org_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.organization_members WHERE user_id = _user_id AND org_id = _org_id LIMIT 1 $$;

CREATE OR REPLACE FUNCTION private.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.organization_members WHERE user_id = _user_id AND org_id = _org_id) $$;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION private.get_league_org_id(_league_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT org_id FROM public.leagues WHERE id = _league_id LIMIT 1 $$;

CREATE OR REPLACE FUNCTION private.get_season_org_id(_season_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT l.org_id FROM public.seasons s JOIN public.leagues l ON l.id = s.league_id WHERE s.id = _season_id LIMIT 1 $$;

CREATE OR REPLACE FUNCTION private.get_division_org_id(_division_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT l.org_id FROM public.divisions d JOIN public.seasons s ON s.id = d.season_id JOIN public.leagues l ON l.id = s.league_id WHERE d.id = _division_id LIMIT 1 $$;

CREATE OR REPLACE FUNCTION private.get_team_org_id(_team_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT private.get_division_org_id(division_id) FROM public.teams WHERE id = _team_id LIMIT 1 $$;

CREATE OR REPLACE FUNCTION private.get_member_org_id(_member_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT org_id FROM public.members WHERE id = _member_id LIMIT 1 $$;

CREATE OR REPLACE FUNCTION private.get_game_org_id(_game_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT private.get_division_org_id(division_id) FROM public.games WHERE id = _game_id LIMIT 1 $$;

CREATE OR REPLACE FUNCTION private.get_bracket_org_id(_bracket_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT private.get_division_org_id(division_id) FROM public.brackets WHERE id = _bracket_id LIMIT 1 $$;

CREATE OR REPLACE FUNCTION private.get_location_org_id(_location_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT org_id FROM public.locations WHERE id = _location_id LIMIT 1 $$;

CREATE OR REPLACE FUNCTION private.get_award_org_id(_award_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT org_id FROM public.awards WHERE id = _award_id LIMIT 1 $$;

CREATE OR REPLACE FUNCTION private.get_form_org_id(_form_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT private.get_season_org_id(season_id) FROM public.registration_forms WHERE id = _form_id LIMIT 1 $$;

CREATE OR REPLACE FUNCTION private.get_category_org_id(_category_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT private.get_league_org_id(league_id) FROM public.categories WHERE id = _category_id LIMIT 1 $$;

REVOKE ALL ON FUNCTION
  private.get_org_role(uuid,uuid),
  private.is_org_member(uuid,uuid),
  private.has_role(uuid, app_role),
  private.get_league_org_id(uuid),
  private.get_season_org_id(uuid),
  private.get_division_org_id(uuid),
  private.get_team_org_id(uuid),
  private.get_member_org_id(uuid),
  private.get_game_org_id(uuid),
  private.get_bracket_org_id(uuid),
  private.get_location_org_id(uuid),
  private.get_award_org_id(uuid),
  private.get_form_org_id(uuid),
  private.get_category_org_id(uuid)
FROM PUBLIC;

GRANT EXECUTE ON FUNCTION
  private.get_org_role(uuid,uuid),
  private.is_org_member(uuid,uuid),
  private.has_role(uuid, app_role),
  private.get_league_org_id(uuid),
  private.get_season_org_id(uuid),
  private.get_division_org_id(uuid),
  private.get_team_org_id(uuid),
  private.get_member_org_id(uuid),
  private.get_game_org_id(uuid),
  private.get_bracket_org_id(uuid),
  private.get_location_org_id(uuid),
  private.get_award_org_id(uuid),
  private.get_form_org_id(uuid),
  private.get_category_org_id(uuid)
TO authenticated, service_role;

DROP POLICY IF EXISTS "Public can view members" ON public.members;
DROP POLICY IF EXISTS "Public can view organizations" ON public.organizations;
DROP POLICY IF EXISTS "Public can view team_players" ON public.team_players;
DROP POLICY IF EXISTS "Public can view player_game_stats" ON public.player_game_stats;

DROP POLICY IF EXISTS "Authenticated can insert scorekeeper categories" ON public.scorekeeper_categories;
DROP POLICY IF EXISTS "Authenticated can update scorekeeper categories" ON public.scorekeeper_categories;
DROP POLICY IF EXISTS "Authenticated can delete scorekeeper categories" ON public.scorekeeper_categories;

CREATE POLICY "Admins can insert scorekeeper categories" ON public.scorekeeper_categories
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update scorekeeper categories" ON public.scorekeeper_categories
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete scorekeeper categories" ON public.scorekeeper_categories
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Org members can view their organization" ON public.organizations;
CREATE POLICY "Org members can view their organization" ON public.organizations FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), id));
DROP POLICY IF EXISTS "Org admins can update their organization" ON public.organizations;
CREATE POLICY "Org admins can update their organization" ON public.organizations FOR UPDATE TO authenticated USING ((private.get_org_role(auth.uid(), id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role])));
DROP POLICY IF EXISTS "Org members can view org members" ON public.organization_members;
CREATE POLICY "Org members can view org members" ON public.organization_members FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), org_id));
DROP POLICY IF EXISTS "Org admins can insert org members" ON public.organization_members;
CREATE POLICY "Org admins can insert org members" ON public.organization_members FOR INSERT TO authenticated WITH CHECK ((private.get_org_role(auth.uid(), org_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role])));
DROP POLICY IF EXISTS "Org admins can update org members" ON public.organization_members;
CREATE POLICY "Org admins can update org members" ON public.organization_members FOR UPDATE TO authenticated USING ((private.get_org_role(auth.uid(), org_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role])));
DROP POLICY IF EXISTS "Org admins can delete org members" ON public.organization_members;
CREATE POLICY "Org admins can delete org members" ON public.organization_members FOR DELETE TO authenticated USING ((private.get_org_role(auth.uid(), org_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role])));
DROP POLICY IF EXISTS "Org members can view leagues" ON public.leagues;
CREATE POLICY "Org members can view leagues" ON public.leagues FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), org_id));
DROP POLICY IF EXISTS "Org admins can insert leagues" ON public.leagues;
CREATE POLICY "Org admins can insert leagues" ON public.leagues FOR INSERT TO authenticated WITH CHECK ((private.get_org_role(auth.uid(), org_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])));
DROP POLICY IF EXISTS "Org admins can update leagues" ON public.leagues;
CREATE POLICY "Org admins can update leagues" ON public.leagues FOR UPDATE TO authenticated USING ((private.get_org_role(auth.uid(), org_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])));
DROP POLICY IF EXISTS "Org admins can delete leagues" ON public.leagues;
CREATE POLICY "Org admins can delete leagues" ON public.leagues FOR DELETE TO authenticated USING ((private.get_org_role(auth.uid(), org_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role])));
DROP POLICY IF EXISTS "Org members can view categories" ON public.categories;
CREATE POLICY "Org members can view categories" ON public.categories FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_league_org_id(league_id)));
DROP POLICY IF EXISTS "Org admins can manage categories" ON public.categories;
CREATE POLICY "Org admins can manage categories" ON public.categories FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_league_org_id(league_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])));
DROP POLICY IF EXISTS "Org members can view seasons" ON public.seasons;
CREATE POLICY "Org members can view seasons" ON public.seasons FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_league_org_id(league_id)));
DROP POLICY IF EXISTS "Org admins can manage seasons" ON public.seasons;
CREATE POLICY "Org admins can manage seasons" ON public.seasons FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_league_org_id(league_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])));
DROP POLICY IF EXISTS "Org members can view divisions" ON public.divisions;
CREATE POLICY "Org members can view divisions" ON public.divisions FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_season_org_id(season_id)));
DROP POLICY IF EXISTS "Org members can view player game stats" ON public.player_game_stats;
CREATE POLICY "Org members can view player game stats" ON public.player_game_stats FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_game_org_id(game_id)));
DROP POLICY IF EXISTS "Org admins can manage divisions" ON public.divisions;
CREATE POLICY "Org admins can manage divisions" ON public.divisions FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_season_org_id(season_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])));
DROP POLICY IF EXISTS "Org members can view conferences" ON public.conferences;
CREATE POLICY "Org members can view conferences" ON public.conferences FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_division_org_id(division_id)));
DROP POLICY IF EXISTS "Org admins can manage conferences" ON public.conferences;
CREATE POLICY "Org admins can manage conferences" ON public.conferences FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_division_org_id(division_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])));
DROP POLICY IF EXISTS "Org members can view teams" ON public.teams;
CREATE POLICY "Org members can view teams" ON public.teams FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_division_org_id(division_id)));
DROP POLICY IF EXISTS "Org admins can manage teams" ON public.teams;
CREATE POLICY "Org admins can manage teams" ON public.teams FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_division_org_id(division_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'staff'::org_role])));
DROP POLICY IF EXISTS "Org members can view members" ON public.members;
CREATE POLICY "Org members can view members" ON public.members FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), org_id));
DROP POLICY IF EXISTS "Org staff can insert members" ON public.members;
CREATE POLICY "Org staff can insert members" ON public.members FOR INSERT TO authenticated WITH CHECK ((private.get_org_role(auth.uid(), org_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'staff'::org_role])));
DROP POLICY IF EXISTS "Org staff can update members" ON public.members;
CREATE POLICY "Org staff can update members" ON public.members FOR UPDATE TO authenticated USING ((private.get_org_role(auth.uid(), org_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'staff'::org_role])));
DROP POLICY IF EXISTS "Org admins can delete members" ON public.members;
CREATE POLICY "Org admins can delete members" ON public.members FOR DELETE TO authenticated USING ((private.get_org_role(auth.uid(), org_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role])));
DROP POLICY IF EXISTS "Org members can view team players" ON public.team_players;
CREATE POLICY "Org members can view team players" ON public.team_players FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_team_org_id(team_id)));
DROP POLICY IF EXISTS "Org staff can manage team players" ON public.team_players;
CREATE POLICY "Org staff can manage team players" ON public.team_players FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_team_org_id(team_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'staff'::org_role])));
DROP POLICY IF EXISTS "Org members can view emergency contacts" ON public.emergency_contacts;
CREATE POLICY "Org members can view emergency contacts" ON public.emergency_contacts FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_member_org_id(member_id)));
DROP POLICY IF EXISTS "Org staff can manage emergency contacts" ON public.emergency_contacts;
CREATE POLICY "Org staff can manage emergency contacts" ON public.emergency_contacts FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_member_org_id(member_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'staff'::org_role])));
DROP POLICY IF EXISTS "Org members can view locations" ON public.locations;
CREATE POLICY "Org members can view locations" ON public.locations FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), org_id));
DROP POLICY IF EXISTS "Org staff can manage locations" ON public.locations;
CREATE POLICY "Org staff can manage locations" ON public.locations FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), org_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'staff'::org_role])));
DROP POLICY IF EXISTS "Org members can view fields" ON public.fields;
CREATE POLICY "Org members can view fields" ON public.fields FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_location_org_id(location_id)));
DROP POLICY IF EXISTS "Org staff can manage fields" ON public.fields;
CREATE POLICY "Org staff can manage fields" ON public.fields FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_location_org_id(location_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'staff'::org_role])));
DROP POLICY IF EXISTS "Org members can view games" ON public.games;
CREATE POLICY "Org members can view games" ON public.games FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_division_org_id(division_id)));
DROP POLICY IF EXISTS "Org staff can manage games" ON public.games;
CREATE POLICY "Org staff can manage games" ON public.games FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_division_org_id(division_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'staff'::org_role])));
DROP POLICY IF EXISTS "Org members can view brackets" ON public.brackets;
CREATE POLICY "Org members can view brackets" ON public.brackets FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_division_org_id(division_id)));
DROP POLICY IF EXISTS "Org members can view pages" ON public.pages;
CREATE POLICY "Org members can view pages" ON public.pages FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), org_id));
DROP POLICY IF EXISTS "Org staff can manage brackets" ON public.brackets;
CREATE POLICY "Org staff can manage brackets" ON public.brackets FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_division_org_id(division_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'staff'::org_role])));
DROP POLICY IF EXISTS "Org members can view bracket matches" ON public.bracket_matches;
CREATE POLICY "Org members can view bracket matches" ON public.bracket_matches FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_bracket_org_id(bracket_id)));
DROP POLICY IF EXISTS "Org staff can manage bracket matches" ON public.bracket_matches;
CREATE POLICY "Org staff can manage bracket matches" ON public.bracket_matches FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_bracket_org_id(bracket_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'staff'::org_role])));
DROP POLICY IF EXISTS "Org members can view stat definitions" ON public.stat_definitions;
CREATE POLICY "Org members can view stat definitions" ON public.stat_definitions FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), org_id));
DROP POLICY IF EXISTS "Org admins can manage stat definitions" ON public.stat_definitions;
CREATE POLICY "Org admins can manage stat definitions" ON public.stat_definitions FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), org_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])));
DROP POLICY IF EXISTS "Org members can view stat tracking config" ON public.stat_tracking_config;
CREATE POLICY "Org members can view stat tracking config" ON public.stat_tracking_config FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_category_org_id(category_id)));
DROP POLICY IF EXISTS "Org admins can manage stat tracking config" ON public.stat_tracking_config;
CREATE POLICY "Org admins can manage stat tracking config" ON public.stat_tracking_config FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_category_org_id(category_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])));
DROP POLICY IF EXISTS "Org staff can manage player game stats" ON public.player_game_stats;
CREATE POLICY "Org staff can manage player game stats" ON public.player_game_stats FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_game_org_id(game_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'staff'::org_role])));
DROP POLICY IF EXISTS "Org members can view member ratings" ON public.member_ratings;
CREATE POLICY "Org members can view member ratings" ON public.member_ratings FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_member_org_id(member_id)));
DROP POLICY IF EXISTS "Org staff can manage member ratings" ON public.member_ratings;
CREATE POLICY "Org staff can manage member ratings" ON public.member_ratings FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_member_org_id(member_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'staff'::org_role])));
DROP POLICY IF EXISTS "Org members can view member tags" ON public.member_tags;
CREATE POLICY "Org members can view member tags" ON public.member_tags FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), org_id));
DROP POLICY IF EXISTS "Org staff can manage member tags" ON public.member_tags;
CREATE POLICY "Org staff can manage member tags" ON public.member_tags FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), org_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'staff'::org_role])));
DROP POLICY IF EXISTS "Org members can view awards" ON public.awards;
CREATE POLICY "Org members can view awards" ON public.awards FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), org_id));
DROP POLICY IF EXISTS "Org admins can manage awards" ON public.awards;
CREATE POLICY "Org admins can manage awards" ON public.awards FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), org_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])));
DROP POLICY IF EXISTS "Org admins can manage pages" ON public.pages;
CREATE POLICY "Org admins can manage pages" ON public.pages FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), org_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])));
DROP POLICY IF EXISTS "Org members can view articles" ON public.articles;
CREATE POLICY "Org members can view articles" ON public.articles FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), org_id));
DROP POLICY IF EXISTS "Org admins can manage articles" ON public.articles;
CREATE POLICY "Org admins can manage articles" ON public.articles FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), org_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])));
DROP POLICY IF EXISTS "Org members can view domains" ON public.domains;
CREATE POLICY "Org members can view domains" ON public.domains FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), org_id));
DROP POLICY IF EXISTS "Org admins can manage domains" ON public.domains;
CREATE POLICY "Org admins can manage domains" ON public.domains FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), org_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role])));
DROP POLICY IF EXISTS "Org members can view tag assignments" ON public.member_tag_assignments;
CREATE POLICY "Org members can view tag assignments" ON public.member_tag_assignments FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_member_org_id(member_id)));
DROP POLICY IF EXISTS "Org staff can manage tag assignments" ON public.member_tag_assignments;
CREATE POLICY "Org staff can manage tag assignments" ON public.member_tag_assignments FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_member_org_id(member_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'staff'::org_role])));
DROP POLICY IF EXISTS "Org members can view member notes" ON public.member_notes;
CREATE POLICY "Org members can view member notes" ON public.member_notes FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_member_org_id(member_id)));
DROP POLICY IF EXISTS "Org staff can manage member notes" ON public.member_notes;
CREATE POLICY "Org staff can manage member notes" ON public.member_notes FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_member_org_id(member_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'staff'::org_role])));
DROP POLICY IF EXISTS "Org members can view waivers" ON public.waivers;
CREATE POLICY "Org members can view waivers" ON public.waivers FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_member_org_id(member_id)));
DROP POLICY IF EXISTS "Org staff can manage waivers" ON public.waivers;
CREATE POLICY "Org staff can manage waivers" ON public.waivers FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_member_org_id(member_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'staff'::org_role])));
DROP POLICY IF EXISTS "Org members can view disciplinary records" ON public.disciplinary_records;
CREATE POLICY "Org members can view disciplinary records" ON public.disciplinary_records FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_member_org_id(member_id)));
DROP POLICY IF EXISTS "Org staff can manage disciplinary records" ON public.disciplinary_records;
CREATE POLICY "Org staff can manage disciplinary records" ON public.disciplinary_records FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_member_org_id(member_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'staff'::org_role])));
DROP POLICY IF EXISTS "Org members can view communications" ON public.communications;
CREATE POLICY "Org members can view communications" ON public.communications FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_member_org_id(member_id)));
DROP POLICY IF EXISTS "Org members can view standings profiles" ON public.standings_profiles;
CREATE POLICY "Org members can view standings profiles" ON public.standings_profiles FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_league_org_id(league_id)));
DROP POLICY IF EXISTS "Org staff can manage communications" ON public.communications;
CREATE POLICY "Org staff can manage communications" ON public.communications FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_member_org_id(member_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'staff'::org_role])));
DROP POLICY IF EXISTS "Org members can view registration forms" ON public.registration_forms;
CREATE POLICY "Org members can view registration forms" ON public.registration_forms FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_season_org_id(season_id)));
DROP POLICY IF EXISTS "Org admins can manage registration forms" ON public.registration_forms;
CREATE POLICY "Org admins can manage registration forms" ON public.registration_forms FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_season_org_id(season_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])));
DROP POLICY IF EXISTS "Org members can view submissions" ON public.registration_submissions;
CREATE POLICY "Org members can view submissions" ON public.registration_submissions FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_form_org_id(form_id)));
DROP POLICY IF EXISTS "Org staff can manage submissions" ON public.registration_submissions;
CREATE POLICY "Org staff can manage submissions" ON public.registration_submissions FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_form_org_id(form_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'staff'::org_role])));
DROP POLICY IF EXISTS "Org members can view award recipients" ON public.award_recipients;
CREATE POLICY "Org members can view award recipients" ON public.award_recipients FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_award_org_id(award_id)));
DROP POLICY IF EXISTS "Org admins can manage award recipients" ON public.award_recipients;
CREATE POLICY "Org admins can manage award recipients" ON public.award_recipients FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_award_org_id(award_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])));
DROP POLICY IF EXISTS "Org admins can manage standings profiles" ON public.standings_profiles;
CREATE POLICY "Org admins can manage standings profiles" ON public.standings_profiles FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_league_org_id(league_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])));
DROP POLICY IF EXISTS "Org members can view standing overrides" ON public.standing_overrides;
CREATE POLICY "Org members can view standing overrides" ON public.standing_overrides FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), private.get_division_org_id(division_id)));
DROP POLICY IF EXISTS "Org admins can manage standing overrides" ON public.standing_overrides;
CREATE POLICY "Org admins can manage standing overrides" ON public.standing_overrides FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), private.get_division_org_id(division_id)) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])));
DROP POLICY IF EXISTS "Org members can view documents" ON public.documents;
CREATE POLICY "Org members can view documents" ON public.documents FOR SELECT TO authenticated USING (private.is_org_member(auth.uid(), org_id));
DROP POLICY IF EXISTS "Org admins can manage documents" ON public.documents;
CREATE POLICY "Org admins can manage documents" ON public.documents FOR ALL TO authenticated USING ((private.get_org_role(auth.uid(), org_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])));

DROP FUNCTION IF EXISTS public.get_league_org_id(uuid);
DROP FUNCTION IF EXISTS public.get_team_org_id(uuid);
DROP FUNCTION IF EXISTS public.get_org_role(uuid,uuid);
DROP FUNCTION IF EXISTS public.get_member_org_id(uuid);
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.is_org_member(uuid,uuid);
DROP FUNCTION IF EXISTS public.get_season_org_id(uuid);
DROP FUNCTION IF EXISTS public.get_game_org_id(uuid);
DROP FUNCTION IF EXISTS public.get_bracket_org_id(uuid);
DROP FUNCTION IF EXISTS public.get_location_org_id(uuid);
DROP FUNCTION IF EXISTS public.get_award_org_id(uuid);
DROP FUNCTION IF EXISTS public.get_form_org_id(uuid);
DROP FUNCTION IF EXISTS public.get_category_org_id(uuid);
DROP FUNCTION IF EXISTS public.get_division_org_id(uuid);

DROP POLICY IF EXISTS "Public can view documents" ON storage.objects;