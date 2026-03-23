import { useState } from 'react';
import { EagleRatingsConfig } from '@/types/eagleRatings';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { GripVertical, Equal, ArrowUpDown } from 'lucide-react';

interface Props {
  config: EagleRatingsConfig;
  updateConfig: (updates: Partial<EagleRatingsConfig>) => void;
}

export function EagleDivisionStrengthStep({ config, updateConfig }: Props) {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

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

  return (
    <div className="space-y-8">
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

      {config.useWeightedDivisions && (
        <div className="space-y-3">
          <div>
            <Label className="text-base font-medium">Division Order</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Drag to reorder divisions from highest to lowest strength
            </p>
          </div>

          <Card>
            <CardContent className="p-2">
              <div className="space-y-2">
                {config.divisions
                  .sort((a, b) => a.order - b.order)
                  .map((division, index) => (
                    <div
                      key={division.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-3 p-3 rounded-lg border bg-card cursor-move transition-all ${
                        draggedItem === index
                          ? 'opacity-50 border-primary'
                          : 'hover:border-muted-foreground/30'
                      }`}
                    >
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{division.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Rank #{index + 1} - {index === 0 ? 'Highest' : index === config.divisions.length - 1 ? 'Lowest' : 'Middle'} tier
                        </div>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {index + 1}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
