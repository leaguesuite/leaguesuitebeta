import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  GripVertical, Plus, Trash2, Save, ArrowUp, ArrowDown, Info, Trophy,
  AlertTriangle, RotateCcw,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SortingCriterion {
  id: string;
  field: string;
  direction: "desc" | "asc";
  enabled: boolean;
}

interface TiebreakRule {
  id: string;
  method: string;
  enabled: boolean;
}

interface StandingsProfile {
  id: string;
  name: string;
  isDefault: boolean;
  pointsForWin: number;
  pointsForLoss: number;
  pointsForTie: number;
  pointsForOTWin: number;
  pointsForOTLoss: number;
  sortingCriteria: SortingCriterion[];
  tiebreakRules: TiebreakRule[];
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const SORT_FIELD_OPTIONS = [
  { value: "points", label: "Points" },
  { value: "wins", label: "Wins" },
  { value: "losses", label: "Losses" },
  { value: "win_pct", label: "Win %" },
  { value: "goal_diff", label: "Goal / Point Differential" },
  { value: "goals_for", label: "Goals / Points For" },
  { value: "goals_against", label: "Goals / Points Against" },
  { value: "games_played", label: "Games Played" },
  { value: "ties", label: "Ties / Draws" },
  { value: "ot_wins", label: "OT Wins" },
  { value: "streak", label: "Current Streak" },
];

const TIEBREAK_OPTIONS = [
  { value: "head_to_head", label: "Head-to-Head Record" },
  { value: "common_record", label: "Record vs. Common Opponents" },
  { value: "goal_diff", label: "Goal / Point Differential" },
  { value: "common_goal_diff", label: "Point Differential vs. Common Opponents" },
  { value: "goals_for", label: "Goals / Points For" },
  { value: "goals_against", label: "Fewest Goals / Points Against" },
  { value: "wins", label: "Most Wins" },
  { value: "home_record", label: "Home Record" },
  { value: "away_record", label: "Away Record" },
  { value: "last_5", label: "Last 5 Games Record" },
  { value: "coin_flip", label: "Coin Flip / Random Draw" },
];

const DEFAULT_PROFILES: StandingsProfile[] = [
  {
    id: "default",
    name: "Standard Points System",
    isDefault: true,
    pointsForWin: 3,
    pointsForLoss: 0,
    pointsForTie: 1,
    pointsForOTWin: 2,
    pointsForOTLoss: 1,
    sortingCriteria: [
      { id: "s1", field: "points", direction: "desc", enabled: true },
      { id: "s2", field: "wins", direction: "desc", enabled: true },
      { id: "s3", field: "goal_diff", direction: "desc", enabled: true },
      { id: "s4", field: "goals_for", direction: "desc", enabled: false },
    ],
    tiebreakRules: [
      { id: "t1", method: "head_to_head", enabled: true },
      { id: "t2", method: "goal_diff", enabled: true },
      { id: "t3", method: "goals_for", enabled: true },
      { id: "t4", method: "wins", enabled: false },
      { id: "t5", method: "coin_flip", enabled: false },
    ],
  },
  {
    id: "wlt",
    name: "Win-Loss-Tie (No Points)",
    isDefault: false,
    pointsForWin: 0,
    pointsForLoss: 0,
    pointsForTie: 0,
    pointsForOTWin: 0,
    pointsForOTLoss: 0,
    sortingCriteria: [
      { id: "s1", field: "win_pct", direction: "desc", enabled: true },
      { id: "s2", field: "wins", direction: "desc", enabled: true },
      { id: "s3", field: "goal_diff", direction: "desc", enabled: true },
    ],
    tiebreakRules: [
      { id: "t1", method: "head_to_head", enabled: true },
      { id: "t2", method: "goal_diff", enabled: true },
      { id: "t3", method: "last_5", enabled: true },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function StandingsRulesPage() {
  const [profiles, setProfiles] = useState<StandingsProfile[]>(DEFAULT_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState("default");
  const [hasChanges, setHasChanges] = useState(false);

  const profile = profiles.find(p => p.id === activeProfileId)!;

  const updateProfile = (updates: Partial<StandingsProfile>) => {
    setProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, ...updates } : p));
    setHasChanges(true);
  };

  const moveSortCriterion = (index: number, direction: -1 | 1) => {
    const newCriteria = [...profile.sortingCriteria];
    const target = index + direction;
    if (target < 0 || target >= newCriteria.length) return;
    [newCriteria[index], newCriteria[target]] = [newCriteria[target], newCriteria[index]];
    updateProfile({ sortingCriteria: newCriteria });
  };

  const moveTiebreak = (index: number, direction: -1 | 1) => {
    const newRules = [...profile.tiebreakRules];
    const target = index + direction;
    if (target < 0 || target >= newRules.length) return;
    [newRules[index], newRules[target]] = [newRules[target], newRules[index]];
    updateProfile({ tiebreakRules: newRules });
  };

  const addSortCriterion = () => {
    const used = new Set(profile.sortingCriteria.map(c => c.field));
    const available = SORT_FIELD_OPTIONS.find(o => !used.has(o.value));
    if (!available) return;
    updateProfile({
      sortingCriteria: [...profile.sortingCriteria, { id: `s${Date.now()}`, field: available.value, direction: "desc", enabled: true }],
    });
  };

  const removeSortCriterion = (id: string) => {
    updateProfile({ sortingCriteria: profile.sortingCriteria.filter(c => c.id !== id) });
  };

  const addTiebreak = () => {
    const used = new Set(profile.tiebreakRules.map(r => r.method));
    const available = TIEBREAK_OPTIONS.find(o => !used.has(o.value));
    if (!available) return;
    updateProfile({
      tiebreakRules: [...profile.tiebreakRules, { id: `t${Date.now()}`, method: available.value, enabled: true }],
    });
  };

  const removeTiebreak = (id: string) => {
    updateProfile({ tiebreakRules: profile.tiebreakRules.filter(r => r.id !== id) });
  };

  const addProfile = () => {
    const newProfile: StandingsProfile = {
      id: `prof_${Date.now()}`,
      name: "New Profile",
      isDefault: false,
      pointsForWin: 3, pointsForLoss: 0, pointsForTie: 1, pointsForOTWin: 2, pointsForOTLoss: 1,
      sortingCriteria: [{ id: "s1", field: "points", direction: "desc", enabled: true }],
      tiebreakRules: [{ id: "t1", method: "head_to_head", enabled: true }],
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    toast({ title: "Standings rules saved!", description: "These rules will apply to all new and current seasons using this profile." });
  };

  const handleReset = () => {
    setProfiles(DEFAULT_PROFILES);
    setActiveProfileId("default");
    setHasChanges(false);
    toast({ title: "Reset to defaults" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Standings Rules</h1>
          <p className="text-sm text-muted-foreground">Configure how standings are sorted and how tiebreaks are resolved</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges} className="gap-1.5">
            <Save className="h-3.5 w-3.5" /> Save Rules
          </Button>
        </div>
      </div>

      {/* Profile selector */}
      <div className="flex items-center gap-3">
        <Label className="text-sm shrink-0">Rule Profile:</Label>
        <Select value={activeProfileId} onValueChange={setActiveProfileId}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {profiles.map(p => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} {p.isDefault && <span className="text-muted-foreground">(Default)</span>}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={addProfile} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New Profile
        </Button>
      </div>

      {/* Profile name */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Profile Name</Label>
              <Input value={profile.name} onChange={e => updateProfile({ name: e.target.value })} />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex items-center gap-2">
                <Switch checked={profile.isDefault} onCheckedChange={v => {
                  setProfiles(prev => prev.map(p => ({ ...p, isDefault: p.id === activeProfileId ? v : (v ? false : p.isDefault) })));
                  setHasChanges(true);
                }} />
                <Label className="text-sm">Default profile for new seasons</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Points system */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" /> Points System
          </CardTitle>
          <CardDescription className="text-xs">How many points each result is worth. Set all to 0 for W-L-T systems.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {([
              ["pointsForWin", "Win"],
              ["pointsForLoss", "Loss"],
              ["pointsForTie", "Tie / Draw"],
              ["pointsForOTWin", "OT Win"],
              ["pointsForOTLoss", "OT Loss"],
            ] as const).map(([field, label]) => (
              <div key={field} className="space-y-1.5">
                <Label className="text-xs">{label}</Label>
                <Input
                  type="number"
                  min={0}
                  value={profile[field]}
                  onChange={e => updateProfile({ [field]: parseInt(e.target.value) || 0 })}
                  className="text-center"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sorting criteria */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Sorting Order</CardTitle>
                <CardDescription className="text-xs">Primary → secondary → tertiary sorting. Drag to reorder priority.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addSortCriterion} className="gap-1.5"
                disabled={profile.sortingCriteria.length >= SORT_FIELD_OPTIONS.length}>
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {profile.sortingCriteria.map((criterion, index) => (
              <div key={criterion.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                criterion.enabled ? "border-border bg-card" : "border-border/50 bg-muted/30 opacity-60"
              }`}>
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <Badge variant="outline" className="text-[10px] shrink-0 w-5 h-5 flex items-center justify-center p-0 rounded-full">
                  {index + 1}
                </Badge>
                <Select value={criterion.field} onValueChange={v => {
                  const updated = [...profile.sortingCriteria];
                  updated[index] = { ...updated[index], field: v };
                  updateProfile({ sortingCriteria: updated });
                }}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_FIELD_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={criterion.direction} onValueChange={v => {
                  const updated = [...profile.sortingCriteria];
                  updated[index] = { ...updated[index], direction: v as "asc" | "desc" };
                  updateProfile({ sortingCriteria: updated });
                }}>
                  <SelectTrigger className="h-8 text-xs w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">High → Low</SelectItem>
                    <SelectItem value="asc">Low → High</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveSortCriterion(index, -1)} disabled={index === 0}>
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveSortCriterion(index, 1)} disabled={index === profile.sortingCriteria.length - 1}>
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Switch checked={criterion.enabled} onCheckedChange={v => {
                    const updated = [...profile.sortingCriteria];
                    updated[index] = { ...updated[index], enabled: v };
                    updateProfile({ sortingCriteria: updated });
                  }} />
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeSortCriterion(criterion.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {profile.sortingCriteria.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No sorting criteria. Add one to get started.</p>
            )}
          </CardContent>
        </Card>

        {/* Tiebreak rules */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  Tiebreak Priority
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs">
                      When two or more teams are tied on the primary sort, these rules are applied in order to break the tie.
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <CardDescription className="text-xs">Applied in order when teams are tied on sort criteria.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addTiebreak} className="gap-1.5"
                disabled={profile.tiebreakRules.length >= TIEBREAK_OPTIONS.length}>
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {profile.tiebreakRules.map((rule, index) => (
              <div key={rule.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                rule.enabled ? "border-border bg-card" : "border-border/50 bg-muted/30 opacity-60"
              }`}>
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <Badge variant="outline" className="text-[10px] shrink-0 w-5 h-5 flex items-center justify-center p-0 rounded-full">
                  {index + 1}
                </Badge>
                <Select value={rule.method} onValueChange={v => {
                  const updated = [...profile.tiebreakRules];
                  updated[index] = { ...updated[index], method: v };
                  updateProfile({ tiebreakRules: updated });
                }}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue>
                      {TIEBREAK_OPTIONS.find(o => o.value === rule.method)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {TIEBREAK_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveTiebreak(index, -1)} disabled={index === 0}>
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveTiebreak(index, 1)} disabled={index === profile.tiebreakRules.length - 1}>
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Switch checked={rule.enabled} onCheckedChange={v => {
                    const updated = [...profile.tiebreakRules];
                    updated[index] = { ...updated[index], enabled: v };
                    updateProfile({ tiebreakRules: updated });
                  }} />
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeTiebreak(rule.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {profile.tiebreakRules.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No tiebreak rules. Add one to get started.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" /> Rule Summary Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-foreground space-y-1">
            <p>
              <span className="font-medium">Sort by:</span>{" "}
              {profile.sortingCriteria.filter(c => c.enabled).map((c, i) => (
                <span key={c.id}>
                  {i > 0 && " → "}
                  {SORT_FIELD_OPTIONS.find(o => o.value === c.field)?.label} ({c.direction === "desc" ? "↓" : "↑"})
                </span>
              ))}
              {profile.sortingCriteria.filter(c => c.enabled).length === 0 && <span className="text-muted-foreground">None configured</span>}
            </p>
            <p>
              <span className="font-medium">Tiebreaks:</span>{" "}
              {profile.tiebreakRules.filter(r => r.enabled).map((r, i) => (
                <span key={r.id}>
                  {i > 0 && " → "}
                  {TIEBREAK_OPTIONS.find(o => o.value === r.method)?.label}
                </span>
              ))}
              {profile.tiebreakRules.filter(r => r.enabled).length === 0 && <span className="text-muted-foreground">None configured</span>}
            </p>
            {profile.pointsForWin > 0 && (
              <p>
                <span className="font-medium">Points:</span> W={profile.pointsForWin} L={profile.pointsForLoss} T={profile.pointsForTie} OTW={profile.pointsForOTWin} OTL={profile.pointsForOTLoss}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
