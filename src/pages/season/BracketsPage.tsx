import { useState, useRef, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { generateBracketStructure } from "@/utils/bracketGenerator";
// Local types for this page's legacy bracket display
interface TeamMatchData {
  id: string;
  name: string;
  score?: number | null;
  seed?: number;
  logo?: string;
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
  date?: string;
  matches: LegacyMatch[];
}

interface Bracket {
  id: string;
  name: string;
  division: string;
  rounds: LegacyRound[];
  teamCount: number;
  status: "setup" | "active" | "completed";
  isReseeding: boolean;
}
import {
  Plus, Trophy, Edit, Trash2, ChevronRight, Play, CheckCircle2,
  Clock, Settings, Eye, Maximize2, RotateCcw, Shield,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const DIVISIONS = ["All Divisions", "Men's D1", "Men's D2", "Women's D1", "Co-Ed Open"];

const DIVISION_TEAMS: Record<string, string[]> = {
  "Men's D1": ["Thunder Hawks", "Iron Eagles", "Crimson Tide", "Blue Lightning", "Storm Riders", "Night Owls", "Golden Bears", "Viper Squad"],
  "Men's D2": ["Silver Sharks", "Red Rockets", "Arctic Wolves", "Dark Knights", "Green Machine", "Wild Cards"],
  "Women's D1": ["Phoenix Rising", "Steel Wolves", "Valkyries", "Lightning Bolts", "Storm Queens", "Fire Hawks", "Ice Tigers", "Shadow Cats"],
  "Co-Ed Open": ["Blaze FC", "Chaos Theory", "Dream Team", "Misfits"],
};

function createBracketFromTeams(
  id: string, name: string, division: string, teamNames: string[],
  status: Bracket["status"] = "setup", withScores: boolean = false,
): Bracket {
  const teamCount = teamNames.length;
  const structure = generateBracketStructure(teamCount);
  const numRounds = structure.length;

  const rounds: Round[] = structure.map((roundMatches, ri) => {
    const roundsFromEnd = numRounds - ri - 1;
    let roundName = `Round ${ri + 1}`;
    if (roundsFromEnd === 0) roundName = "Finals";
    else if (roundsFromEnd === 1) roundName = "Semi-Finals";
    else if (roundsFromEnd === 2) roundName = "Quarter-Finals";

    const matches: Match[] = roundMatches.map((m, mi) => {
      const t1Name = ri === 0 && m.seeds[0] <= teamNames.length ? teamNames[m.seeds[0] - 1] : "TBD";
      const t2Name = ri === 0 && m.seeds.length > 1 && m.seeds[1] <= teamNames.length ? teamNames[m.seeds[1] - 1] : "TBD";

      const team1: TeamMatchData = { id: `${id}-r${ri}-m${mi}-t1`, name: t1Name, seed: m.seeds[0], score: null };
      const team2: TeamMatchData = { id: `${id}-r${ri}-m${mi}-t2`, name: t2Name, seed: m.seeds.length > 1 ? m.seeds[1] : undefined, score: null };

      let matchStatus: Match["status"] = "upcoming";
      let winnerId: string | undefined;

      if (withScores && ri === 0) {
        team1.score = Math.floor(Math.random() * 35) + 7;
        team2.score = Math.floor(Math.random() * 35) + 7;
        if (team2.score === team1.score) team2.score! += 7;
        matchStatus = "completed";
        winnerId = team1.score! > team2.score! ? team1.id : team2.id;
      }

      return {
        id: `${id}-r${ri}-m${mi}`,
        matchNumber: mi + 1,
        teams: [team1, team2] as [TeamMatchData, TeamMatchData],
        status: matchStatus,
        winnerId,
      };
    });

    return { id: `${id}-round-${ri}`, name: roundName, matches };
  });

  return { id, name, division, rounds, teamCount, status, isReseeding: false };
}

const INITIAL_BRACKETS: Bracket[] = [
  createBracketFromTeams("b1", "Men's D1 Playoffs", "Men's D1", DIVISION_TEAMS["Men's D1"], "active", true),
  createBracketFromTeams("b2", "Women's D1 Playoffs", "Women's D1", DIVISION_TEAMS["Women's D1"], "setup", false),
];

// ─── Bracket SVG Preview ─────────────────────────────────────────────────────

function BracketPreviewSVG({ teamCount, height = 300 }: { teamCount: number; height?: number }) {
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
      const tH = 28;
      const gap = 16;

      structure.forEach((round, ri) => {
        const totalH = round.length * tH + (round.length - 1) * gap;
        const startY = (ch - totalH) / 2;

        round.forEach((m, mi) => {
          const y = startY + mi * (tH + gap);
          const x = ri * colW + 16;
          const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          rect.setAttribute("x", String(x)); rect.setAttribute("y", String(y));
          rect.setAttribute("width", String(colW - 32)); rect.setAttribute("height", String(tH));
          rect.setAttribute("rx", "4");
          rect.setAttribute("fill", m.bye ? "hsl(210, 15%, 94%)" : "hsl(215, 90%, 95%)");
          rect.setAttribute("stroke", m.bye ? "hsl(214, 20%, 85%)" : "hsl(215, 90%, 80%)");
          svg.appendChild(rect);

          const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
          txt.setAttribute("x", String(x + (colW - 32) / 2)); txt.setAttribute("y", String(y + tH / 2 + 4));
          txt.setAttribute("text-anchor", "middle"); txt.setAttribute("font-size", "11");
          txt.setAttribute("fill", "hsl(215, 14%, 50%)");
          txt.textContent = m.bye ? `Bye (#${m.seeds[0]})` : `#${m.seeds[0]} vs #${m.seeds[1]}`;
          svg.appendChild(txt);

          if (ri < maxR - 1) {
            const nr = structure[ri + 1];
            const nmi = Math.floor(mi / 2);
            if (nmi >= nr.length) return;
            const nTotalH = nr.length * tH + (nr.length - 1) * gap;
            const nStartY = (ch - nTotalH) / 2;
            const ny = nStartY + nmi * (tH + gap);
            const sx = x + colW - 32; const sy = y + tH / 2;
            const ex = (ri + 1) * colW + 16; const ey = ny + tH / 2;
            const mx = (sx + ex) / 2;
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", `M${sx} ${sy} L${mx} ${sy} L${mx} ${ey} L${ex} ${ey}`);
            path.setAttribute("stroke", "hsl(214, 20%, 85%)"); path.setAttribute("fill", "none");
            svg.appendChild(path);
          }
        });

        const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
        title.setAttribute("x", String(ri * colW + colW / 2));
        title.setAttribute("y", "16"); title.setAttribute("text-anchor", "middle");
        title.setAttribute("font-size", "11"); title.setAttribute("font-weight", "600");
        title.setAttribute("fill", "hsl(215, 14%, 50%)");
        const rfe = maxR - ri - 1;
        title.textContent = rfe === 0 ? "Finals" : rfe === 1 ? "Semis" : rfe === 2 ? "Quarters" : `Round ${ri + 1}`;
        svg.appendChild(title);
      });
    } catch {}
  }, [teamCount]);

  return (
    <div ref={containerRef} className="w-full overflow-hidden rounded-lg border border-border bg-card" style={{ height }}>
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
}

