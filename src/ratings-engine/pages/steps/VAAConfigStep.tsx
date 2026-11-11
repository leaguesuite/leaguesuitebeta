import { VAAConfig, VARConfig, RatingCategory, VAABaseline } from '@/ratings-engine/types/ratings';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VAAConfigStepProps {
  vaaConfig: Record<RatingCategory, VAAConfig>;
  varConfig: Record<RatingCategory, VARConfig>;
  onVAAChange: (config: Record<RatingCategory, VAAConfig>) => void;
  onVARChange: (config: Record<RatingCategory, VARConfig>) => void;
}

const CATEGORIES: { id: RatingCategory; label: string }[] = [
  { id: 'offense', label: 'Offense' },
  { id: 'defense', label: 'Defense' },
  { id: 'qb', label: 'QB' },
];

const BASELINES: { id: VAABaseline; label: string }[] = [
  { id: 'division_average', label: 'Their division' },
  { id: 'position_average', label: 'Their position' },
];

export function VAAConfigStep({ vaaConfig, onVAAChange }: VAAConfigStepProps) {
  const update = (category: RatingCategory, updates: Partial<VAAConfig>) =>
    onVAAChange({ ...vaaConfig, [category]: { ...vaaConfig[category], ...updates } });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">Should average players keep their rating?</h3>
        <p className="text-sm text-muted-foreground">
          When this is on, players who perform about average stay where they are. Players
          above average move up, and players below average move down — the further from
          average, the bigger the move.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: ArrowUp, title: 'Above average', text: 'Rating goes up', tone: 'text-success' },
          { icon: Minus, title: 'About average', text: 'Rating stays the same', tone: 'text-muted-foreground' },
          { icon: ArrowDown, title: 'Below average', text: 'Rating goes down', tone: 'text-destructive' },
        ].map(({ icon: Icon, title, text, tone }) => (
          <div key={title} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
            <Icon className={cn('h-5 w-5 shrink-0', tone)} />
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="divide-y rounded-lg border">
        {CATEGORIES.map(({ id, label }) => {
          const cfg = vaaConfig[id];
          return (
            <div key={id} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <Switch
                  id={`vaa-${id}`}
                  checked={cfg.enabled}
                  onCheckedChange={(enabled) => update(id, { enabled })}
                />
                <div>
                  <Label htmlFor={`vaa-${id}`} className="text-sm font-medium">
                    {label} ratings
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {cfg.enabled ? 'Average players stay steady' : 'Off — ratings follow raw results'}
                  </p>
                </div>
              </div>
              {cfg.enabled && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Compare to</span>
                  <div className="inline-flex rounded-md border p-0.5">
                    {BASELINES.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => update(id, { baseline: b.id })}
                        className={cn(
                          'rounded px-2.5 py-1 text-xs transition-colors',
                          cfg.baseline === b.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
