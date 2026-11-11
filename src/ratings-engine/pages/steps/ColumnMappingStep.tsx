import { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, AlertTriangle } from 'lucide-react';

interface ColumnMappingStepProps {
  dataSource: 'internal' | 'csv';
  csvData?: Record<string, unknown>[];
  columnMapping: Record<string, string>;
  onMappingChange: (mapping: Record<string, string>) => void;
}

const CANONICAL_FIELDS = [
  { key: 'player_identifier', label: 'Player Identifier', required: true, category: 'identity' },
  { key: 'division', label: 'Division', required: true, category: 'identity' },
  { key: 'team', label: 'Team', required: false, category: 'identity' },
  { key: 'games_played', label: 'Games Played', required: true, category: 'general' },
  // Offense
  { key: 'receptions', label: 'Receptions', required: false, category: 'offense' },
  { key: 'receiving_yards', label: 'Receiving Yards', required: false, category: 'offense' },
  { key: 'receiving_touchdowns', label: 'Receiving TDs', required: false, category: 'offense' },
  { key: 'targets', label: 'Targets', required: false, category: 'offense' },
  { key: 'catch_rate', label: 'Catch Rate %', required: false, category: 'offense' },
  { key: 'drops', label: 'Drops', required: false, category: 'offense' },
  { key: 'yards_after_catch', label: 'Yards After Catch', required: false, category: 'offense' },
  { key: 'rushes', label: 'Rushes', required: false, category: 'offense' },
  { key: 'rushing_yards', label: 'Rushing Yards', required: false, category: 'offense' },
  { key: 'rushing_touchdowns', label: 'Rushing TDs', required: false, category: 'offense' },
  // Defense
  { key: 'flags_pulled', label: 'Flags Pulled', required: false, category: 'defense' },
  { key: 'interceptions', label: 'Interceptions', required: false, category: 'defense' },
  { key: 'pass_deflections', label: 'Pass Deflections', required: false, category: 'defense' },
  { key: 'sacks', label: 'Sacks', required: false, category: 'defense' },
  { key: 'defensive_touchdowns', label: 'Defensive TDs', required: false, category: 'defense' },
  // QB
  { key: 'pass_attempts', label: 'Pass Attempts', required: false, category: 'qb' },
  { key: 'pass_completions', label: 'Completions', required: false, category: 'qb' },
  { key: 'passing_yards', label: 'Passing Yards', required: false, category: 'qb' },
  { key: 'passing_touchdowns', label: 'Passing TDs', required: false, category: 'qb' },
  { key: 'interceptions_thrown', label: 'INTs Thrown', required: false, category: 'qb' },
  { key: 'completion_pct', label: 'Completion %', required: false, category: 'qb' },
  // Team
  { key: 'team_wins', label: 'Team Wins', required: false, category: 'team' },
  { key: 'team_losses', label: 'Team Losses', required: false, category: 'team' },
  { key: 'team_ties', label: 'Team Ties', required: false, category: 'team' },
  { key: 'team_win_pct', label: 'Team Win %', required: false, category: 'team' },
  { key: 'points_for', label: 'Points For', required: false, category: 'team' },
  { key: 'points_against', label: 'Points Against', required: false, category: 'team' },
  { key: 'point_differential', label: 'Point Differential', required: false, category: 'team' },
];

export function ColumnMappingStep({ 
  dataSource, 
  csvData, 
  columnMapping, 
  onMappingChange 
}: ColumnMappingStepProps) {
  const availableColumns = useMemo(() => {
    if (dataSource === 'internal') {
      // For internal data, auto-map to known column names
      return CANONICAL_FIELDS.map(f => f.key);
    }
    if (csvData && csvData.length > 0) {
      return Object.keys(csvData[0]);
    }
    return [];
  }, [dataSource, csvData]);

  const handleMappingChange = (canonicalKey: string, sourceColumn: string) => {
    const newMapping = { ...effectiveMapping };
    if (sourceColumn === '_unmapped') {
      delete newMapping[canonicalKey];
    } else {
      newMapping[canonicalKey] = sourceColumn;
    }
    onMappingChange(newMapping);
  };

  // Auto-detect mappings based on similar names
  const suggestedMapping = useMemo(() => {
    if (dataSource === 'internal') {
      // Auto-map for internal data
      const mapping: Record<string, string> = {};
      CANONICAL_FIELDS.forEach(f => {
        mapping[f.key] = f.key;
      });
      return mapping;
    }
    
    const suggestions: Record<string, string> = {};
    availableColumns.forEach(col => {
      const colLower = col.toLowerCase().replace(/[_\s-]/g, '');
      CANONICAL_FIELDS.forEach(field => {
        const fieldLower = field.key.replace(/_/g, '');
        if (colLower.includes(fieldLower) || fieldLower.includes(colLower)) {
          if (!suggestions[field.key]) {
            suggestions[field.key] = col;
          }
        }
      });
    });
    return suggestions;
  }, [dataSource, availableColumns]);

  // Use suggested mapping if no mapping exists
  const effectiveMapping = Object.keys(columnMapping).length > 0 ? columnMapping : suggestedMapping;

  const missingRequired = CANONICAL_FIELDS
    .filter(f => f.required && !effectiveMapping[f.key])
    .map(f => f.label);

  const groupedFields = {
    identity: CANONICAL_FIELDS.filter(f => f.category === 'identity'),
    general: CANONICAL_FIELDS.filter(f => f.category === 'general'),
    offense: CANONICAL_FIELDS.filter(f => f.category === 'offense'),
    defense: CANONICAL_FIELDS.filter(f => f.category === 'defense'),
    qb: CANONICAL_FIELDS.filter(f => f.category === 'qb'),
    team: CANONICAL_FIELDS.filter(f => f.category === 'team'),
  };
  const labelFor = (col: string) =>
    dataSource === 'internal' ? CANONICAL_FIELDS.find(f => f.key === col)?.label ?? col : col;

  return (
    <div className="space-y-6">
      {missingRequired.length > 0 && (
        <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <p className="font-medium text-warning">Missing required mappings</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please map: {missingRequired.join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {dataSource === 'internal' && (
        <div className="rounded-lg border border-success/20 bg-success/5 p-4">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-success mt-0.5" />
            <div>
              <p className="font-medium text-success">Auto-mapped to internal schema</p>
              <p className="text-sm text-muted-foreground mt-1">
                Fields are pre-mapped to League Suite data. Change or unmap any field below.
              </p>
            </div>
          </div>
        </div>
      )}

      {Object.entries(groupedFields).map(([category, fields]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-sm font-medium capitalize">{category === 'qb' ? 'QB' : category} Fields</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(field => (
              <div key={field.key} className="space-y-2">
                <Label className="flex items-center gap-2">
                  {field.label}
                  {field.required && (
                    <span className="text-xs text-destructive">*</span>
                  )}
                </Label>
                <Select
                  value={effectiveMapping[field.key] || '_unmapped'}
                  onValueChange={(v) => handleMappingChange(field.key, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_unmapped">— Not mapped —</SelectItem>
                    {availableColumns.map(col => (
                      <SelectItem key={col} value={col}>
                        {labelFor(col)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
