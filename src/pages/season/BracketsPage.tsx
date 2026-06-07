import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trophy, PlayCircle, Undo2, Eye, ArrowLeft, Plus } from "lucide-react";
import { ScorekeeperSyncBanner } from "@/components/playoffs/ScorekeeperSyncBanner";
import { BracketGameLinkBadge } from "@/components/playoffs/BracketGameLinkBadge";
import { PendingFeederSlot } from "@/components/playoffs/PendingFeederSlot";
import { ReseedingBanner } from "@/components/playoffs/ReseedingBanner";
import { AdvancementConfirmDialog } from "@/components/playoffs/AdvancementConfirmDialog";
import { RollbackDialog } from "@/components/playoffs/RollbackDialog";
import { PlayoffWizard } from "@/components/playoffs/PlayoffWizard";
import { MOCK_PLAYOFF_GAMES, type MockPlayoffGame } from "@/data/mockPlayoffs";

const BracketsPage = () => {
  const [view, setView] = useState<"wizard" | "bracket">("wizard");
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const [reseeding, setReseeding] = useState(true);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({
    Quarterfinal: true, Semifinal: true, Final: false,
  });

  const games = MOCK_PLAYOFF_GAMES;
  const byRound = useMemo(() => {
    const map: Record<string, MockPlayoffGame[]> = {};
    for (const g of games) (map[g.round] ||= []).push(g);
    return map;
  }, [games]);
  const finals = games.filter((g) => g.status === "final");
  const completedAdvancers = finals; // games that produced winners ready to advance

  if (view === "wizard") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Playoffs & Brackets</h1>
            <p className="text-sm text-muted-foreground">Configure your playoff format step by step.</p>
          </div>
          <Button variant="outline" onClick={() => setView("bracket")}>
            <Eye className="h-4 w-4" />View existing bracket
          </Button>
        </div>
        <PlayoffWizard onPublish={() => setView("bracket")} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setView("wizard")}>
            <ArrowLeft className="h-4 w-4" />Back to wizard
          </Button>
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />Men's Division 1 Playoffs
            </h1>
            <p className="text-sm text-muted-foreground">8 teams · {reseeding ? "Reseeded" : "Fixed"} bracket</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5">
            <Label htmlFor="reseed" className="text-xs">Reseeding</Label>
            <Switch id="reseed" checked={reseeding} onCheckedChange={setReseeding} />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm"><Eye className="h-4 w-4" />Public visibility</Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64">
              <div className="space-y-2">
                <div className="text-sm font-medium">Show on public site</div>
                {Object.keys(byRound).map((r) => (
                  <div key={r} className="flex items-center justify-between text-sm">
                    <span>{r}</span>
                    <Switch
                      checked={visibility[r] ?? true}
                      onCheckedChange={(v) => setVisibility({ ...visibility, [r]: v })}
                    />
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={() => setRollbackOpen(true)}>
            <Undo2 className="h-4 w-4" />Rollback
          </Button>
          <Button size="sm" onClick={() => setAdvanceOpen(true)}>
            <PlayCircle className="h-4 w-4" />Advance from results
          </Button>
          <Button size="sm" variant="default" onClick={() => setView("wizard")}>
            <Plus className="h-4 w-4" />New playoff
          </Button>
        </div>
      </div>

      <ScorekeeperSyncBanner />

      <Tabs defaultValue="bracket">
        <TabsList>
          <TabsTrigger value="bracket">Bracket</TabsTrigger>
          <TabsTrigger value="schedule">Linked schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="bracket">
          <div className="overflow-x-auto">
            <div className="flex items-start gap-6 pb-3">
              {Object.entries(byRound).map(([round, roundGames], rIdx) => {
                const allDone = roundGames.every((g) => g.status === "final");
                const remaining = roundGames.filter((g) => g.status !== "final").length;
                const showReseedBanner = reseeding && !allDone && rIdx < Object.keys(byRound).length - 1;
                const visible = visibility[round] ?? true;
                return (
                  <div key={round} className="flex min-w-[300px] flex-col gap-3">
                    <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{round}</span>
                        {!visible && <Badge variant="outline" className="text-[10px]">hidden from public</Badge>}
                      </div>
                      <Badge variant="secondary">{roundGames.length} game{roundGames.length === 1 ? "" : "s"}</Badge>
                    </div>
                    {showReseedBanner && <ReseedingBanner round={round} remaining={remaining} />}
                    {roundGames.map((g, gIdx) => {
                      const pending1 = g.team1.startsWith("Winner ");
                      const pending2 = g.team2.startsWith("Winner ");
                      const winnerIsT1 = g.score ? g.score.t1 >= g.score.t2 : false;
                      const feeder = (slotIdx: 0 | 1, sourceLabel: string) => {
                        // sourceLabel like "QF1"
                        const id = LABEL_TO_ID[sourceLabel] ?? sourceLabel;
                        if (!reseeding) {
                          return {
                            label: `Winner of #${id}`,
                            tooltip: `Advances from game #${id} (${sourceLabel})`,
                          };
                        }
                        // Reseeding: use range of feeder games from previous round
                        const prevRound = Object.keys(byRound)[rIdx - 1];
                        const prevGames = prevRound ? byRound[prevRound] : [];
                        const range = prevGames.length
                          ? `#${prevGames[0].id}–#${prevGames[prevGames.length - 1].id}`
                          : `#${id}`;
                        const rankWords = ["Highest", "2nd highest", "3rd highest", "4th highest"];
                        // slot 0 in match gIdx → rank gIdx; slot 1 → mirrored from bottom
                        const rank =
                          slotIdx === 0
                            ? rankWords[gIdx] ?? `${gIdx + 1}th highest`
                            : `${rankWords[gIdx]?.toLowerCase() ?? `${gIdx + 1}th`} lowest`.replace("highest ", "");
                        const label =
                          slotIdx === 0
                            ? `${rankWords[gIdx] ?? `#${gIdx + 1}`} remaining seed`
                            : `${["Lowest", "2nd lowest", "3rd lowest", "4th lowest"][gIdx] ?? `#${gIdx + 1}`} remaining seed`;
                        return {
                          label: `${label} from ${range}`,
                          tooltip: `Reseed rule: ${rank} advancing seed out of feeder games ${range}`,
                        };
                      };
                      return (
                        <Card key={g.id} className="overflow-hidden">
                          <CardContent className="space-y-2 p-3">
                            {pending1 ? (
                              <PendingFeederSlot {...feeder(0, g.team1.replace("Winner ", ""))} />
                            ) : (
                              <div className={`flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm ${g.status === "final" && winnerIsT1 ? "bg-emerald-500/10 font-semibold" : ""}`}>
                                <span>{g.team1}</span>
                                {g.score && <span className="font-mono">{g.score.t1}</span>}
                              </div>
                            )}
                            {pending2 ? (
                              <PendingFeederSlot {...feeder(1, g.team2.replace("Winner ", ""))} />
                            ) : (
                              <div className={`flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm ${g.status === "final" && !winnerIsT1 ? "bg-emerald-500/10 font-semibold" : ""}`}>
                                <span>{g.team2}</span>
                                {g.score && <span className="font-mono">{g.score.t2}</span>}
                              </div>
                            )}
                            <BracketGameLinkBadge game={g} />
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader><CardTitle className="text-base">Schedule ↔ bracket links</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {games.map((g) => (
                  <div key={g.id} className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card/40 px-3 py-2 text-sm">
                    <Badge variant="outline" className="font-mono">{g.id}</Badge>
                    <span className="font-medium">{g.round} · {g.matchLabel}</span>
                    <span className="text-muted-foreground">{g.team1} vs {g.team2}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{g.date} · {g.time} · {g.field}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AdvancementConfirmDialog open={advanceOpen} onOpenChange={setAdvanceOpen} finalGames={completedAdvancers} />
      <RollbackDialog open={rollbackOpen} onOpenChange={setRollbackOpen} games={games} />
    </div>
  );
};

export default BracketsPage;
