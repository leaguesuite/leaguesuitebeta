import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface WizardFormat {
  teams: number;
  type: "fixed" | "reseeding" | "pool_crossover";
  rounds: string[];
  bronze: boolean;
}

interface Props {
  value: WizardFormat;
  onChange: (v: WizardFormat) => void;
}

const defaultRoundNames = (n: number): string[] => {
  if (n <= 2) return ["Final"];
  if (n <= 4) return ["Semifinal", "Final"];
  if (n <= 8) return ["Quarterfinal", "Semifinal", "Final"];
  return ["Round of 16", "Quarterfinal", "Semifinal", "Final"];
};

export const FormatStep = ({ value, onChange }: Props) => {
  const update = (patch: Partial<WizardFormat>) => onChange({ ...value, ...patch });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Playoff format</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Number of teams</Label>
            <Input
              type="number" min={2} max={16}
              value={value.teams}
              onChange={(e) => {
                const n = Math.max(2, Math.min(16, Number(e.target.value) || 2));
                update({ teams: n, rounds: defaultRoundNames(n) });
              }}
            />
          </div>
          <div>
            <Label>Bracket type</Label>
            <Select value={value.type} onValueChange={(v: WizardFormat["type"]) => update({ type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed bracket</SelectItem>
                <SelectItem value="reseeding">Reseed each round</SelectItem>
                <SelectItem value="pool_crossover">Pool / crossover</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Round names</Label>
          <div className="mt-2 space-y-2">
            {value.rounds.map((r, i) => (
              <Input
                key={i}
                value={r}
                onChange={(e) => {
                  const next = [...value.rounds];
                  next[i] = e.target.value;
                  update({ rounds: next });
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
          <div>
            <Label className="text-sm">Include bronze (3rd place) game</Label>
            <p className="text-xs text-muted-foreground">Losers of the semifinals play for 3rd place.</p>
          </div>
          <Switch checked={value.bronze} onCheckedChange={(v) => update({ bronze: v })} />
        </div>
      </CardContent>
    </Card>
  );
};
