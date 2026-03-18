import { Bell, Search, HelpCircle, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AppHeader() {
  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search anything..."
            className="h-9 w-72 rounded-lg bg-secondary pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/20 transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>
        <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-4.5 w-4.5" />
        </button>
        <div className="ml-2 pl-3 border-l border-border flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Metro Flag League</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
