
-- Add anonymous read access for public-facing pages
-- These allow unauthenticated visitors to view league data

CREATE POLICY "Public can view organizations" ON public.organizations FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view leagues" ON public.leagues FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view seasons" ON public.seasons FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view divisions" ON public.divisions FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view teams" ON public.teams FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view members" ON public.members FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view team_players" ON public.team_players FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view games" ON public.games FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view fields" ON public.fields FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view locations" ON public.locations FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view player_game_stats" ON public.player_game_stats FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT TO anon USING (true);
