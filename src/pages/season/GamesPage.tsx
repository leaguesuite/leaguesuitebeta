import { useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Filter, Plus, Download, Search, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";

const games = [
  { id: 1, date: "Mar 15, 2025", time: "6:00 PM", home: "Thunder Hawks", away: "Iron Eagles", score: "28-14", status: "completed" as const, division: "Men's D1", field: "Memorial Field 1", week: 8 },
  { id: 2, date: "Mar 15, 2025", time: "7:30 PM", home: "Storm Riders", away: "Blaze FC", score: "21-21", status: "completed" as const, division: "Co-Ed Open", field: "Central Park A", week: 8 },
  { id: 3, date: "Mar 18, 2025", time: "6:00 PM", home: "Phoenix Rising", away: "Steel Wolves", score: "-", status: "upcoming" as const, division: "Women's D1", field: "Memorial Field 2", week: 9 },
  { id: 4, date: "Mar 18, 2025", time: "7:00 PM", home: "Crimson Tide", away: "Blue Lightning", score: "-", status: "upcoming" as const, division: "Men's D1", field: "Riverside Field 1", week: 9 },
  { id: 5, date: "Mar 18, 2025", time: "8:00 PM", home: "Night Owls", away: "Silver Sharks", score: "-", status: "live" as const, division: "Men's D2", field: "Memorial Field 1", week: 9 },
  { id: 6, date: "Mar 20, 2025", time: "6:30 PM", home: "Golden Bears", away: "Red Rockets", score: "-", status: "upcoming" as const, division: "Co-Ed Open", field: "Central Park B", week: 9 },
  { id: 7, date: "Mar 20, 2025", time: "7:30 PM", home: "Viper Squad", away: "Arctic Wolves", score: "-", status: "upcoming" as const, division: "Women's D1", field: "Memorial Field 2", week: 9 },
  { id: 8, date: "Mar 22, 2025", time: "10:00 AM", home: "Thunder Hawks", away: "Storm Riders", score: "-", status: "draft" as const, division: "Men's D1", field: "TBD", week: 10 },
];

const divisions = ["All Divisions", "Men's D1", "Men's D2", "Women's D1", "Co-Ed Open"];
const weeks = ["All Weeks", "Week 8", "Week 9", "Week 10"];

export default function GamesPage() {
  const [selectedDivision, setSelectedDivision] = useState("All Divisions");
  const [selectedWeek, setSelectedWeek] = useState("All Weeks");
  const [search, setSearch] = useState("");

  const filtered = games.filter(g => {
    if (selectedDivision !== "All Divisions" && g.division !== selectedDivision) return false;
    if (selectedWeek !== "All Weeks" && `Week ${g.week}` !== selectedWeek) return false;
    if (search && !g.home.toLowerCase().includes(search.toLowerCase()) && !g.away.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Games & Schedule</h1>
          <p className="text-sm text-muted-foreground mt-1">Spring 2025 Season · 48 total games</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 px-4 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary transition-colors flex items-center gap-2">
            <Download className="h-4 w-4" /> Export
          </button>
          <button className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Game
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="section-card p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search teams..."
              className="h-9 w-56 rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <select
            value={selectedDivision}
            onChange={e => setSelectedDivision(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-ring/20"
          >
            {divisions.map(d => <option key={d}>{d}</option>)}
          </select>
          <select
            value={selectedWeek}
            onChange={e => setSelectedWeek(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-ring/20"
          >
            {weeks.map(w => <option key={w}>{w}</option>)}
          </select>
          <div className="ml-auto text-sm text-muted-foreground">
            {filtered.length} game{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="section-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="table-header text-left px-5 py-3">Date / Time</th>
                <th className="table-header text-left px-5 py-3">Matchup</th>
                <th className="table-header text-left px-5 py-3">Division</th>
                <th className="table-header text-left px-5 py-3">Location</th>
                <th className="table-header text-left px-5 py-3">Score</th>
                <th className="table-header text-left px-5 py-3">Status</th>
                <th className="table-header text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(game => (
                <tr key={game.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-medium text-foreground">{game.date}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> {game.time}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-sm">
                      <span className="font-semibold text-foreground">{game.home}</span>
                      <span className="mx-2 text-xs text-muted-foreground font-bold">VS</span>
                      <span className="font-semibold text-foreground">{game.away}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant="secondary" className="text-xs">{game.division}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {game.field}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-sm font-semibold ${game.score === "-" ? "text-muted-foreground" : "text-foreground"}`}>
                      {game.score}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={game.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="text-xs text-primary font-medium hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Showing {filtered.length} of {games.length} games</span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground"><ChevronLeft className="h-4 w-4" /></button>
            <button className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium">1</button>
            <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
