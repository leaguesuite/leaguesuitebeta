import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, ChevronDown, ChevronRight, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  statDefinitions,
  statCategoryLabels,
  statCategoryOrder,
  type StatDefinition,
} from '@/data/statDefinitions';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export default function StatsTrackingPage() {
  const [enabledStats, setEnabledStats] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    statDefinitions.forEach((s) => {
      initial[s.id] = s.defaultEnabled;
    });
    return initial;
  });

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    statCategoryOrder.forEach((c) => {
      initial[c] = true;
    });
    return initial;
  });

  const [saving, setSaving] = useState(false);

  const grouped = useMemo(() => {
    const map: Record<string, StatDefinition[]> = {};
    statDefinitions.forEach((s) => {
      if (!map[s.category]) map[s.category] = [];
      map[s.category].push(s);
    });
    return map;
  }, []);

  const toggleStat = (id: string) => {
    setEnabledStats((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAllInCategory = (category: string, enable: boolean) => {
    setEnabledStats((prev) => {
      const next = { ...prev };
      grouped[category]?.forEach((s) => {
        next[s.id] = enable;
      });
      return next;
    });
  };

  const getCategoryCounts = (category: string) => {
    const stats = grouped[category] || [];
    const enabled = stats.filter((s) => enabledStats[s.id]).length;
    return { enabled, total: stats.length };
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Stats tracking configuration saved');
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Stats Tracking</h1>
          <p className="text-sm text-muted-foreground">
            Toggle individual stats on or off to control what is displayed on your public site and admin views.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {statCategoryOrder.map((category) => {
        const stats = grouped[category] || [];
        const { enabled, total } = getCategoryCounts(category);
        const allEnabled = enabled === total;
        const isOpen = openCategories[category] ?? true;

        return (
          <Collapsible
            key={category}
            open={isOpen}
            onOpenChange={(open) =>
              setOpenCategories((prev) => ({ ...prev, [category]: open }))
            }
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          {statCategoryLabels[category] || category}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {enabled} of {total} stats enabled
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={allEnabled ? 'default' : 'secondary'} className="text-xs">
                      {enabled}/{total}
                    </Badge>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 space-y-1">
                  {/* Bulk toggles */}
                  <div className="flex gap-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAllInCategory(category, true);
                      }}
                      disabled={allEnabled}
                    >
                      Enable All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAllInCategory(category, false);
                      }}
                      disabled={enabled === 0}
                    >
                      Disable All
                    </Button>
                  </div>

                  {/* Stat rows */}
                  <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                    {stats.map((stat) => (
                      <div
                        key={stat.id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Badge variant="outline" className="font-mono text-xs shrink-0 w-12 justify-center">
                            {stat.abbreviation}
                          </Badge>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {stat.label}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {stat.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={enabledStats[stat.id] ?? false}
                          onCheckedChange={() => toggleStat(stat.id)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}
