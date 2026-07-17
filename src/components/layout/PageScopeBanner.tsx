import { Trophy, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useActiveLeague } from "@/contexts/LeagueContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Renders a compact "Managing: <league>" strip. Place at the top of any
 * league-scoped page so admins always know which league they are editing.
 */
export default function PageScopeBanner({ scope = "league" }: { scope?: "league" | "event" }) {
  const { leagues, activeLeague, setActiveLeagueId, isMultiLeague } = useActiveLeague();
  const [open, setOpen] = useState(false);
  const label = scope === "event" ? "Event scope in" : "Managing";

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>{label}:</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium hover:bg-primary/15 transition-colors"
            disabled={!isMultiLeague}
          >
            <Trophy className="h-3 w-3" />
            {activeLeague.name}
            {isMultiLeague && <ChevronDown className="h-3 w-3" />}
          </button>
        </PopoverTrigger>
        {isMultiLeague && (
          <PopoverContent align="start" className="w-56 p-1">
            {leagues.map(l => (
              <button
                key={l.id}
                onClick={() => {
                  setActiveLeagueId(l.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left hover:bg-accent transition-colors ${
                  l.id === activeLeague.id ? "bg-accent/60 font-medium" : ""
                }`}
              >
                <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
                {l.name}
              </button>
            ))}
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}
