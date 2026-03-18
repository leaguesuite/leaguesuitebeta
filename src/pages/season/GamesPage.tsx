import { useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Download, Search, MapPin, Clock, ChevronLeft, ChevronRight,
  Edit, Save, X, BarChart3, Pencil,
} from "lucide-react";

// ─── Stat Category Definitions ────────────────────────────────────────────────

interface StatColumn {
  key: string;
  label: string;
  abbr: string;
}

interface StatCategory {
  id: string;
  label: string;
  columns: StatColumn[];
}

const STAT_CATEGORIES: StatCategory[] = [
  {
    id: "passing", label: "Passing",
    columns: [
      { key: "passAtt", label: "Attempts", abbr: "ATT" },
      { key: "passComp", label: "Completions", abbr: "CMP" },
      { key: "passYds", label: "Yards", abbr: "YDS" },
      { key: "passTd", label: "Touchdowns", abbr: "TD" },
      { key: "passInt", label: "Interceptions", abbr: "INT" },
    ],
  },
  {
    id: "rushing", label: "Rushing",
    columns: [
      { key: "rushAtt", label: "Attempts", abbr: "ATT" },
      { key: "rushYds", label: "Yards", abbr: "YDS" },
      { key: "rushTd", label: "Touchdowns", abbr: "TD" },
      { key: "rushLong", label: "Longest", abbr: "LNG" },
    ],
  },
  {
    id: "receiving", label: "Receiving",
    columns: [
      { key: "recTgt", label: "Targets", abbr: "TGT" },
      { key: "recCatch", label: "Catches", abbr: "REC" },
      { key: "recYds", label: "Yards", abbr: "YDS" },
      { key: "recTd", label: "Touchdowns", abbr: "TD" },
    ],
  },
  {
    id: "defence", label: "Defence",
    columns: [
      { key: "defTackles", label: "Tackles", abbr: "TKL" },
      { key: "defSacks", label: "Sacks", abbr: "SCK" },
      { key: "defInts", label: "Interceptions", abbr: "INT" },
      { key: "defIntYds", label: "INT Return Yds", abbr: "IRYD" },
      { key: "defPD", label: "Passes Deflected", abbr: "PD" },
      { key: "defFF", label: "Forced Fumbles", abbr: "FF" },
      { key: "defFR", label: "Fumble Recoveries", abbr: "FR" },
      { key: "defTd", label: "Def. Touchdowns", abbr: "TD" },
    ],
  },
  {
    id: "converts", label: "Converts",
    columns: [
      { key: "conv1Att", label: "1-Pt Attempts", abbr: "1ATT" },
      { key: "conv1Made", label: "1-Pt Made", abbr: "1MD" },
      { key: "conv2Att", label: "2-Pt Attempts", abbr: "2ATT" },
      { key: "conv2Made", label: "2-Pt Made", abbr: "2MD" },
      { key: "fgAtt", label: "FG Attempts", abbr: "FGA" },
      { key: "fgMade", label: "FG Made", abbr: "FGM" },
    ],
  },
  {
    id: "general", label: "General",
    columns: [
      { key: "gp", label: "Game Played", abbr: "GP" },
      { key: "majorPenalties", label: "Major Penalties", abbr: "MAJP" },
      { key: "minorPenalties", label: "Minor Penalties", abbr: "MINP" },
      { key: "penaltyYds", label: "Penalty Yards", abbr: "PNYD" },
      { key: "fumbles", label: "Fumbles Lost", abbr: "FUM" },
    ],
  },
];

