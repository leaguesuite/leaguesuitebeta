import { useState } from 'react';
import { DivisionMultiplier } from '@/ratings-engine/types/ratings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DivisionMultipliersStepProps {
  multipliers: DivisionMultiplier[];
  onMultipliersChange: (multipliers: DivisionMultiplier[]) => void;
}

/** How far below the division above. Values are the drop in multiplier. */
const GAPS = [
  { id: 'same', label: 'Same level', drop: 0 },
  { id: 'small', label: 'Small gap', drop: 0.03 },
  { id: 'medium', label: 'Medium gap', drop: 0.07 },
  { id: 'big', label: 'Big gap', drop: 0.12 },
  { id: 'huge', label: 'Huge gap', drop: 0.2 },
] as const;
type GapId = typeof GAPS[number]['id'];
const dropOf = (g: GapId) => GAPS.find(x => x.id === g)!.drop;
const nearestGap = (d: number): GapId =>
  GAPS.reduce((best, g) => (Math.abs(g.drop - d) < Math.abs(dropOf(best) - d) ? g.id : best), 'medium' as GapId);

function SortableDivision({ m, index, total, onMove }: { m: DivisionMultiplier; index: number; total: number; onMove: (d: -1 | 1) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: m.division_id });
  const pct = Math.round((m.multiplier - 1) * 100);
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-lg border bg-card p-3 ${isDragging ? 'shadow-lg relative z-10' : ''}`}>
      <button {...attributes} {...listeners} className="cursor-grab touch-none text-muted-foreground" aria-label="Drag to reorder">
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="w-8 font-mono text-sm font-semibold text-primary">#{index + 1}</span>
      <p className="flex-1 font-medium">{m.division_name}</p>
      {index === 0
        ? <Badge variant="soft">Top division · full rating</Badge>
        : <span className="font-mono text-xs text-muted-foreground">{pct}% vs top</span>}
      <div className="flex">
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up"><ChevronUp className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={index === total - 1} onClick={() => onMove(1)} aria-label="Move down"><ChevronDown className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

export function DivisionMultipliersStep({ multipliers, onMultipliersChange }: DivisionMultipliersStepProps) {
  // Initial order + gaps inferred from existing multipliers (strongest first).
  const [order, setOrder] = useState<string[]>(() =>
    [...multipliers].sort((a, b) => b.multiplier - a.multiplier).map(m => m.division_id));
  const [gaps, setGaps] = useState<Record<string, GapId>>(() => {
    const sorted = [...multipliers].sort((a, b) => b.multiplier - a.multiplier);
    const g: Record<string, GapId> = {};
    sorted.forEach((m, i) => { if (i > 0) g[m.division_id] = nearestGap(sorted[i - 1].multiplier - m.multiplier); });
    return g;
  });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const byId = new Map(multipliers.map(m => [m.division_id, m]));
  const ids = [...order.filter(id => byId.has(id)), ...multipliers.filter(m => !order.includes(m.division_id)).map(m => m.division_id)];

  const emit = (nextOrder: string[], nextGaps: Record<string, GapId>) => {
    let value = 1;
    const out = nextOrder.map((id, i) => {
      if (i > 0) value = Math.max(0.3, value - dropOf(nextGaps[id] ?? 'medium'));
      return { ...byId.get(id)!, multiplier: Number(value.toFixed(2)) };
    });
    setOrder(nextOrder); setGaps(nextGaps); onMultipliersChange(out);
  };

  const move = (from: number, to: number) => emit(arrayMove(ids, from, to), gaps);
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    move(ids.indexOf(String(e.active.id)), ids.indexOf(String(e.over.id)));
  };
  const shown = ids.map(id => byId.get(id)!);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Put divisions in order from strongest to weakest. The top division keeps full ratings. Between each pair, pick how big the
        skill gap is. Bigger gaps lower the ratings of the divisions below more.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div>
            {shown.map((m, i) => (
              <div key={m.division_id}>
                {i > 0 && (
                  <div className="flex items-center gap-3 py-2 pl-12">
                    <div className="h-6 w-px bg-border" />
                    <span className="text-xs text-muted-foreground">Gap from {shown[i - 1].division_name}:</span>
                    <ToggleGroup type="single" size="sm" variant="outline" value={gaps[m.division_id] ?? 'medium'}
                      onValueChange={v => v && emit(ids, { ...gaps, [m.division_id]: v as GapId })}>
                      {GAPS.map(g => <ToggleGroupItem key={g.id} value={g.id} className="h-7 px-2 text-xs">{g.label}</ToggleGroupItem>)}
                    </ToggleGroup>
                  </div>
                )}
                <SortableDivision m={m} index={i} total={shown.length} onMove={d => move(i, i + d)} />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
