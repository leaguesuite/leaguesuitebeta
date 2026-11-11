import { useState } from 'react';
import { StatConfig, RatingCategory, NormalizeMode } from '@/ratings-engine/types/ratings';
import { configPresets } from '@/ratings-engine/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';

interface StatWeightsStepProps {
  statConfigs: StatConfig[];
  onStatConfigsChange: (configs: StatConfig[]) => void;
}

const NORMALIZE_OPTIONS: { value: NormalizeMode; label: string }[] = [
  { value: 'raw', label: 'Raw Total' },
  { value: 'per_game', label: 'Per Game' },
  { value: 'per_touch', label: 'Per Touch' },
  { value: 'percentage', label: 'Percentage' },
];

export function StatWeightsStep({ statConfigs, onStatConfigsChange }: StatWeightsStepProps) {
  const [activeTab, setActiveTab] = useState<RatingCategory>('offense');

  const handleToggle = (statKey: string, enabled: boolean) => {
    onStatConfigsChange(
      statConfigs.map(s => s.stat_key === statKey ? { ...s, enabled } : s)
    );
  };

  const handleWeightChange = (statKey: string, weight: number) => {
    onStatConfigsChange(
      statConfigs.map(s => s.stat_key === statKey ? { ...s, weight } : s)
    );
  };

  const handleNormalizeModeChange = (statKey: string, normalize_mode: NormalizeMode) => {
    onStatConfigsChange(
      statConfigs.map(s => s.stat_key === statKey ? { ...s, normalize_mode } : s)
    );
  };

  const applyPreset = (presetId: string) => {
    const preset = configPresets.find(p => p.id === presetId);
    if (preset?.config.stat_configs) {
      onStatConfigsChange(preset.config.stat_configs);
    }
  };

  const getStatsByCategory = (category: RatingCategory) => 
    statConfigs.filter(s => s.category === category);

  const getTotalWeight = (category: RatingCategory) => {
    const stats = getStatsByCategory(category);
    return stats
      .filter(s => s.enabled)
      .reduce((sum, s) => sum + Math.abs(s.weight), 0);
  };

  const renderStatsList = (category: RatingCategory) => {
    const stats = getStatsByCategory(category);
    const totalWeight = getTotalWeight(category);

    return (
      <div className="space-y-4">
        {/* Weight Distribution Bar */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Weight Distribution</p>
            <div className="flex h-4 rounded-full overflow-hidden bg-muted">
              {stats
                .filter(s => s.enabled)
                .map((stat, i) => {
                  const percentage = totalWeight > 0 
                    ? (Math.abs(stat.weight) / totalWeight) * 100 
                    : 0;
                  const hue = (i * 360) / stats.filter(s => s.enabled).length;
                  return (
                    <div
                      key={stat.stat_key}
                      className="h-full transition-all"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: `hsl(${hue}, 70%, 60%)`,
                      }}
                      title={`${stat.display_name}: ${percentage.toFixed(1)}%`}
                    />
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Stats List */}
        <div className="space-y-3">
          {stats.map(stat => (
            <div 
              key={stat.stat_key}
              className="flex items-center gap-4 rounded-lg border bg-card p-4"
            >
              <Switch
                checked={stat.enabled}
                onCheckedChange={(checked) => handleToggle(stat.stat_key, checked)}
              />
              
              <div className="flex-1 min-w-0">
                <p className="font-medium">{stat.display_name}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-24">
                  <Label className="text-xs text-muted-foreground">Weight</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={stat.weight}
                    onChange={(e) => handleWeightChange(stat.stat_key, parseFloat(e.target.value) || 0)}
                    disabled={!stat.enabled}
                    className="h-9"
                  />
                </div>

                <div className="w-32">
                  <Label className="text-xs text-muted-foreground">Normalize</Label>
                  <Select
                    value={stat.normalize_mode}
                    onValueChange={(v) => handleNormalizeModeChange(stat.stat_key, v as NormalizeMode)}
                    disabled={!stat.enabled}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NORMALIZE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="flex items-center gap-3">
        <Wand2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Quick presets:</span>
        {configPresets.map(preset => (
          <Button
            key={preset.id}
            variant="outline"
            size="sm"
            onClick={() => applyPreset(preset.id)}
          >
            {preset.name}
          </Button>
        ))}
      </div>

      {/* Tabs by Category */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as RatingCategory)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="offense">
            Offense
            <span className="ml-2 text-xs text-muted-foreground">
              ({getStatsByCategory('offense').filter(s => s.enabled).length})
            </span>
          </TabsTrigger>
          <TabsTrigger value="defense">
            Defense
            <span className="ml-2 text-xs text-muted-foreground">
              ({getStatsByCategory('defense').filter(s => s.enabled).length})
            </span>
          </TabsTrigger>
          <TabsTrigger value="qb">
            QB
            <span className="ml-2 text-xs text-muted-foreground">
              ({getStatsByCategory('qb').filter(s => s.enabled).length})
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="offense" className="mt-6">
          {renderStatsList('offense')}
        </TabsContent>
        <TabsContent value="defense" className="mt-6">
          {renderStatsList('defense')}
        </TabsContent>
        <TabsContent value="qb" className="mt-6">
          {renderStatsList('qb')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
