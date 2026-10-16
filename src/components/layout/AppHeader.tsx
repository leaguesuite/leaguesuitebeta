import { Bell, Search, HelpCircle, Building2 } from "lucide-react";
import { useActiveLeague } from "@/contexts/LeagueContext";

export default function AppHeader() {
  const { tenant } = useActiveLeague();
  return (
    <header className="sticky top-0 z-20 h-14 bg-card/80 backdrop-blur-md border-b border-border/80 flex items-center justify-between px-6 shrink-0">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search anything..."
          className="h-9 w-80 rounded-lg bg-secondary/70 border border-transparent pl-9 pr-14 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:bg-card focus:border-border focus:ring-4 focus:ring-ring/10 transition-all"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">Ctrl K</kbd>
      </div>
      <div className="flex items-center gap-1">
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-live rounded-full ring-2 ring-card" />
        </button>
        <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-4 w-4" />
        </button>
        <div className="ml-2 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 shadow-card">
          <Building2 className="h-3.5 w-3.5 text-primary" />
          <span className="text-[13px] font-medium text-foreground">{tenant.name}</span>
        </div>
      </div>
    </header>
  );
}
