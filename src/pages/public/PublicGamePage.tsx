import { useParams, Link } from 'react-router-dom';
import { useGameById, useGameStats } from '@/hooks/use-public-data';
import { format } from 'date-fns';

export default function PublicGamePage() {
  const { gameId } = useParams();
  const { data: game, isLoading } = useGameById(gameId);
  const { data: stats } = useGameStats(gameId);

  if (isLoading) return <div className="text-white/40 py-12 text-center">Loading...</div>;
  if (!game) return <div className="text-white/40 py-12 text-center">Game not found</div>;

  const isCompleted = game.status === 'completed';
  const homeTeam = game.home_team;
  const awayTeam = game.away_team;

  // Group stats by team and player
  const homeStats: Record<string, { name: string; memberId: string; stats: Record<string, number> }> = {};
  const awayStats: Record<string, { name: string; memberId: string; stats: Record<string, number> }> = {};

  for (const s of stats ?? []) {
    const target = s.team_id === game.home_team_id ? homeStats : awayStats;
    const name = `${s.members?.first_name ?? ''} ${s.members?.last_name ?? ''}`;
    if (!target[s.member_id]) target[s.member_id] = { name, memberId: s.member_id, stats: {} };
    target[s.member_id].stats[s.stat_key] = (target[s.member_id].stats[s.stat_key] ?? 0) + Number(s.value);
  }

  return (
    <div className="space-y-8">
      {/* Scoreboard */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <div className="text-center text-xs text-white/40 uppercase font-bold mb-4">
          {isCompleted ? 'Final' : game.scheduled_date ? format(new Date(game.scheduled_date), 'EEEE, MMM d, yyyy') : 'TBD'}
          {!isCompleted && game.scheduled_time && ` · ${game.scheduled_time.slice(0, 5)}`}
        </div>
        <div className="flex items-center justify-center gap-8 sm:gap-16">
          {/* Away */}
          <Link to={`/site/teams/${awayTeam?.id}`} className="text-center group">
            <div
              className="w-16 h-16 rounded-xl mx-auto mb-2 flex items-center justify-center text-2xl font-extrabold group-hover:scale-110 transition-transform"
              style={{ background: `${awayTeam?.primary_color}22`, color: awayTeam?.primary_color ?? '#fff', border: `2px solid ${awayTeam?.primary_color}44` }}
            >
              {awayTeam?.name?.charAt(0)}
            </div>
            <div className="font-bold text-lg group-hover:text-[hsl(var(--primary))]">{awayTeam?.name}</div>
          </Link>

          {/* Score */}
          <div className="text-center">
            {isCompleted ? (
              <div className="text-5xl font-extrabold font-mono tracking-tighter">
                <span className={(game.away_score ?? 0) > (game.home_score ?? 0) ? '' : 'text-white/40'}>{game.away_score}</span>
                <span className="text-white/20 mx-3">-</span>
                <span className={(game.home_score ?? 0) > (game.away_score ?? 0) ? '' : 'text-white/40'}>{game.home_score}</span>
              </div>
            ) : (
              <div className="text-3xl font-bold text-white/30">VS</div>
            )}
          </div>

          {/* Home */}
          <Link to={`/site/teams/${homeTeam?.id}`} className="text-center group">
            <div
              className="w-16 h-16 rounded-xl mx-auto mb-2 flex items-center justify-center text-2xl font-extrabold group-hover:scale-110 transition-transform"
              style={{ background: `${homeTeam?.primary_color}22`, color: homeTeam?.primary_color ?? '#fff', border: `2px solid ${homeTeam?.primary_color}44` }}
            >
              {homeTeam?.name?.charAt(0)}
            </div>
            <div className="font-bold text-lg group-hover:text-[hsl(var(--primary))]">{homeTeam?.name}</div>
          </Link>
        </div>
        <div className="text-center text-xs text-white/30 mt-4">
          {game.fields?.locations?.name} · {game.fields?.name} · {(game as any).divisions?.name}
        </div>
      </div>

      {/* Box Score */}
      {isCompleted && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BoxScoreTable title={awayTeam?.name ?? 'Away'} color={awayTeam?.primary_color} players={Object.values(awayStats)} />
          <BoxScoreTable title={homeTeam?.name ?? 'Home'} color={homeTeam?.primary_color} players={Object.values(homeStats)} />
        </div>
      )}
    </div>
  );
}

function BoxScoreTable({ title, color, players }: { title: string; color?: string | null; players: { name: string; memberId: string; stats: Record<string, number> }[] }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ background: color ?? '#666' }} />
        <h3 className="font-bold text-sm uppercase">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/40 text-xs uppercase">
              <th className="text-left py-2 px-4">Player</th>
              <th className="text-center py-2 px-2">CMP</th>
              <th className="text-center py-2 px-2">ATT</th>
              <th className="text-center py-2 px-2">YDS</th>
              <th className="text-center py-2 px-2">TD</th>
              <th className="text-center py-2 px-2">INT</th>
              <th className="text-center py-2 px-2">REC</th>
              <th className="text-center py-2 px-2">R.YDS</th>
              <th className="text-center py-2 px-2">R.TD</th>
              <th className="text-center py-2 px-2">FP</th>
            </tr>
          </thead>
          <tbody>
            {players.map(p => (
              <tr key={p.memberId} className="border-t border-white/5 hover:bg-white/5">
                <td className="py-2 px-4">
                  <Link to={`/site/players/${p.memberId}`} className="font-semibold hover:text-[hsl(var(--primary))]">{p.name}</Link>
                </td>
                <td className="text-center py-2 px-2 font-mono">{p.stats.pass_comp ?? '-'}</td>
                <td className="text-center py-2 px-2 font-mono">{p.stats.pass_att ?? '-'}</td>
                <td className="text-center py-2 px-2 font-mono">{p.stats.pass_yds ?? '-'}</td>
                <td className="text-center py-2 px-2 font-mono">{p.stats.pass_td ?? '-'}</td>
                <td className="text-center py-2 px-2 font-mono">{p.stats.pass_int ?? '-'}</td>
                <td className="text-center py-2 px-2 font-mono">{p.stats.rec ?? '-'}</td>
                <td className="text-center py-2 px-2 font-mono">{p.stats.rec_yds ?? '-'}</td>
                <td className="text-center py-2 px-2 font-mono">{p.stats.rec_td ?? '-'}</td>
                <td className="text-center py-2 px-2 font-mono">{p.stats.def_flag_pull ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
