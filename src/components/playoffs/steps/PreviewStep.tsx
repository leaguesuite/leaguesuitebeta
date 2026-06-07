import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import type { WizardFormat } from "./FormatStep";

export interface RoundVisibility { [round: string]: boolean }

interface Props {
  format: WizardFormat;
  visibility: RoundVisibility;
  onVisibilityChange: (v: RoundVisibility) => void;
}

export const PreviewStep = ({ format, visibility, onVisibilityChange }: Props) => {
  const matchesInRound = (idx: number) => {
    const remaining = format.teams / Math.pow(2, idx);
    return Math.max(1, Math.floor(remaining / 2));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Preview & public visibility</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex items-stretch gap-6 pb-3">
            {format.rounds.map((round, rIdx) => {
              const visible = visibility[round] ?? true;
              const count = matchesInRound(rIdx);
              return (
                <div key={round} className="flex min-w-[180px] flex-col gap-3">
                  <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2">
                    <span className="text-sm font-medium">{round}</span>
                    <button
                      onClick={() => onVisibilityChange({ ...visibility, [round]: !visible })}
                      className="text-muted-foreground hover:text-foreground"
                      title={visible ? "Visible to public" : "Hidden from public"}
                    >
                      {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col justify-around gap-3">
                    {Array.from({ length: count }).map((_, i) => (
                      <div key={i} className="rounded-md border border-dashed border-border bg-card/40 p-2 text-xs">
                        <div className="text-muted-foreground">Seed {rIdx === 0 ? i * 2 + 1 : "—"}</div>
                        <div className="text-muted-foreground">Seed {rIdx === 0 ? format.teams - i * 2 : "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {format.bronze && (
              <div className="flex min-w-[180px] flex-col gap-3">
                <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm font-medium">Bronze Game</div>
                <div className="rounded-md border border-dashed border-border bg-card/40 p-2 text-xs text-muted-foreground">
                  Loser SF1 vs Loser SF2
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <Label className="text-xs">Tip:</Label> click the eye icon on a round to hide future matchups from the public site until you're ready.
        </div>
      </CardContent>
    </Card>
  );
};
