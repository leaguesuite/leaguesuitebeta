import { useState } from 'react';
import { RatingRunConfig, PlayerRatingResult } from '@/ratings-engine/types/ratings';
import { createRatingRun, saveResultsForRun, commitRatingRun } from '@/ratings-engine/services/ratingsStorage';
import { mockSeasons } from '@/ratings-engine/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Check, AlertTriangle } from 'lucide-react';

interface CommitStepProps {
  config: RatingRunConfig;
  results?: PlayerRatingResult[];
  onCommit: () => void;
}

export function CommitStep({ config, results, onCommit }: CommitStepProps) {
  const [versionLabel, setVersionLabel] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);

  const activeSeason = mockSeasons.find(s => s.active) || mockSeasons[0];
  const includedCount = results?.filter(r => !r.excluded).length ?? 0;
  const excludedCount = results?.filter(r => r.excluded).length ?? 0;

  const handleCommit = async () => {
    if (!results || !versionLabel.trim()) return;

    setIsCommitting(true);
    try {
      // Create the rating run
      const run = createRatingRun({
        tenant_id: 'tenant-1',
        season_id: activeSeason.id,
        season_name: activeSeason.name,
        version_label: versionLabel.trim(),
        status: 'completed',
        config,
        players_processed: includedCount,
        players_excluded: excludedCount,
        created_by: 'admin@league.com',
      });

      // Save results
      saveResultsForRun(run.id, results);

      // Commit the run
      commitRatingRun(run.id);

      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));

      onCommit();
    } finally {
      setIsCommitting(false);
    }
  };

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-warning mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Results to Commit</h3>
        <p className="text-sm text-muted-foreground">
          Please go back to the Preview step and calculate ratings first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Version Label */}
      <div className="space-y-2">
        <Label htmlFor="version-label">Version Label</Label>
        <Input
          id="version-label"
          placeholder={`e.g., ${activeSeason.name} Final`}
          value={versionLabel}
          onChange={(e) => setVersionLabel(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          A descriptive name to identify this rating run
        </p>
      </div>

      <Separator />

      {/* Summary */}
      <div className="space-y-4">
        <h3 className="font-medium">Summary</h3>
        
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Season</span>
              <span className="font-medium">{activeSeason.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Players Rated</span>
              <span className="font-medium">{includedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Players Excluded</span>
              <span className="font-medium">{excludedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data Source</span>
              <span className="font-medium capitalize">{config.data_source}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium">Configuration Highlights</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Rating Scale: {config.rating_scale.min_rating} - {config.rating_scale.max_rating}</li>
              <li>• Carryover: {Math.round(config.carryover.carryover_weight * 100)}% previous / {Math.round(config.carryover.current_weight * 100)}% current</li>
              <li>• Compression: {config.rating_scale.use_compression ? 'Enabled' : 'Disabled'}</li>
              <li>• Max Drift: {config.rating_scale.max_drift === null ? 'No maximum' : `±${config.rating_scale.max_drift} points`}</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Commit Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
        <Button
          onClick={handleCommit}
          disabled={!versionLabel.trim() || isCommitting}
          size="lg"
          className="gap-2"
        >
          {isCommitting ? (
            'Committing...'
          ) : (
            <>
              <Check className="h-4 w-4" />
              Commit Ratings
            </>
          )}
        </Button>
      </div>

      <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
          <div>
            <p className="font-medium text-warning">Important</p>
            <p className="text-sm text-muted-foreground mt-1">
              Committing will update player ratings in the system. You can rollback 
              committed ratings from the dashboard if needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
