import { useState } from 'react';
import { EagleRatingsConfig, SeasonWeight } from '@/types/eagleRatings';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Lock, Plus } from 'lucide-react';
import { mockSeasons } from '@/data/eagleMockData';

const getSeasonColor = (seasonName: string): string => {
  const name = seasonName.toLowerCase();
  if (name.includes('winter')) return 'hsl(var(--primary))';
  if (name.includes('spring')) return 'hsl(142, 71%, 45%)';
  if (name.includes('summer')) return 'hsl(25, 95%, 53%)';
  if (name.includes('fall')) return 'hsl(0, 84%, 60%)';
  return 'hsl(280, 65%, 60%)';
};

interface Props {
  config: EagleRatingsConfig;
  updateConfig: (updates: Partial<EagleRatingsConfig>) => void;
}

export function EagleSeasonWeightsStep({ config, updateConfig }: Props) {
  const [pastSeasons, setPastSeasons] = useState<SeasonWeight[]>(
    config.pastSeasonWeights || []
  );
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);

  const currentSeason = mockSeasons.find((s) => s.id === config.seasonId);
  const totalPastWeight = pastSeasons.reduce((sum, s) => sum + s.weight, 0);
  const currentSeasonWeight = 100 - totalPastWeight;

  const availableSeasons = mockSeasons.filter(
    (s) => s.id !== config.seasonId && !pastSeasons.some((ps) => ps.seasonId === s.id)
  );

  const handleToggleSeason = (seasonId: string) => {
    setSelectedSeasons((prev) =>
      prev.includes(seasonId)
        ? prev.filter((id) => id !== seasonId)
        : [...prev, seasonId]
    );
  };

  const handleAddSelectedSeasons = () => {
    const newSeasons = selectedSeasons
      .map((id) => mockSeasons.find((s) => s.id === id))
      .filter(Boolean)
      .map((season) => ({
        seasonId: season!.id,
        seasonName: season!.name,
        weight: 0,
      }));

    const newPastSeasons = [...pastSeasons, ...newSeasons];
    setPastSeasons(newPastSeasons);
    updateConfig({ pastSeasonWeights: newPastSeasons });
    setSelectedSeasons([]);
  };

  const handleWeightChange = (seasonId: string, weight: number) => {
    const otherWeights = pastSeasons
      .filter((s) => s.seasonId !== seasonId)
      .reduce((sum, s) => sum + s.weight, 0);
    const maxWeight = 100 - otherWeights;
    const clampedWeight = Math.max(0, Math.min(weight, maxWeight));

    const newPastSeasons = pastSeasons.map((s) =>
      s.seasonId === seasonId ? { ...s, weight: clampedWeight } : s
    );
    setPastSeasons(newPastSeasons);
    updateConfig({ pastSeasonWeights: newPastSeasons });
  };

  const handleRemoveSeason = (seasonId: string) => {
    const newPastSeasons = pastSeasons.filter((s) => s.seasonId !== seasonId);
    setPastSeasons(newPastSeasons);
    updateConfig({ pastSeasonWeights: newPastSeasons });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Season Weighting</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Configure how much each season contributes to the final rating
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Season</TableHead>
              <TableHead className="w-[200px]">Weight</TableHead>
              <TableHead className="w-[80px] text-right">%</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="bg-primary/5">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {currentSeason?.name || 'Current Season'}
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Current
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        currentSeasonWeight < 50 ? 'bg-accent' : 'bg-primary'
                      }`}
                      style={{ width: `${currentSeasonWeight}%` }}
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <span
                    className={`text-lg font-semibold tabular-nums ${
                      currentSeasonWeight < 50 ? 'text-accent-foreground' : 'text-primary'
                    }`}
                  >
                    {currentSeasonWeight}
                  </span>
                  <span className="text-muted-foreground">%</span>
                </div>
              </TableCell>
              <TableCell>
                <Lock className="h-4 w-4 text-muted-foreground mx-auto" />
              </TableCell>
            </TableRow>

            {pastSeasons.map((season) => {
              const otherWeights = pastSeasons
                .filter((s) => s.seasonId !== season.seasonId)
                .reduce((sum, s) => sum + s.weight, 0);
              const maxWeight = 100 - otherWeights;

              return (
                <TableRow key={season.seasonId}>
                  <TableCell className="font-medium">{season.seasonName}</TableCell>
                  <TableCell>
                    <Slider
                      value={[season.weight]}
                      onValueChange={(values) => handleWeightChange(season.seasonId, values[0])}
                      min={0}
                      max={maxWeight}
                      step={1}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-lg font-semibold tabular-nums">{season.weight}</span>
                    <span className="text-muted-foreground">%</span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSeason(season.seasonId)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}

            {pastSeasons.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No past seasons added. Select seasons below to blend historical performance.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {availableSeasons.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Add Past Seasons</Label>
          <div className="rounded-lg border p-3 space-y-2">
            {availableSeasons.map((season) => (
              <div
                key={season.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                onClick={() => handleToggleSeason(season.id)}
              >
                <Checkbox
                  checked={selectedSeasons.includes(season.id)}
                  onCheckedChange={() => handleToggleSeason(season.id)}
                />
                <span className="flex-1">{season.name}</span>
              </div>
            ))}
          </div>
          {selectedSeasons.length > 0 && (
            <Button onClick={handleAddSelectedSeasons} className="gap-2">
              <Plus className="h-4 w-4" />
              Add {selectedSeasons.length} Season{selectedSeasons.length > 1 ? 's' : ''}
            </Button>
          )}
        </div>
      )}

      <div className="rounded-lg bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total Weight</span>
          <span className="text-lg font-semibold text-primary">
            {currentSeasonWeight + totalPastWeight}%
          </span>
        </div>
        <div className="mt-3 h-3 bg-muted rounded-full overflow-hidden flex">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${currentSeasonWeight}%` }}
          />
          {pastSeasons.map((season) => (
            <div
              key={season.seasonId}
              className="h-full transition-all"
              style={{
                width: `${season.weight}%`,
                backgroundColor: getSeasonColor(season.seasonName),
              }}
            />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span>{currentSeason?.name} ({currentSeasonWeight}%)</span>
          </div>
          {pastSeasons.map((season) => (
            <div key={season.seasonId} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: getSeasonColor(season.seasonName) }}
              />
              <span>{season.seasonName} ({season.weight}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
