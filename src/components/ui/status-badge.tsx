import { cn } from "@/lib/utils";

type Status = "active" | "completed" | "upcoming" | "draft" | "cancelled" | "live" | "pending" | "published";

const statusStyles: Record<Status, string> = {
  active: "bg-success/10 text-success ring-success/20",
  completed: "bg-foreground/[0.06] text-foreground ring-foreground/10",
  upcoming: "bg-info/10 text-info ring-info/20",
  draft: "bg-secondary text-muted-foreground ring-border",
  cancelled: "bg-destructive/10 text-destructive ring-destructive/20",
  live: "bg-live/10 text-live ring-live/25",
  pending: "bg-warning/10 text-warning ring-warning/25",
  published: "bg-success/10 text-success ring-success/20",
};

const labels: Partial<Record<Status, string>> = { completed: "Final", upcoming: "Scheduled" };

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset", statusStyles[status])}>
      {status === "live" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-live opacity-75 animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live" />
        </span>
      )}
      {labels[status] ?? status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
