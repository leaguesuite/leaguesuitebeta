import { useParams, Link } from 'react-router-dom';
import { useTeamById, useTeamRoster, useGames, useAllPlayerStats } from '@/hooks/use-public-data';

export default function PublicTeamPage() {
  const { teamId } = useParams();
  const { data: team, isLoading } = useTeamById(teamId);
  const { data: roster } = useTeamRoster(teamId);
  const { data: allGames } = useGames();
  const { data: allStats } = useAllPlayerStats();

  if (isLoading) return <div className="text-white/40 py-12 text-center">Loading...</div>;
  if (!team) return <div className="text-white/40 py-12 text-center">Team not found</div>;

  const teamGames = allGames?.filter(g => g.home_team_id === teamId || g.away_team_id === teamId) ?? [];
  const completedGames = teamGames.filter(g => g.status === 'completed');

  // Compute W-L
  let w = 0, l = 0, t = 0;
  for (const g of completedGames) {
    const isHome = g.home_team_id === teamId;
    const ts = isHome ? (g.home_score ?? 0) : (g.away_score ?? 0);
    const os = isHome ? (g.away_score ?? 0) : (g.home_score ?? 0);
    if (ts > os) w++;
    else if (os > ts) l++;
    else t++;
  }

  // Aggregate team stats per player
  const memberIds = new Set(roster?.map(r => r.member_id) ?? []);
  const teamStats: Record<string, Record<string, number>> = {};
  for (const s of allStats ?? []) {
    if (!memberIds.has(s.member_id)) continue;
    if (!teamStats[s.member_id]) teamStats[s.member_id] = {};
    teamStats[s.member_id][s.stat_key] = (teamStats[s.member_id][s.stat_key] ?? 0) + Number(s.value);
  }

  return (
    <div className="space-y-8">
      {/* Team header */}
      <div className="flex items-center gap-6">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-extrabold"
          style={{ background: `${team.primary_color}22`, color: team.primary_color ?? '#fff', border: `3px solid ${team.primary_color}44` }}
        >
          {team.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-extrabold">{team.name}</h1>
          <p className="text-white/50 text-sm mt-1">{(team as any).divisions?.name} · {(team as any).divisions?.seasons?.name}</p>
          <div className="flex gap-4 mt-2 text-sm font-mono">
            <span className="text-green-400">{w}W</span>
            <span className="text-red-400">{l}L</span>
            {t > 0 && <span className="text-white/50">{t}T</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roster */}
        <div className="lg:col-span-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-white/40 mb-3">Roster</h2>
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            {roster?.map(p => (
              <Link
                key={p.id}
                to={`/site/players/${p.member_id}`}
                className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
              >
                <img src={p.members?.avatar_url ?? ''} className="w-8 h-8 rounded-full bg-white/10" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{p.members?.first_name} {p.members?.last_name}</div>
                  <div className="text-xs text-white/40 capitalize">{p.role}</div>
                </div>
                <span className="text-sm font-mono text-white/40">#{p.jersey_number}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Team stats table */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-white/40 mb-3">Season Stats</h2>
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs uppercase bg-white/5">
                  <th className="text-left py-3 px-4">Player</th>
                  <th className="text-center py-3 px-2">CMP</th>
                  <th className="text-center py-3 px-2">ATT</th>
                  <th className="text-center py-3 px-2">P.YDS</th>
                  <th className="text-center py-3 px-2">P.TD</th>
                  <th className="text-center py-3 px-2">INT</th>
                  <th className="text-center py-3 px-2">REC</th>
                  <th className="text-center py-3 px-2">R.YDS</th>
                  <th className="text-center py-3 px-2">R.TD</th>
                  <th className="text-center py-3 px-2">FP</th>
                  <th className="text-center py-3 px-2">D.INT</th>
                </tr>
              </thead>
              <tbody>
                {roster?.filter(p => teamStats[p.member_id]).map(p => {
                  const s = teamStats[p.member_id] ?? {};
                  return (
                    <tr key={p.id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="py-2 px-4">
                        <Link to={`/site/players/${p.member_id}`} className="font-semibold hover:text-[hsl(var(--primary))]">
                          {p.members?.first_name} {p.members?.last_name}
                        </Link>
                      </td>
                      <td className="text-center py-2 px-2 font-mono">{s.pass_comp ?? '-'}</td>
                      <td className="text-center py-2 px-2 font-mono">{s.pass_att ?? '-'}</td>
                      <td className="text-center py-2 px-2 font-mono">{s.pass_yds ?? '-'}</td>
                      <td className="text-center py-2 px-2 font-mono">{s.pass_td ?? '-'}</td>
                      <td className="text-center py-2 px-2 font-mono">{s.pass_int ?? '-'}</td>
                      <td className="text-center py-2 px-2 font-mono">{s.rec ?? '-'}</td>
                      <td className="text-center py-2 px-2 font-mono">{s.rec_yds ?? '-'}</td>
                      <td className="text-center py-2 px-2 font-mono">{s.rec_td ?? '-'}</td>
                      <td className="text-center py-2 px-2 font-mono">{s.def_flag_pull ?? '-'}</td>
                      <td className="text-center py-2 px-2 font-mono">{s.def_int ?? '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Recent Games */}
          <h2 className="text-sm font-bold uppercase tracking-wide text-white/40 mb-3 mt-6">Recent Games</h2>
          <div className="space-y-2">
            {teamGames.slice(0, 6).map(g => {
              const isHome = g.home_team_id === teamId;
              const opponent = isHome ? g.away_team : g.home_team;
              const ts = isHome ? g.home_score : g.away_score;
              const os = isHome ? g.away_score : g.home_score;
              const isCompleted = g.status === 'completed';
              const won = isCompleted && (ts ?? 0) > (os ?? 0);
              const lost = isCompleted && (os ?? 0) > (ts ?? 0);

              return (
                <Link key={g.id} to={`/site/games/${g.id}`} className="flex items-center bg-white/5 border border-white/10 rounded-lg px-4 py-3 hover:bg-white/10 transition-colors">
                  {isCompleted && (
                    <span className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center mr-3 ${won ? 'bg-green-500/20 text-green-400' : lost ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/50'}`}>
                      {won ? 'W' : lost ? 'L' : 'T'}
                    </span>
                  )}
                  <span className="flex-1 text-sm">
                    {isHome ? 'vs' : '@'} <span className="font-semibold">{opponent?.name}</span>
                  </span>
                  <span className="font-mono text-sm">{isCompleted ? `${ts}-${os}` : g.scheduled_date}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
