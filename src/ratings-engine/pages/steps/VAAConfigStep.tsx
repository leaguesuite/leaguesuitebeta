import { VAAConfig, VARConfig, RatingCategory, VAABaseline, VARMethod } from '@/ratings-engine/types/ratings';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users } from 'lucide-react';

interface VAAConfigStepProps {
  vaaConfig: Record<RatingCategory, VAAConfig>;
  varConfig: Record<RatingCategory, VARConfig>;
  onVAAChange: (config: Record<RatingCategory, VAAConfig>) => void;
  onVARChange: (config: Record<RatingCategory, VARConfig>) => void;
}

const CATEGORIES: RatingCategory[] = ['offense', 'defense', 'qb'];

export function VAAConfigStep({ vaaConfig, varConfig, onVAAChange, onVARChange }: VAAConfigStepProps) {
  const updateVAA = (category: RatingCategory, updates: Partial<VAAConfig>) => {
    onVAAChange({
      ...vaaConfig,
      [category]: { ...vaaConfig[category], ...updates },
    });
  };

  const updateVAR = (category: RatingCategory, updates: Partial<VARConfig>) => {
    onVARChange({
      ...varConfig,
      [category]: { ...varConfig[category], ...updates },
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="vaa">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vaa" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Value Above Average (VAA)
          </TabsTrigger>
          <TabsTrigger value="var" className="gap-2">
            <Users className="h-4 w-4" />
            Value Above Replacement (WAR)
          </TabsTrigger>
        </TabsList>

        {/* VAA Tab */}
        <TabsContent value="vaa" className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            VAA measures how much better (or worse) a player performs compared to the average 
            player in their division or at their position.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            {CATEGORIES.map(category => (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base capitalize">
                    {category}
                    <Switch
                      checked={vaaConfig[category].enabled}
                      onCheckedChange={(enabled) => updateVAA(category, { enabled })}
                    />
                  </CardTitle>
                </CardHeader>
                {vaaConfig[category].enabled && (
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <Label>Baseline</Label>
                      <Select
                        value={vaaConfig[category].baseline}
                        onValueChange={(v) => updateVAA(category, { baseline: v as VAABaseline })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="division_average">Division Average</SelectItem>
                          <SelectItem value="position_average">Position Average</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium mb-2">How VAA Works</p>
            <p className="text-sm text-muted-foreground">
              A player with a rating of 85 in a division where the average is 72 would have 
              a VAA of <span className="font-mono">+13</span>. Positive VAA indicates 
              above-average performance.
            </p>
          </div>
        </TabsContent>

        {/* VAR/WAR Tab */}
        <TabsContent value="var" className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            WAR (Wins Above Replacement) estimates how many "wins" a player contributes 
            compared to a replacement-level player, factoring in playing time.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            {CATEGORIES.map(category => (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base capitalize">
                    {category}
                    <Switch
                      checked={varConfig[category].enabled}
                      onCheckedChange={(enabled) => updateVAR(category, { enabled })}
                    />
                  </CardTitle>
                </CardHeader>
                {varConfig[category].enabled && (
                  <CardContent className="pt-0 space-y-4">
                    <div className="space-y-2">
                      <Label>Replacement Level</Label>
                      <Select
                        value={varConfig[category].method}
                        onValueChange={(v) => updateVAR(category, { method: v as VARMethod })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottom_n_percent">Bottom N%</SelectItem>
                          <SelectItem value="fixed_value">Fixed Rating</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        {varConfig[category].method === 'bottom_n_percent' 
                          ? 'Percentile' 
                          : 'Rating Value'}
                      </Label>
                      <Input
                        type="number"
                        value={varConfig[category].threshold_value}
                        onChange={(e) => updateVAR(category, { 
                          threshold_value: parseFloat(e.target.value) || 0 
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Playing Time Factor</Label>
                      <Select
                        value={varConfig[category].playing_time_factor}
                        onValueChange={(v) => updateVAR(category, { 
                          playing_time_factor: v as 'games_played' | 'touches' 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="games_played">Games Played</SelectItem>
                          <SelectItem value="touches">Total Touches</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium mb-2">How WAR Works</p>
            <p className="text-sm text-muted-foreground">
              WAR combines a player's rating above replacement level with their playing time. 
              A player with a high rating but few games will have lower WAR than a 
              slightly lower-rated player who played all games.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