// ─── Match Card ──────────────────────────────────────────────────────────────

function MatchCardUI({ match }: { match: Match }) {
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
        {match.teams.map((team, i) => {
          const isWinner = isComplete && team.id === match.winnerId;
          return (
            <div
              key={team.id}
              className={`flex items-center justify-between px-2 py-1.5 rounded text-sm ${
                isWinner ? "bg-accent/10 font-semibold text-foreground" :
                !team.name || team.name === "TBD" ? "border border-dashed border-border text-muted-foreground" :
                "text-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5">
                {team.seed && <span className="text-[10px] text-muted-foreground font-mono">#{team.seed}</span>}
                <span className={isWinner ? "text-accent" : ""}>{team.name || "TBD"}</span>
              </div>
              <span className="font-mono text-xs w-5 text-right">{team.score ?? ""}</span>
            </div>
          );
        })}
      </div>
      {match.venue && <div className="mt-2 pt-2 border-t border-border text-[11px] text-muted-foreground">{match.venue}</div>}
    </div>
  );
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function BracketsPage() {
  const [brackets, setBrackets] = useState<Bracket[]>(INITIAL_BRACKETS);
  const [divisionFilter, setDivisionFilter] = useState("All Divisions");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewBracket, setViewBracket] = useState<Bracket | null>(null);

  // Create form
  const [newName, setNewName] = useState("");
  const [newDivision, setNewDivision] = useState("Men's D1");
  const [newTeamCount, setNewTeamCount] = useState("8");
  const [newReseeding, setNewReseeding] = useState(false);

  const filtered = divisionFilter === "All Divisions" ? brackets : brackets.filter(b => b.division === divisionFilter);

  const handleCreate = () => {
    if (!newName.trim()) return;
    const teams = DIVISION_TEAMS[newDivision] || [];
    const count = Math.min(parseInt(newTeamCount) || 4, teams.length || 32);
    const teamSlice = teams.slice(0, count);
    // Pad with TBD if not enough teams
    while (teamSlice.length < count) teamSlice.push(`Team ${teamSlice.length + 1}`);

    const bracket = createBracketFromTeams(
      String(Date.now()), newName.trim(), newDivision, teamSlice, "setup"
    );
    bracket.isReseeding = newReseeding;
    setBrackets(prev => [...prev, bracket]);
    setCreateOpen(false);
    setNewName("");
    toast({ title: "Bracket created", description: `${newName} has been set up.` });
  };

  const deleteBracket = (id: string) => {
    setBrackets(prev => prev.filter(b => b.id !== id));
    toast({ title: "Deleted", description: "Bracket removed." });
  };

  const statusIcon = (s: Bracket["status"]) => {
    if (s === "completed") return <CheckCircle2 className="h-4 w-4 text-accent" />;
    if (s === "active") return <Play className="h-4 w-4 text-primary" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Playoffs & Brackets</h1>
          <p className="text-sm text-muted-foreground mt-1">Set up and manage playoff brackets for each division.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={divisionFilter} onValueChange={setDivisionFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DIVISIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New Bracket
          </Button>
        </div>
      </div>

      {/* Bracket Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map(bracket => (
          <div key={bracket.id} className="section-card overflow-hidden">
            <div className="h-1.5 bg-primary" />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  {statusIcon(bracket.status)}
                  <div>
                    <h3 className="font-semibold text-foreground">{bracket.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-xs">{bracket.division}</Badge>
                      <span className="text-xs text-muted-foreground">{bracket.teamCount} teams</span>
                      {bracket.isReseeding && <Badge variant="secondary" className="text-[10px]">Reseeding</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewBracket(bracket)}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteBracket(bracket.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Mini bracket preview */}
              <BracketPreviewSVG teamCount={bracket.teamCount} height={180} />

              {/* Round summary */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {bracket.rounds.map(round => {
                  const completed = round.matches.filter(m => m.status === "completed").length;
                  const total = round.matches.length;
                  return (
                    <div key={round.id} className="flex items-center gap-1.5 text-xs">
                      <span className="text-muted-foreground">{round.name}:</span>
                      <span className={`font-medium ${completed === total && total > 0 ? "text-accent" : "text-foreground"}`}>
                        {completed}/{total}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Button variant="outline" size="sm" className="w-full mt-3 gap-2" onClick={() => setViewBracket(bracket)}>
                <Maximize2 className="h-3.5 w-3.5" /> View Full Bracket
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="lg:col-span-2 section-card p-12 text-center">
            <Trophy className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No brackets yet. Create one to get started.</p>
          </div>
        )}
      </div>

      {/* Create Bracket Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              New Playoff Bracket
            </DialogTitle>
            <DialogDescription>Set up a bracket for a division's playoffs.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Bracket Name</Label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Men's D1 Playoffs" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Division</Label>
                <Select value={newDivision} onValueChange={setNewDivision}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIVISIONS.filter(d => d !== "All Divisions").map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Number of Teams</Label>
                <Select value={newTeamCount} onValueChange={setNewTeamCount}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["2", "4", "6", "8", "12", "16"].map(n => (
                      <SelectItem key={n} value={n}>{n} Teams</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Reseeding</Label>
                <p className="text-xs text-muted-foreground">Re-seed teams after each round based on original seed.</p>
              </div>
              <Switch checked={newReseeding} onCheckedChange={setNewReseeding} />
            </div>
            {/* Preview */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Bracket Preview</Label>
              <BracketPreviewSVG teamCount={parseInt(newTeamCount) || 4} height={220} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>Create Bracket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Full Bracket Dialog */}
      <Dialog open={!!viewBracket} onOpenChange={v => !v && setViewBracket(null)}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              {viewBracket?.name}
              <Badge variant="secondary" className="text-xs ml-1">{viewBracket?.division}</Badge>
            </DialogTitle>
          </DialogHeader>
          {viewBracket && (
            <div className="py-2">
              {/* Full bracket view with match cards */}
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-max pt-8">
                  {viewBracket.rounds.map((round, ri) => (
                    <div key={round.id} className="flex flex-col w-60 shrink-0">
                      <div className="text-center mb-4">
                        <h3 className="text-sm font-semibold text-foreground">{round.name}</h3>
                        {round.date && <span className="text-xs text-muted-foreground">{round.date}</span>}
                      </div>
                      <div
                        className="flex flex-col justify-around flex-1 gap-3"
                        style={{ minHeight: viewBracket.rounds[0].matches.length * 90 }}
                      >
                        {round.matches.map(match => (
                          <MatchCardUI key={match.id} match={match} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
