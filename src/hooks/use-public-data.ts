import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ORG_ID = 'a0000000-0000-0000-0000-000000000001';

export function useSeasons() {
  return useQuery({
    queryKey: ['public', 'seasons'],
    queryFn: async () => {
      const { data } = await supabase
        .from('seasons')
        .select('*, leagues!inner(org_id, name)')
        .eq('leagues.org_id', ORG_ID)
        .order('start_date', { ascending: false });
      return data ?? [];
    },
  });
}

export function useDivisions(seasonId?: string) {
  return useQuery({
    queryKey: ['public', 'divisions', seasonId],
    queryFn: async () => {
      let q = supabase
        .from('divisions')
        .select('*, categories(name), seasons!inner(league_id, leagues!inner(org_id))')
        .eq('seasons.leagues.org_id', ORG_ID);
      if (seasonId) q = q.eq('season_id', seasonId);
      const { data } = await q;
      return data ?? [];
    },
    enabled: !!seasonId,
  });
}

export function useTeams(divisionId?: string) {
  return useQuery({
    queryKey: ['public', 'teams', divisionId],
    queryFn: async () => {
      let q = supabase.from('teams').select('*');
      if (divisionId) q = q.eq('division_id', divisionId);
      const { data } = await q.order('name');
      return data ?? [];
    },
  });
}

export function useTeamById(teamId?: string) {
  return useQuery({
    queryKey: ['public', 'team', teamId],
    queryFn: async () => {
      const { data } = await supabase
        .from('teams')
        .select('*, divisions(name, season_id, seasons(name))')
        .eq('id', teamId!)
        .single();
      return data;
    },
    enabled: !!teamId,
  });
}

export function useTeamRoster(teamId?: string) {
  return useQuery({
    queryKey: ['public', 'roster', teamId],
    queryFn: async () => {
      const { data } = await supabase
        .from('team_players')
        .select('*, members(id, first_name, last_name, avatar_url)')
        .eq('team_id', teamId!);
      return data ?? [];
    },
    enabled: !!teamId,
  });
}

export function useMemberById(memberId?: string) {
  return useQuery({
    queryKey: ['public', 'member', memberId],
    queryFn: async () => {
      const { data } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId!)
        .single();
      return data;
    },
    enabled: !!memberId,
  });
}

export function useMemberTeams(memberId?: string) {
  return useQuery({
    queryKey: ['public', 'member-teams', memberId],
    queryFn: async () => {
      const { data } = await supabase
        .from('team_players')
        .select('*, teams(id, name, primary_color, divisions(name, seasons(name)))')
        .eq('member_id', memberId!);
      return data ?? [];
    },
    enabled: !!memberId,
  });
}

export function useGames(divisionId?: string) {
  return useQuery({
    queryKey: ['public', 'games', divisionId],
    queryFn: async () => {
      let q = supabase
        .from('games')
        .select('*, home_team:teams!games_home_team_id_fkey(id, name, primary_color), away_team:teams!games_away_team_id_fkey(id, name, primary_color), fields(name, locations(name))')
        .order('scheduled_date', { ascending: false });
      if (divisionId) q = q.eq('division_id', divisionId);
      const { data } = await q;
      return data ?? [];
    },
  });
}

export function useGameById(gameId?: string) {
  return useQuery({
    queryKey: ['public', 'game', gameId],
    queryFn: async () => {
      const { data } = await supabase
        .from('games')
        .select('*, home_team:teams!games_home_team_id_fkey(id, name, primary_color), away_team:teams!games_away_team_id_fkey(id, name, primary_color), fields(name, locations(name)), divisions(name)')
        .eq('id', gameId!)
        .single();
      return data;
    },
    enabled: !!gameId,
  });
}

export function useGameStats(gameId?: string) {
  return useQuery({
    queryKey: ['public', 'game-stats', gameId],
    queryFn: async () => {
      const { data } = await supabase
        .from('player_game_stats')
        .select('*, members(id, first_name, last_name)')
        .eq('game_id', gameId!);
      return data ?? [];
    },
    enabled: !!gameId,
  });
}

export function usePlayerStats(memberId?: string) {
  return useQuery({
    queryKey: ['public', 'player-stats', memberId],
    queryFn: async () => {
      const { data } = await supabase
        .from('player_game_stats')
        .select('*, games(scheduled_date, home_team:teams!games_home_team_id_fkey(name), away_team:teams!games_away_team_id_fkey(name))')
        .eq('member_id', memberId!);
      return data ?? [];
    },
    enabled: !!memberId,
  });
}

export function useAllPlayerStats() {
  return useQuery({
    queryKey: ['public', 'all-player-stats'],
    queryFn: async () => {
      const { data } = await supabase
        .from('player_game_stats')
        .select('*, members(id, first_name, last_name), teams(id, name)');
      return data ?? [];
    },
  });
}

// Compute standings from game results
export function useStandings(divisionId?: string) {
  const { data: games, ...rest } = useGames(divisionId);

  const standings = (() => {
    if (!games) return [];
    const teamMap: Record<string, { id: string; name: string; color: string; w: number; l: number; t: number; pf: number; pa: number }> = {};

    for (const g of games) {
      if (g.status !== 'completed') continue;
      const home = g.home_team;
      const away = g.away_team;
      if (!home || !away) continue;

      if (!teamMap[home.id]) teamMap[home.id] = { id: home.id, name: home.name, color: home.primary_color ?? '#666', w: 0, l: 0, t: 0, pf: 0, pa: 0 };
      if (!teamMap[away.id]) teamMap[away.id] = { id: away.id, name: away.name, color: away.primary_color ?? '#666', w: 0, l: 0, t: 0, pf: 0, pa: 0 };

      const hs = g.home_score ?? 0;
      const as = g.away_score ?? 0;
      teamMap[home.id].pf += hs;
      teamMap[home.id].pa += as;
      teamMap[away.id].pf += as;
      teamMap[away.id].pa += hs;

      if (hs > as) { teamMap[home.id].w++; teamMap[away.id].l++; }
      else if (as > hs) { teamMap[away.id].w++; teamMap[home.id].l++; }
      else { teamMap[home.id].t++; teamMap[away.id].t++; }
    }

    return Object.values(teamMap).sort((a, b) => {
      const aPct = a.w + a.l + a.t > 0 ? a.w / (a.w + a.l + a.t) : 0;
      const bPct = b.w + b.l + b.t > 0 ? b.w / (b.w + b.l + b.t) : 0;
      if (bPct !== aPct) return bPct - aPct;
      return (b.pf - b.pa) - (a.pf - a.pa);
    });
  })();

  return { data: standings, ...rest };
}
