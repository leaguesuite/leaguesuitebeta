import { useState } from 'react';
import { StatConfig, RatingCategory } from '@/ratings-engine/types/ratings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface StatWeightsStepProps {
  statConfigs: StatConfig[];
  onStatConfigsChange: (configs: StatConfig[]) => void;
}

const impactLabel = (i: number, n: number) => {
  if (i === 0) return 'Most important';
  const r = i / Math.max(n - 1, 1);
  if (r <= 0.34) return 'High impact';
  if (r <= 0.67) return 'Moderate impact';
  return 'Low impact';
};

/** Turn list order into weights behind the scenes: #1 gets the most, scaling down linearly. Negative stats keep their sign. */
function applyRankWeights(list: StatConfig[]): StatConfig[] {
  const enabled = list.filter(s => s.enabled);
  const n = enabled.length;
  return list.map(s => {
    if (!s.enabled) return s;
    const i = enabled.indexOf(s);
    const magnitude = Number((((n - i) / n) * 3).toFixed(2));
    const sign = s.weight < 0 ? -1 : 1;
    const isRate = /pct|percent|rate/i.test(s.stat_key);
    return { ...s, weight: sign * magnitude, normalize_mode: isRate ? 'percentage' : 'per_game' };
  });
}

function SortableRow({ stat, index, total, onMove, onToggle }: {
  stat: StatConfig; index: number; total: number;
  onMove: (dir: -1 | 1) => void; onToggle: (v: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stat.stat_key });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-lg border bg-card p-3 ${isDragging ? 'shadow-lg z-10 relative' : ''}`}
    >
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground touch-none" aria-label="Drag to reorder">
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="w-8 font-mono text-sm font-semibold text-primary">#{index + 1}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{stat.display_name}</p>
        {stat.weight < 0 && <p className="text-xs text-muted-foreground">Counts against the player</p>}
      </div>
      <Badge variant={index === 0 ? 'soft' : 'outline'}>{impactLabel(index, total)}</Badge>
      <div className="flex">
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up"><ChevronUp className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={index === total - 1} onClick={() => onMove(1)} aria-label="Move down"><ChevronDown className="h-4 w-4" /></Button>
      </div>
      <Switch checked onCheckedChange={onToggle} aria-label="Include stat" />
    </div>
  );
}

export function StatWeightsStep({ statConfigs, onStatConfigsChange }: StatWeightsStepProps) {
  const [activeTab, setActiveTab] = useState<RatingCategory>('offense');
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const byCat = (c: RatingCategory) => statConfigs.filter(s => s.category === c);

  const commit = (c: RatingCategory, list: StatConfig[]) => {
    const enabled = list.filter(s => s.enabled);
    const disabled = list.filter(s => !s.enabled);
    const ranked = applyRankWeights([...enabled, ...disabled]);
    onStatConfigsChange([...statConfigs.filter(s => s.category !== c), ...ranked]);
  };

  const renderList = (c: RatingCategory) => {
    const all = byCat(c);
    const active = all.filter(s => s.enabled);
    const excluded = all.filter(s => !s.enabled);

    const reorder = (from: number, to: number) => commit(c, [...arrayMove(active, from, to), ...excluded]);
    const onDragEnd = (e: DragEndEvent) => {
      if (!e.over || e.active.id === e.over.id) return;
      reorder(active.findIndex(s => s.stat_key === e.active.id), active.findIndex(s => s.stat_key === e.over!.id));
    };
    const setEnabled = (key: string, enabled: boolean) =>
      commit(c, all.map(s => (s.stat_key === key ? { ...s, enabled, weight: s.weight || 1 } : s)));

    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Drag stats into order of importance. The top stat has the biggest effect on the rating. {active.length} stats included.
        </p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={active.map(s => s.stat_key)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {active.map((s, i) => (
                <SortableRow key={s.stat_key} stat={s} index={i} total={active.length}
                  onMove={d => reorder(i, i + d)} onToggle={v => setEnabled(s.stat_key, v)} />
              ))}
              {active.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No stats included.</p>}
            </div>
          </SortableContext>
        </DndContext>
        {excluded.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Not included</p>
            <div className="space-y-2">
              {excluded.map(s => (
                <div key={s.stat_key} className="flex items-center gap-3 rounded-lg border border-dashed p-3 opacity-70">
                  <p className="flex-1 text-sm">{s.display_name}</p>
                  <Switch checked={false} onCheckedChange={v => setEnabled(s.stat_key, v)} aria-label="Include stat" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const cats: { v: RatingCategory; l: string }[] = [{ v: 'offense', l: 'Offense' }, { v: 'defense', l: 'Defense' }, { v: 'qb', l: 'QB' }];
  return (
    <Tabs value={activeTab} onValueChange={v => setActiveTab(v as RatingCategory)}>
      <TabsList className="grid w-full grid-cols-3">
        {cats.map(c => (
          <TabsTrigger key={c.v} value={c.v}>
            {c.l}<span className="ml-2 text-xs text-muted-foreground">({byCat(c.v).filter(s => s.enabled).length})</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {cats.map(c => <TabsContent key={c.v} value={c.v} className="mt-6">{renderList(c.v)}</TabsContent>)}
    </Tabs>
  );
}
