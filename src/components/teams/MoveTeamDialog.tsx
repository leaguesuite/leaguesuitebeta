import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { CONFERENCES, DIVISIONS, Team } from "./teamsData";

export type PlayedOption = "keep" | "move";
export type ScheduledOption = "cancel" | "cross" | "flag";
export interface MoveResult { division: string; conference?: string; played: PlayedOption; scheduled: ScheduledOption; reason: string; }

const SEASON_GAMES = 10;
const NONE = "__none";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  teams: Team[];            // teams being moved
  allTeams: Team[];
  onConfirm: (r: MoveResult) => void;
}

export default function MoveTeamDialog({ open, onOpenChange, teams, allTeams, onConfirm }: Props) {
  const sources = Array.from(new Set(teams.map(t => t.division)));
  const firstOther = DIVISIONS.find(d => !sources.includes(d.name))?.name ?? DIVISIONS[0].name;
  const [division, setDivision] = useState(firstOther);
  const [conference, setConference] = useState(NONE);
  const [played, setPlayed] = useState<PlayedOption>("keep");
  const [scheduled, setScheduled] = useState<ScheduledOption>("flag");
  const [reason, setReason] = useState("");
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (open) { setDivision(firstOther); setConference(NONE); setPlayed("keep"); setScheduled("flag"); setReason(""); setTried(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const movingIn = teams.filter(t => t.division !== division);
  const target = DIVISIONS.find(d => d.name === division)!;
  const targetBefore = allTeams.filter(t => t.division === division).length;
  const targetAfter = targetBefore + movingIn.length;
  const overCap = targetAfter > target.cap;
  const playedCount = movingIn.reduce((s, t) => s + t.wins + t.losses, 0);
  const remaining = movingIn.reduce((s, t) => s + Math.max(0, SEASON_GAMES - t.wins - t.losses), 0);
  const label = teams.length === 1 ? teams[0].name : `${teams.length} teams`;
  const valid = reason.trim().length > 0 && movingIn.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Move {label} to another division</DialogTitle>
          <DialogDescription>The roster and team identity always move with the team. Choose what happens to its games.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>New division</Label>
              <Select value={division} onValueChange={v => { setDivision(v); setConference(NONE); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DIVISIONS.map(d => <SelectItem key={d.name} value={d.name} disabled={sources.length === 1 && sources[0] === d.name}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Conference (optional)</Label>
              <Select value={conference} onValueChange={setConference} disabled={!CONFERENCES[division]?.length}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Unassigned</SelectItem>
                  {CONFERENCES[division]?.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Games already played <span className="text-muted-foreground font-normal">({playedCount})</span></Label>
            <RadioGroup value={played} onValueChange={v => setPlayed(v as PlayedOption)} className="space-y-1.5">
              <Option value="keep" title="Keep in the old division" desc="Results stay as history in the old division. The team starts 0-0 in the new one." />
              <Option value="move" title="Move them to the new division" desc="The team's record carries over and counts in the new standings." />
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Games still scheduled <span className="text-muted-foreground font-normal">({remaining})</span></Label>
            <RadioGroup value={scheduled} onValueChange={v => setScheduled(v as ScheduledOption)} className="space-y-1.5">
              <Option value="flag" title="Flag for rescheduling" desc="Games stay on the schedule, marked for review." />
              <Option value="cross" title="Keep as cross-division games" desc="Games are played as-is but don't count in either division's standings." />
              <Option value="cancel" title="Cancel them" desc="Remaining games against the old division are removed." />
            </RadioGroup>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-3">
            <p className="table-header">Standings preview</p>
            {sources.filter(s => s !== division).map(s => {
              const before = allTeams.filter(t => t.division === s).length;
              const out = movingIn.filter(t => t.division === s).length;
              return <PreviewRow key={s} name={s} before={`${before} teams`} after={`${before - out} teams`} note={played === "keep" ? "Results vs. the moved team stay" : "Results vs. the moved team leave"} />;
            })}
            <PreviewRow name={division} before={`${targetBefore} teams`} after={`${targetAfter} teams`}
              note={movingIn.map(t => `${t.name} ${played === "move" ? `${t.wins}-${t.losses}` : "0-0"}`).join(", ")} warn={overCap} />
            {overCap && <p className="flex items-center gap-1.5 text-xs text-warning"><AlertTriangle className="h-3.5 w-3.5" /> {division} will be over its team cap of {target.cap}.</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Textarea rows={2} value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Moved up after a 6-0 start" />
            {tried && !reason.trim() && <p className="text-xs text-destructive">A reason is required</p>}
            <p className="text-xs text-muted-foreground">This move is recorded in the team history.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { setTried(true); if (valid) { onConfirm({ division, conference: conference === NONE ? undefined : conference, played, scheduled, reason: reason.trim() }); onOpenChange(false); } }}>
            Move {label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Option({ value, title, desc }: { value: string; title: string; desc: string }) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
      <RadioGroupItem value={value} className="mt-0.5" />
      <span><span className="block text-sm font-medium">{title}</span><span className="block text-xs text-muted-foreground">{desc}</span></span>
    </label>
  );
}

function PreviewRow({ name, before, after, note, warn }: { name: string; before: string; after: string; note?: string; warn?: boolean }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-28 font-medium">{name}</span>
      <span className="tabular text-muted-foreground">{before}</span>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
      <span className={`tabular font-medium ${warn ? "text-warning" : ""}`}>{after}</span>
      {note && <span className="text-xs text-muted-foreground truncate">· {note}</span>}
    </div>
  );
}
