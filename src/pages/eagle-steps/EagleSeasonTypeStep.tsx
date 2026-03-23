import { EagleRatingsConfig, EagleRatingType } from '@/types/eagleRatings';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Target, Shield, Crosshair } from 'lucide-react';

interface Props {
  config: EagleRatingsConfig;
  updateConfig: (updates: Partial<EagleRatingsConfig>) => void;
  seasons: { id: string; name: string; active: boolean }[];
}

const ratingTypes: { value: EagleRatingType; label: string; description: string; icon: typeof Target }[] = [
  {
    value: 'offensive',
    label: 'Offensive',
    description: 'Receiving, route running, and scoring ability',
    icon: Target,
  },
  {
    value: 'defensive',
    label: 'Defensive',
    description: 'Coverage, flag pulling, and playmaking',
    icon: Shield,
  },
  {
    value: 'quarterback',
    label: 'Quarterback',
    description: 'Passing efficiency, decision making, and leadership',
    icon: Crosshair,
  },
];

export function EagleSeasonTypeStep({ config, updateConfig, seasons }: Props) {
  const toggleRatingType = (type: EagleRatingType) => {
    const current = config.ratingTypes;
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    updateConfig({ ratingTypes: updated });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Label className="text-base font-medium">Select Season</Label>
        <Select
          value={config.seasonId}
          onValueChange={(value) => updateConfig({ seasonId: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a season..." />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((season) => (
              <SelectItem key={season.id} value={season.id}>
                {season.name} {season.active && '(Active)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-medium">Rating Types to Run</Label>
        <p className="text-sm text-muted-foreground">Select one or more rating types to generate in this run.</p>
        <div className="grid gap-3">
          {ratingTypes.map((type) => {
            const Icon = type.icon;
            const checked = config.ratingTypes.includes(type.value);
            return (
              <label
                key={type.value}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 ${
                  checked ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleRatingType(type.value)}
                />
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm text-muted-foreground">{type.description}</div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
