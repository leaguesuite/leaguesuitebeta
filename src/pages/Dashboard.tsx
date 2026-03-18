import { StatCard } from "@/components/ui/stat-card";
import { Users, UserCheck, Trophy, CalendarDays, TrendingUp, AlertTriangle, ArrowRight, FileText, BarChart3, Globe, Search, ArrowUpRight, ArrowDownRight, Monitor, Smartphone, Tablet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

// ─── Website Traffic Data ────────────────────────────────────────────────────

const trafficData = [
  { date: "Mar 1", visitors: 342, pageViews: 891 },
  { date: "Mar 2", visitors: 287, pageViews: 723 },
  { date: "Mar 3", visitors: 410, pageViews: 1102 },
  { date: "Mar 4", visitors: 523, pageViews: 1340 },
  { date: "Mar 5", visitors: 478, pageViews: 1210 },
  { date: "Mar 6", visitors: 390, pageViews: 980 },
  { date: "Mar 7", visitors: 312, pageViews: 802 },
  { date: "Mar 8", visitors: 445, pageViews: 1150 },
  { date: "Mar 9", visitors: 510, pageViews: 1320 },
  { date: "Mar 10", visitors: 620, pageViews: 1580 },
  { date: "Mar 11", visitors: 580, pageViews: 1490 },
  { date: "Mar 12", visitors: 540, pageViews: 1380 },
  { date: "Mar 13", visitors: 490, pageViews: 1250 },
  { date: "Mar 14", visitors: 680, pageViews: 1720 },
  { date: "Mar 15", visitors: 750, pageViews: 1900 },
  { date: "Mar 16", visitors: 710, pageViews: 1810 },
  { date: "Mar 17", visitors: 640, pageViews: 1640 },
  { date: "Mar 18", visitors: 590, pageViews: 1510 },
];

const trafficSourcesData = [
  { name: "Direct", value: 38, color: "hsl(215, 90%, 52%)" },
  { name: "Organic Search", value: 28, color: "hsl(165, 70%, 42%)" },
  { name: "Social Media", value: 20, color: "hsl(280, 65%, 60%)" },
  { name: "Referral", value: 10, color: "hsl(38, 92%, 55%)" },
  { name: "Email", value: 4, color: "hsl(340, 82%, 52%)" },
];

const topPages = [
  { page: "/schedule", views: 4_210, change: 12.3 },
  { page: "/standings", views: 3_880, change: 8.7 },
  { page: "/register", views: 2_540, change: -3.2 },
  { page: "/teams/eagles", views: 1_920, change: 22.1 },
  { page: "/news/playoffs", views: 1_650, change: 45.6 },
];

const deviceData = [
  { name: "Mobile", value: 58, icon: Smartphone },
  { name: "Desktop", value: 34, icon: Monitor },
  { name: "Tablet", value: 8, icon: Tablet },
];

// ─── SEO Data ────────────────────────────────────────────────────────────────

const seoScoreData = [
  { category: "Performance", score: 87 },
  { category: "Accessibility", score: 92 },
  { category: "Best Practices", score: 78 },
  { category: "SEO", score: 95 },
];

const keywordRankings = [
  { keyword: "flag football league", position: 3, change: 2, volume: 2_400 },
  { keyword: "metro flag league registration", position: 1, change: 0, volume: 880 },
  { keyword: "flag football schedule", position: 5, change: -1, volume: 1_900 },
  { keyword: "adult flag football near me", position: 8, change: 4, volume: 3_200 },
  { keyword: "flag football standings", position: 4, change: 1, volume: 1_100 },
  { keyword: "co-ed flag football", position: 12, change: 3, volume: 720 },
];

const indexedPages = [
  { url: "/schedule", status: "indexed" },
  { url: "/standings", status: "indexed" },
  { url: "/register", status: "indexed" },
  { url: "/teams", status: "indexed" },
  { url: "/news/playoffs", status: "indexed" },
  { url: "/about", status: "warning" },
];

const organicTrafficTrend = [
  { month: "Oct", clicks: 1_800, impressions: 14_200 },
  { month: "Nov", clicks: 2_100, impressions: 16_800 },
  { month: "Dec", clicks: 1_600, impressions: 13_500 },
  { month: "Jan", clicks: 2_400, impressions: 19_200 },
  { month: "Feb", clicks: 2_900, impressions: 22_100 },
  { month: "Mar", clicks: 3_400, impressions: 26_800 },
];

function ScoreRing({ score, label, size = 56 }: { score: number; label: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 90 ? "hsl(var(--accent))" : score >= 70 ? "hsl(var(--warning))" : "hsl(var(--destructive))";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={4} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-foreground">{score}</span>
        </div>
      </div>
      <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

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

      {/* ─── Website Traffic Section ──────────────────────────────────────── */}
      <div className="section-card">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Website Traffic</h2>
          </div>
          <Tabs defaultValue="30d" className="h-auto">
            <TabsList className="h-7">
              <TabsTrigger value="7d" className="text-xs px-2 h-5">7D</TabsTrigger>
              <TabsTrigger value="30d" className="text-xs px-2 h-5">30D</TabsTrigger>
              <TabsTrigger value="90d" className="text-xs px-2 h-5">90D</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Traffic KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 pb-2">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Visitors</p>
            <p className="text-xl font-bold text-foreground mt-0.5">9,297</p>
            <p className="text-xs text-accent font-medium flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="h-3 w-3" /> 14.2%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Page Views</p>
            <p className="text-xl font-bold text-foreground mt-0.5">23,407</p>
            <p className="text-xs text-accent font-medium flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="h-3 w-3" /> 9.8%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Avg. Session</p>
            <p className="text-xl font-bold text-foreground mt-0.5">2m 34s</p>
            <p className="text-xs text-destructive font-medium flex items-center gap-0.5 mt-0.5">
              <ArrowDownRight className="h-3 w-3" /> 3.1%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Bounce Rate</p>
            <p className="text-xl font-bold text-foreground mt-0.5">42.3%</p>
            <p className="text-xs text-accent font-medium flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="h-3 w-3" /> 2.4% better
            </p>
          </div>
        </div>

        {/* Traffic Chart */}
        <div className="px-5 pb-2">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(215, 90%, 52%)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(215, 90%, 52%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradPageViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(165, 70%, 42%)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="hsl(165, 70%, 42%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(215, 14%, 50%)" tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 14%, 50%)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214, 20%, 90%)", fontSize: 12 }} />
                <Area type="monotone" dataKey="pageViews" stroke="hsl(165, 70%, 42%)" fill="url(#gradPageViews)" strokeWidth={2} name="Page Views" />
                <Area type="monotone" dataKey="visitors" stroke="hsl(215, 90%, 52%)" fill="url(#gradVisitors)" strokeWidth={2} name="Visitors" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom row: Sources, Top Pages, Devices */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-border divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Traffic Sources */}
          <div className="p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Traffic Sources</h3>
            <div className="space-y-2.5">
              {trafficSourcesData.map(src => (
                <div key={src.name} className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: src.color }} />
                  <span className="text-sm text-foreground flex-1">{src.name}</span>
                  <span className="text-sm font-semibold text-foreground">{src.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Pages */}
          <div className="p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Top Pages</h3>
            <div className="space-y-2.5">
              {topPages.map(pg => (
                <div key={pg.page} className="flex items-center justify-between">
                  <span className="text-sm text-foreground font-mono">{pg.page}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{pg.views.toLocaleString()}</span>
                    <span className={`text-[11px] font-medium flex items-center ${pg.change >= 0 ? "text-accent" : "text-destructive"}`}>
                      {pg.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {Math.abs(pg.change)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Devices */}
          <div className="p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Devices</h3>
            <div className="space-y-3">
              {deviceData.map(d => (
                <div key={d.name} className="flex items-center gap-3">
                  <d.icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">{d.name}</span>
                      <span className="text-sm font-semibold text-foreground">{d.value}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${d.value}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── SEO Overview Section ─────────────────────────────────────────── */}
      <div className="section-card">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">SEO Overview</h2>
        </div>

        {/* Score rings + Organic traffic chart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Lighthouse-style scores */}
          <div className="p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Site Health</h3>
            <div className="flex items-center justify-around">
              {seoScoreData.map(s => (
                <ScoreRing key={s.category} score={s.score} label={s.category} />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-lg font-bold text-foreground">{indexedPages.filter(p => p.status === "indexed").length}/{indexedPages.length}</p>
                <p className="text-[11px] text-muted-foreground">Pages Indexed</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-lg font-bold text-foreground">1.2s</p>
                <p className="text-[11px] text-muted-foreground">Avg Load Time</p>
              </div>
            </div>
          </div>

          {/* Organic traffic trend */}
          <div className="p-5 md:col-span-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Organic Search Performance</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Clicks</p>
                <p className="text-lg font-bold text-foreground">14,200</p>
                <p className="text-xs text-accent font-medium flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" /> 17.2% vs prev.</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Impressions</p>
                <p className="text-lg font-bold text-foreground">112,600</p>
                <p className="text-xs text-accent font-medium flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" /> 22.5% vs prev.</p>
              </div>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={organicTrafficTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(215, 14%, 50%)" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 14%, 50%)" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214, 20%, 90%)", fontSize: 12 }} />
                  <Line type="monotone" dataKey="clicks" stroke="hsl(215, 90%, 52%)" strokeWidth={2} dot={{ fill: "hsl(215, 90%, 52%)", r: 3 }} name="Clicks" />
                  <Line type="monotone" dataKey="impressions" stroke="hsl(165, 70%, 42%)" strokeWidth={2} dot={{ fill: "hsl(165, 70%, 42%)", r: 3 }} name="Impressions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Keyword rankings */}
        <div className="border-t border-border p-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Keyword Rankings</h3>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-2.5 table-header">Keyword</th>
                  <th className="text-center px-4 py-2.5 table-header">Position</th>
                  <th className="text-center px-4 py-2.5 table-header">Change</th>
                  <th className="text-right px-4 py-2.5 table-header">Search Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {keywordRankings.map(kw => (
                  <tr key={kw.keyword} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-foreground">{kw.keyword}</td>
                    <td className="px-4 py-2.5 text-center">
                      <Badge variant={kw.position <= 3 ? "default" : "secondary"} className="text-xs font-mono">
                        #{kw.position}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {kw.change !== 0 ? (
                        <span className={`text-xs font-medium flex items-center justify-center gap-0.5 ${kw.change > 0 ? "text-accent" : "text-destructive"}`}>
                          {kw.change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {Math.abs(kw.change)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{kw.volume.toLocaleString()}/mo</td>
                  </tr>
                ))}
              </tbody>
            </table>
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