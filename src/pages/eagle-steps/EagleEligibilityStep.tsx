import { EagleRatingsConfig } from '@/types/eagleRatings';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Shield, Crosshair, Footprints } from 'lucide-react';

interface Props {
  config: EagleRatingsConfig;
  updateConfig: (updates: Partial<EagleRatingsConfig>) => void;
}

export function EagleEligibilityStep({ config, updateConfig }: Props) {
  const isQB = config.ratingType === 'quarterback';
  const isOffensive = config.ratingType === 'offensive';
  const isDefensive = config.ratingType === 'defensive';
  const showRushingToggle = isQB || isOffensive;

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Eligibility Requirements</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Set minimum thresholds for players to be included in ratings
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" />
              Minimum Games Played
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min={0}
                max={20}
                value={config.minGamesPlayed}
                onChange={(e) => updateConfig({ minGamesPlayed: parseInt(e.target.value) || 0 })}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">games required</span>
            </div>
          </CardContent>
        </Card>

        {isQB && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Crosshair className="h-4 w-4 text-primary" />
                Minimum Pass Attempts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min={0}
                  max={500}
                  value={config.minAttempts}
                  onChange={(e) => updateConfig({ minAttempts: parseInt(e.target.value) || 0 })}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">pass attempts required</span>
              </div>
            </CardContent>
          </Card>
        )}

        {isOffensive && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-primary" />
                Minimum Offensive Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min={0}
                  max={200}
                  value={config.minOffensiveStats}
                  onChange={(e) => updateConfig({ minOffensiveStats: parseInt(e.target.value) || 0 })}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  total offensive stats (receptions, targets, etc.)
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {isDefensive && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary" />
                Minimum Defensive Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min={0}
                  max={200}
                  value={config.minDefensiveStats}
                  onChange={(e) => updateConfig({ minDefensiveStats: parseInt(e.target.value) || 0 })}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  total defensive stats (flags, INTs, etc.)
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {showRushingToggle && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Footprints className="h-4 w-4 text-primary" />
                Rushing Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="rushing-toggle">Include Rushing Statistics</Label>
                  <p className="text-sm text-muted-foreground">
                    Factor in rushing yards and touchdowns in the rating calculation
                  </p>
                </div>
                <Switch
                  id="rushing-toggle"
                  checked={config.includeRushingStats}
                  onCheckedChange={(checked) => updateConfig({ includeRushingStats: checked })}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
