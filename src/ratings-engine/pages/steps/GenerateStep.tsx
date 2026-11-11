import { useState } from 'react';
import * as XLSX from 'xlsx';
import { RatingRunConfig, PlayerRatingResult } from '@/ratings-engine/types/ratings';
import { mockSeasonPlayers, mockPlayerStats, mockSeasons } from '@/ratings-engine/data/mockData';
import { calculateRatings } from '@/ratings-engine/services/ratingCalculator';
import { createRatingRun, saveResultsForRun } from '@/ratings-engine/services/ratingsStorage';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Download, Play, FileSpreadsheet } from 'lucide-react';

interface GenerateStepProps {
  config: RatingRunConfig;
  onDone: () => void;
}

type Phase = 'ready' | 'running' | 'done';

export function GenerateStep({ config, onDone }: GenerateStepProps) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<PlayerRatingResult[]>([]);
  const [runLabel, setRunLabel] = useState('');

  const generate = async () => {
    setPhase('running');
    setProgress(0);
    const all = calculateRatings(mockSeasonPlayers, mockPlayerStats, config);
    // Generating takes a while; show steady progress.
    for (let i = 1; i <= 40; i++) {
      await new Promise(r => setTimeout(r, 100));
      setProgress((i / 40) * 100);
    }
    const season = mockSeasons.find(s => s.active) || mockSeasons[0];
    const label = `${season.name} · ${new Date().toLocaleDateString()}`;
    const run = createRatingRun({
      tenant_id: 'tenant-1',
      season_id: season.id,
      season_name: season.name,
      version_label: label,
      status: 'completed',
      config,
      players_processed: all.filter(r => !r.excluded).length,
      players_excluded: all.filter(r => r.excluded).length,
      created_by: 'admin@league.com',
    });
    saveResultsForRun(run.id, all);
    setResults(all);
    setRunLabel(label);
    setPhase('done');
  };

  const download = () => {
    const rows = results.map(r => ({
      'Player ID': r.season_player_id,
      Player: r.player_name,
      Division: r.division_name,
      Team: r.team_name,
      OFF: r.offense_rating ?? '',
      DEF: r.defense_rating ?? '',
      QB: r.qb_rating ?? '',
      Excluded: r.excluded ? 'Yes' : 'No',
      Reason: r.exclusion_reason ?? '',
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Ratings');
    XLSX.writeFile(wb, `ratings-${runLabel.replace(/[^\w]+/g, '-')}.xlsx`);
  };

  if (phase === 'done') {
    const rated = results.filter(r => !r.excluded).length;
    return (
      <div className="py-10 text-center space-y-5">
        <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Your ratings are ready</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {rated} players rated · {results.length - rated} not rated · saved as “{runLabel}”
          </p>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Download the Excel file to review the ratings. If you want to change anything, edit
          the file and upload it in a new rating run to re-run it.
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={download} className="gap-2">
            <Download className="h-4 w-4" /> Download to Excel
          </Button>
          <Button variant="outline" onClick={onDone}>Back to Ratings</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 text-center space-y-5">
      <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <FileSpreadsheet className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">
          {phase === 'running' ? 'Generating ratings…' : 'Ready to generate'}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          {phase === 'running'
            ? 'This can take a while. Keep this page open — we’ll let you know when it’s done.'
            : `Ratings will be generated for ${mockSeasonPlayers.length} players using your settings.`}
        </p>
      </div>
      {phase === 'running' ? (
        <div className="max-w-sm mx-auto space-y-2">
          <Progress value={progress} />
          <p className="text-xs font-mono text-muted-foreground">{Math.round(progress)}%</p>
        </div>
      ) : (
        <Button size="lg" onClick={generate} className="gap-2">
          <Play className="h-4 w-4" /> Generate Ratings
        </Button>
      )}
    </div>
  );
}
