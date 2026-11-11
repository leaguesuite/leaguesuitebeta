import { useState, useCallback, useMemo } from 'react';
import { EagleRatingsConfig, DivisionMapping, DivisionOrder } from '@/ratings-engine/types/eagleRatings';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUp, Check, AlertCircle, BarChart3, Link2, Plus, Unlink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockSeasons } from '@/ratings-engine/data/mockData';

interface Props {
  config: EagleRatingsConfig;
  updateConfig: (updates: Partial<EagleRatingsConfig>) => void;
}

function parseCSV(text: string): Record<string, unknown>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must have at least a header and one data row');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data: Record<string, unknown>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, unknown> = {};
    headers.forEach((header, idx) => {
      const value = values[idx] || '';
      const numValue = parseFloat(value);
      row[header] = isNaN(numValue) ? value : numValue;
    });
    data.push(row);
  }
  return data;
}

const statColumnsByType: Record<string, string[]> = {
  quarterback: ['completions', 'attempts', 'passing_yards', 'passing_tds', 'interceptions', 'qb_rating', 'rushing_yards', 'rushing_tds'],
  offensive: ['receptions', 'receiving_yards', 'receiving_tds', 'targets', 'rushing_yards', 'rushing_tds', 'rushes', 'fumbles'],
  defensive: ['tackles', 'sacks', 'interceptions', 'passes_defended', 'forced_fumbles', 'fumble_recoveries', 'tfl'],
};

// Try to find a division column in the CSV
const DIVISION_COLUMN_CANDIDATES = ['division', 'Division', 'DIVISION', 'div', 'Div', 'division_name', 'Division_Name'];

function findDivisionColumn(data: Record<string, unknown>[]): string | null {
  if (data.length === 0) return null;
  const keys = Object.keys(data[0]);
  return DIVISION_COLUMN_CANDIDATES.find(c => keys.includes(c))
    || keys.find(k => k.toLowerCase().includes('division') || k.toLowerCase().includes('div'))
    || null;
}

function extractDivisions(data: Record<string, unknown>[], divColumn: string): DivisionMapping[] {
  const counts = new Map<string, number>();
  for (const row of data) {
    const val = String(row[divColumn] || '').trim();
    if (val) counts.set(val, (counts.get(val) || 0) + 1);
  }
  return Array.from(counts.entries()).map(([name, count]) => ({
    csvDivision: name,
    mappedDivisionId: null,
    playerCount: count,
  }));
}

