import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import {
  Trophy, Edit, Save, X, AlertTriangle, Info, ChevronDown, Download, RotateCcw, Pencil,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamStanding {
  id: string;
  rank: number;
  team: string;
  gp: number;
  w: number;
  l: number;
  t: number;
  otw: number;
  otl: number;
  pts: number;
  gf: number;
  ga: number;
  diff: number;
  streak: string;
  hasOverride: boolean;
  overrideNote?: string;
}

interface Override {
  teamId: string;
  field: string;
  oldValue: number;
  newValue: number;
  reason: string;
  timestamp: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const DIVISIONS = ["Premier", "Division 1", "Division 2", "Division 3"];
const SEASONS = ["Spring 2026", "Fall 2025", "Spring 2025"];

const generateStandings = (division: string): TeamStanding[] => {
  const teamsByDiv: Record<string, string[]> = {
    "Premier": ["Thunder FC", "Storm United", "Lightning SC", "Blaze FC", "Phoenix Rising", "Titans SC"],
    "Division 1": ["Hawks FC", "Wolves SC", "Eagles United", "Lions FC", "Bears SC", "Panthers FC"],
    "Division 2": ["Sharks FC", "Dolphins SC", "Orcas United", "Stingrays FC", "Barracudas SC", "Marlins FC"],
    "Division 3": ["Cobras FC", "Vipers SC", "Pythons United", "Rattlers FC", "Sidewinders SC", "Mambas FC"],
  };

  const teams = teamsByDiv[division] || teamsByDiv["Premier"];
  return teams.map((team, i) => {
    const w = Math.max(0, 12 - i * 2 + Math.floor(Math.random() * 3));
    const l = Math.max(0, i * 2 + Math.floor(Math.random() * 3));
    const t = Math.floor(Math.random() * 4);
    const gp = w + l + t;
    const gf = w * 3 + t + Math.floor(Math.random() * 10);
    const ga = l * 2 + t + Math.floor(Math.random() * 8);
    const pts = w * 3 + t;
    const streaks = ["W3", "W2", "W1", "L1", "L2", "T1", "W4", "L3"];
    return {
      id: `team_${division}_${i}`,
      rank: i + 1,
      team,
      gp, w, l, t,
      otw: Math.floor(Math.random() * 2),
      otl: Math.floor(Math.random() * 2),
      pts,
      gf, ga,
      diff: gf - ga,
      streak: streaks[Math.floor(Math.random() * streaks.length)],
      hasOverride: false,
    };
  }).sort((a, b) => b.pts - a.pts || b.diff - a.diff).map((t, i) => ({ ...t, rank: i + 1 }));
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function StandingsPage() {
  const [selectedDivision, setSelectedDivision] = useState("Premier");
  const [selectedSeason, setSelectedSeason] = useState("Spring 2026");
  const [standings, setStandings] = useState<Record<string, TeamStanding[]>>(() => {
    const initial: Record<string, TeamStanding[]> = {};
    DIVISIONS.forEach(d => { initial[d] = generateStandings(d); });
    return initial;
  });
  const [overrides, setOverrides] = useState<Override[]>([]);

  // Override dialog
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideTeam, setOverrideTeam] = useState<TeamStanding | null>(null);
  const [overrideField, setOverrideField] = useState("pts");
  const [overrideValue, setOverrideValue] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  const currentStandings = standings[selectedDivision] || [];

  const openOverride = (team: TeamStanding) => {
    setOverrideTeam(team);
    setOverrideField("pts");
    setOverrideValue("");
    setOverrideReason("");
    setOverrideOpen(true);
  };

  const applyOverride = () => {
    if (!overrideTeam || !overrideValue || !overrideReason.trim()) return;

    const newVal = parseInt(overrideValue);
    if (isNaN(newVal)) return;

    const field = overrideField as keyof TeamStanding;
    const oldVal = overrideTeam[field] as number;

    // Record override
    const override: Override = {
      teamId: overrideTeam.id,
      field: overrideField,
      oldValue: oldVal,
      newValue: newVal,
      reason: overrideReason,
      timestamp: new Date().toISOString(),
    };
    setOverrides(prev => [...prev, override]);

    // Apply to standings
    setStandings(prev => {
      const divStandings = [...(prev[selectedDivision] || [])];
      const idx = divStandings.findIndex(t => t.id === overrideTeam.id);
      if (idx !== -1) {
        const updated = { ...divStandings[idx], [field]: newVal, hasOverride: true, overrideNote: overrideReason };
        // Recalculate diff if gf or ga changed
        if (field === "gf" || field === "ga") {
          const gf = field === "gf" ? newVal : updated.gf;
          const ga = field === "ga" ? newVal : updated.ga;
          updated.diff = gf - ga;
          updated.gf = gf;
          updated.ga = ga;
        }
        divStandings[idx] = updated;
        // Re-sort and re-rank
        divStandings.sort((a, b) => b.pts - a.pts || b.diff - a.diff);
        divStandings.forEach((t, i) => { t.rank = i + 1; });
      }
      return { ...prev, [selectedDivision]: divStandings };
    });

    setOverrideOpen(false);
    toast({
      title: "Override applied",
      description: `${overrideTeam.team}: ${FIELD_LABELS[overrideField]} changed from ${oldVal} to ${newVal}`,
    });
  };

  const revertOverride = (teamId: string) => {
    // Remove all overrides for team and regenerate
    setOverrides(prev => prev.filter(o => o.teamId !== teamId));
    setStandings(prev => {
      const divStandings = generateStandings(selectedDivision);
      return { ...prev, [selectedDivision]: divStandings };
    });
    toast({ title: "Override reverted" });
  };

  const divisionOverrides = overrides.filter(o =>
    currentStandings.some(t => t.id === o.teamId)
  );

  const FIELD_LABELS: Record<string, string> = {
    pts: "Points", w: "Wins", l: "Losses", t: "Ties", gf: "Goals For",
    ga: "Goals Against", gp: "Games Played", otw: "OT Wins", otl: "OT Losses",
  };

  const EDITABLE_FIELDS = ["pts", "w", "l", "t", "gf", "ga", "gp", "otw", "otl"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Standings</h1>
          <p className="text-sm text-muted-foreground">View division standings and apply manual adjustments</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" /> Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Season</Label>
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEASONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Division</Label>
          <Select value={selectedDivision} onValueChange={setSelectedDivision}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIVISIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Standings table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              {selectedDivision} — {selectedSeason}
            </CardTitle>
            {divisionOverrides.length > 0 && (
              <Badge variant="outline" className="text-xs gap-1 border-amber-500/50 text-amber-600">
                <AlertTriangle className="h-3 w-3" />
                {divisionOverrides.length} override{divisionOverrides.length > 1 ? "s" : ""} active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12 text-center text-xs">#</TableHead>
                  <TableHead className="text-xs">Team</TableHead>
                  <TableHead className="text-center text-xs w-12">GP</TableHead>
                  <TableHead className="text-center text-xs w-12">W</TableHead>
                  <TableHead className="text-center text-xs w-12">L</TableHead>
                  <TableHead className="text-center text-xs w-12">T</TableHead>
                  <TableHead className="text-center text-xs w-12">OTW</TableHead>
                  <TableHead className="text-center text-xs w-12">OTL</TableHead>
                  <TableHead className="text-center text-xs w-14 font-bold">PTS</TableHead>
                  <TableHead className="text-center text-xs w-12">GF</TableHead>
                  <TableHead className="text-center text-xs w-12">GA</TableHead>
                  <TableHead className="text-center text-xs w-14">DIFF</TableHead>
                  <TableHead className="text-center text-xs w-14">STRK</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentStandings.map((team) => (
                  <TableRow key={team.id} className={team.hasOverride ? "bg-amber-50/50 dark:bg-amber-950/10" : ""}>
                    <TableCell className="text-center font-bold text-sm">
                      {team.rank <= 3 ? (
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          team.rank === 1 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" :
                          team.rank === 2 ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" :
                          "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400"
                        }`}>
                          {team.rank}
                        </span>
                      ) : team.rank}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{team.team}</span>
                        {team.hasOverride && (
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            </TooltipTrigger>
                            <TooltipContent className="text-xs max-w-xs">
                              Manual override applied: {team.overrideNote}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm">{team.gp}</TableCell>
                    <TableCell className="text-center text-sm">{team.w}</TableCell>
                    <TableCell className="text-center text-sm">{team.l}</TableCell>
                    <TableCell className="text-center text-sm">{team.t}</TableCell>
                    <TableCell className="text-center text-sm">{team.otw}</TableCell>
                    <TableCell className="text-center text-sm">{team.otl}</TableCell>
                    <TableCell className="text-center text-sm font-bold">{team.pts}</TableCell>
                    <TableCell className="text-center text-sm">{team.gf}</TableCell>
                    <TableCell className="text-center text-sm">{team.ga}</TableCell>
                    <TableCell className="text-center text-sm">
                      <span className={team.diff > 0 ? "text-emerald-600" : team.diff < 0 ? "text-red-500" : ""}>
                        {team.diff > 0 ? "+" : ""}{team.diff}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      <Badge variant="outline" className={`text-[10px] px-1.5 ${
                        team.streak.startsWith("W") ? "border-emerald-500/50 text-emerald-600" :
                        team.streak.startsWith("L") ? "border-red-500/50 text-red-500" :
                        "border-border text-muted-foreground"
                      }`}>
                        {team.streak}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openOverride(team)}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="text-xs">Manual Override</TooltipContent>
                        </Tooltip>
                        {team.hasOverride && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-500" onClick={() => revertOverride(team.id)}>
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">Revert Override</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Override history */}
      {divisionOverrides.length > 0 && (
        <Card className="border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Override History — {selectedDivision}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {divisionOverrides.map((o, i) => {
                const team = currentStandings.find(t => t.id === o.teamId);
                return (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-amber-200/50 bg-amber-50/30 dark:bg-amber-950/10 px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{team?.team || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">
                        {FIELD_LABELS[o.field]}: {o.oldValue} → {o.newValue} — <span className="italic">{o.reason}</span>
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(o.timestamp).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Override dialog */}
      <Dialog open={overrideOpen} onOpenChange={setOverrideOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-primary" />
              Manual Override — {overrideTeam?.team}
            </DialogTitle>
            <DialogDescription>
              Override a stat value for this team. This change will reflect on the public standings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Field to Override</Label>
              <Select value={overrideField} onValueChange={setOverrideField}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EDITABLE_FIELDS.map(f => (
                    <SelectItem key={f} value={f}>{FIELD_LABELS[f]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Current Value</Label>
                <Input value={overrideTeam ? String((overrideTeam as any)[overrideField]) : ""} disabled className="bg-muted" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">New Value</Label>
                <Input type="number" value={overrideValue} onChange={e => setOverrideValue(e.target.value)} placeholder="Enter new value" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Reason for Override *</Label>
              <Textarea
                value={overrideReason}
                onChange={e => setOverrideReason(e.target.value)}
                placeholder="e.g. Forfeit penalty — 3 points deducted per league rule 4.2"
                rows={2}
              />
              <p className="text-[11px] text-muted-foreground">This reason will be recorded in the audit log and visible to admins.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOverrideOpen(false)}>Cancel</Button>
            <Button onClick={applyOverride} disabled={!overrideValue || !overrideReason.trim()} className="gap-1.5">
              <Save className="h-3.5 w-3.5" /> Apply Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
