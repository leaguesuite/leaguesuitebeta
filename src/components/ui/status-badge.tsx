import { cn } from "@/lib/utils";

type Status = "active" | "completed" | "upcoming" | "draft" | "cancelled" | "live" | "pending" | "published";

const statusStyles: Record<Status, string> = {
  active: "bg-success/10 text-success border-success/20",
  completed: "bg-muted text-muted-foreground border-border",
  upcoming: "bg-info/10 text-info border-info/20",
  draft: "bg-secondary text-secondary-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  live: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  published: "bg-success/10 text-success border-success/20",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", statusStyles[status])}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
