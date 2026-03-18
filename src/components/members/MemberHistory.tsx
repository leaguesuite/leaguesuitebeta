import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Trophy, ChevronRight } from 'lucide-react';
import type { SeasonHistory } from '@/types/member';

export function MemberHistory({ history }: { history: SeasonHistory[] }) {
  if (history.length === 0) {
    return <div className="text-center py-8 text-muted-foreground"><Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No season history</p></div>;
  }

  const grouped = history.reduce((acc, e) => { (acc[e.year] = acc[e.year] || []).push(e); return acc; }, {} as Record<number, SeasonHistory[]>);
  const years = Object.keys(grouped).map(Number).sort((a, b) => b - a);
  const roleColors = {
    captain: 'bg-primary/10 text-primary border-primary/20',
    coach: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    player: 'bg-muted text-muted-foreground border-muted',
  };

  return (
    <div className="space-y-6">
      {years.map(year => (
        <div key={year}>
          <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2"><Calendar className="h-4 w-4" />{year}</h4>
          <div className="space-y-2 ml-6">
            {grouped[year].map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{entry.team_name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{entry.division}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={roleColors[entry.role]}>
                    {entry.role === 'captain' && <Trophy className="h-3 w-3 mr-1" />}
                    {entry.role.charAt(0).toUpperCase() + entry.role.slice(1)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{entry.season_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="border-t pt-4 mt-4">
        <h4 className="font-medium text-sm mb-2">Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-muted/30 rounded-lg"><div className="text-2xl font-bold">{years.length}</div><div className="text-xs text-muted-foreground">Seasons</div></div>
          <div className="p-3 bg-muted/30 rounded-lg"><div className="text-2xl font-bold">{new Set(history.map(h => h.team_name)).size}</div><div className="text-xs text-muted-foreground">Teams</div></div>
          <div className="p-3 bg-muted/30 rounded-lg"><div className="text-2xl font-bold">{history.filter(h => h.role === 'captain').length}</div><div className="text-xs text-muted-foreground">As Captain</div></div>
        </div>
      </div>
    </div>
  );
}
