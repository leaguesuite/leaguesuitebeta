import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStandings } from '@/hooks/use-public-data';

const DIVISIONS = [
  { id: 'e0000000-0000-0000-0000-000000000001', label: 'Division A · Men\'s' },
  { id: 'e0000000-0000-0000-0000-000000000002', label: 'Division B · Co-Ed' },
];

export default function PublicStandingsPage() {
  const [activeDivision, setActiveDivision] = useState(DIVISIONS[0].id);
  const { data: standings, isLoading } = useStandings(activeDivision);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold uppercase tracking-tight">Standings</h1>

      {/* Division tabs */}
      <div className="flex gap-2">
        {DIVISIONS.map(d => (
          <button
            key={d.id}
            onClick={() => setActiveDivision(d.id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors ${
              activeDivision === d.id ? 'bg-[hsl(var(--primary))] text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-white/40 py-12 text-center">Loading standings...</div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-xs uppercase bg-white/5">
                <th className="text-left py-3 px-4 w-8">#</th>
                <th className="text-left py-3 px-4">Team</th>
                <th className="text-center py-3 px-3">GP</th>
                <th className="text-center py-3 px-3">W</th>
                <th className="text-center py-3 px-3">L</th>
                <th className="text-center py-3 px-3">T</th>
                <th className="text-center py-3 px-3">WIN%</th>
                <th className="text-center py-3 px-3">PF</th>
                <th className="text-center py-3 px-3">PA</th>
                <th className="text-center py-3 px-3">DIFF</th>
              </tr>
            </thead>
            <tbody>
              {standings?.map((team, i) => {
                const gp = team.w + team.l + team.t;
                const pct = gp > 0 ? (team.w / gp).toFixed(3) : '.000';
                const diff = team.pf - team.pa;
                return (
                  <tr key={team.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-white/40 font-mono">{i + 1}</td>
                    <td className="py-3 px-4">
                      <Link to={`/site/teams/${team.id}`} className="flex items-center gap-3 hover:text-[hsl(var(--primary))] transition-colors">
                        <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: team.color, background: `${team.color}33` }} />
                        <span className="font-bold">{team.name}</span>
                      </Link>
                    </td>
                    <td className="text-center py-3 px-3 font-mono">{gp}</td>
                    <td className="text-center py-3 px-3 font-mono font-bold text-green-400">{team.w}</td>
                    <td className="text-center py-3 px-3 font-mono text-red-400">{team.l}</td>
                    <td className="text-center py-3 px-3 font-mono text-white/50">{team.t}</td>
                    <td className="text-center py-3 px-3 font-mono font-semibold">{pct}</td>
                    <td className="text-center py-3 px-3 font-mono">{team.pf}</td>
                    <td className="text-center py-3 px-3 font-mono">{team.pa}</td>
                    <td className={`text-center py-3 px-3 font-mono font-bold ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-white/50'}`}>
                      {diff > 0 ? '+' : ''}{diff}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
