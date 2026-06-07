import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { detectConflicts, MOCK_PLAYOFF_GAMES, type ScheduleConflict } from "@/data/mockPlayoffs";

const sevStyle: Record<ScheduleConflict["severity"], string> = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  low: "bg-muted text-muted-foreground border-border",
};

export const ConflictsStep = () => {
  const conflicts = detectConflicts(MOCK_PLAYOFF_GAMES);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Conflict check</CardTitle>
      </CardHeader>
      <CardContent>
        {conflicts.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />No conflicts detected.
          </div>
        ) : (
          <ul className="space-y-2">
            {conflicts.map((c, i) => (
              <li key={i} className={`flex items-start gap-3 rounded-md border px-3 py-2 text-sm ${sevStyle[c.severity]}`}>
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="flex-1">
                  <div>{c.message}</div>
                  <div className="mt-0.5 text-xs opacity-80">Games: {c.gameIds.join(", ")}</div>
                </div>
                <Badge variant="outline" className="uppercase">{c.severity}</Badge>
                <Badge variant="outline">{c.type}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
