import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, FileUp, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';

interface DataSourceStepProps {
  dataSource: 'internal' | 'csv';
  onDataSourceChange: (source: 'internal' | 'csv') => void;
  onCSVUpload: (data: Record<string, unknown>[]) => void;
  csvData?: Record<string, unknown>[];
}

export function DataSourceStep({ 
  dataSource, 
  onDataSourceChange, 
  onCSVUpload,
  csvData 
}: DataSourceStepProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const parseCSV = (text: string): Record<string, unknown>[] => {
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
  };

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
        onCSVUpload(data);
        onDataSourceChange('csv');
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Failed to parse CSV');
      }
    };
    reader.readAsText(file);
  }, [onCSVUpload, onDataSourceChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <RadioGroup value={dataSource} onValueChange={(v) => onDataSourceChange(v as 'internal' | 'csv')}>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Internal Data Source */}
          <Label htmlFor="internal" className="cursor-pointer">
            <Card className={cn(
              'transition-all hover:border-primary/50',
              dataSource === 'internal' && 'border-primary ring-2 ring-primary/20'
            )}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <RadioGroupItem value="internal" id="internal" className="mt-1" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      <span className="font-medium">Use League Suite Stats</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pull player data directly from your internal season_players and player_stats tables. 
                      Recommended for most use cases.
                    </p>
                    <div className="flex items-center gap-1 text-xs text-success">
                      <Check className="h-3 w-3" />
                      <span>Auto-synced with latest data</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Label>

          {/* CSV Upload */}
          <Label htmlFor="csv" className="cursor-pointer">
            <Card className={cn(
              'transition-all hover:border-primary/50',
              dataSource === 'csv' && 'border-primary ring-2 ring-primary/20'
            )}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <RadioGroupItem value="csv" id="csv" className="mt-1" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileUp className="h-5 w-5 text-primary" />
                      <span className="font-medium">Upload CSV</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Import player stats from an external CSV file. 
                      Useful for importing historical data or external sources.
                    </p>
                    {csvData && (
                      <div className="flex items-center gap-1 text-xs text-success">
                        <Check className="h-3 w-3" />
                        <span>{csvData.length} rows loaded</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Label>
        </div>
      </RadioGroup>

      {/* CSV Upload Area */}
      {dataSource === 'csv' && (
        <div className="space-y-4">
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
              Drag and drop your CSV file here, or
            </p>
            <label className="mt-2 inline-block">
              <input
                type="file"
                accept=".csv"
                onChange={handleInputChange}
                className="sr-only"
              />
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

          {/* Preview first few rows */}
          {csvData && csvData.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Preview (first 5 rows)</p>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      {Object.keys(csvData[0]).slice(0, 8).map((key) => (
                        <th key={key} className="px-3 py-2 text-left font-medium">
                          {key}
                        </th>
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
                          <td key={j} className="px-3 py-2 text-muted-foreground">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
