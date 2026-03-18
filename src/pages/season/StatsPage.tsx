import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Save, RotateCcw, BarChart3, Settings2, Eye, EyeOff } from 'lucide-react';
import {
  statDefinitions,
  statCategoryLabels,
  statCategoryOrder,
  type StatDefinition,
} from '@/data/statDefinitions';
import { mockPlayers } from '@/data/mockMembers';

const leagueCategories = [
  { id: 1, name: "Men's" },
  { id: 2, name: "Women's" },
  { id: 3, name: "Co-Ed" },
  { id: 4, name: "Youth" },
];

type EnabledMap = Record<number, Record<string, boolean>>;

function buildDefaults(): EnabledMap {
  const map: EnabledMap = {};
  leagueCategories.forEach(cat => {
    map[cat.id] = {};
    statDefinitions.forEach(s => {
      map[cat.id][s.id] = s.defaultEnabled;
    });
  });
  return map;
}

const StatsPage = () => {
  const [enabledStats, setEnabledStats] = useState<EnabledMap>(buildDefaults);
  const [selectedCategory, setSelectedCategory] = useState<number>(leagueCategories[0].id);
  const [hasChanges, setHasChanges] = useState(false);

  const currentConfig = enabledStats[selectedCategory] || {};

  const toggleStat = (statId: string) => {
    setEnabledStats(prev => ({
      ...prev,
      [selectedCategory]: {
        ...prev[selectedCategory],
        [statId]: !prev[selectedCategory][statId],
      },
    }));
    setHasChanges(true);
  };

  const toggleAllInGroup = (group: string, enable: boolean) => {
    const groupStats = statDefinitions.filter(s => s.category === group);
    setEnabledStats(prev => {
      const updated = { ...prev[selectedCategory] };
      groupStats.forEach(s => { updated[s.id] = enable; });
      return { ...prev, [selectedCategory]: updated };
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    toast.success(`Stats tracking saved for ${leagueCategories.find(c => c.id === selectedCategory)?.name}`);
  };

  const handleReset = () => {
    setEnabledStats(prev => {
      const updated = { ...prev };
      updated[selectedCategory] = {};
      statDefinitions.forEach(s => { updated[selectedCategory][s.id] = s.defaultEnabled; });
      return updated;
    });
    setHasChanges(false);
    toast.info('Reset to defaults');
  };

  const enabledCount = Object.values(currentConfig).filter(Boolean).length;
  const totalCount = statDefinitions.length;

  // Build preview data from enabled stats
  const enabledStatDefs = useMemo(
    () => statDefinitions.filter(s => currentConfig[s.id]),
    [currentConfig]
  );

  const groupedStats = useMemo(() => {
    const groups: Record<string, StatDefinition[]> = {};
    statCategoryOrder.forEach(cat => {
      const items = statDefinitions.filter(s => s.category === cat);
      if (items.length) groups[cat] = items;
    });
    return groups;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stats Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Configure which statistics to track per league category. Hidden stats won't appear in tables or exports.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} disabled={!hasChanges}>
            <RotateCcw className="h-4 w-4 mr-1" /> Reset
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-1" /> Save Changes
          </Button>
        </div>
      </div>

      {/* Category selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">League Category:</span>
        <Select value={String(selectedCategory)} onValueChange={v => setSelectedCategory(Number(v))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {leagueCategories.map(c => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="ml-auto">
          {enabledCount} / {totalCount} stats enabled
        </Badge>
      </div>

      <Tabs defaultValue="configure">
        <TabsList>
          <TabsTrigger value="configure" className="gap-1.5">
            <Settings2 className="h-4 w-4" /> Configure
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-1.5">
            <BarChart3 className="h-4 w-4" /> Preview
          </TabsTrigger>
        </TabsList>

        {/* CONFIGURE TAB */}
        <TabsContent value="configure" className="space-y-4 mt-4">
          {statCategoryOrder.map(groupKey => {
            const items = groupedStats[groupKey];
            if (!items) return null;
            const allEnabled = items.every(s => currentConfig[s.id]);
            const noneEnabled = items.every(s => !currentConfig[s.id]);

            return (
              <Card key={groupKey}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{statCategoryLabels[groupKey]}</CardTitle>
                      <CardDescription className="text-xs">
                        {items.filter(s => currentConfig[s.id]).length} of {items.length} enabled
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1"
                        disabled={allEnabled}
                        onClick={() => toggleAllInGroup(groupKey, true)}
                      >
                        <Eye className="h-3.5 w-3.5" /> Enable All
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1"
                        disabled={noneEnabled}
                        onClick={() => toggleAllInGroup(groupKey, false)}
                      >
                        <EyeOff className="h-3.5 w-3.5" /> Disable All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map(stat => (
                      <div
                        key={stat.id}
                        className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                          currentConfig[stat.id]
                            ? 'bg-card border-border'
                            : 'bg-muted/40 border-transparent opacity-60'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{stat.label}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono shrink-0">
                              {stat.abbreviation}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{stat.description}</p>
                        </div>
                        <Switch
                          checked={!!currentConfig[stat.id]}
                          onCheckedChange={() => toggleStat(stat.id)}
                          className="ml-3 shrink-0"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* PREVIEW TAB */}
        <TabsContent value="preview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stat Table Preview</CardTitle>
              <CardDescription>
                This is how the stats table will appear with your current configuration. Only enabled columns are shown.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enabledStatDefs.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No stats enabled. Enable at least one stat to see a preview.</p>
              ) : (
                <div className="rounded-md border overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-background z-10 min-w-[140px]">Player</TableHead>
                        {enabledStatDefs.map(s => (
                          <TableHead key={s.id} className="text-center min-w-[60px] whitespace-nowrap">
                            {s.abbreviation}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockPlayers.slice(0, 6).map(player => (
                        <TableRow key={player.player_id}>
                          <TableCell className="sticky left-0 bg-background z-10 font-medium">
                            {player.player_name}
                          </TableCell>
                          {enabledStatDefs.map(s => (
                            <TableCell key={s.id} className="text-center text-muted-foreground">
                              —
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatsPage;
