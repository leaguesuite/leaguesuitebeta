import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Users, UserCheck, Trophy, CalendarDays, TrendingUp, AlertTriangle, Clock, ArrowRight, FileText, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const upcomingGames = [
  { id: 1, home: "Thunder Hawks", away: "Iron Eagles", time: "6:00 PM", field: "Memorial Field 1", division: "Men's D1" },
  { id: 2, home: "Storm Riders", away: "Blaze FC", time: "7:30 PM", field: "Central Park A", division: "Co-Ed Open" },
  { id: 3, home: "Phoenix Rising", away: "Steel Wolves", time: "8:00 PM", field: "Memorial Field 2", division: "Women's D1" },
];

const recentRegistrations = [
  { name: "Marcus Johnson", type: "Player", team: "Thunder Hawks", date: "Today" },
  { name: "Sarah Chen", type: "Coach", team: "Iron Eagles", date: "Today" },
  { name: "Jake Williams", type: "Player", team: "Storm Riders", date: "Yesterday" },
  { name: "Emily Torres", type: "Official", team: "-", date: "Yesterday" },
  { name: "David Kim", type: "Player", team: "Phoenix Rising", date: "2 days ago" },
];

const alerts = [
  { message: "3 teams missing roster submissions", type: "warning" as const },
  { message: "Season payment overdue: Steel Wolves", type: "error" as const },
  { message: "New registrar access request pending", type: "info" as const },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back, John. Here's what's happening in Metro Flag League.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Members" value="1,247" change="+23 this month" changeType="positive" />
        <StatCard icon={UserCheck} label="Active Players" value="384" change="Spring 2025 Season" changeType="neutral" />
        <StatCard icon={Trophy} label="Active Teams" value="32" change="Across 4 divisions" changeType="neutral" />
        <StatCard icon={CalendarDays} label="Games This Week" value="12" change="3 today" changeType="positive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Games */}
        <div className="lg:col-span-2 section-card">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Today's Games</h2>
            <a href="/season/games" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </a>
          </div>
          <div className="divide-y divide-border">
            {upcomingGames.map(game => (
              <div key={game.id} className="px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="text-sm font-medium text-foreground whitespace-nowrap">{game.home}</div>
                  <span className="text-xs font-bold text-muted-foreground">VS</span>
                  <div className="text-sm font-medium text-foreground whitespace-nowrap">{game.away}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="secondary" className="text-xs font-medium">{game.division}</Badge>
                  <span className="text-xs text-muted-foreground">{game.field}</span>
                  <span className="text-xs font-semibold text-foreground">{game.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="section-card">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Alerts & Tasks</h2>
          </div>
          <div className="p-4 space-y-3">
            {alerts.map((alert, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                alert.type === "warning" ? "bg-warning/5 text-foreground" :
                alert.type === "error" ? "bg-destructive/5 text-foreground" :
                "bg-info/5 text-foreground"
              }`}>
                <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${
                  alert.type === "warning" ? "text-warning" :
                  alert.type === "error" ? "text-destructive" :
                  "text-info"
                }`} />
                <span className="text-[13px]">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="section-card">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Registrations</h2>
            <a href="/members/all" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </a>
          </div>
          <div className="divide-y divide-border">
            {recentRegistrations.map((reg, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">{reg.name}</div>
                  <div className="text-xs text-muted-foreground">{reg.type} · {reg.team}</div>
                </div>
                <span className="text-xs text-muted-foreground">{reg.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="section-card">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Quick Actions</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {[
              { label: "New Season", icon: CalendarDays, path: "/setup/new-season" },
              { label: "Add Member", icon: Users, path: "/members/all" },
              { label: "Create Form", icon: FileText, path: "/forms/all" },
              { label: "View Reports", icon: BarChart3, path: "/season/reports" },
              { label: "Export Data", icon: TrendingUp, path: "/season/reports" },
              { label: "Manage Users", icon: UserCheck, path: "/admin/users" },
            ].map(action => (
              <a
                key={action.label}
                href={action.path}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
              >
                <action.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
