import { EligibilityThreshold, RatingCategory, BelowThresholdBehavior } from '@/ratings-engine/types/ratings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Shield, Zap } from 'lucide-react';

interface EligibilityStepProps {
  thresholds: EligibilityThreshold[];
  onThresholdsChange: (thresholds: EligibilityThreshold[]) => void;
}

const BEHAVIOR_OPTIONS: { value: BelowThresholdBehavior; label: string; description: string }[] = [
  { value: 'keep_last', label: 'Keep Last Rating', description: "Use their previous seasons' rating" },
  { value: 'division_average', label: 'Division Average', description: 'Assign the division average rating' },
  { value: 'no_rating', label: 'No Rating', description: 'Leave rating blank (null)' },
];

const CATEGORY_CONFIG: Record<RatingCategory, { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string;
  statOptions: { value: string; label: string }[];
}> = {
  offense: {
    icon: Target,
    label: 'Offense',
    statOptions: [
      { value: 'targets', label: 'Targets' },
      { value: 'receptions', label: 'Receptions' },
      { value: 'touches', label: 'Total Touches (targets + rushes)' },
      { value: 'games_played', label: 'Games Played' },
    ],
  },
  defense: {
    icon: Shield,
    label: 'Defense',
    statOptions: [
      { value: 'games_played', label: 'Games Played' },
      { value: 'flags_pulled', label: 'Flags Pulled' },
      { value: 'defensive_snaps', label: 'Defensive Snaps' },
    ],
  },
  qb: {
    icon: Zap,
    label: 'Quarterback',
    statOptions: [
      { value: 'pass_attempts', label: 'Pass Attempts' },
      { value: 'games_played', label: 'Games Played' },
    ],
  },
};

export function EligibilityStep({ thresholds, onThresholdsChange }: EligibilityStepProps) {
  const getThreshold = (category: RatingCategory) => 
    thresholds.find(t => t.category === category);

  const updateThreshold = (category: RatingCategory, updates: Partial<EligibilityThreshold>) => {
    const existing = getThreshold(category);
    if (existing) {
      onThresholdsChange(
        thresholds.map(t => t.category === category ? { ...t, ...updates } : t)
      );
    } else {
      onThresholdsChange([
        ...thresholds,
        {
          category,
          min_value: 0,
          stat_key: CATEGORY_CONFIG[category].statOptions[0].value,
          below_behavior: 'division_average',
          ...updates,
        },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Set minimum thresholds for each rating category. Players below these thresholds 
        will be handled according to the behavior you specify.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        {(['offense', 'defense', 'qb'] as RatingCategory[]).map(category => {
          const config = CATEGORY_CONFIG[category];
          const threshold = getThreshold(category);
          const Icon = config.icon;

          return (
            <Card key={category}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-5 w-5 text-primary" />
                  {config.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Minimum Stat</Label>
                  <Select
                    value={threshold?.stat_key || config.statOptions[0].value}
                    onValueChange={(v) => updateThreshold(category, { stat_key: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {config.statOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Value</Label>
                  <Input
                    type="number"
                    min={0}
                    value={threshold?.min_value ?? 0}
                    onChange={(e) => updateThreshold(category, { 
                      min_value: parseInt(e.target.value) || 0 
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>If Below Threshold</Label>
                  <Select
                    value={threshold?.below_behavior || 'division_average'}
                    onValueChange={(v) => updateThreshold(category, { 
                      below_behavior: v as BelowThresholdBehavior 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BEHAVIOR_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div>
                            <p>{opt.label}</p>
                            <p className="text-xs text-muted-foreground">{opt.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
