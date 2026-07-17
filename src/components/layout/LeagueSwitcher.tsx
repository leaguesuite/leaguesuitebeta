import { Building2, Trophy, Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { useActiveLeague } from "@/contexts/LeagueContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link } from "react-router-dom";

export default function LeagueSwitcher() {
  const { tenant, leagues, activeLeague, setActiveLeagueId } = useActiveLeague();
  const [open, setOpen] = useState(false);

  return (
    <div className="px-2 py-2 border-b border-sidebar-border">
      <div className="flex items-center gap-2 px-2 py-1 text-[11px] uppercase tracking-wide text-sidebar-foreground/60">
        <Building2 className="h-3 w-3" />
        <span className="truncate">{tenant.name}</span>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="mt-1 w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[13px] font-medium text-sidebar-accent-foreground bg-sidebar-accent/40 hover:bg-sidebar-accent transition-colors"
            aria-label="Switch league"
          >
            <Trophy className="h-4 w-4 shrink-0 text-sidebar-primary" />
            <span className="flex-1 text-left truncate">{activeLeague.name}</span>
            <ChevronsUpDown className="h-3.5 w-3.5 opacity-60" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-1">
          <div className="px-2 py-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
            Leagues in {tenant.name}
          </div>
          <div className="space-y-0.5">
            {leagues.map(l => (
              <button
                key={l.id}
                onClick={() => {
                  setActiveLeagueId(l.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left hover:bg-accent transition-colors ${
                  l.id === activeLeague.id ? "bg-accent/60" : ""
                }`}
              >
                <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="flex-1 truncate">{l.name}</span>
                {l.id === activeLeague.id && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
          </div>
          <div className="border-t border-border mt-1 pt-1">
            <Link
              to="/structure/leagues"
              onClick={() => setOpen(false)}
              className="block px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Manage leagues →
            </Link>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
