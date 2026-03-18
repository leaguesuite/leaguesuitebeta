import { Link } from 'react-router-dom';
import { useGames, useStandings } from '@/hooks/use-public-data';
import { format } from 'date-fns';

const DIVISION_A = 'e0000000-0000-0000-0000-000000000001';
const DIVISION_B = 'e0000000-0000-0000-0000-000000000002';

function ScoreCard({ game }: { game: any }) {
  const isCompleted = game.status === 'completed';
  const homeWin = isCompleted && (game.home_score ?? 0) > (game.away_score ?? 0);
  const awayWin = isCompleted && (game.away_score ?? 0) > (game.home_score ?? 0);

  return (
    <Link to={`/site/games/${game.id}`} className="block bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
      <div className="text-xs text-white/40 mb-2 uppercase font-semibold">
        {isCompleted ? 'Final' : format(new Date(game.scheduled_date), 'MMM d')} · {game.scheduled_time?.slice(0, 5)}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: game.away_team?.primary_color ?? '#666' }} />
            <span className={awayWin ? 'font-bold' : 'text-white/70'}>{game.away_team?.name ?? 'TBD'}</span>
          </div>
          <span className={`text-lg font-mono font-bold ${awayWin ? 'text-white' : 'text-white/50'}`}>{isCompleted ? game.away_score : '-'}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: game.home_team?.primary_color ?? '#666' }} />
            <span className={homeWin ? 'font-bold' : 'text-white/70'}>{game.home_team?.name ?? 'TBD'}</span>
          </div>
          <span className={`text-lg font-mono font-bold ${homeWin ? 'text-white' : 'text-white/50'}`}>{isCompleted ? game.home_score : '-'}</span>
        </div>
      </div>
    </Link>
  );
}

function MiniStandings({ divisionId, title }: { divisionId: string; title: string }) {
  const { data: standings } = useStandings(divisionId);

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-white/5 border-b border-white/10">
        <h3 className="font-bold text-sm uppercase tracking-wide">{title}</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-white/40 text-xs uppercase">
            <th className="text-left py-2 px-4">Team</th>
            <th className="text-center py-2 px-2">W</th>
            <th className="text-center py-2 px-2">L</th>
            <th className="text-center py-2 px-2">T</th>
            <th className="text-right py-2 px-4">PF</th>
          </tr>
        </thead>
        <tbody>
          {standings?.map((team, i) => (
            <tr key={team.id} className="border-t border-white/5 hover:bg-white/5">
              <td className="py-2 px-4">
                <Link to={`/site/teams/${team.id}`} className="flex items-center gap-2 hover:text-[hsl(var(--primary))]">
                  <span className="text-white/40 text-xs w-4">{i + 1}</span>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: team.color }} />
                  <span className="font-semibold">{team.name}</span>
                </Link>
              </td>
              <td className="text-center py-2 px-2 font-mono">{team.w}</td>
              <td className="text-center py-2 px-2 font-mono">{team.l}</td>
              <td className="text-center py-2 px-2 font-mono">{team.t}</td>
              <td className="text-right py-2 px-4 font-mono">{team.pf}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PublicHomePage() {
  const { data: recentGames } = useGames();

  const completedGames = recentGames?.filter(g => g.status === 'completed').slice(0, 4) ?? [];
  const upcomingGames = recentGames?.filter(g => g.status === 'scheduled').slice(0, 4) ?? [];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[hsl(215,90%,20%)] to-[hsl(220,25%,8%)] rounded-2xl p-8 border border-white/10">
        <h1 className="text-3xl font-extrabold tracking-tight">Spring 2025 Season</h1>
        <p className="text-white/50 mt-1">Week 4 · 8 Teams · 2 Divisions</p>
      </div>

      {/* Recent Scores */}
      {completedGames.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold uppercase tracking-wide">Recent Scores</h2>
            <Link to="/site/schedule" className="text-sm text-[hsl(var(--primary))] hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {completedGames.map(g => <ScoreCard key={g.id} game={g} />)}
          </div>
        </section>
      )}

      {/* Upcoming Games */}
      {upcomingGames.length > 0 && (
        <section>
          <h2 className="text-lg font-bold uppercase tracking-wide mb-4">Upcoming</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {upcomingGames.map(g => <ScoreCard key={g.id} game={g} />)}
          </div>
        </section>
      )}

      {/* Standings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold uppercase tracking-wide">Standings</h2>
          <Link to="/site/standings" className="text-sm text-[hsl(var(--primary))] hover:underline">Full Standings →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MiniStandings divisionId={DIVISION_A} title="Division A · Men's" />
          <MiniStandings divisionId={DIVISION_B} title="Division B · Co-Ed" />
        </div>
      </section>
    </div>
  );
}
