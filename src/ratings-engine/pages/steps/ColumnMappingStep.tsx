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
import { Switch } from '@/components/ui/switch';

const EXCLUDED = '_excluded';

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
    if (sourceColumn === '_unmapped' && newMapping[canonicalKey] !== EXCLUDED) {
      delete newMapping[canonicalKey];
    } else {
      newMapping[canonicalKey] = sourceColumn;
    }
    onMappingChange(newMapping);
  };

  const setIncluded = (canonicalKey: string, included: boolean) => {
    const newMapping = { ...effectiveMapping };
    if (included) {
      const suggested = suggestedMapping[canonicalKey];
      if (suggested) newMapping[canonicalKey] = suggested;
      else delete newMapping[canonicalKey];
    } else {
      newMapping[canonicalKey] = EXCLUDED;
    }
    onMappingChange(newMapping);
  };

  const setGroupIncluded = (keys: string[], included: boolean) => {
    const newMapping = { ...effectiveMapping };
    keys.forEach(k => {
      if (included) {
        if (suggestedMapping[k]) newMapping[k] = suggestedMapping[k];
        else delete newMapping[k];
      } else newMapping[k] = EXCLUDED;
    });
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

  const isExcluded = (key: string) => effectiveMapping[key] === EXCLUDED;
  const yardKeys = CANONICAL_FIELDS.filter(f => !f.required && /yards/.test(f.key)).map(f => f.key);
  const excludedCount = CANONICAL_FIELDS.filter(f => isExcluded(f.key)).length;

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

      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3 text-sm">
        <span className="text-muted-foreground">
          Turn off any stat your league doesn't track. Excluded: <span className="font-medium text-foreground">{excludedCount}</span>
        </span>
        <div className="ml-auto flex gap-2">
          <button type="button" className="rounded-md border px-2.5 py-1 text-xs hover:bg-secondary"
            onClick={() => setGroupIncluded(yardKeys, yardKeys.some(k => isExcluded(k)))}>
            {yardKeys.every(k => isExcluded(k)) ? 'Include all yards' : 'Exclude all yards'}
          </button>
        </div>
      </div>

      {Object.entries(groupedFields).map(([category, fields]) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium capitalize">{category === 'qb' ? 'QB' : category} Fields</h3>
            {fields.some(f => !f.required) && (
              <button type="button" className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  const keys = fields.filter(f => !f.required).map(f => f.key);
                  setGroupIncluded(keys, keys.some(k => isExcluded(k)));
                }}>
                {fields.filter(f => !f.required).every(f => isExcluded(f.key)) ? 'Include all' : 'Exclude all'}
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(field => (
              <div key={field.key} className={`space-y-2 ${isExcluded(field.key) ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-2">
                  <Label className="flex items-center gap-2">
                    {field.label}
                    {field.required && (
                      <span className="text-xs text-destructive">*</span>
                    )}
                  </Label>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {field.required ? 'Required' : isExcluded(field.key) ? 'Not included' : 'Included'}
                    </span>
                    <Switch
                      checked={!isExcluded(field.key)}
                      disabled={field.required}
                      onCheckedChange={(v) => setIncluded(field.key, v)}
                      aria-label={`Include ${field.label}`}
                    />
                  </div>
                </div>
                <Select
                  disabled={isExcluded(field.key)}
                  value={isExcluded(field.key) ? '_unmapped' : effectiveMapping[field.key] || '_unmapped'}
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
