import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Hash } from "lucide-react";
import type { MockPlayoffGame } from "@/data/mockPlayoffs";

const statusStyle: Record<MockPlayoffGame["status"], string> = {
  scheduled: "bg-muted text-muted-foreground",
  in_progress: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  final: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
};

const statusLabel: Record<MockPlayoffGame["status"], string> = {
  scheduled: "Scheduled",
  in_progress: "Live",
  final: "Final",
};

export const BracketGameLinkBadge = ({ game }: { game: MockPlayoffGame }) => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-dashed border-border bg-card/50 px-2.5 py-1.5 text-[11px] text-muted-foreground">
    <span className="inline-flex items-center gap-1 font-mono text-foreground">
      <Hash className="h-3 w-3" />{game.id}
    </span>
    <span className="inline-flex items-center gap-1">
      <Calendar className="h-3 w-3" />{game.date} · {game.time}
    </span>
    <span className="inline-flex items-center gap-1">
      <MapPin className="h-3 w-3" />{game.field}
    </span>
    <Badge variant="secondary" className={`ml-auto ${statusStyle[game.status]}`}>
      {statusLabel[game.status]}
      {game.score ? ` · ${game.score.t1}–${game.score.t2}` : ""}
    </Badge>
  </div>
);
