import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

export function StatCard({ label, value, change, changeType = "neutral", icon: Icon }: StatCardProps) {
  return (
    <div className="stat-card flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        {change && (
          <p className={`text-xs font-medium mt-1.5 ${
            changeType === "positive" ? "text-success" : changeType === "negative" ? "text-destructive" : "text-muted-foreground"
          }`}>
            {change}
          </p>
        )}
      </div>
      <div className="p-2.5 rounded-xl bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </div>
  );
}
