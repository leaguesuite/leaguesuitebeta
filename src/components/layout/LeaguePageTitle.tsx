import { useActiveLeague } from "@/contexts/LeagueContext";
import { cn } from "@/lib/utils";

interface LeaguePageTitleProps {
  title: string;
  className?: string;
}

/**
 * Renders a page title prefixed with the active league name.
 * Example: "Metro Flag League › Tags"
 */
export function LeaguePageTitle({ title, className }: LeaguePageTitleProps) {
  const { activeLeague } = useActiveLeague();
  return (
    <h1 className={cn("text-2xl font-bold text-foreground", className)}>
      {activeLeague?.name && (
        <>
          <span className="text-muted-foreground font-medium">{activeLeague.name}</span>{" "}
          <span className="text-muted-foreground/60 font-normal">›</span>{" "}
        </>
      )}
      {title}
    </h1>
  );
}
