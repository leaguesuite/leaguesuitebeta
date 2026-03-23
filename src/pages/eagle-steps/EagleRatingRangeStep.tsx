import { EagleRatingsConfig } from '@/types/eagleRatings';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  config: EagleRatingsConfig;
  updateConfig: (updates: Partial<EagleRatingsConfig>) => void;
}

export function EagleRatingRangeStep({ config, updateConfig }: Props) {
  const handleGlobalRangeChange = (values: number[]) => {
    updateConfig({
      globalRatingRange: { min: values[0], max: values[1] },
    });
  };

  const handleDivisionRangeChange = (divisionId: string, values: number[]) => {
    const updatedDivisions = config.divisions.map((d) =>
      d.id === divisionId ? { ...d, ratingRange: { min: values[0], max: values[1] } } : d
    );
    updateConfig({ divisions: updatedDivisions });
  };

  if (config.useWeightedDivisions) {
    const sortedDivisions = [...config.divisions].sort((a, b) => a.order - b.order);

    return (
      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">Rating Ranges by Division</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Set the expected rating range for each division tier
          </p>
        </div>

        <div className="space-y-4">
          {sortedDivisions.map((division, index) => (
            <Card key={division.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">{division.name}</Label>
                      <p className="text-xs text-muted-foreground">
                        Tier {index + 1} of {sortedDivisions.length}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-primary">
                        {division.ratingRange.min} - {division.ratingRange.max}
                      </span>
                    </div>
                  </div>

                  <Slider
                    value={[division.ratingRange.min, division.ratingRange.max]}
                    onValueChange={(values) => handleDivisionRangeChange(division.id, values)}
                    min={50}
                    max={100}
                    step={1}
                    className="mt-2"
                  />

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>50</span>
                    <span>75</span>
                    <span>100</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Expected Rating Range</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Set the minimum and maximum expected ratings for all players
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Rating Range</Label>
              <div className="text-right">
                <span className="text-2xl font-semibold text-primary">
                  {config.globalRatingRange.min} - {config.globalRatingRange.max}
                </span>
              </div>
            </div>

            <Slider
              value={[config.globalRatingRange.min, config.globalRatingRange.max]}
              onValueChange={handleGlobalRangeChange}
              min={50}
              max={100}
              step={1}
            />

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>50 (Min)</span>
              <span>75</span>
              <span>100 (Max)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
