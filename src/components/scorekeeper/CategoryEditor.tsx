import { useState, useEffect } from 'react';
import { Category, defaultCategory, presets, PresetName } from '@/types/scorekeeperCategory';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Zap, Layers, Shield } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSave: (form: Omit<Category, 'id' | 'updatedAt'>, existing: Category | null, isCopy: boolean) => Promise<void> | void;
  isCopy?: boolean;
}

const numericFields = [
  { key: 'FieldSize', label: 'Field Size (yards)', min: 10, max: 999 },
  { key: 'RedZoneYards', label: 'Red Zone Yards', min: 0, max: 999 },
  { key: 'NumberOfPeriods', label: 'Number of Periods', min: 1, max: 10 },
  { key: 'periodLength', label: 'Period Length (min)', min: 1, max: 60 },
  { key: 'downs', label: 'Downs', min: 1, max: 10 },
  { key: 'PossessionStartRelativeDefaultPosition', label: 'Possession Start Position', min: 0, max: 999 },
  { key: 'OnsidePlaysRelativeDefaultPosition', label: 'Onside Plays Position', min: 0, max: 999 },
  { key: 'OCURPlaysOff', label: 'OCUR Plays Off', min: 0, max: 999 },
  { key: 'TouchdownPoints', label: 'Touchdown Points', min: 0, max: 999 },
  { key: 'FemaleAdditionalPoints', label: 'Female Additional Points', min: 0, max: 999 },
] as const;

const booleanFields = [
  { key: 'FemaleSwitch', label: 'Female Bonus Scoring' },
  { key: 'UseFumble', label: 'Track Fumbles' },
  { key: 'UseLateral', label: 'Track Laterals' },
  { key: 'UseAirYards', label: 'Track Air Yards' },
  { key: 'UseYardsAfterCatch', label: 'Track Yards After Catch' },
  { key: 'UsePassDirection', label: 'Track Pass Direction' },
] as const;

export default function CategoryEditor({ open, onOpenChange, category, onSave, isCopy }: Props) {
  const [form, setForm] = useState<Omit<Category, 'id' | 'updatedAt'>>({ ...defaultCategory });
  const [confirmPreset, setConfirmPreset] = useState<PresetName | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (category) {
      const { id, updatedAt, ...rest } = category;
      setForm({ ...rest, name: isCopy ? `${rest.name} (Copy)` : rest.name });
    } else {
      setForm({ ...defaultCategory });
    }
    setIsDirty(false);
  }, [category, isCopy, open]);

  const updateField = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const applyPreset = (preset: PresetName) => {
    if (isDirty) setConfirmPreset(preset);
    else doApplyPreset(preset);
  };

  const doApplyPreset = (preset: PresetName) => {
    setForm(prev => ({ ...prev, ...presets[preset] }));
    setIsDirty(true);
    setConfirmPreset(null);
    toast.success(`${preset.charAt(0).toUpperCase() + preset.slice(1)} preset applied`);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    try {
      setSaving(true);
      await onSave(form, category, !!isCopy);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const structureSummary = `${form.NumberOfPeriods}P · ${form.periodLength}min · ${form.downs}D`;
  const scoringSummary = `TD${form.TouchdownPoints}${form.FemaleSwitch ? ` +${form.FemaleAdditionalPoints}F` : ''}`;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-[900px] p-0 flex flex-col">
          <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">
            <SheetTitle className="text-lg font-bold">
              {isCopy ? 'Duplicate Category' : category ? 'Edit Category' : 'New Category'}
            </SheetTitle>
            {form.name && (
              <p className="text-sm text-muted-foreground mt-1">
                {form.name} · {form.format} · {structureSummary} · {scoringSummary}
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={() => applyPreset('simple')} className="gap-1.5">
                <Zap className="h-3.5 w-3.5" /> Apply Simple
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset('medium')} className="gap-1.5">
                <Layers className="h-3.5 w-3.5" /> Apply Medium
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset('advanced')} className="gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Apply Advanced
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            <Section title="General">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Name">
                  <Input value={form.name} onChange={e => updateField('name', e.target.value)} />
                </Field>
                <Field label="Format">
                  <Select value={form.format} onValueChange={v => updateField('format', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['4v4','5v5','6v6','7v7','8v8'].map(f => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="League Type">
                  <Select value={form.LeagueType} onValueChange={v => updateField('LeagueType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flag">Flag</SelectItem>
                      <SelectItem value="Tackle">Tackle</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Allow Live Scoring">
                  <div className="pt-2">
                    <Switch checked={form.AllowLiveScoring} onCheckedChange={v => updateField('AllowLiveScoring', v)} />
                  </div>
                </Field>
              </div>
            </Section>

            <Section title="Game Structure">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {numericFields.filter(f => ['NumberOfPeriods','periodLength','downs'].includes(f.key)).map(f => (
                  <Field key={f.key} label={f.label}>
                    <Input type="number" min={f.min} max={f.max}
                      value={(form as any)[f.key]}
                      onChange={e => updateField(f.key, clamp(+e.target.value, f.min, f.max))} />
                  </Field>
                ))}
              </div>
            </Section>

            <Section title="Field & Possession">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {numericFields.filter(f => ['FieldSize','RedZoneYards','PossessionStartRelativeDefaultPosition','OnsidePlaysRelativeDefaultPosition','OCURPlaysOff'].includes(f.key)).map(f => (
                  <Field key={f.key} label={f.label}>
                    <Input type="number" min={f.min} max={f.max}
                      value={(form as any)[f.key]}
                      onChange={e => updateField(f.key, clamp(+e.target.value, f.min, f.max))} />
                  </Field>
                ))}
              </div>
            </Section>

            <Section title="Scoring">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {numericFields.filter(f => ['TouchdownPoints','FemaleAdditionalPoints'].includes(f.key)).map(f => (
                  <Field key={f.key} label={f.label}>
                    <Input type="number" min={f.min} max={f.max}
                      value={(form as any)[f.key]}
                      onChange={e => updateField(f.key, clamp(+e.target.value, f.min, f.max))} />
                  </Field>
                ))}
                <Field label="Female Bonus Scoring">
                  <div className="pt-2">
                    <Switch checked={form.FemaleSwitch} onCheckedChange={v => updateField('FemaleSwitch', v)} />
                  </div>
                </Field>
              </div>
            </Section>

            <Section title="Tracking Features">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {booleanFields.filter(f => f.key !== 'FemaleSwitch').map(f => (
                  <div key={f.key} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <Label className="text-sm font-medium">{f.label}</Label>
                    <Switch checked={(form as any)[f.key]} onCheckedChange={v => updateField(f.key, v)} />
                  </div>
                ))}
              </div>
            </Section>
          </div>

          <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirmPreset} onOpenChange={() => setConfirmPreset(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Preset?</AlertDialogTitle>
            <AlertDialogDescription>
              This will overwrite your current form values. Unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmPreset && doApplyPreset(confirmPreset)}>
              Apply
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">{title}</h3>
      <Separator className="mb-4" />
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}
