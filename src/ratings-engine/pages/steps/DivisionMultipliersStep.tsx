import { DivisionMultiplier } from '@/ratings-engine/types/ratings';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface DivisionMultipliersStepProps {
  multipliers: DivisionMultiplier[];
  onMultipliersChange: (multipliers: DivisionMultiplier[]) => void;
}

const DEFAULT_MULTIPLIERS: Record<string, number> = {
  'Elite': 1.15,
  'Intermediate': 1.05,
  'Recreational': 0.95,
};

export function DivisionMultipliersStep({ multipliers, onMultipliersChange }: DivisionMultipliersStepProps) {
  const handleMultiplierChange = (divisionId: string, value: number) => {
    onMultipliersChange(
      multipliers.map(m => 
        m.division_id === divisionId ? { ...m, multiplier: value } : m
      )
    );
  };

  const resetToDefaults = () => {
    onMultipliersChange(
      multipliers.map(m => ({
        ...m,
        multiplier: DEFAULT_MULTIPLIERS[m.division_name] ?? 1.0,
      }))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Adjust rating multipliers by division to account for varying competition levels.
          Values &gt;1 boost ratings, values &lt;1 reduce them.
        </p>
        <Button variant="outline" size="sm" onClick={resetToDefaults} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset Defaults
        </Button>
      </div>

      <div className="space-y-4">
        {multipliers.map((multiplier) => {
          const percentage = ((multiplier.multiplier - 1) * 100).toFixed(0);
          const isPositive = multiplier.multiplier >= 1;
          
          return (
            <div 
              key={multiplier.division_id}
              className="flex items-center gap-4 rounded-lg border bg-card p-4"
            >
              <div className="flex-1">
                <p className="font-medium">{multiplier.division_name}</p>
                <p className="text-sm text-muted-foreground">
                  {isPositive ? '+' : ''}{percentage}% adjustment
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Visual slider representation */}
                <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ 
                      width: `${Math.min(100, (multiplier.multiplier / 1.3) * 100)}%`,
                    }}
                  />
                </div>

                <Input
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="1.5"
                  value={multiplier.multiplier}
                  onChange={(e) => handleMultiplierChange(
                    multiplier.division_id, 
                    parseFloat(e.target.value) || 1
                  )}
                  className="w-24"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Example calculation */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm font-medium mb-2">Example Calculation</p>
        <p className="text-sm text-muted-foreground">
          A player with a raw score of 75 in the Elite division (1.15× multiplier) would receive: 
          <span className="font-mono ml-1">75 × 1.15 = 86.25</span>
        </p>
      </div>
    </div>
  );
}
