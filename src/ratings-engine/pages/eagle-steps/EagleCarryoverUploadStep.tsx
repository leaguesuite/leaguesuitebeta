import { useState, useCallback } from 'react';
import { EagleRatingsConfig } from '@/ratings-engine/types/eagleRatings';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FileUp, Check, AlertCircle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export function EagleCarryoverUploadStep({ config, updateConfig }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<Record<string, unknown>[] | null>(
    config.carryoverData || null
  );

  const pastSeasonNames = config.pastSeasonWeights
    .filter(s => s.weight > 0)
    .map(s => s.seasonName);

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
        updateConfig({ carryoverData: data });
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Failed to parse CSV');
      }
    };
    reader.readAsText(file);
  }, [updateConfig]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Carryover Ratings</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a CSV containing player ratings from the previous seasons you've selected for blending.
        </p>
      </div>

      {/* Expected seasons callout */}
      {pastSeasonNames.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium mb-2">Expected rating columns for:</p>
          <div className="flex flex-wrap gap-2">
            {pastSeasonNames.map(name => (
              <span key={name} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                {name}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            CSV should include columns: <code className="bg-muted px-1 rounded">player_id</code>, <code className="bg-muted px-1 rounded">player_name</code>, and a rating column per season.
          </p>
        </div>
      )}

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
          Drag and drop your carryover ratings CSV, or
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
          <div className="flex items-center gap-2 text-sm text-primary">
            <Check className="h-4 w-4" />
            <span className="font-medium">{csvData.length} players loaded</span>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {Object.keys(csvData[0]).slice(0, 6).map(key => (
                    <th key={key} className="px-3 py-2 text-left font-medium">{key}</th>
                  ))}
                  {Object.keys(csvData[0]).length > 6 && (
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      +{Object.keys(csvData[0]).length - 6} more
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {csvData.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-t">
                    {Object.values(row).slice(0, 6).map((val, j) => (
                      <td key={j} className="px-3 py-2 text-muted-foreground">{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            Showing first 5 of {csvData.length} rows
          </div>
        </div>
      )}
    </div>
  );
}
