import { Link } from 'react-router-dom';
import { useTeams } from '@/hooks/use-public-data';

const DIVISIONS = [
  { id: 'e0000000-0000-0000-0000-000000000001', label: 'Division A · Men\'s' },
  { id: 'e0000000-0000-0000-0000-000000000002', label: 'Division B · Co-Ed' },
];

export default function PublicTeamsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold uppercase tracking-tight">Teams</h1>
      {DIVISIONS.map(div => (
        <DivisionTeams key={div.id} divisionId={div.id} title={div.label} />
      ))}
    </div>
  );
}

function DivisionTeams({ divisionId, title }: { divisionId: string; title: string }) {
  const { data: teams } = useTeams(divisionId);

  return (
    <section>
      <h2 className="text-sm font-bold uppercase tracking-wide text-white/40 mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {teams?.map(team => (
          <Link
            key={team.id}
            to={`/site/teams/${team.id}`}
            className="group bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all hover:border-white/20"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-extrabold mb-4"
              style={{ background: `${team.primary_color}22`, color: team.primary_color ?? '#fff', border: `2px solid ${team.primary_color}44` }}
            >
              {team.name.charAt(0)}
            </div>
            <h3 className="font-bold text-lg group-hover:text-[hsl(var(--primary))] transition-colors">{team.name}</h3>
            <p className="text-xs text-white/40 mt-1 uppercase">View Roster & Stats →</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
