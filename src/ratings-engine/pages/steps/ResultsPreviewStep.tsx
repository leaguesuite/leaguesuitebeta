import { useState, useEffect, useCallback } from 'react';
import { RatingRunConfig, PlayerRatingResult, RatingCategory } from '@/ratings-engine/types/ratings';
import { mockSeasonPlayers, mockPlayerStats } from '@/ratings-engine/data/mockData';
import { calculateRatings } from '@/ratings-engine/services/ratingCalculator';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Play, Search, AlertCircle, CheckCircle } from 'lucide-react';

interface ResultsPreviewStepProps {
  config: RatingRunConfig;
  csvData?: Record<string, unknown>[];
  isCalculating: boolean;
  progress: number;
  results?: PlayerRatingResult[];
  onCalculate: (results: PlayerRatingResult[]) => void;
  onProgressUpdate: (progress: number) => void;
  onCalculatingChange: (isCalc: boolean) => void;
}

export function ResultsPreviewStep({
  config,
  csvData,
  isCalculating,
  progress,
  results,
  onCalculate,
  onProgressUpdate,
  onCalculatingChange,
}: ResultsPreviewStepProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'excluded'>('all');

  const runCalculation = useCallback(async () => {
    onCalculatingChange(true);
    onProgressUpdate(0);

    try {
      // Simulate batch processing with progress
      const totalPlayers = mockSeasonPlayers.length;
      const batchSize = 50;
      const batches = Math.ceil(totalPlayers / batchSize);
      
      let allResults: PlayerRatingResult[] = [];

      for (let i = 0; i < batches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, totalPlayers);
        const batchPlayers = mockSeasonPlayers.slice(start, end);
        const batchStats = mockPlayerStats.filter(s => 
          batchPlayers.some(p => p.id === s.season_player_id)
        );

        // Calculate ratings for this batch
        const batchResults = calculateRatings(batchPlayers, batchStats, config);
        allResults = [...allResults, ...batchResults];

        // Update progress
        onProgressUpdate(((i + 1) / batches) * 100);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      onCalculate(allResults);
    } finally {
      onCalculatingChange(false);
    }
  }, [config, onCalculate, onProgressUpdate, onCalculatingChange]);

  const filteredResults = results?.filter(r => {
    const matchesSearch = search === '' || 
      r.player_name.toLowerCase().includes(search.toLowerCase()) ||
      r.division_name.toLowerCase().includes(search.toLowerCase()) ||
      r.team_name.toLowerCase().includes(search.toLowerCase());
    
    const matchesTab = activeTab === 'all' ? !r.excluded : r.excluded;
    
    return matchesSearch && matchesTab;
  }) ?? [];

  const excludedCount = results?.filter(r => r.excluded).length ?? 0;
  const includedCount = (results?.length ?? 0) - excludedCount;

  if (!results) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Play className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Ready to Calculate</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Click the button below to calculate ratings for all {mockSeasonPlayers.length} players 
            using your configured settings.
          </p>
          <Button onClick={runCalculation} disabled={isCalculating} size="lg" className="gap-2">
            {isCalculating ? (
              <>Calculating...</>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Calculate Ratings
              </>
            )}
          </Button>
        </div>

        {isCalculating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Processing players...</span>
              <span className="font-mono">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-success mb-1">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Rated Players</span>
          </div>
          <p className="text-2xl font-bold">{includedCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-warning mb-1">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Excluded</span>
          </div>
          <p className="text-2xl font-bold">{excludedCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <Button 
            variant="outline" 
            onClick={runCalculation} 
            disabled={isCalculating}
            className="w-full"
          >
            Recalculate
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'excluded')}>
          <TabsList>
            <TabsTrigger value="all">
              Rated ({includedCount})
            </TabsTrigger>
            <TabsTrigger value="excluded">
              Excluded ({excludedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Player</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-right">OFF</TableHead>
              <TableHead className="text-right">DEF</TableHead>
              <TableHead className="text-right">QB</TableHead>
              {activeTab === 'excluded' && <TableHead>Reason</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={activeTab === 'excluded' ? 7 : 6} className="h-24 text-center text-muted-foreground">
                  No players found.
                </TableCell>
              </TableRow>
            ) : (
              filteredResults.slice(0, 50).map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.player_name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{result.division_name}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{result.team_name}</TableCell>
                  <TableCell className="text-right font-mono">
                    {result.offense_rating?.toFixed(config.rating_scale.decimal_places) ?? '—'}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {result.defense_rating?.toFixed(config.rating_scale.decimal_places) ?? '—'}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {result.qb_rating?.toFixed(config.rating_scale.decimal_places) ?? '—'}
                  </TableCell>
                  {activeTab === 'excluded' && (
                    <TableCell className="text-sm text-muted-foreground">
                      {result.exclusion_reason}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {filteredResults.length > 50 && (
          <div className="p-4 text-center text-sm text-muted-foreground border-t">
            Showing 50 of {filteredResults.length} players
          </div>
        )}
      </div>
    </div>
  );
}
