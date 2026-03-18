import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAllPlayerStats } from '@/hooks/use-public-data';

type StatTab = 'passing' | 'receiving' | 'defense';

const STAT_CONFIGS: Record<StatTab, { columns: { key: string; label: string }[]; sortKey: string }> = {
  passing: {
    sortKey: 'pass_yds',
    columns: [
      { key: 'pass_comp', label: 'CMP' },
      { key: 'pass_att', label: 'ATT' },
      { key: 'pass_yds', label: 'YDS' },
      { key: 'pass_td', label: 'TD' },
      { key: 'pass_int', label: 'INT' },
    ],
  },
  receiving: {
    sortKey: 'rec_yds',
    columns: [
      { key: 'rec', label: 'REC' },
      { key: 'rec_yds', label: 'YDS' },
      { key: 'rec_td', label: 'TD' },
    ],
  },
  defense: {
    sortKey: 'def_flag_pull',
    columns: [
      { key: 'def_flag_pull', label: 'FP' },
      { key: 'def_int', label: 'INT' },
      { key: 'def_td', label: 'TD' },
    ],
  },
};

export default function PublicStatsPage() {
  const [tab, setTab] = useState<StatTab>('passing');
  const [sortKey, setSortKey] = useState('pass_yds');
  const { data: rawStats } = useAllPlayerStats();

  const config = STAT_CONFIGS[tab];

  // Aggregate per player
  const playerMap: Record<string, { memberId: string; name: string; team: string; teamId: string; stats: Record<string, number> }> = {};
  for (const s of rawStats ?? []) {
    const key = s.member_id;
    if (!playerMap[key]) {
      playerMap[key] = {
        memberId: s.member_id,
        name: `${s.members?.first_name ?? ''} ${s.members?.last_name ?? ''}`,
        team: (s.teams as any)?.name ?? '',
        teamId: s.team_id,
        stats: {},
      };
    }
    playerMap[key].stats[s.stat_key] = (playerMap[key].stats[s.stat_key] ?? 0) + Number(s.value);
  }

  // Filter players who have any stat in current category
  const relevantKeys = config.columns.map(c => c.key);
  const players = Object.values(playerMap)
    .filter(p => relevantKeys.some(k => (p.stats[k] ?? 0) > 0))
    .sort((a, b) => (b.stats[sortKey] ?? 0) - (a.stats[sortKey] ?? 0));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold uppercase tracking-tight">Player Stats</h1>

      <div className="flex gap-2">
        {(Object.keys(STAT_CONFIGS) as StatTab[]).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setSortKey(STAT_CONFIGS[t].sortKey); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors ${
              tab === t ? 'bg-[hsl(var(--primary))] text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/40 text-xs uppercase bg-white/5">
              <th className="text-left py-3 px-4 w-8">#</th>
              <th className="text-left py-3 px-4">Player</th>
              <th className="text-left py-3 px-4">Team</th>
              {config.columns.map(col => (
                <th
                  key={col.key}
                  className={`text-center py-3 px-3 cursor-pointer hover:text-white transition-colors ${sortKey === col.key ? 'text-[hsl(var(--primary))]' : ''}`}
                  onClick={() => setSortKey(col.key)}
                >
                  {col.label} {sortKey === col.key ? '▼' : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => (
              <tr key={p.memberId} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 text-white/40 font-mono">{i + 1}</td>
                <td className="py-3 px-4">
                  <Link to={`/site/players/${p.memberId}`} className="font-bold hover:text-[hsl(var(--primary))] transition-colors">{p.name}</Link>
                </td>
                <td className="py-3 px-4">
                  <Link to={`/site/teams/${p.teamId}`} className="text-white/60 hover:text-white transition-colors">{p.team}</Link>
                </td>
                {config.columns.map(col => (
                  <td key={col.key} className={`text-center py-3 px-3 font-mono ${sortKey === col.key ? 'font-bold text-white' : ''}`}>
                    {p.stats[col.key] ?? 0}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
