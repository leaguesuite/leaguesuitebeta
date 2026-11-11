import { CarryoverConfig } from '@/ratings-engine/types/ratings';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';

interface CarryoverStepProps {
  carryover: CarryoverConfig;
  onCarryoverChange: (carryover: CarryoverConfig) => void;
}

export function CarryoverStep({ carryover, onCarryoverChange }: CarryoverStepProps) {
  const updateCarryover = (updates: Partial<CarryoverConfig>) => {
    onCarryoverChange({ ...carryover, ...updates });
  };

  const handleWeightChange = (value: number[]) => {
    const carryoverWeight = value[0] / 100;
    updateCarryover({
      carryover_weight: carryoverWeight,
      current_weight: 1 - carryoverWeight,
    });
  };

  const carryoverPercent = Math.round(carryover.carryover_weight * 100);
  const currentPercent = Math.round(carryover.current_weight * 100);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Blend previous seasons' ratings with current season performance to smooth out 
        rating volatility and reward consistency over time.
      </p>

      {/* Weight Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Carryover Weight</Label>
          <span className="text-sm font-mono">
            {carryoverPercent}% / {currentPercent}%
          </span>
        </div>

        <Slider
          value={[carryoverPercent]}
          onValueChange={handleWeightChange}
          min={0}
          max={100}
          step={5}
          className="w-full"
        />

        <div className="flex justify-between text-sm text-muted-foreground">
          <span>100% Current Season</span>
          <span>100% Previous Seasons</span>
        </div>
      </div>

      {/* Visual Blend Indicator */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-3">Blend Visualization</p>
          <div className="flex h-8 rounded-lg overflow-hidden">
            <div 
              className="bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium transition-all"
              style={{ width: `${currentPercent}%` }}
            >
              {currentPercent > 20 && 'Current'}
            </div>
            <div 
              className="bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium transition-all"
              style={{ width: `${carryoverPercent}%` }}
            >
              {carryoverPercent > 20 && 'Previous'}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <p className="text-sm">
              <span className="font-medium">Example:</span> A player with a previous rating of 
              <span className="font-mono mx-1">80</span> and current season score of 
              <span className="font-mono mx-1">70</span> would receive:
            </p>
            <p className="font-mono text-sm mt-1">
              ({carryover.carryover_weight.toFixed(2)} × 80) + ({carryover.current_weight.toFixed(2)} × 70) = 
              <span className="text-primary font-bold ml-1">
                {(carryover.carryover_weight * 80 + carryover.current_weight * 70).toFixed(1)}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
