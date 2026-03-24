import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { generateBracketStructure } from "@/utils/bracketGenerator";
import {
  Plus, Trophy, Trash2, Play, CheckCircle2, Clock, Eye, Maximize2,
  Settings, ChevronRight, SplitSquareHorizontal, Users, ArrowLeft,
  Swords, Shield,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TeamMatchData {
  id: string;
  name: string;
  score?: number | null;
  seed?: number;
}

interface LegacyMatch {
  id: string;
  matchNumber: number;
  teams: [TeamMatchData, TeamMatchData];
  winnerId?: string;
  status: "upcoming" | "inProgress" | "completed";
  venue?: string;
}

interface LegacyRound {
  id: string;
  name: string;
  matches: LegacyMatch[];
}

interface PlayoffSplit {
  name: string;
  teamCount: number;
  bracketId?: string;
}

interface DivisionPlayoff {
  divisionId: string;
  divisionName: string;
  totalTeams: number;
  status: "not_started" | "setup" | "active" | "completed";
  qualifyingTeams: number;
  hasSplit: boolean;
  splits: PlayoffSplit[];
  reseeding: boolean;
  brackets: BracketData[];
}

interface BracketData {
  id: string;
  name: string;
  splitName?: string;
  rounds: LegacyRound[];
  teamCount: number;
  status: "setup" | "active" | "completed";
  isReseeding: boolean;
  teams: string[];
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_DIVISIONS: DivisionPlayoff[] = [
  {
    divisionId: "d1",
    divisionName: "Men's Division 1",
    totalTeams: 8,
    status: "active",
    qualifyingTeams: 8,
    hasSplit: false,
    splits: [],
    reseeding: false,
    brackets: [],
  },
  {
    divisionId: "d2",
    divisionName: "Men's Division 2",
    totalTeams: 12,
    status: "not_started",
    qualifyingTeams: 8,
    hasSplit: false,
    splits: [],
    reseeding: false,
    brackets: [],
  },
  {
    divisionId: "d3",
    divisionName: "Women's Division 1",
    totalTeams: 8,
    status: "not_started",
    qualifyingTeams: 6,
    hasSplit: false,
    splits: [],
    reseeding: false,
    brackets: [],
  },
  {
    divisionId: "d4",
    divisionName: "Co-Ed Open",
    totalTeams: 6,
    status: "completed",
    qualifyingTeams: 4,
    hasSplit: false,
    splits: [],
    reseeding: false,
    brackets: [],
  },
];

const MOCK_TEAM_NAMES: Record<string, string[]> = {
  d1: ["Thunder Hawks", "Iron Eagles", "Crimson Tide", "Blue Lightning", "Storm Riders", "Night Owls", "Golden Bears", "Viper Squad"],
  d2: ["Silver Sharks", "Red Rockets", "Arctic Wolves", "Dark Knights", "Green Machine", "Wild Cards", "Phantom Force", "Steel City", "Blazers", "Lightning FC", "Rebels", "Outlaws"],
  d3: ["Phoenix Rising", "Steel Wolves", "Valkyries", "Lightning Bolts", "Storm Queens", "Fire Hawks", "Ice Tigers", "Shadow Cats"],
  d4: ["Blaze FC", "Chaos Theory", "Dream Team", "Misfits", "Renegades", "Thunder"],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createBracket(
  id: string, name: string, teamNames: string[], splitName?: string
): BracketData {
  const teamCount = teamNames.length;
  const structure = generateBracketStructure(teamCount);
  const numRounds = structure.length;

  const rounds: LegacyRound[] = structure.map((roundMatches, ri) => {
    const roundsFromEnd = numRounds - ri - 1;
    let roundName = `Round ${ri + 1}`;
    if (roundsFromEnd === 0) roundName = "Finals";
    else if (roundsFromEnd === 1) roundName = "Semi-Finals";
    else if (roundsFromEnd === 2) roundName = "Quarter-Finals";

    const matches: LegacyMatch[] = roundMatches.map((m, mi) => {
      const t1Name = ri === 0 && m.seeds[0] <= teamNames.length ? teamNames[m.seeds[0] - 1] : "TBD";
      const t2Name = ri === 0 && m.seeds.length > 1 && m.seeds[1] <= teamNames.length ? teamNames[m.seeds[1] - 1] : "TBD";

      return {
        id: `${id}-r${ri}-m${mi}`,
        matchNumber: mi + 1,
        teams: [
          { id: `${id}-r${ri}-m${mi}-t1`, name: t1Name, seed: m.seeds[0], score: null },
          { id: `${id}-r${ri}-m${mi}-t2`, name: t2Name, seed: m.seeds.length > 1 ? m.seeds[1] : undefined, score: null },
        ] as [TeamMatchData, TeamMatchData],
        status: "upcoming" as const,
      };
    });

    return { id: `${id}-round-${ri}`, name: roundName, matches };
  });

  return { id, name, splitName, rounds, teamCount, status: "setup", isReseeding: false, teams: teamNames };
}

// ─── Bracket SVG Preview ─────────────────────────────────────────────────────

function BracketPreviewSVG({ teamCount, height = 220 }: { teamCount: number; height?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const svg = svgRef.current;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    try {
      const structure = generateBracketStructure(Math.max(2, Math.min(32, teamCount)));
      const cw = containerRef.current.clientWidth;
      const ch = containerRef.current.clientHeight;
      const maxR = structure.length;
      const colW = cw / (maxR + 0.5);
      const tH = 24;
      const gap = 12;

      structure.forEach((round, ri) => {
        const totalH = round.length * tH + (round.length - 1) * gap;
        const startY = (ch - totalH) / 2;

        round.forEach((m, mi) => {
          const y = startY + mi * (tH + gap);
          const x = ri * colW + 12;
          const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          rect.setAttribute("x", String(x)); rect.setAttribute("y", String(y));
          rect.setAttribute("width", String(colW - 24)); rect.setAttribute("height", String(tH));
          rect.setAttribute("rx", "3");
          rect.setAttribute("fill", m.bye ? "hsl(var(--muted))" : "hsl(var(--primary) / 0.08)");
          rect.setAttribute("stroke", m.bye ? "hsl(var(--border))" : "hsl(var(--primary) / 0.2)");
          svg.appendChild(rect);

          const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
          txt.setAttribute("x", String(x + (colW - 24) / 2)); txt.setAttribute("y", String(y + tH / 2 + 4));
          txt.setAttribute("text-anchor", "middle"); txt.setAttribute("font-size", "9");
          txt.setAttribute("fill", "hsl(var(--muted-foreground))");
          txt.textContent = m.bye ? `Bye` : `#${m.seeds[0]} v #${m.seeds[1]}`;
          svg.appendChild(txt);

          if (ri < maxR - 1) {
            const nr = structure[ri + 1];
            const nmi = Math.floor(mi / 2);
            if (nmi >= nr.length) return;
            const nTotalH = nr.length * tH + (nr.length - 1) * gap;
            const nStartY = (ch - nTotalH) / 2;
            const ny = nStartY + nmi * (tH + gap);
            const sx = x + colW - 24; const sy = y + tH / 2;
            const ex = (ri + 1) * colW + 12; const ey = ny + tH / 2;
            const mx = (sx + ex) / 2;
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", `M${sx} ${sy} L${mx} ${sy} L${mx} ${ey} L${ex} ${ey}`);
            path.setAttribute("stroke", "hsl(var(--border))"); path.setAttribute("fill", "none");
            svg.appendChild(path);
          }
        });
      });
    } catch {}
  }, [teamCount]);

  return (
    <div ref={containerRef} className="w-full overflow-hidden rounded-lg border border-border bg-muted/30" style={{ height }}>
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
}

// ─── Match Card ──────────────────────────────────────────────────────────────

function MatchCardUI({ match }: { match: LegacyMatch }) {
  const isComplete = match.status === "completed";
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-sm w-56 shrink-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-muted-foreground">Match {match.matchNumber}</span>
        <Badge
          variant={isComplete ? "default" : match.status === "inProgress" ? "destructive" : "secondary"}
          className="text-[10px] h-5"
        >
          {isComplete ? "Final" : match.status === "inProgress" ? "Live" : "Upcoming"}
        </Badge>
      </div>
      <div className="space-y-1.5">
        {match.teams.map((team) => {
          const isWinner = isComplete && team.id === match.winnerId;
          return (
            <div
              key={team.id}
              className={`flex items-center justify-between px-2 py-1.5 rounded text-sm ${
                isWinner ? "bg-primary/10 font-semibold text-foreground" :
                !team.name || team.name === "TBD" ? "border border-dashed border-border text-muted-foreground" :
                "text-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5">
                {team.seed && <span className="text-[10px] text-muted-foreground font-mono">#{team.seed}</span>}
                <span>{team.name || "TBD"}</span>
              </div>
              <span className="font-mono text-xs w-5 text-right">{team.score ?? ""}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Setup Dialog ────────────────────────────────────────────────────────────

function PlayoffSetupDialog({
  division,
  open,
  onOpenChange,
  onSave,
}: {
  division: DivisionPlayoff;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: Partial<DivisionPlayoff>) => void;
}) {
  const [qualifyingTeams, setQualifyingTeams] = useState(division.qualifyingTeams);
  const [hasSplit, setHasSplit] = useState(division.hasSplit);
  const [splitCount, setSplitCount] = useState(2);
  const [splits, setSplits] = useState<PlayoffSplit[]>(
    division.splits.length > 0
      ? division.splits
      : [
          { name: `${division.divisionName} A`, teamCount: Math.ceil(qualifyingTeams / 2) },
          { name: `${division.divisionName} B`, teamCount: Math.floor(qualifyingTeams / 2) },
        ]
  );
  const [reseeding, setReseeding] = useState(division.reseeding);

  // Recalculate splits when qualifying teams or split toggle changes
  const updateSplits = (count: number, qualifying: number) => {
    const perSplit = Math.floor(qualifying / count);
    const remainder = qualifying % count;
    const labels = ["A", "B", "C", "D"];
    const newSplits: PlayoffSplit[] = [];
    for (let i = 0; i < count; i++) {
      newSplits.push({
        name: `${division.divisionName.replace(/Division \d+/, `D${division.divisionName.match(/\d+/)?.[0] || ""}`)} ${labels[i] || String(i + 1)}`,
        teamCount: perSplit + (i < remainder ? 1 : 0),
      });
    }
    setSplits(newSplits);
  };

  const handleSplitToggle = (enabled: boolean) => {
    setHasSplit(enabled);
    if (enabled) {
      updateSplits(splitCount, qualifyingTeams);
    }
  };

  const handleSplitCountChange = (val: string) => {
    const n = parseInt(val);
    setSplitCount(n);
    updateSplits(n, qualifyingTeams);
  };

  const handleQualifyingChange = (val: string) => {
    const n = parseInt(val);
    setQualifyingTeams(n);
    if (hasSplit) {
      updateSplits(splitCount, n);
    }
  };

  const updateSplitName = (index: number, name: string) => {
    setSplits(prev => prev.map((s, i) => i === index ? { ...s, name } : s));
  };

  const updateSplitTeamCount = (index: number, count: number) => {
    setSplits(prev => prev.map((s, i) => i === index ? { ...s, teamCount: count } : s));
  };

  const totalSplitTeams = splits.reduce((acc, s) => acc + s.teamCount, 0);
  const splitMismatch = hasSplit && totalSplitTeams !== qualifyingTeams;

  const handleSave = () => {
    onSave({
      qualifyingTeams,
      hasSplit,
      splits: hasSplit ? splits : [],
      reseeding,
      status: "setup",
    });
    onOpenChange(false);
  };

  const teamOptions = [];
  for (let i = 2; i <= division.totalTeams; i++) {
    teamOptions.push(i);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Set Up Playoffs — {division.divisionName}
          </DialogTitle>
          <DialogDescription>
            Configure how many teams qualify and whether to split the division into sub-brackets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Qualifying teams */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Qualifying Teams</Label>
            <p className="text-xs text-muted-foreground">
              {division.totalTeams} teams in this division. How many make the playoffs?
            </p>
            <Select value={String(qualifyingTeams)} onValueChange={handleQualifyingChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {teamOptions.map(n => (
                  <SelectItem key={n} value={String(n)}>{n} teams</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Split toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <SplitSquareHorizontal className="h-4 w-4 text-primary" />
                  Split Division
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Break the division into separate playoff brackets (e.g., "2A" and "2B", or "Top" and "Bottom")
                </p>
              </div>
              <Switch checked={hasSplit} onCheckedChange={handleSplitToggle} />
            </div>

            {hasSplit && (
              <div className="space-y-3 pl-2 border-l-2 border-primary/20 ml-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Number of Splits</Label>
                  <Select value={String(splitCount)} onValueChange={handleSplitCountChange}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 splits</SelectItem>
                      <SelectItem value="3">3 splits</SelectItem>
                      <SelectItem value="4">4 splits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {splits.map((split, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Bracket Name</Label>
                        <Input
                          value={split.name}
                          onChange={e => updateSplitName(i, e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="w-28 space-y-1">
                        <Label className="text-xs text-muted-foreground">Teams</Label>
                        <Select
                          value={String(split.teamCount)}
                          onValueChange={v => updateSplitTeamCount(i, parseInt(v))}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {teamOptions.map(n => (
                              <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}

                  {splitMismatch && (
                    <p className="text-xs text-destructive font-medium">
                      ⚠ Split teams ({totalSplitTeams}) don't match qualifying teams ({qualifyingTeams})
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Reseeding */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Reseeding Between Rounds</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Re-rank remaining teams after each round
              </p>
            </div>
            <Switch checked={reseeding} onCheckedChange={setReseeding} />
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Bracket Preview</Label>
            {hasSplit ? (
              <div className="grid grid-cols-2 gap-3">
                {splits.map((split, i) => (
                  <div key={i} className="space-y-1.5">
                    <p className="text-xs font-medium text-foreground">{split.name}</p>
                    <BracketPreviewSVG teamCount={split.teamCount} height={140} />
                  </div>
                ))}
              </div>
            ) : (
              <BracketPreviewSVG teamCount={qualifyingTeams} height={180} />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={splitMismatch} className="gap-2">
            <CheckCircle2 className="h-4 w-4" /> Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Bracket Viewer Dialog ───────────────────────────────────────────────────

function BracketViewerDialog({
  bracket,
  open,
  onOpenChange,
}: {
  bracket: BracketData | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  if (!bracket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {bracket.name}
          </DialogTitle>
          <DialogDescription>
            {bracket.teamCount} teams • {bracket.rounds.length} rounds
            {bracket.splitName && ` • ${bracket.splitName}`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-2">
          {bracket.rounds.map(round => (
            <div key={round.id}>
              <h4 className="text-sm font-semibold text-foreground mb-3">{round.name}</h4>
              <div className="flex flex-wrap gap-3">
                {round.matches.map(match => (
                  <MatchCardUI key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Status helpers ──────────────────────────────────────────────────────────

function statusBadge(status: DivisionPlayoff["status"]) {
  switch (status) {
    case "not_started":
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Not Started</Badge>;
    case "setup":
      return <Badge variant="outline" className="gap-1 border-primary/30 text-primary"><Settings className="h-3 w-3" /> Set Up</Badge>;
    case "active":
      return <Badge className="gap-1 bg-primary text-primary-foreground"><Play className="h-3 w-3" /> In Progress</Badge>;
    case "completed":
      return <Badge variant="secondary" className="gap-1 bg-accent/10 text-accent"><CheckCircle2 className="h-3 w-3" /> Completed</Badge>;
  }
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function BracketsPage() {
  const [divisions, setDivisions] = useState<DivisionPlayoff[]>(MOCK_DIVISIONS);
  const [setupDivision, setSetupDivision] = useState<DivisionPlayoff | null>(null);
  const [viewBracket, setViewBracket] = useState<BracketData | null>(null);
  const [expandedDivision, setExpandedDivision] = useState<string | null>(null);

  const handleSaveSetup = (divisionId: string, config: Partial<DivisionPlayoff>) => {
    setDivisions(prev => prev.map(d => {
      if (d.divisionId !== divisionId) return d;
      return { ...d, ...config };
    }));
    toast.success("Playoff configuration saved");
  };

  const handleStartPlayoffs = (divisionId: string) => {
    setDivisions(prev => prev.map(d => {
      if (d.divisionId !== divisionId) return d;

      const teamNames = MOCK_TEAM_NAMES[divisionId] || [];
      let brackets: BracketData[] = [];

      if (d.hasSplit && d.splits.length > 0) {
        let teamIndex = 0;
        brackets = d.splits.map((split, i) => {
          const splitTeams = teamNames.slice(teamIndex, teamIndex + split.teamCount);
          teamIndex += split.teamCount;
          return createBracket(`${divisionId}-split-${i}`, split.name, splitTeams, split.name);
        });
      } else {
        const qualifiedTeams = teamNames.slice(0, d.qualifyingTeams);
        brackets = [createBracket(`${divisionId}-main`, `${d.divisionName} Playoffs`, qualifiedTeams)];
      }

      return { ...d, status: "active" as const, brackets };
    }));
    setExpandedDivision(divisionId);
    toast.success("Playoffs started! Brackets have been generated.");
  };

  const handleResetPlayoffs = (divisionId: string) => {
    setDivisions(prev => prev.map(d =>
      d.divisionId === divisionId
        ? { ...d, status: "not_started", brackets: [], hasSplit: false, splits: [] }
        : d
    ));
    toast.info("Playoffs reset");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Playoffs & Brackets</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Set up and manage playoff brackets for each division. Split divisions into sub-brackets if needed.
        </p>
      </div>

      {/* Division Cards */}
      <div className="space-y-4">
        {divisions.map(division => {
          const isExpanded = expandedDivision === division.divisionId;

          return (
            <Card key={division.divisionId} className="overflow-hidden">
              {/* Division Header */}
              <CardHeader
                className="cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedDivision(isExpanded ? null : division.divisionId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{division.divisionName}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-0.5">
                        <Users className="h-3.5 w-3.5" />
                        {division.totalTeams} teams
                        {division.status !== "not_started" && (
                          <>
                            <span className="text-border">•</span>
                            {division.qualifyingTeams} qualifying
                          </>
                        )}
                        {division.hasSplit && (
                          <>
                            <span className="text-border">•</span>
                            <SplitSquareHorizontal className="h-3.5 w-3.5" />
                            {division.splits.length} splits
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {statusBadge(division.status)}
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>
                </div>
              </CardHeader>

              {/* Expanded Content */}
              {isExpanded && (
                <CardContent className="border-t border-border pt-4">
                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mb-4">
                    {(division.status === "not_started" || division.status === "setup") && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={(e) => { e.stopPropagation(); setSetupDivision(division); }}
                        >
                          <Settings className="h-4 w-4" />
                          {division.status === "setup" ? "Edit Setup" : "Set Up Playoffs"}
                        </Button>
                        {division.status === "setup" && (
                          <Button
                            size="sm"
                            className="gap-2"
                            onClick={(e) => { e.stopPropagation(); handleStartPlayoffs(division.divisionId); }}
                          >
                            <Play className="h-4 w-4" /> Start Playoffs
                          </Button>
                        )}
                      </>
                    )}
                    {(division.status === "active" || division.status === "completed") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-destructive hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleResetPlayoffs(division.divisionId); }}
                      >
                        <Trash2 className="h-4 w-4" /> Reset Playoffs
                      </Button>
                    )}
                  </div>

                  {/* Setup summary */}
                  {division.status === "setup" && (
                    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                      <h4 className="text-sm font-medium text-foreground">Configuration Summary</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Qualifying Teams</p>
                          <p className="font-medium">{division.qualifyingTeams}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Division Split</p>
                          <p className="font-medium">{division.hasSplit ? `${division.splits.length} brackets` : "No"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Reseeding</p>
                          <p className="font-medium">{division.reseeding ? "Yes" : "No"}</p>
                        </div>
                      </div>
                      {division.hasSplit && (
                        <div className="flex gap-2 flex-wrap">
                          {division.splits.map((split, i) => (
                            <Badge key={i} variant="secondary" className="gap-1">
                              <Swords className="h-3 w-3" />
                              {split.name} ({split.teamCount} teams)
                            </Badge>
                          ))}
                        </div>
                      )}
                      <BracketPreviewSVG teamCount={division.qualifyingTeams} height={160} />
                    </div>
                  )}

                  {/* Active/Completed brackets */}
                  {(division.status === "active" || division.status === "completed") && division.brackets.length > 0 && (
                    <div className="space-y-3">
                      {division.brackets.map(bracket => (
                        <div key={bracket.id} className="rounded-lg border border-border p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">{bracket.name}</span>
                              <Badge variant="secondary" className="text-xs">{bracket.teamCount} teams</Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => setViewBracket(bracket)}
                            >
                              <Maximize2 className="h-3.5 w-3.5" /> View Bracket
                            </Button>
                          </div>
                          <BracketPreviewSVG teamCount={bracket.teamCount} height={160} />
                          <div className="flex items-center gap-3 text-xs">
                            {bracket.rounds.map(round => {
                              const completed = round.matches.filter(m => m.status === "completed").length;
                              return (
                                <span key={round.id} className="text-muted-foreground">
                                  {round.name}: <span className="font-medium text-foreground">{completed}/{round.matches.length}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Not started state */}
                  {division.status === "not_started" && (
                    <div className="text-center py-8">
                      <Trophy className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        Playoffs haven't been configured yet. Click "Set Up Playoffs" to get started.
                      </p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Setup Dialog */}
      {setupDivision && (
        <PlayoffSetupDialog
          division={setupDivision}
          open={!!setupDivision}
          onOpenChange={(open) => { if (!open) setSetupDivision(null); }}
          onSave={(config) => handleSaveSetup(setupDivision.divisionId, config)}
        />
      )}

      {/* Bracket Viewer */}
      <BracketViewerDialog
        bracket={viewBracket}
        open={!!viewBracket}
        onOpenChange={(open) => { if (!open) setViewBracket(null); }}
      />
    </div>
  );
}
