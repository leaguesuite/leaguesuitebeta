import { Link } from 'react-router-dom';
import { useOrganization, useCurrentSeason, useDivisions, useTeams } from '@/hooks/use-public-data';

export default function PublicTeamsPage() {
  const { data: org } = useOrganization();
  const { data: season } = useCurrentSeason(org?.id);
  const { data: divisions } = useDivisions(season?.id);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold uppercase tracking-tight">Teams</h1>
      {divisions?.map(div => (
        <DivisionTeams
          key={div.id}
          divisionId={div.id}
          title={`${div.name}${div.categories?.name ? ` · ${div.categories.name}` : ''}`}
        />
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
