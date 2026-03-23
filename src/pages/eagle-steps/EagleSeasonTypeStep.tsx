import { EagleRatingsConfig, EagleRatingType } from '@/types/eagleRatings';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Target, Shield, Crosshair } from 'lucide-react';

interface Props {
  config: EagleRatingsConfig;
  updateConfig: (updates: Partial<EagleRatingsConfig>) => void;
  seasons: { id: string; name: string; active: boolean }[];
}

const ratingTypes: { value: EagleRatingType; label: string; description: string; icon: typeof Target }[] = [
  {
    value: 'quarterback',
    label: 'Quarterback',
    description: 'Passing efficiency, decision making, and leadership',
    icon: Crosshair,
  },
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
];

export function EagleSeasonTypeStep({ config, updateConfig, seasons }: Props) {
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
        <Label className="text-base font-medium">Rating Type</Label>
        <RadioGroup
          value={config.ratingType}
          onValueChange={(value) => updateConfig({ ratingType: value as EagleRatingType })}
          className="grid gap-4"
        >
          {ratingTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div key={type.value}>
                <RadioGroupItem
                  value={type.value}
                  id={type.value}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={type.value}
                  className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                >
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-muted-foreground">{type.description}</div>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>
    </div>
  );
}
