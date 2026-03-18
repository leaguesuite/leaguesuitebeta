import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGames } from '@/hooks/use-public-data';
import { format } from 'date-fns';

const DIVISIONS = [
  { id: '', label: 'All Divisions' },
  { id: 'e0000000-0000-0000-0000-000000000001', label: 'Division A' },
  { id: 'e0000000-0000-0000-0000-000000000002', label: 'Division B' },
];

export default function PublicSchedulePage() {
  const [filter, setFilter] = useState('');
  const { data: allGames } = useGames();
  const { data: divGames } = useGames(filter || undefined);
  const games = filter ? divGames : allGames;

  // Group by date
  const grouped: Record<string, any[]> = {};
  for (const g of games ?? []) {
    const d = g.scheduled_date ?? 'TBD';
    (grouped[d] ??= []).push(g);
  }
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold uppercase tracking-tight">Schedule</h1>

      <div className="flex gap-2">
        {DIVISIONS.map(d => (
          <button
            key={d.id}
            onClick={() => setFilter(d.id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors ${
              filter === d.id ? 'bg-[hsl(var(--primary))] text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {sortedDates.map(date => (
          <div key={date}>
            <h3 className="text-sm font-bold uppercase text-white/40 tracking-wide mb-3">
              {date !== 'TBD' ? format(new Date(date), 'EEEE, MMMM d, yyyy') : 'To Be Determined'}
            </h3>
            <div className="space-y-2">
              {grouped[date].map((g: any) => {
                const isCompleted = g.status === 'completed';
                const homeWin = isCompleted && (g.home_score ?? 0) > (g.away_score ?? 0);
                const awayWin = isCompleted && (g.away_score ?? 0) > (g.home_score ?? 0);

                return (
                  <Link key={g.id} to={`/site/games/${g.id}`} className="flex items-center bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                    <div className="w-20 text-center shrink-0">
                      {isCompleted ? (
                        <span className="text-xs font-bold uppercase text-green-400">Final</span>
                      ) : (
                        <span className="text-xs font-semibold text-white/50">{g.scheduled_time?.slice(0, 5)}</span>
                      )}
                    </div>
                    <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                      <div className="flex items-center gap-2 justify-end">
                        <span className={awayWin ? 'font-bold' : 'text-white/70'}>{g.away_team?.name ?? 'TBD'}</span>
                        <div className="w-3 h-3 rounded-full" style={{ background: g.away_team?.primary_color ?? '#666' }} />
                      </div>
                      <div className="text-center font-mono font-bold text-lg min-w-[60px]">
                        {isCompleted ? `${g.away_score} - ${g.home_score}` : 'vs'}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: g.home_team?.primary_color ?? '#666' }} />
                        <span className={homeWin ? 'font-bold' : 'text-white/70'}>{g.home_team?.name ?? 'TBD'}</span>
                      </div>
                    </div>
                    <div className="w-32 text-right text-xs text-white/40 shrink-0 hidden sm:block">
                      {g.fields?.locations?.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
