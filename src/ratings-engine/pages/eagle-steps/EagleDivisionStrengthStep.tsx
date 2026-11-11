import { useState } from 'react';
import { EagleRatingsConfig, DivisionOrder } from '@/ratings-engine/types/eagleRatings';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, Equal, ArrowUpDown, Plus, Trash2, X } from 'lucide-react';

interface Props {
  config: EagleRatingsConfig;
  updateConfig: (updates: Partial<EagleRatingsConfig>) => void;
}

export function EagleDivisionStrengthStep({ config, updateConfig }: Props) {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDivisionName, setNewDivisionName] = useState('');

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newDivisions = [...config.divisions];
    const draggedDivision = newDivisions[draggedItem];
    newDivisions.splice(draggedItem, 1);
    newDivisions.splice(index, 0, draggedDivision);

    const reorderedDivisions = newDivisions.map((d, i) => ({ ...d, order: i }));
    updateConfig({ divisions: reorderedDivisions });
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleAddDivision = () => {
    const trimmed = newDivisionName.trim();
    if (!trimmed) return;
    if (config.divisions.some(d => d.name.toLowerCase() === trimmed.toLowerCase())) return;

    const newDivision: DivisionOrder = {
      id: `div-custom-${Date.now()}`,
      name: trimmed,
      order: config.divisions.length,
      ratingRange: { min: 60, max: 90 },
    };

    updateConfig({ divisions: [...config.divisions, newDivision] });
    setNewDivisionName('');
    setShowAddForm(false);
  };

  const handleRemoveDivision = (divisionId: string) => {
    const filtered = config.divisions
      .filter(d => d.id !== divisionId)
      .map((d, i) => ({ ...d, order: i }));
    updateConfig({ divisions: filtered });
  };

  return (
    <div className="space-y-8">
      {/* Weighting Mode Selection */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Division Strength Mode</Label>
        <RadioGroup
          value={config.useWeightedDivisions ? 'weighted' : 'equal'}
          onValueChange={(value) => updateConfig({ useWeightedDivisions: value === 'weighted' })}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div>
            <RadioGroupItem value="equal" id="equal" className="peer sr-only" />
            <Label
              htmlFor="equal"
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
            >
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Equal className="h-6 w-6" />
              </div>
              <div className="text-center">
                <div className="font-medium">Equal Weight</div>
                <div className="text-sm text-muted-foreground">
                  All divisions use the same rating scale
                </div>
              </div>
            </Label>
          </div>

          <div>
            <RadioGroupItem value="weighted" id="weighted" className="peer sr-only" />
            <Label
              htmlFor="weighted"
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
            >
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <ArrowUpDown className="h-6 w-6" />
              </div>
              <div className="text-center">
                <div className="font-medium">Weighted</div>
                <div className="text-sm text-muted-foreground">
                  Different rating scales per division tier
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Division List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Divisions</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {config.useWeightedDivisions
                ? 'Drag to reorder divisions from highest to lowest strength'
                : 'Manage the divisions included in this rating run'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Division
          </Button>
        </div>

        {/* Add Division Form */}
        {showAddForm && (
          <div className="flex items-center gap-2 p-3 rounded-lg border border-primary/30 bg-primary/5">
            <Input
              placeholder="Division name..."
              value={newDivisionName}
              onChange={(e) => setNewDivisionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddDivision()}
              className="flex-1"
              autoFocus
            />
            <Button size="sm" onClick={handleAddDivision} disabled={!newDivisionName.trim()}>
              Add
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowAddForm(false); setNewDivisionName(''); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Card>
          <CardContent className="p-2">
            <div className="space-y-2">
              {config.divisions
                .sort((a, b) => a.order - b.order)
                .map((division, index) => (
                  <div
                    key={division.id}
                    draggable={config.useWeightedDivisions}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 p-3 rounded-lg border bg-card transition-all ${
                      config.useWeightedDivisions ? 'cursor-move' : ''
                    } ${
                      draggedItem === index
                        ? 'opacity-50 border-primary'
                        : 'hover:border-muted-foreground/30'
                    }`}
                  >
                    {config.useWeightedDivisions && (
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{division.name}</div>
                      {config.useWeightedDivisions && (
                        <div className="text-sm text-muted-foreground">
                          Rank #{index + 1} - {index === 0 ? 'Highest' : index === config.divisions.length - 1 ? 'Lowest' : 'Middle'} tier
                        </div>
                      )}
                    </div>
                    {config.useWeightedDivisions && (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {index + 1}
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveDivision(division.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              {config.divisions.length === 0 && (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  No divisions added. Click "Add Division" to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          {config.divisions.length} division{config.divisions.length !== 1 ? 's' : ''} configured
        </p>
      </div>
    </div>
  );
}
