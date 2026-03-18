import { useParams, Link } from 'react-router-dom';
import { useMemberById, useMemberTeams, usePlayerStats } from '@/hooks/use-public-data';

export default function PublicPlayerPage() {
  const { memberId } = useParams();
  const { data: member, isLoading } = useMemberById(memberId);
  const { data: teams } = useMemberTeams(memberId);
  const { data: rawStats } = usePlayerStats(memberId);

  if (isLoading) return <div className="text-white/40 py-12 text-center">Loading...</div>;
  if (!member) return <div className="text-white/40 py-12 text-center">Player not found</div>;

  // Aggregate season totals
  const totals: Record<string, number> = {};
  for (const s of rawStats ?? []) {
    totals[s.stat_key] = (totals[s.stat_key] ?? 0) + Number(s.value);
  }

  // Game log
  const gameMap: Record<string, { date: string; opponent: string; stats: Record<string, number> }> = {};
  for (const s of rawStats ?? []) {
    if (!gameMap[s.game_id]) {
      const g = s.games as any;
      const date = g?.scheduled_date ?? '';
      const home = g?.home_team?.name ?? '';
      const away = g?.away_team?.name ?? '';
      // figure out opponent from team_id
      const teamName = teams?.find(t => t.team_id === s.team_id)?.teams?.name ?? '';
      const opp = teamName === home ? away : home;
      gameMap[s.game_id] = { date, opponent: opp || 'Unknown', stats: {} };
    }
    gameMap[s.game_id].stats[s.stat_key] = (gameMap[s.game_id].stats[s.stat_key] ?? 0) + Number(s.value);
  }
  const gameLog = Object.entries(gameMap).sort(([, a], [, b]) => b.date.localeCompare(a.date));

  const statKeys = Object.keys(totals);
  const hasPassingStats = statKeys.some(k => k.startsWith('pass_'));
  const hasReceivingStats = statKeys.some(k => k.startsWith('rec'));
  const hasDefensiveStats = statKeys.some(k => k.startsWith('def_'));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-6">
        <img
          src={member.avatar_url ?? ''}
          alt={`${member.first_name} ${member.last_name}`}
          className="w-24 h-24 rounded-2xl bg-white/10 object-cover"
        />
        <div>
          <h1 className="text-3xl font-extrabold">{member.first_name} {member.last_name}</h1>
          <div className="flex flex-wrap gap-3 mt-2">
            {teams?.map(t => (
              <Link
                key={t.id}
                to={`/site/teams/${t.team_id}`}
                className="text-sm text-white/60 hover:text-[hsl(var(--primary))] transition-colors"
              >
                {(t.teams as any)?.name} · #{t.jersey_number} · <span className="capitalize">{t.role}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Season Totals */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-white/40 mb-3">Season Totals</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {hasPassingStats && (
            <>
              <StatCard label="Pass CMP" value={totals.pass_comp ?? 0} />
              <StatCard label="Pass ATT" value={totals.pass_att ?? 0} />
              <StatCard label="Pass YDS" value={totals.pass_yds ?? 0} highlight />
              <StatCard label="Pass TD" value={totals.pass_td ?? 0} highlight />
              <StatCard label="INT" value={totals.pass_int ?? 0} negative />
              <StatCard label="CMP%" value={totals.pass_att ? Math.round((totals.pass_comp / totals.pass_att) * 100) : 0} suffix="%" />
            </>
          )}
          {hasReceivingStats && (
            <>
              <StatCard label="REC" value={totals.rec ?? 0} />
              <StatCard label="REC YDS" value={totals.rec_yds ?? 0} highlight />
              <StatCard label="REC TD" value={totals.rec_td ?? 0} highlight />
            </>
          )}
          {hasDefensiveStats && (
            <>
              <StatCard label="Flag Pulls" value={totals.def_flag_pull ?? 0} />
              <StatCard label="DEF INT" value={totals.def_int ?? 0} highlight />
              <StatCard label="DEF TD" value={totals.def_td ?? 0} highlight />
            </>
          )}
        </div>
      </section>

      {/* Game Log */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-white/40 mb-3">Game Log</h2>
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-xs uppercase bg-white/5">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Opponent</th>
                {hasPassingStats && (
                  <>
                    <th className="text-center py-3 px-2">CMP</th>
                    <th className="text-center py-3 px-2">ATT</th>
                    <th className="text-center py-3 px-2">YDS</th>
                    <th className="text-center py-3 px-2">TD</th>
                    <th className="text-center py-3 px-2">INT</th>
                  </>
                )}
                {hasReceivingStats && (
                  <>
                    <th className="text-center py-3 px-2">REC</th>
                    <th className="text-center py-3 px-2">YDS</th>
                    <th className="text-center py-3 px-2">TD</th>
                  </>
                )}
                {hasDefensiveStats && (
                  <>
                    <th className="text-center py-3 px-2">FP</th>
                    <th className="text-center py-3 px-2">INT</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {gameLog.map(([gameId, game]) => (
                <tr key={gameId} className="border-t border-white/5 hover:bg-white/5">
                  <td className="py-2 px-4 text-white/60">{game.date}</td>
                  <td className="py-2 px-4 font-semibold">{game.opponent}</td>
                  {hasPassingStats && (
                    <>
                      <td className="text-center py-2 px-2 font-mono">{game.stats.pass_comp ?? '-'}</td>
                      <td className="text-center py-2 px-2 font-mono">{game.stats.pass_att ?? '-'}</td>
                      <td className="text-center py-2 px-2 font-mono">{game.stats.pass_yds ?? '-'}</td>
                      <td className="text-center py-2 px-2 font-mono">{game.stats.pass_td ?? '-'}</td>
                      <td className="text-center py-2 px-2 font-mono">{game.stats.pass_int ?? '-'}</td>
                    </>
                  )}
                  {hasReceivingStats && (
                    <>
                      <td className="text-center py-2 px-2 font-mono">{game.stats.rec ?? '-'}</td>
                      <td className="text-center py-2 px-2 font-mono">{game.stats.rec_yds ?? '-'}</td>
                      <td className="text-center py-2 px-2 font-mono">{game.stats.rec_td ?? '-'}</td>
                    </>
                  )}
                  {hasDefensiveStats && (
                    <>
                      <td className="text-center py-2 px-2 font-mono">{game.stats.def_flag_pull ?? '-'}</td>
                      <td className="text-center py-2 px-2 font-mono">{game.stats.def_int ?? '-'}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, suffix, highlight, negative }: { label: string; value: number; suffix?: string; highlight?: boolean; negative?: boolean }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
      <div className={`text-2xl font-extrabold font-mono ${highlight ? 'text-[hsl(var(--primary))]' : negative ? 'text-red-400' : ''}`}>
        {value}{suffix}
      </div>
      <div className="text-xs text-white/40 uppercase mt-1">{label}</div>
    </div>
  );
}
