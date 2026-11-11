import { RatingScaleConfig } from '@/ratings-engine/types/ratings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';

interface RatingScaleStepProps {
  scale: RatingScaleConfig;
  onScaleChange: (scale: RatingScaleConfig) => void;
}

export function RatingScaleStep({ scale, onScaleChange }: RatingScaleStepProps) {
  const updateScale = (updates: Partial<RatingScaleConfig>) => {
    onScaleChange({ ...scale, ...updates });
  };

  return (
    <div className="space-y-6">
      {/* Min/Max Ratings */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Minimum Rating</Label>
          <Input
            type="number"
            value={scale.min_rating}
            onChange={(e) => updateScale({ min_rating: parseInt(e.target.value) || 0 })}
          />
          <p className="text-xs text-muted-foreground">
            Lowest possible rating a player can receive
          </p>
        </div>

        <div className="space-y-2">
          <Label>Maximum Rating</Label>
          <Input
            type="number"
            value={scale.max_rating}
            onChange={(e) => updateScale({ max_rating: parseInt(e.target.value) || 100 })}
          />
          <p className="text-xs text-muted-foreground">
            Highest possible rating a player can receive
          </p>
        </div>
      </div>

      {/* Decimal Places */}
      <div className="space-y-3">
        <Label>Decimal Precision</Label>
        <RadioGroup
          value={String(scale.decimal_places)}
          onValueChange={(v) => updateScale({ decimal_places: parseInt(v) })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="0" id="dec-0" />
            <Label htmlFor="dec-0" className="font-normal cursor-pointer">
              Whole numbers (75)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="1" id="dec-1" />
            <Label htmlFor="dec-1" className="font-normal cursor-pointer">
              One decimal (75.5)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Compression Curve */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">Use Compression Curve</Label>
              <p className="text-sm text-muted-foreground">
                Apply a sigmoid curve to compress extreme ratings toward the center, 
                reducing outliers while preserving relative rankings.
              </p>
            </div>
            <Switch
              checked={scale.use_compression}
              onCheckedChange={(checked) => updateScale({ use_compression: checked })}
            />
          </div>

          {scale.use_compression && (
            <div className="mt-4 pt-4 border-t">
              <div className="h-24 rounded-lg bg-muted/50 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Compression curve visualization
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Drift Guardrail */}
      <div className="space-y-3">
        <Label>Maximum Rating Change Per Season</Label>
        <RadioGroup
          value={scale.max_drift === null ? 'no_max' : 'limited'}
          onValueChange={(v) => updateScale({ max_drift: v === 'no_max' ? null : (scale.max_drift ?? 10) })}
          className="gap-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no_max" id="drift-no-max" />
            <Label htmlFor="drift-no-max" className="font-normal cursor-pointer">
              No maximum
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="limited" id="drift-limited" />
            <Label htmlFor="drift-limited" className="font-normal cursor-pointer">
              Limit change to
            </Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={scale.max_drift ?? 10}
              disabled={scale.max_drift === null}
              onChange={(e) => updateScale({ max_drift: parseInt(e.target.value) || 1 })}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">points</span>
          </div>
        </RadioGroup>
        <p className="text-xs text-muted-foreground">
          Limits how much a player's rating can change from one season to the next. 
          Choose "No maximum" to let ratings move freely.
        </p>
      </div>

      {/* Preview */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm font-medium mb-2">Rating Scale Preview</p>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 rounded-full bg-gradient-to-r from-destructive via-warning via-50% to-success overflow-hidden relative">
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-foreground"
              style={{ left: '25%' }}
            />
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-foreground"
              style={{ left: '50%' }}
            />
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-foreground"
              style={{ left: '75%' }}
            />
          </div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{scale.min_rating}</span>
          <span>{Math.round((scale.min_rating + scale.max_rating) / 2)}</span>
          <span>{scale.max_rating}</span>
        </div>
      </div>
    </div>
  );
}
