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
  Edit, Save, X, BarChart3, Pencil, Upload, Trash2, Eraser,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CsvImportDialog from "@/components/shared/CsvImportDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

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

type Phase = "Regular Season" | "Playoffs";

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
  week: number | string;
  phase: Phase;
  periodScores?: { home: number; away: number }[];
  periodType?: "halves" | "quarters";
  playerStats: PlayerStat[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const rand = (max: number) => Math.floor(Math.random() * max);

const generatePlayerStats = (): PlayerStat[] => {
  const homePlayers = ["James Smith", "Marcus Johnson", "Ryan Williams", "Tyler Brown", "Derek Jones", "Kevin Davis"];
  const awayPlayers = ["Aaron Wilson", "Carlos Martinez", "Brandon Anderson", "Sean Taylor", "Lucas Thomas", "Paul Garcia"];

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
  { id: 1, date: "Mar 15, 2025", time: "6:00 PM", home: "Thunder Hawks", away: "Iron Eagles", homeScore: 28, awayScore: 14, status: "completed", division: "Men's D1", field: "Memorial Field 1", week: 8, phase: "Regular Season", periodType: "quarters", periodScores: [{ home: 7, away: 0 }, { home: 7, away: 7 }, { home: 7, away: 0 }, { home: 7, away: 7 }], playerStats: generatePlayerStats() },
  { id: 2, date: "Mar 15, 2025", time: "7:30 PM", home: "Storm Riders", away: "Blaze FC", homeScore: 21, awayScore: 21, status: "completed", division: "Co-Ed Open", field: "Central Park A", week: 8, phase: "Regular Season", periodType: "halves", periodScores: [{ home: 14, away: 7 }, { home: 7, away: 14 }], playerStats: generatePlayerStats() },
  { id: 3, date: "Mar 18, 2025", time: "6:00 PM", home: "Phoenix Rising", away: "Steel Wolves", homeScore: null, awayScore: null, status: "upcoming", division: "Women's D1", field: "Memorial Field 2", week: 9, phase: "Regular Season", playerStats: [] },
  { id: 4, date: "Mar 18, 2025", time: "7:00 PM", home: "Crimson Tide", away: "Blue Lightning", homeScore: null, awayScore: null, status: "upcoming", division: "Men's D1", field: "Riverside Field 1", week: 9, phase: "Regular Season", playerStats: [] },
  { id: 5, date: "Mar 18, 2025", time: "8:00 PM", home: "Night Owls", away: "Silver Sharks", homeScore: 14, awayScore: 7, status: "live", division: "Men's D2", field: "Memorial Field 1", week: 9, phase: "Regular Season", periodType: "quarters", periodScores: [{ home: 7, away: 0 }, { home: 7, away: 7 }], playerStats: generatePlayerStats() },
  { id: 6, date: "Mar 20, 2025", time: "6:30 PM", home: "Golden Bears", away: "Red Rockets", homeScore: null, awayScore: null, status: "upcoming", division: "Co-Ed Open", field: "Central Park B", week: 9, phase: "Playoffs", playerStats: [] },
  { id: 7, date: "Mar 20, 2025", time: "7:30 PM", home: "Viper Squad", away: "Arctic Wolves", homeScore: null, awayScore: null, status: "upcoming", division: "Women's D1", field: "Memorial Field 2", week: 9, phase: "Playoffs", playerStats: [] },
  { id: 8, date: "Mar 22, 2025", time: "10:00 AM", home: "Thunder Hawks", away: "Storm Riders", homeScore: null, awayScore: null, status: "draft", division: "Men's D1", field: "TBD", week: 10, phase: "Playoffs", playerStats: [] },
];

const phases = ["All Phases", "Regular Season", "Playoffs"];

const divisions = ["All Divisions", "Men's D1", "Men's D2", "Women's D1", "Co-Ed Open"];
const teamsByDivision: Record<string, string[]> = {
  "Men's D1": ["Thunder Hawks", "Iron Eagles", "Crimson Tide", "Blue Lightning", "Storm Riders"],
  "Men's D2": ["Night Owls", "Silver Sharks", "Steel Wolves"],
  "Women's D1": ["Phoenix Rising", "Viper Squad", "Arctic Wolves"],
  "Co-Ed Open": ["Blaze FC", "Golden Bears", "Red Rockets"],
};
const allTeams = Object.values(teamsByDivision).flat();
const weeks = ["All Weeks", "Week 8", "Week 9", "Week 10"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [selectedDivision, setSelectedDivision] = useState("All Divisions");
  const [selectedWeek, setSelectedWeek] = useState("All Weeks");
  const [selectedPhase, setSelectedPhase] = useState("All Phases");
  const [search, setSearch] = useState("");

  // Edit game info
  const [editGame, setEditGame] = useState<Game | null>(null);
  const [editForm, setEditForm] = useState({ date: "", time: "", field: "", division: "", homeScore: "", awayScore: "", status: "" });

  // Stats view
  const [statsGame, setStatsGame] = useState<Game | null>(null);
  const [editingStats, setEditingStats] = useState(false);
  const [editedStats, setEditedStats] = useState<PlayerStat[]>([]);
  const [editedPeriodScores, setEditedPeriodScores] = useState<{ home: number; away: number }[]>([]);
  const [editedPeriodType, setEditedPeriodType] = useState<"halves" | "quarters">("quarters");
  const [activeStatCategory, setActiveStatCategory] = useState("passing");
  const [playerSort, setPlayerSort] = useState<"number" | "firstName" | "lastName">("number");
  const [importOpen, setImportOpen] = useState(false);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkAction, setBulkAction] = useState<null | "delete" | "clear">(null);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const confirmBulk = () => {
    const ids = Array.from(selectedIds);
    if (bulkAction === "delete") {
      setGames(prev => prev.filter(g => !selectedIds.has(g.id)));
      toast({ title: `${ids.length} game${ids.length !== 1 ? "s" : ""} deleted` });
    } else if (bulkAction === "clear") {
      setGames(prev => prev.map(g => selectedIds.has(g.id)
        ? { ...g, homeScore: null, awayScore: null, periodScores: undefined, playerStats: [], status: "upcoming" }
        : g));
      toast({ title: `Cleared data for ${ids.length} game${ids.length !== 1 ? "s" : ""}` });
    }
    setSelectedIds(new Set());
    setBulkAction(null);
  };

  // Add game
  const emptyAddForm = {
    hideFromSchedule: false, date: "", time: "", week: "", field: "", fieldNumber: "",
    status: "upcoming", shortNotesHome: "", shortNotesVisitor: "", interdivision: false,
    division: "", exhibition: false, phase: "Regular Season" as Competition,
    home: "", away: "",
  };
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(emptyAddForm);

  const saveNewGame = () => {
    if (!addForm.date || !addForm.time || !addForm.week) {
      toast({ title: "Missing required fields", description: "Date, Time and Week are required.", variant: "destructive" });
      return;
    }
    const newGame: Game = {
      id: Math.max(0, ...games.map(g => g.id)) + 1,
      date: addForm.date, time: addForm.time,
      home: addForm.home || "TBD", away: addForm.away || "TBD",
      homeScore: null, awayScore: null,
      status: addForm.status as Game["status"],
      division: addForm.division || "Men's D1",
      field: [addForm.field, addForm.fieldNumber].filter(Boolean).join(" #") || "TBD",
      week: addForm.phase === "Playoffs" ? addForm.week : (parseInt(addForm.week) || 1),
      phase: addForm.phase,
      playerStats: [],
    };
    setGames(prev => [...prev, newGame]);
    setAddOpen(false);
    setAddForm(emptyAddForm);
    toast({ title: "Game added", description: `${newGame.home} vs ${newGame.away}` });
  };

  const filtered = games.filter(g => {
    if (selectedDivision !== "All Divisions" && g.division !== selectedDivision) return false;
    if (selectedWeek !== "All Weeks" && `Week ${g.week}` !== selectedWeek) return false;
    if (selectedPhase !== "All Phases" && g.phase !== selectedPhase) return false;
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
    const periodType = game.periodType ?? "quarters";
    const defaultLen = periodType === "halves" ? 2 : 4;
    const periodScores = game.periodScores && game.periodScores.length > 0
      ? game.periodScores
      : Array.from({ length: defaultLen }, () => ({ home: 0, away: 0 }));
    setStatsGame({ ...game, playerStats: stats, periodScores, periodType });
    setEditedStats(stats.map(s => ({ ...s })));
    setEditedPeriodScores(periodScores.map(p => ({ ...p })));
    setEditedPeriodType(periodType);
    setEditingStats(false);
    setActiveStatCategory("passing");
  };

  const updateStat = (playerId: string, key: string, value: string) => {
    const v = key === "gp" ? (value === "true" ? 1 : value === "false" ? 0 : parseInt(value) || 0) : (parseInt(value) || 0);
    setEditedStats(prev => prev.map(s => s.id === playerId ? { ...s, [key]: v } : s));
  };

  const updatePeriodScore = (idx: number, team: "home" | "away", value: string) => {
    const v = parseInt(value) || 0;
    setEditedPeriodScores(prev => prev.map((p, i) => i === idx ? { ...p, [team]: v } : p));
  };

  const changePeriodType = (type: "halves" | "quarters") => {
    const len = type === "halves" ? 2 : 4;
    setEditedPeriodType(type);
    setEditedPeriodScores(prev => {
      const next = [...prev];
      while (next.length < len) next.push({ home: 0, away: 0 });
      return next.slice(0, len);
    });
  };

  const saveStats = () => {
    if (!statsGame) return;
    const homeTotal = editedPeriodScores.reduce((s, p) => s + p.home, 0);
    const awayTotal = editedPeriodScores.reduce((s, p) => s + p.away, 0);
    setGames(prev => prev.map(g => g.id === statsGame.id ? {
      ...g, playerStats: editedStats,
      periodScores: editedPeriodScores, periodType: editedPeriodType,
      homeScore: homeTotal, awayScore: awayTotal,
    } : g));
    setStatsGame(prev => prev ? {
      ...prev, playerStats: editedStats,
      periodScores: editedPeriodScores, periodType: editedPeriodType,
      homeScore: homeTotal, awayScore: awayTotal,
    } : null);
    setEditingStats(false);
    toast({ title: "Stats saved" });
  };

  const cancelStatsEdit = () => {
    if (statsGame) {
      setEditedStats(statsGame.playerStats.map(s => ({ ...s })));
      setEditedPeriodScores((statsGame.periodScores ?? []).map(p => ({ ...p })));
      setEditedPeriodType(statsGame.periodType ?? "quarters");
    }
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
    const teamStats = stats.filter(s => s.team === team).slice().sort((a, b) => {
      if (playerSort === "firstName") {
        const af = a.name.split(" ")[0] || "";
        const bf = b.name.split(" ")[0] || "";
        return af.localeCompare(bf);
      }
      if (playerSort === "lastName") {
        const al = a.name.split(" ").slice(-1)[0] || "";
        const bl = b.name.split(" ").slice(-1)[0] || "";
        return al.localeCompare(bl);
      }
      return (parseInt(a.number) || 0) - (parseInt(b.number) || 0);
    });
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



  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Games & Schedule</h1>
          <p className="text-sm text-muted-foreground mt-1">Spring 2025 Season · {games.length} total games</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setImportOpen(true)}><Upload className="h-4 w-4" /> Import CSV</Button>
          <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
          <Button size="sm" className="gap-2" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add Game</Button>
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
          <select value={selectedPhase} onChange={e => setSelectedPhase(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-ring/20">
            {phases.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={selectedWeek} onChange={e => setSelectedWeek(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-ring/20">
            {weeks.map(w => <option key={w}>{w}</option>)}
          </select>
          <div className="ml-auto text-sm text-muted-foreground">{filtered.length} game{filtered.length !== 1 ? "s" : ""}</div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="section-card p-3 flex items-center justify-between bg-primary/5 border-primary/30">
          <div className="text-sm font-medium">
            {selectedIds.size} game{selectedIds.size !== 1 ? "s" : ""} selected
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>Cancel</Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setBulkAction("clear")}>
              <Eraser className="h-3.5 w-3.5" /> Clear Data
            </Button>
            <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => setBulkAction("delete")}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        </div>
      )}

      {/* Games Table */}
      <div className="section-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="table-header px-5 py-3 w-10">
                  <Checkbox
                    checked={filtered.length > 0 && filtered.every(g => selectedIds.has(g.id))}
                    onCheckedChange={(checked) => {
                      setSelectedIds(prev => {
                        const next = new Set(prev);
                        if (checked) filtered.forEach(g => next.add(g.id));
                        else filtered.forEach(g => next.delete(g.id));
                        return next;
                      });
                    }}
                    aria-label="Select all"
                  />
                </th>
                <th className="table-header text-left px-5 py-3">Date / Time</th>
                <th className="table-header text-left px-5 py-3">Matchup</th>
                <th className="table-header text-left px-5 py-3">Division</th>
                <th className="table-header text-left px-5 py-3">Phase</th>
                <th className="table-header text-left px-5 py-3">Location</th>
                <th className="table-header text-left px-5 py-3">Score</th>
                <th className="table-header text-left px-5 py-3">Status</th>
                <th className="table-header text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(game => (
                <tr key={game.id} className={`hover:bg-secondary/30 transition-colors ${selectedIds.has(game.id) ? "bg-primary/5" : ""}`}>
                  <td className="px-5 py-3.5">
                    <Checkbox
                      checked={selectedIds.has(game.id)}
                      onCheckedChange={() => toggleSelect(game.id)}
                      aria-label={`Select ${game.home} vs ${game.away}`}
                    />
                  </td>
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
                  <td className="px-5 py-3.5"><Badge variant={game.phase === "Playoffs" ? "default" : "outline"} className="text-xs">{game.phase}</Badge></td>
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
              <div className="py-4 rounded-lg bg-muted/50 border border-border">
                {(() => {
                  const showScores = editingStats ? editedPeriodScores : (statsGame.periodScores ?? []);
                  const showType = editingStats ? editedPeriodType : (statsGame.periodType ?? "quarters");
                  const homeTotal = editingStats
                    ? editedPeriodScores.reduce((s, p) => s + p.home, 0)
                    : (statsGame.homeScore ?? "—");
                  const awayTotal = editingStats
                    ? editedPeriodScores.reduce((s, p) => s + p.away, 0)
                    : (statsGame.awayScore ?? "—");
                  return (
                    <>
                      <div className="flex items-center justify-center gap-6">
                        <div className="text-center">
                          <p className="text-sm font-medium text-muted-foreground">{statsGame.home}</p>
                          <p className="text-3xl font-bold text-foreground">{homeTotal}</p>
                        </div>
                        <span className="text-lg font-bold text-muted-foreground">vs</span>
                        <div className="text-center">
                          <p className="text-sm font-medium text-muted-foreground">{statsGame.away}</p>
                          <p className="text-3xl font-bold text-foreground">{awayTotal}</p>
                        </div>
                      </div>

                      {editingStats && (
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <Label className="text-xs text-muted-foreground">Period type</Label>
                          <Select value={editedPeriodType} onValueChange={(v) => changePeriodType(v as "halves" | "quarters")}>
                            <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="quarters">Quarters</SelectItem>
                              <SelectItem value="halves">Halves</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {showScores.length > 0 && (
                        <div className="mt-4 mx-auto max-w-md">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-muted-foreground">
                                <th className="text-left font-medium py-1 px-2">Team</th>
                                {showScores.map((_, i) => (
                                  <th key={i} className="text-center font-medium py-1 px-2">
                                    {showType === "halves" ? `H${i + 1}` : `Q${i + 1}`}
                                  </th>
                                ))}
                                <th className="text-center font-bold py-1 px-2">T</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-t border-border">
                                <td className="py-1 px-2 font-medium">{statsGame.home}</td>
                                {showScores.map((p, i) => (
                                  <td key={i} className="text-center py-1 px-1 font-mono">
                                    {editingStats ? (
                                      <Input
                                        type="number" min={0}
                                        value={p.home}
                                        onChange={e => updatePeriodScore(i, "home", e.target.value)}
                                        className="h-7 w-14 text-center text-xs mx-auto"
                                      />
                                    ) : p.home}
                                  </td>
                                ))}
                                <td className="text-center py-1 px-2 font-bold font-mono">{homeTotal}</td>
                              </tr>
                              <tr className="border-t border-border">
                                <td className="py-1 px-2 font-medium">{statsGame.away}</td>
                                {showScores.map((p, i) => (
                                  <td key={i} className="text-center py-1 px-1 font-mono">
                                    {editingStats ? (
                                      <Input
                                        type="number" min={0}
                                        value={p.away}
                                        onChange={e => updatePeriodScore(i, "away", e.target.value)}
                                        className="h-7 w-14 text-center text-xs mx-auto"
                                      />
                                    ) : p.away}
                                  </td>
                                ))}
                                <td className="text-center py-1 px-2 font-bold font-mono">{awayTotal}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Sort + Category tabs */}
              <Tabs value={activeStatCategory} onValueChange={setActiveStatCategory}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <TabsList className="justify-start flex-wrap h-auto gap-1 bg-transparent p-0">
                    {STAT_CATEGORIES.map(cat => (
                      <TabsTrigger key={cat.id} value={cat.id}
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-3 py-1.5 rounded-md border border-border data-[state=active]:border-primary">
                        {cat.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Sort by</Label>
                    <Select value={playerSort} onValueChange={(v) => setPlayerSort(v as "number" | "firstName" | "lastName")}>
                      <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="number">Jersey #</SelectItem>
                        <SelectItem value="firstName">First Name</SelectItem>
                        <SelectItem value="lastName">Last Name</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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

      {/* CSV Import */}
      {/* ─── Add Game Dialog ──────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> Create Match</DialogTitle>
            <DialogDescription>Schedule a new game.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox id="hide-from-schedule" checked={addForm.hideFromSchedule}
                onCheckedChange={v => setAddForm(f => ({ ...f, hideFromSchedule: !!v }))} />
              <Label htmlFor="hide-from-schedule" className="text-sm font-medium">Hide match from schedule</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Date <span className="text-destructive">*</span></Label>
                <div className="flex gap-2">
                  <Input type="date" value={addForm.date === "TBD" ? "" : addForm.date} disabled={addForm.date === "TBD"} onChange={e => setAddForm(f => ({ ...f, date: e.target.value }))} />
                  <Button type="button" variant={addForm.date === "TBD" ? "default" : "outline"} size="sm"
                    onClick={() => setAddForm(f => ({ ...f, date: f.date === "TBD" ? "" : "TBD" }))}>TBD</Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Time <span className="text-destructive">*</span></Label>
                <div className="flex gap-2">
                  <Input type="time" value={addForm.time === "TBD" ? "" : addForm.time} disabled={addForm.time === "TBD"} onChange={e => setAddForm(f => ({ ...f, time: e.target.value }))} />
                  <Button type="button" variant={addForm.time === "TBD" ? "default" : "outline"} size="sm"
                    onClick={() => setAddForm(f => ({ ...f, time: f.time === "TBD" ? "" : "TBD" }))}>TBD</Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Competition <span className="text-destructive">*</span></Label>
                <Select value={addForm.phase} onValueChange={v => setAddForm(f => ({ ...f, phase: v as Phase }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular Season">Regular Season</SelectItem>
                    <SelectItem value="Playoffs">Playoffs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {addForm.phase === "Playoffs" ? (
                <div className="space-y-1.5">
                  <Label className="text-xs">Playoff Round <span className="text-destructive">*</span></Label>
                  <Select value={addForm.week} onValueChange={v => setAddForm(f => ({ ...f, week: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select playoff round" /></SelectTrigger>
                    <SelectContent>
                      {[
                        "Wild-Card Round",
                        "Divisional Round",
                        "Quarterfinals",
                        "Semifinals",
                        "Championship Finals",
                        "Consolation Semifinals",
                        "Consolation Finals",
                        "Bronze Medal Game",
                        "Gold Medal Game",
                      ].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-xs">Week No. <span className="text-destructive">*</span></Label>
                  <Input
                    type="number"
                    min={1}
                    list="week-options"
                    placeholder="Enter or select week number"
                    value={addForm.week}
                    onChange={e => setAddForm(f => ({ ...f, week: e.target.value }))}
                  />
                  <datalist id="week-options">
                    {Array.from({ length: 16 }, (_, i) => i + 1).map(w => (
                      <option key={w} value={String(w)}>{`Week ${w}`}</option>
                    ))}
                  </datalist>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Field</Label>
                <Select value={addForm.field} onValueChange={v => setAddForm(f => ({ ...f, field: v }))}>
                  <SelectTrigger><SelectValue placeholder="Choose a field" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TBD">TBD</SelectItem>
                    <SelectItem value="Memorial Field">Memorial Field</SelectItem>
                    <SelectItem value="Central Park">Central Park</SelectItem>
                    <SelectItem value="Riverside Field">Riverside Field</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Field Number</Label>
                <Select value={addForm.fieldNumber} onValueChange={v => setAddForm(f => ({ ...f, fieldNumber: v }))}>
                  <SelectTrigger><SelectValue placeholder="Choose a field number" /></SelectTrigger>
                  <SelectContent>
                    {["1", "2", "3", "A", "B"].map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={addForm.status} onValueChange={v => setAddForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue placeholder="Choose status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
              <div className="space-y-1.5">
                <Label className="text-xs">Division</Label>
                <Select value={addForm.division} onValueChange={v => setAddForm(f => ({ ...f, division: v, home: "", away: "" }))}>
                  <SelectTrigger><SelectValue placeholder="Choose a division" /></SelectTrigger>
                  <SelectContent>
                    {divisions.filter(d => d !== "All Divisions").map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 h-10">
                <Checkbox id="interdivision" checked={addForm.interdivision}
                  onCheckedChange={v => setAddForm(f => ({ ...f, interdivision: !!v }))} />
                <Label htmlFor="interdivision" className="text-sm font-medium">Interdivision Game</Label>
              </div>
            </div>

            {(() => {
              const teamOpts = addForm.interdivision
                ? allTeams
                : (teamsByDivision[addForm.division] ?? []);
              const TeamSelect = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
                <Select value={value} onValueChange={onChange} disabled={!addForm.interdivision && !addForm.division}>
                  <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TBD">TBD</SelectItem>
                    {teamOpts.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              );
              return (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Home Team</Label>
                      <TeamSelect value={addForm.home} onChange={v => setAddForm(f => ({ ...f, home: v }))} placeholder={addForm.interdivision || addForm.division ? "Select home team" : "Choose division first"} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Short Notes Home</Label>
                      <Textarea rows={2} value={addForm.shortNotesHome} onChange={e => setAddForm(f => ({ ...f, shortNotesHome: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Visitor Team</Label>
                      <TeamSelect value={addForm.away} onChange={v => setAddForm(f => ({ ...f, away: v }))} placeholder={addForm.interdivision || addForm.division ? "Select visitor team" : "Choose division first"} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Short Notes Visitor</Label>
                      <Textarea rows={2} value={addForm.shortNotesVisitor} onChange={e => setAddForm(f => ({ ...f, shortNotesVisitor: e.target.value }))} />
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center gap-2">
              <Checkbox id="exhibition" checked={addForm.exhibition}
                onCheckedChange={v => setAddForm(f => ({ ...f, exhibition: !!v }))} />
              <Label htmlFor="exhibition" className="text-sm font-medium">Exhibition game</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={saveNewGame} className="gap-1.5"><Save className="h-3.5 w-3.5" /> Create Match</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CsvImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import Games & Schedule"
        description="Upload a CSV file to bulk-import games into the schedule."
        expectedColumns={["date", "time", "home", "away", "division", "field", "week", "status"]}
        sampleRows={[
          ["Mar 25, 2025", "6:00 PM", "Thunder Hawks", "Iron Eagles", "Men's D1", "Memorial Field 1", "11", "upcoming"],
          ["Mar 25, 2025", "7:30 PM", "Storm Riders", "Blaze FC", "Co-Ed Open", "Central Park A", "11", "upcoming"],
        ]}
        onImport={(rows) => {
          const newGames: Game[] = rows.map((r, i) => ({
            id: games.length + i + 1,
            date: r.date || "",
            time: r.time || "",
            home: r.home || "",
            away: r.away || "",
            homeScore: null,
            awayScore: null,
            status: (r.status as Game["status"]) || "upcoming",
            division: r.division || "",
            field: r.field || "TBD",
            week: parseInt(r.week) || 1,
            phase: (r.phase === "Playoffs" ? "Playoffs" : "Regular Season") as Phase,
            playerStats: [],
          }));
          setGames(prev => [...prev, ...newGames]);
        }}
      />

      <AlertDialog open={!!bulkAction} onOpenChange={(o) => !o && setBulkAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === "delete" ? "Delete selected games?" : "Clear data for selected games?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === "delete"
                ? `This will permanently remove ${selectedIds.size} game${selectedIds.size !== 1 ? "s" : ""} from the schedule.`
                : `This will reset scores, period scores, and player stats for ${selectedIds.size} game${selectedIds.size !== 1 ? "s" : ""}, and mark them as upcoming. The game entries will be kept.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulk}
              className={bulkAction === "delete" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {bulkAction === "delete" ? "Delete" : "Clear Data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
