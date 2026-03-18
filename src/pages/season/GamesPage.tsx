import { useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  CalendarDays, Plus, Download, Search, MapPin, Clock, ChevronLeft, ChevronRight,
  Edit, Save, X, BarChart3, FileText, Pencil,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlayerStat {
  id: string;
  name: string;
  team: "home" | "away";
  number: string;
  td: number;
  passYds: number;
  rushYds: number;
  recYds: number;
  tackles: number;
  sacks: number;
  ints: number;
  fumbles: number;
}

interface Game {
  id: number;
  date: string;
  time: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "completed" | "upcoming" | "live" | "draft";
  division: string;
  field: string;
  week: number;
  playerStats: PlayerStat[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const generatePlayerStats = (homeTeam: string, awayTeam: string): PlayerStat[] => {
  const homePlayers = ["J. Smith", "M. Johnson", "R. Williams", "T. Brown", "D. Jones", "K. Davis"];
  const awayPlayers = ["A. Wilson", "C. Martinez", "B. Anderson", "S. Taylor", "L. Thomas", "P. Garcia"];

  return [
    ...homePlayers.map((name, i) => ({
      id: `h${i}`, name, team: "home" as const, number: String(10 + i),
      td: Math.floor(Math.random() * 3), passYds: Math.floor(Math.random() * 200),
      rushYds: Math.floor(Math.random() * 80), recYds: Math.floor(Math.random() * 100),
      tackles: Math.floor(Math.random() * 8), sacks: Math.floor(Math.random() * 2),
      ints: Math.floor(Math.random() * 2), fumbles: Math.floor(Math.random() * 2),
    })),
    ...awayPlayers.map((name, i) => ({
      id: `a${i}`, name, team: "away" as const, number: String(20 + i),
      td: Math.floor(Math.random() * 3), passYds: Math.floor(Math.random() * 200),
      rushYds: Math.floor(Math.random() * 80), recYds: Math.floor(Math.random() * 100),
      tackles: Math.floor(Math.random() * 8), sacks: Math.floor(Math.random() * 2),
      ints: Math.floor(Math.random() * 2), fumbles: Math.floor(Math.random() * 2),
    })),
  ];
};

const initialGames: Game[] = [
  { id: 1, date: "Mar 15, 2025", time: "6:00 PM", home: "Thunder Hawks", away: "Iron Eagles", homeScore: 28, awayScore: 14, status: "completed", division: "Men's D1", field: "Memorial Field 1", week: 8, playerStats: generatePlayerStats("Thunder Hawks", "Iron Eagles") },
  { id: 2, date: "Mar 15, 2025", time: "7:30 PM", home: "Storm Riders", away: "Blaze FC", homeScore: 21, awayScore: 21, status: "completed", division: "Co-Ed Open", field: "Central Park A", week: 8, playerStats: generatePlayerStats("Storm Riders", "Blaze FC") },
  { id: 3, date: "Mar 18, 2025", time: "6:00 PM", home: "Phoenix Rising", away: "Steel Wolves", homeScore: null, awayScore: null, status: "upcoming", division: "Women's D1", field: "Memorial Field 2", week: 9, playerStats: [] },
  { id: 4, date: "Mar 18, 2025", time: "7:00 PM", home: "Crimson Tide", away: "Blue Lightning", homeScore: null, awayScore: null, status: "upcoming", division: "Men's D1", field: "Riverside Field 1", week: 9, playerStats: [] },
  { id: 5, date: "Mar 18, 2025", time: "8:00 PM", home: "Night Owls", away: "Silver Sharks", homeScore: 14, awayScore: 7, status: "live", division: "Men's D2", field: "Memorial Field 1", week: 9, playerStats: generatePlayerStats("Night Owls", "Silver Sharks") },
  { id: 6, date: "Mar 20, 2025", time: "6:30 PM", home: "Golden Bears", away: "Red Rockets", homeScore: null, awayScore: null, status: "upcoming", division: "Co-Ed Open", field: "Central Park B", week: 9, playerStats: [] },
  { id: 7, date: "Mar 20, 2025", time: "7:30 PM", home: "Viper Squad", away: "Arctic Wolves", homeScore: null, awayScore: null, status: "upcoming", division: "Women's D1", field: "Memorial Field 2", week: 9, playerStats: [] },
  { id: 8, date: "Mar 22, 2025", time: "10:00 AM", home: "Thunder Hawks", away: "Storm Riders", homeScore: null, awayScore: null, status: "draft", division: "Men's D1", field: "TBD", week: 10, playerStats: [] },
];

const divisions = ["All Divisions", "Men's D1", "Men's D2", "Women's D1", "Co-Ed Open"];
const weeks = ["All Weeks", "Week 8", "Week 9", "Week 10"];
const STAT_COLUMNS: { key: keyof PlayerStat; label: string; abbr: string }[] = [
  { key: "td", label: "Touchdowns", abbr: "TD" },
  { key: "passYds", label: "Passing Yards", abbr: "PASS" },
  { key: "rushYds", label: "Rushing Yards", abbr: "RUSH" },
  { key: "recYds", label: "Receiving Yards", abbr: "REC" },
  { key: "tackles", label: "Tackles", abbr: "TKL" },
  { key: "sacks", label: "Sacks", abbr: "SCK" },
  { key: "ints", label: "Interceptions", abbr: "INT" },
  { key: "fumbles", label: "Fumbles", abbr: "FUM" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [selectedDivision, setSelectedDivision] = useState("All Divisions");
  const [selectedWeek, setSelectedWeek] = useState("All Weeks");
  const [search, setSearch] = useState("");

  // Edit game info dialog
  const [editGame, setEditGame] = useState<Game | null>(null);
  const [editForm, setEditForm] = useState({ date: "", time: "", field: "", division: "", homeScore: "", awayScore: "", status: "" });

  // Stats view dialog
  const [statsGame, setStatsGame] = useState<Game | null>(null);
  const [editingStats, setEditingStats] = useState(false);
  const [editedStats, setEditedStats] = useState<PlayerStat[]>([]);

  const filtered = games.filter(g => {
    if (selectedDivision !== "All Divisions" && g.division !== selectedDivision) return false;
    if (selectedWeek !== "All Weeks" && `Week ${g.week}` !== selectedWeek) return false;
    if (search && !g.home.toLowerCase().includes(search.toLowerCase()) && !g.away.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const formatScore = (g: Game) => {
    if (g.homeScore === null || g.awayScore === null) return "-";
    return `${g.homeScore}-${g.awayScore}`;
  };

  // ─── Edit Game Info ─────────────────────────────────────────────────────

  const openEditGame = (game: Game) => {
    setEditGame(game);
    setEditForm({
      date: game.date, time: game.time, field: game.field, division: game.division,
      homeScore: game.homeScore !== null ? String(game.homeScore) : "",
      awayScore: game.awayScore !== null ? String(game.awayScore) : "",
      status: game.status,
    });
  };

  const saveEditGame = () => {
    if (!editGame) return;
    setGames(prev => prev.map(g => g.id === editGame.id ? {
      ...g,
      date: editForm.date, time: editForm.time, field: editForm.field, division: editForm.division,
      homeScore: editForm.homeScore ? parseInt(editForm.homeScore) : null,
      awayScore: editForm.awayScore ? parseInt(editForm.awayScore) : null,
      status: editForm.status as Game["status"],
    } : g));
    setEditGame(null);
    toast({ title: "Game updated", description: `${editGame.home} vs ${editGame.away} has been saved.` });
  };

  // ─── Stats ──────────────────────────────────────────────────────────────

  const openStats = (game: Game) => {
    let stats = game.playerStats;
    if (stats.length === 0) {
      stats = generatePlayerStats(game.home, game.away);
      setGames(prev => prev.map(g => g.id === game.id ? { ...g, playerStats: stats } : g));
    }
    setStatsGame({ ...game, playerStats: stats });
    setEditedStats(stats.map(s => ({ ...s })));
    setEditingStats(false);
  };

  const updateStat = (playerId: string, field: keyof PlayerStat, value: string) => {
    const numVal = parseInt(value) || 0;
    setEditedStats(prev => prev.map(s =>
      s.id === playerId ? { ...s, [field]: numVal } : s
    ));
  };

  const saveStats = () => {
    if (!statsGame) return;
    setGames(prev => prev.map(g => g.id === statsGame.id ? { ...g, playerStats: editedStats } : g));
    setStatsGame(prev => prev ? { ...prev, playerStats: editedStats } : null);
    setEditingStats(false);
    toast({ title: "Stats saved", description: "Player statistics have been updated." });
  };

  const cancelStatsEdit = () => {
    if (statsGame) {
      setEditedStats(statsGame.playerStats.map(s => ({ ...s })));
    }
    setEditingStats(false);
  };

  const getTeamTotals = (stats: PlayerStat[], team: "home" | "away") => {
    const teamStats = stats.filter(s => s.team === team);
    const totals: Record<string, number> = {};
    STAT_COLUMNS.forEach(col => {
      totals[col.key] = teamStats.reduce((sum, s) => sum + (s[col.key] as number), 0);
    });
    return totals;
  };

  const renderStatsTable = (team: "home" | "away", teamName: string) => {
    const stats = editingStats ? editedStats : (statsGame?.playerStats || []);
    const teamStats = stats.filter(s => s.team === team);
    const totals = getTeamTotals(stats, team);

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{teamName}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs w-8">#</TableHead>
                  <TableHead className="text-xs">Player</TableHead>
                  {STAT_COLUMNS.map(col => (
                    <TableHead key={col.key} className="text-xs text-center w-16">{col.abbr}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamStats.map(player => (
                  <TableRow key={player.id}>
                    <TableCell className="text-xs text-muted-foreground">{player.number}</TableCell>
                    <TableCell className="text-sm font-medium">{player.name}</TableCell>
                    {STAT_COLUMNS.map(col => (
                      <TableCell key={col.key} className="text-center p-1">
                        {editingStats ? (
                          <Input
                            type="number"
                            min={0}
                            value={player[col.key] as number}
                            onChange={e => updateStat(player.id, col.key, e.target.value)}
                            className="h-7 w-14 text-center text-xs mx-auto"
                          />
                        ) : (
                          <span className="text-sm">{player[col.key] as number}</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {/* Totals row */}
                <TableRow className="bg-muted/30 font-bold border-t-2 border-border">
                  <TableCell></TableCell>
                  <TableCell className="text-xs uppercase text-muted-foreground">Totals</TableCell>
                  {STAT_COLUMNS.map(col => (
                    <TableCell key={col.key} className="text-center text-sm font-bold">
                      {totals[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Games & Schedule</h1>
          <p className="text-sm text-muted-foreground mt-1">Spring 2025 Season · {games.length} total games</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Add Game
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="section-card p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search teams..."
              className="h-9 w-56 rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <select value={selectedDivision} onChange={e => setSelectedDivision(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-ring/20">
            {divisions.map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={selectedWeek} onChange={e => setSelectedWeek(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-ring/20">
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
                    <span className={`text-sm font-semibold ${formatScore(game) === "-" ? "text-muted-foreground" : "text-foreground"}`}>
                      {formatScore(game)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={game.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => openEditGame(game)}>
                        <Edit className="h-3 w-3" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => openStats(game)}>
                        <BarChart3 className="h-3 w-3" /> Stats
                      </Button>
                    </div>
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

      {/* ─── Edit Game Dialog ──────────────────────────────────────────────── */}
      <Dialog open={!!editGame} onOpenChange={() => setEditGame(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-4 w-4 text-primary" /> Edit Game
            </DialogTitle>
            <DialogDescription>
              {editGame?.home} vs {editGame?.away}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Date</Label>
                <Input value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Time</Label>
                <Input value={editForm.time} onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Location / Field</Label>
              <Input value={editForm.field} onChange={e => setEditForm(f => ({ ...f, field: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Division</Label>
              <Select value={editForm.division} onValueChange={v => setEditForm(f => ({ ...f, division: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {divisions.filter(d => d !== "All Divisions").map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">{editGame?.home} Score</Label>
                <Input type="number" min={0} value={editForm.homeScore} onChange={e => setEditForm(f => ({ ...f, homeScore: e.target.value }))} placeholder="—" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{editGame?.away} Score</Label>
                <Input type="number" min={0} value={editForm.awayScore} onChange={e => setEditForm(f => ({ ...f, awayScore: e.target.value }))} placeholder="—" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditGame(null)}>Cancel</Button>
            <Button onClick={saveEditGame} className="gap-1.5"><Save className="h-3.5 w-3.5" /> Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Stats Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={!!statsGame} onOpenChange={() => { setStatsGame(null); setEditingStats(false); }}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Game Stats
                </DialogTitle>
                <DialogDescription>
                  {statsGame?.home} vs {statsGame?.away} — {statsGame?.date}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                {editingStats ? (
                  <>
                    <Button variant="outline" size="sm" onClick={cancelStatsEdit} className="gap-1.5">
                      <X className="h-3.5 w-3.5" /> Cancel
                    </Button>
                    <Button size="sm" onClick={saveStats} className="gap-1.5">
                      <Save className="h-3.5 w-3.5" /> Save Stats
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setEditingStats(true)} className="gap-1.5">
                    <Pencil className="h-3.5 w-3.5" /> Edit Stats
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          {statsGame && (
            <div className="space-y-4 mt-2">
              {/* Score summary */}
              <div className="flex items-center justify-center gap-6 py-4 rounded-lg bg-muted/50 border border-border">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">{statsGame.home}</p>
                  <p className="text-3xl font-bold text-foreground">{statsGame.homeScore ?? "—"}</p>
                </div>
                <span className="text-lg font-bold text-muted-foreground">vs</span>
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">{statsGame.away}</p>
                  <p className="text-3xl font-bold text-foreground">{statsGame.awayScore ?? "—"}</p>
                </div>
              </div>

              {/* Team comparison totals */}
              {(() => {
                const stats = editingStats ? editedStats : statsGame.playerStats;
                const homeTotals = getTeamTotals(stats, "home");
                const awayTotals = getTeamTotals(stats, "away");
                return (
                  <div className="grid grid-cols-4 gap-2">
                    {STAT_COLUMNS.slice(0, 4).map(col => (
                      <div key={col.key} className="rounded-lg border border-border p-3 text-center">
                        <p className="text-[10px] uppercase text-muted-foreground font-medium">{col.label}</p>
                        <div className="flex items-center justify-center gap-3 mt-1">
                          <span className="text-lg font-bold text-foreground">{homeTotals[col.key]}</span>
                          <span className="text-xs text-muted-foreground">-</span>
                          <span className="text-lg font-bold text-foreground">{awayTotals[col.key]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Per-team stat tables */}
              <Tabs defaultValue="home">
                <TabsList>
                  <TabsTrigger value="home">{statsGame.home}</TabsTrigger>
                  <TabsTrigger value="away">{statsGame.away}</TabsTrigger>
                </TabsList>
                <TabsContent value="home" className="mt-3">
                  {renderStatsTable("home", statsGame.home)}
                </TabsContent>
                <TabsContent value="away" className="mt-3">
                  {renderStatsTable("away", statsGame.away)}
                </TabsContent>
              </Tabs>

              {editingStats && (
                <p className="text-xs text-muted-foreground text-center">
                  Click into any cell to edit. Changes won't be saved until you click "Save Stats".
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