export function EagleStatsUploadStep({ config, updateConfig }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<Record<string, unknown>[] | null>(
    config.currentSeasonStats || null
  );
  const [divisionMappings, setDivisionMappings] = useState<DivisionMapping[]>(
    config.divisionMappings || []
  );
  const [divColumn, setDivColumn] = useState<string | null>(null);

  const currentSeason = mockSeasons.find(s => s.id === config.seasonId);
  const expectedStats = statColumnsByType[config.ratingType] || [];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleFile = useCallback((file: File) => {
    setUploadError(null);
    if (!file.name.endsWith('.csv')) {
      setUploadError('Please upload a CSV file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        setCsvData(data);
        updateConfig({ currentSeasonStats: data });

        // Auto-detect divisions
        const col = findDivisionColumn(data);
        setDivColumn(col);
        if (col) {
          const detected = extractDivisions(data, col);
          // Auto-map exact name matches
          const autoMapped = detected.map(d => {
            const match = config.divisions.find(
              div => div.name.toLowerCase() === d.csvDivision.toLowerCase()
            );
            return { ...d, mappedDivisionId: match?.id || null };
          });
          setDivisionMappings(autoMapped);
          updateConfig({ divisionMappings: autoMapped });
        }
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Failed to parse CSV');
      }
    };
    reader.readAsText(file);
  }, [updateConfig, config.divisions]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleMapDivision = (csvDivision: string, wizardDivisionId: string) => {
    const updated = divisionMappings.map(m =>
      m.csvDivision === csvDivision ? { ...m, mappedDivisionId: wizardDivisionId } : m
    );
    setDivisionMappings(updated);
    updateConfig({ divisionMappings: updated });
  };

  const handleAddAsNewDivision = (csvDivision: string) => {
    const newDiv: DivisionOrder = {
      id: `div-csv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: csvDivision,
      order: config.divisions.length,
      ratingRange: { min: config.globalRatingRange.min, max: config.globalRatingRange.max },
    };
    const newDivisions = [...config.divisions, newDiv];
    const updated = divisionMappings.map(m =>
      m.csvDivision === csvDivision ? { ...m, mappedDivisionId: newDiv.id } : m
    );
    setDivisionMappings(updated);
    updateConfig({ divisions: newDivisions, divisionMappings: updated });
  };

  const presentColumns = csvData && csvData.length > 0
    ? expectedStats.filter(col => col in csvData[0])
    : [];
  const missingColumns = csvData && csvData.length > 0
    ? expectedStats.filter(col => !(col in csvData[0]))
    : [];

  const mappedCount = divisionMappings.filter(m => m.mappedDivisionId).length;
  const unmappedCount = divisionMappings.length - mappedCount;

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Current Season Stats</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a CSV containing all player stats for <span className="font-medium text-foreground">{currentSeason?.name || 'the current season'}</span>.
        </p>
      </div>

      {/* Expected columns info */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-medium mb-2">
          Expected stat columns for {config.ratingType} ratings:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {expectedStats.map(col => (
            <code key={col} className={cn(
              'text-xs px-2 py-0.5 rounded',
              csvData && csvData.length > 0
                ? presentColumns.includes(col)
                  ? 'bg-primary/10 text-primary'
                  : 'bg-destructive/10 text-destructive'
                : 'bg-muted text-muted-foreground'
            )}>
              {col}
            </code>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Also include: <code className="bg-muted px-1 rounded">player_id</code>, <code className="bg-muted px-1 rounded">player_name</code>, <code className="bg-muted px-1 rounded">games_played</code>, <code className="bg-muted px-1 rounded">division</code>
        </p>
      </div>

      {/* Upload area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          uploadError && 'border-destructive'
        )}
      >
        <FileUp className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Drag and drop your season stats CSV, or
        </p>
        <label className="mt-2 inline-block">
          <input type="file" accept=".csv" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} className="sr-only" />
          <Button variant="outline" size="sm" className="cursor-pointer" asChild>
            <span>Browse Files</span>
          </Button>
        </label>
        {uploadError && (
          <p className="mt-2 flex items-center justify-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {uploadError}
          </p>
        )}
      </div>

      {/* Upload success & preview */}
      {csvData && csvData.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-primary">
              <Check className="h-4 w-4" />
              <span className="font-medium">{csvData.length} player records loaded</span>
            </div>
            {missingColumns.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                {missingColumns.length} expected column{missingColumns.length > 1 ? 's' : ''} missing
              </div>
            )}
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {Object.keys(csvData[0]).slice(0, 8).map(key => (
                    <th key={key} className="px-3 py-2 text-left font-medium">{key}</th>
                  ))}
                  {Object.keys(csvData[0]).length > 8 && (
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      +{Object.keys(csvData[0]).length - 8} more
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {csvData.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-t">
                    {Object.values(row).slice(0, 8).map((val, j) => (
                      <td key={j} className="px-3 py-2 text-muted-foreground">{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5" />
            Showing first 5 of {csvData.length} rows · {Object.keys(csvData[0]).length} columns detected
          </div>
        </div>
      )}

      {/* Division Mapping */}
      {csvData && divisionMappings.length > 0 && (
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              <Label className="text-base font-medium">Division Mapping</Label>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {divColumn
                ? <>Found <span className="font-medium text-foreground">{divisionMappings.length}</span> unique divisions in the <code className="bg-muted px-1 rounded text-xs">{divColumn}</code> column. Map each to a wizard division or add as new.</>
                : 'No division column detected in CSV.'}
            </p>
          </div>

          {/* Summary badge */}
          <div className="flex gap-3">
            <span className={cn(
              'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium',
              mappedCount === divisionMappings.length
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
            )}>
              <Check className="h-3 w-3" />
              {mappedCount} mapped
            </span>
            {unmappedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-destructive/10 text-destructive">
                <Unlink className="h-3 w-3" />
                {unmappedCount} unmapped
              </span>
            )}
          </div>

          {/* Mapping rows */}
          <div className="rounded-lg border divide-y">
            {divisionMappings.map((mapping) => {
              const isMapped = !!mapping.mappedDivisionId;
              const mappedDiv = config.divisions.find(d => d.id === mapping.mappedDivisionId);

              return (
                <div key={mapping.csvDivision} className="flex items-center gap-3 p-3">
                  {/* CSV division name */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{mapping.csvDivision}</div>
                    <div className="text-xs text-muted-foreground">{mapping.playerCount} player{mapping.playerCount !== 1 ? 's' : ''}</div>
                  </div>

                  {/* Arrow */}
                  <div className="text-muted-foreground text-xs">→</div>

                  {/* Mapping selector */}
                  <div className="flex items-center gap-2 flex-1">
                    <Select
                      value={mapping.mappedDivisionId || ''}
                      onValueChange={(val) => handleMapDivision(mapping.csvDivision, val)}
                    >
                      <SelectTrigger className={cn(
                        'w-full',
                        !isMapped && 'border-destructive/50'
                      )}>
                        <SelectValue placeholder="Select division..." />
                      </SelectTrigger>
                      <SelectContent>
                        {config.divisions.map(div => (
                          <SelectItem key={div.id} value={div.id}>
                            {div.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {!isMapped && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddAsNewDivision(mapping.csvDivision)}
                        className="shrink-0 gap-1 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add New
                      </Button>
                    )}
                  </div>

                  {/* Status indicator */}
                  {isMapped && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
