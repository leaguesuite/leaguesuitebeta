import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { MOCK_DIVISIONS } from "@/data/mockPlayoffs";

export interface SeedSourceConfig {
  [divisionId: string]: { mode: "standings" | "manual"; asOf: string };
}

interface Props {
  value: SeedSourceConfig;
  onChange: (v: SeedSourceConfig) => void;
}

export const SeedSourceStep = ({ value, onChange }: Props) => {
  const update = (id: string, patch: Partial<SeedSourceConfig[string]>) =>
    onChange({ ...value, [id]: { ...value[id], ...patch } });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Seed source per division</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {MOCK_DIVISIONS.map((d) => {
          const cfg = value[d.id] ?? { mode: "standings", asOf: "2026-11-07T23:59" };
          const hasTies = d.standings.some((s) => s.tiedWith && s.tiedWith.length);
          return (
            <div key={d.id} className="rounded-md border border-border p-3">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.qualifyingTeams} of {d.totalTeams} teams qualify
                  </div>
                </div>
                {hasTies && (
                  <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400">
                    <AlertCircle className="h-3 w-3" />Tied seeds detected
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Mode</Label>
                  <Select value={cfg.mode} onValueChange={(v: "standings" | "manual") => update(d.id, { mode: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standings">Standings as of…</SelectItem>
                      <SelectItem value="manual">Manual seed entry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {cfg.mode === "standings" && (
                  <div>
                    <Label className="text-xs">Lock standings as of</Label>
                    <Input
                      type="datetime-local"
                      value={cfg.asOf}
                      onChange={(e) => update(d.id, { asOf: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
