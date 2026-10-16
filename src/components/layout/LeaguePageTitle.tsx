import { useActiveLeague } from "@/contexts/LeagueContext";
import { cn } from "@/lib/utils";

interface LeaguePageTitleProps {
  title: string;
  className?: string;
}

/**
 * Page title with the active league shown as a small eyebrow label above it.
 */
export function LeaguePageTitle({ title, className }: LeaguePageTitleProps) {
  const { activeLeague } = useActiveLeague();
  return (
    <div>
      {activeLeague?.name && (
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary mb-1">
          {activeLeague.name}
        </div>
      )}
      <h1 className={cn("text-2xl font-display font-semibold tracking-tight text-foreground", className)}>{title}</h1>
    </div>
  );
}
