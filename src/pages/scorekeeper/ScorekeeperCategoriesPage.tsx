import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category, categoryToRow, rowToCategory } from '@/types/scorekeeperCategory';
import CategoryEditor from '@/components/scorekeeper/CategoryEditor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Copy, Check, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const TABLE = 'scorekeeper_categories' as any;
const API_PATH = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sk-v2-categories`;

export default function ScorekeeperCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [isCopy, setIsCopy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from(TABLE).select('*').order('name', { ascending: true });
    if (error) { toast.error(error.message); setLoading(false); return; }
    setCategories((data ?? []).map(rowToCategory));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setIsCopy(false); setEditorOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setIsCopy(false); setEditorOpen(true); };
  const openCopy = (c: Category) => { setEditing(c); setIsCopy(true); setEditorOpen(true); };

  const handleSave = async (
    form: Omit<Category, 'id' | 'updatedAt'>,
    existing: Category | null,
    copy: boolean,
  ) => {
    const row = categoryToRow(form);
    if (existing && !copy) {
      const { error } = await (supabase as any).from(TABLE).update(row).eq('id', existing.id);
      if (error) { toast.error(error.message); throw error; }
      toast.success('Category updated');
    } else {
      const { error } = await (supabase as any).from(TABLE).insert(row);
      if (error) { toast.error(error.message); throw error; }
      toast.success(copy ? 'Category duplicated' : 'Category created');
    }
    await load();
  };

  const handleDelete = async (c: Category) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    const { error } = await (supabase as any).from(TABLE).delete().eq('id', c.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Category deleted');
    await load();
  };

  const structure = (c: Category) => `${c.NumberOfPeriods}P · ${c.periodLength}min · ${c.downs}D`;
  const scoring = (c: Category) => `TD${c.TouchdownPoints}${c.FemaleSwitch ? ` +${c.FemaleAdditionalPoints}F` : ''}`;
  const updated = (c: Category) => c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : '—';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <div>
            <LeaguePageTitle title="Scorekeeper Categories" />
            <p className="text-sm text-muted-foreground mt-1">
              Manage scorekeeping configurations served to the scorekeeper app via <code className="font-mono text-primary">/api/sk/v2/categories</code>.
            </p>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" /> New Category
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="hidden md:block rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {['Name','Format','Structure','Scoring','Field','Live','Updated',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {!loading && categories.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No categories yet.</td></tr>
              )}
              {categories.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                  <td className="px-4 py-3"><Badge variant="secondary">{c.format}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{structure(c)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{scoring(c)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.FieldSize}yd</td>
                  <td className="px-4 py-3">
                    {c.AllowLiveScoring
                      ? <Check className="h-4 w-4 text-accent" />
                      : <X className="h-4 w-4 text-muted-foreground" />}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{updated(c)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openCopy(c)} aria-label="Duplicate"><Copy className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {categories.map(c => (
            <div key={c.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{c.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{c.format} · {structure(c)}</p>
                  <p className="text-sm text-muted-foreground">{scoring(c)} · {c.FieldSize}yd · {c.AllowLiveScoring ? 'Live' : 'No Live'}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => openCopy(c)}><Copy className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(c)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
            API Preview — <code className="text-primary font-mono">GET {API_PATH}</code>
          </h2>
          <pre className="rounded-lg border border-border bg-card p-4 text-xs overflow-auto max-h-64 text-muted-foreground">
            {JSON.stringify(categories.map(({ updatedAt, ...rest }) => rest), null, 2)}
          </pre>
        </div>
      </main>

      <CategoryEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        category={editing}
        onSave={handleSave}
        isCopy={isCopy}
      />
    </div>
  );
}