const ALL_STAT_KEYS = STAT_CATEGORIES.flatMap(c => c.columns.map(col => col.key));

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlayerStat {
  id: string;
  name: string;
  team: "home" | "away";
  number: string;
  [key: string]: string | number;
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

const rand = (max: number) => Math.floor(Math.random() * max);

const generatePlayerStats = (): PlayerStat[] => {
  const homePlayers = ["J. Smith", "M. Johnson", "R. Williams", "T. Brown", "D. Jones", "K. Davis"];
  const awayPlayers = ["A. Wilson", "C. Martinez", "B. Anderson", "S. Taylor", "L. Thomas", "P. Garcia"];

  const makeStat = (name: string, team: "home" | "away", number: string): PlayerStat => {
    const stat: PlayerStat = { id: `${team[0]}${number}`, name, team, number };
    // Passing
    stat.passAtt = rand(20); stat.passComp = Math.min(stat.passAtt as number, rand(15));
    stat.passYds = rand(250); stat.passTd = rand(3); stat.passInt = rand(2);
    // Rushing
    stat.rushAtt = rand(12); stat.rushYds = rand(80); stat.rushTd = rand(2); stat.rushLong = rand(40);
    // Receiving
    stat.recTgt = rand(8); stat.recCatch = Math.min(stat.recTgt as number, rand(6));
    stat.recYds = rand(100); stat.recTd = rand(2);
    // Defence
    stat.defTackles = rand(8); stat.defSacks = rand(2); stat.defInts = rand(2);
    stat.defIntYds = rand(30); stat.defPD = rand(3); stat.defFF = rand(2);
    stat.defFR = rand(1); stat.defTd = rand(1);
    // Converts
    stat.conv1Att = rand(3); stat.conv1Made = Math.min(stat.conv1Att as number, rand(3));
    stat.conv2Att = rand(2); stat.conv2Made = Math.min(stat.conv2Att as number, rand(2));
    stat.fgAtt = rand(3); stat.fgMade = Math.min(stat.fgAtt as number, rand(3));
    // General
    stat.gp = 1; stat.majorPenalties = rand(2); stat.minorPenalties = rand(4);
    stat.penaltyYds = rand(30); stat.fumbles = rand(2);
    return stat;
  };

  return [
    ...homePlayers.map((name, i) => makeStat(name, "home", String(10 + i))),
    ...awayPlayers.map((name, i) => makeStat(name, "away", String(20 + i))),
  ];
};

const initialGames: Game[] = [
  { id: 1, date: "Mar 15, 2025", time: "6:00 PM", home: "Thunder Hawks", away: "Iron Eagles", homeScore: 28, awayScore: 14, status: "completed", division: "Men's D1", field: "Memorial Field 1", week: 8, playerStats: generatePlayerStats() },
  { id: 2, date: "Mar 15, 2025", time: "7:30 PM", home: "Storm Riders", away: "Blaze FC", homeScore: 21, awayScore: 21, status: "completed", division: "Co-Ed Open", field: "Central Park A", week: 8, playerStats: generatePlayerStats() },
  { id: 3, date: "Mar 18, 2025", time: "6:00 PM", home: "Phoenix Rising", away: "Steel Wolves", homeScore: null, awayScore: null, status: "upcoming", division: "Women's D1", field: "Memorial Field 2", week: 9, playerStats: [] },
  { id: 4, date: "Mar 18, 2025", time: "7:00 PM", home: "Crimson Tide", away: "Blue Lightning", homeScore: null, awayScore: null, status: "upcoming", division: "Men's D1", field: "Riverside Field 1", week: 9, playerStats: [] },
  { id: 5, date: "Mar 18, 2025", time: "8:00 PM", home: "Night Owls", away: "Silver Sharks", homeScore: 14, awayScore: 7, status: "live", division: "Men's D2", field: "Memorial Field 1", week: 9, playerStats: generatePlayerStats() },
  { id: 6, date: "Mar 20, 2025", time: "6:30 PM", home: "Golden Bears", away: "Red Rockets", homeScore: null, awayScore: null, status: "upcoming", division: "Co-Ed Open", field: "Central Park B", week: 9, playerStats: [] },
  { id: 7, date: "Mar 20, 2025", time: "7:30 PM", home: "Viper Squad", away: "Arctic Wolves", homeScore: null, awayScore: null, status: "upcoming", division: "Women's D1", field: "Memorial Field 2", week: 9, playerStats: [] },
  { id: 8, date: "Mar 22, 2025", time: "10:00 AM", home: "Thunder Hawks", away: "Storm Riders", homeScore: null, awayScore: null, status: "draft", division: "Men's D1", field: "TBD", week: 10, playerStats: [] },
];

const divisions = ["All Divisions", "Men's D1", "Men's D2", "Women's D1", "Co-Ed Open"];
const weeks = ["All Weeks", "Week 8", "Week 9", "Week 10"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [selectedDivision, setSelectedDivision] = useState("All Divisions");
  const [selectedWeek, setSelectedWeek] = useState("All Weeks");
  const [search, setSearch] = useState("");

  // Edit game info
  const [editGame, setEditGame] = useState<Game | null>(null);
  const [editForm, setEditForm] = useState({ date: "", time: "", field: "", division: "", homeScore: "", awayScore: "", status: "" });

  // Stats view
  const [statsGame, setStatsGame] = useState<Game | null>(null);
  const [editingStats, setEditingStats] = useState(false);
  const [editedStats, setEditedStats] = useState<PlayerStat[]>([]);
  const [activeStatCategory, setActiveStatCategory] = useState("passing");

  const filtered = games.filter(g => {
    if (selectedDivision !== "All Divisions" && g.division !== selectedDivision) return false;
    if (selectedWeek !== "All Weeks" && `Week ${g.week}` !== selectedWeek) return false;
    if (search && !g.home.toLowerCase().includes(search.toLowerCase()) && !g.away.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const formatScore = (g: Game) => g.homeScore === null || g.awayScore === null ? "-" : `${g.homeScore}-${g.awayScore}`;

  // ─── Edit Game ──────────────────────────────────────────────────────────

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
      ...g, date: editForm.date, time: editForm.time, field: editForm.field, division: editForm.division,
      homeScore: editForm.homeScore ? parseInt(editForm.homeScore) : null,
      awayScore: editForm.awayScore ? parseInt(editForm.awayScore) : null,
      status: editForm.status as Game["status"],
    } : g));
    setEditGame(null);
    toast({ title: "Game updated", description: `${editGame.home} vs ${editGame.away} saved.` });
  };

  // ─── Stats ──────────────────────────────────────────────────────────────

  const openStats = (game: Game) => {
    let stats = game.playerStats;
    if (stats.length === 0) {
      stats = generatePlayerStats();
      setGames(prev => prev.map(g => g.id === game.id ? { ...g, playerStats: stats } : g));
    }
    setStatsGame({ ...game, playerStats: stats });
    setEditedStats(stats.map(s => ({ ...s })));
    setEditingStats(false);
    setActiveStatCategory("passing");
  };

  const updateStat = (playerId: string, key: string, value: string) => {
    const v = key === "gp" ? (value === "true" ? 1 : value === "false" ? 0 : parseInt(value) || 0) : (parseInt(value) || 0);
    setEditedStats(prev => prev.map(s => s.id === playerId ? { ...s, [key]: v } : s));
  };

  const saveStats = () => {
    if (!statsGame) return;
    setGames(prev => prev.map(g => g.id === statsGame.id ? { ...g, playerStats: editedStats } : g));
    setStatsGame(prev => prev ? { ...prev, playerStats: editedStats } : null);
    setEditingStats(false);
    toast({ title: "Stats saved" });
  };

  const cancelStatsEdit = () => {
    if (statsGame) setEditedStats(statsGame.playerStats.map(s => ({ ...s })));
    setEditingStats(false);
  };

  const getTeamTotals = (stats: PlayerStat[], team: "home" | "away", columns: StatColumn[]) => {
    const teamStats = stats.filter(s => s.team === team);
    const totals: Record<string, number> = {};
    columns.forEach(col => {
      totals[col.key] = teamStats.reduce((sum, s) => sum + (Number(s[col.key]) || 0), 0);
    });
    return totals;
  };

  const currentCategory = STAT_CATEGORIES.find(c => c.id === activeStatCategory)!;

  const renderCategoryTable = (team: "home" | "away", teamName: string) => {
    const stats = editingStats ? editedStats : (statsGame?.playerStats || []);
    const teamStats = stats.filter(s => s.team === team);
    const totals = getTeamTotals(stats, team, currentCategory.columns);

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs w-8">#</TableHead>
              <TableHead className="text-xs min-w-[120px]">Player</TableHead>
              {currentCategory.columns.map(col => (
                <TableHead key={col.key} className="text-xs text-center w-16">{col.abbr}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamStats.map(player => (
              <TableRow key={player.id}>
                <TableCell className="text-xs text-muted-foreground">{player.number}</TableCell>
                <TableCell className="text-sm font-medium">{player.name}</TableCell>
                {currentCategory.columns.map(col => (
                  <TableCell key={col.key} className="text-center p-1">
                    {editingStats ? (
                      col.key === "gp" ? (
                        <div className="flex justify-center">
                          <Switch
                            checked={Number(player[col.key]) === 1}
                            onCheckedChange={v => updateStat(player.id as string, col.key, String(v))}
                          />
                        </div>
                      ) : (
                        <Input
                          type="number" min={0}
                          value={Number(player[col.key]) || 0}
                          onChange={e => updateStat(player.id as string, col.key, e.target.value)}
                          className="h-7 w-14 text-center text-xs mx-auto"
                        />
                      )
                    ) : (
                      col.key === "gp" ? (
                        <Badge variant={Number(player[col.key]) === 1 ? "default" : "outline"} className="text-[10px]">
                          {Number(player[col.key]) === 1 ? "YES" : "NO"}
                        </Badge>
                      ) : (
                        <span className="text-sm">{Number(player[col.key]) || 0}</span>
                      )
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            <TableRow className="bg-muted/30 font-bold border-t-2 border-border">
              <TableCell></TableCell>
              <TableCell className="text-xs uppercase text-muted-foreground">Totals</TableCell>
              {currentCategory.columns.map(col => (
                <TableCell key={col.key} className="text-center text-sm font-bold">
                  {col.key === "gp" ? totals[col.key] : totals[col.key]}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  };

  // ─── Summary cards for top of stats dialog ─────────────────────────────

  const renderQuickSummary = () => {
    if (!statsGame) return null;
    const stats = editingStats ? editedStats : statsGame.playerStats;
    const categories = [
      { label: "Pass Yds", home: getTeamTotals(stats, "home", [{ key: "passYds", label: "", abbr: "" }]).passYds, away: getTeamTotals(stats, "away", [{ key: "passYds", label: "", abbr: "" }]).passYds },
      { label: "Rush Yds", home: getTeamTotals(stats, "home", [{ key: "rushYds", label: "", abbr: "" }]).rushYds, away: getTeamTotals(stats, "away", [{ key: "rushYds", label: "", abbr: "" }]).rushYds },
      { label: "Tackles", home: getTeamTotals(stats, "home", [{ key: "defTackles", label: "", abbr: "" }]).defTackles, away: getTeamTotals(stats, "away", [{ key: "defTackles", label: "", abbr: "" }]).defTackles },
      { label: "Turnovers", home: getTeamTotals(stats, "home", [{ key: "fumbles", label: "", abbr: "" }]).fumbles + getTeamTotals(stats, "home", [{ key: "passInt", label: "", abbr: "" }]).passInt, away: getTeamTotals(stats, "away", [{ key: "fumbles", label: "", abbr: "" }]).fumbles + getTeamTotals(stats, "away", [{ key: "passInt", label: "", abbr: "" }]).passInt },
    ];
    return (
      <div className="grid grid-cols-4 gap-2">
        {categories.map(cat => (
          <div key={cat.label} className="rounded-lg border border-border p-3 text-center">
            <p className="text-[10px] uppercase text-muted-foreground font-medium">{cat.label}</p>
            <div className="flex items-center justify-center gap-3 mt-1">
              <span className="text-lg font-bold text-foreground">{cat.home}</span>
              <span className="text-xs text-muted-foreground">-</span>
              <span className="text-lg font-bold text-foreground">{cat.away}</span>
            </div>
          </div>
        ))}
      </div>
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
          <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
          <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Game</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="section-card p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teams..."
              className="h-9 w-56 rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" />
          </div>
          <select value={selectedDivision} onChange={e => setSelectedDivision(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-ring/20">
            {divisions.map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={selectedWeek} onChange={e => setSelectedWeek(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-ring/20">
            {weeks.map(w => <option key={w}>{w}</option>)}
          </select>
          <div className="ml-auto text-sm text-muted-foreground">{filtered.length} game{filtered.length !== 1 ? "s" : ""}</div>
        </div>
      </div>

      {/* Games Table */}
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
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="h-3 w-3" /> {game.time}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-foreground text-sm">{game.home}</span>
                    <span className="mx-2 text-xs text-muted-foreground font-bold">VS</span>
                    <span className="font-semibold text-foreground text-sm">{game.away}</span>
                  </td>
                  <td className="px-5 py-3.5"><Badge variant="secondary" className="text-xs">{game.division}</Badge></td>
                  <td className="px-5 py-3.5"><div className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {game.field}</div></td>
                  <td className="px-5 py-3.5">
                    <span className={`text-sm font-semibold ${formatScore(game) === "-" ? "text-muted-foreground" : "text-foreground"}`}>{formatScore(game)}</span>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={game.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => openEditGame(game)}><Edit className="h-3 w-3" /> Edit</Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => openStats(game)}><BarChart3 className="h-3 w-3" /> Stats</Button>
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
            <DialogTitle className="flex items-center gap-2"><Edit className="h-4 w-4 text-primary" /> Edit Game</DialogTitle>
            <DialogDescription>{editGame?.home} vs {editGame?.away}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs">Date</Label><Input value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Time</Label><Input value={editForm.time} onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Location / Field</Label><Input value={editForm.field} onChange={e => setEditForm(f => ({ ...f, field: e.target.value }))} /></div>
            <div className="space-y-1.5">
              <Label className="text-xs">Division</Label>
              <Select value={editForm.division} onValueChange={v => setEditForm(f => ({ ...f, division: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{divisions.filter(d => d !== "All Divisions").map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs">{editGame?.home} Score</Label><Input type="number" min={0} value={editForm.homeScore} onChange={e => setEditForm(f => ({ ...f, homeScore: e.target.value }))} placeholder="—" /></div>
              <div className="space-y-1.5"><Label className="text-xs">{editGame?.away} Score</Label><Input type="number" min={0} value={editForm.awayScore} onChange={e => setEditForm(f => ({ ...f, awayScore: e.target.value }))} placeholder="—" /></div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem><SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="live">Live</SelectItem><SelectItem value="completed">Completed</SelectItem>
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Game Stats</DialogTitle>
                <DialogDescription>{statsGame?.home} vs {statsGame?.away} — {statsGame?.date}</DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                {editingStats ? (
                  <>
                    <Button variant="outline" size="sm" onClick={cancelStatsEdit} className="gap-1.5"><X className="h-3.5 w-3.5" /> Cancel</Button>
                    <Button size="sm" onClick={saveStats} className="gap-1.5"><Save className="h-3.5 w-3.5" /> Save Stats</Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setEditingStats(true)} className="gap-1.5"><Pencil className="h-3.5 w-3.5" /> Edit Stats</Button>
                )}
              </div>
            </div>
          </DialogHeader>

          {statsGame && (
            <div className="space-y-4 mt-2">
              {/* Score header */}
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

              {/* Quick summary */}
              {renderQuickSummary()}

              {/* Category tabs */}
              <Tabs value={activeStatCategory} onValueChange={setActiveStatCategory}>
                <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-transparent p-0">
                  {STAT_CATEGORIES.map(cat => (
                    <TabsTrigger key={cat.id} value={cat.id}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-3 py-1.5 rounded-md border border-border data-[state=active]:border-primary">
                      {cat.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {STAT_CATEGORIES.map(cat => (
                  <TabsContent key={cat.id} value={cat.id} className="mt-4">
                    <div className="space-y-4">
                      {/* Home team */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{statsGame.home} — {cat.label}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          {renderCategoryTable("home", statsGame.home)}
                        </CardContent>
                      </Card>

                      {/* Away team */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{statsGame.away} — {cat.label}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          {renderCategoryTable("away", statsGame.away)}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              {editingStats && (
                <p className="text-xs text-muted-foreground text-center">
                  Edit any cell, then click "Save Stats" to persist changes.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
