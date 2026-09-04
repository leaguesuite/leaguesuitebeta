import { LeaguePageTitle } from "@/components/layout/LeaguePageTitle";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Layers, Edit, Trash2, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { initialCategories, initialDivisions, type Category } from "@/data/structureData";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [search, setSearch] = useState("");

  const [catOpen, setCatOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catFieldLength, setCatFieldLength] = useState("80 yards");
  const [catDowns, setCatDowns] = useState(4);
  const [catRushCount, setCatRushCount] = useState(7);
  const [catPlayers, setCatPlayers] = useState(7);

  const resetCat = () => {
    setEditingId(null);
    setCatName(""); setCatDesc("");
    setCatFieldLength("80 yards"); setCatDowns(4);
    setCatRushCount(7); setCatPlayers(7);
  };

  const openNew = () => { resetCat(); setCatOpen(true); };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setCatName(cat.name);
    setCatDesc(cat.description === "—" ? "" : cat.description);
    setCatFieldLength(cat.rules.fieldLength);
    setCatDowns(cat.rules.downs);
    setCatRushCount(cat.rules.rushCount);
    setCatPlayers(cat.rules.playersPerSide);
    setCatOpen(true);
  };

  const handleSave = () => {
    if (!catName.trim()) { toast.error("Category name is required"); return; }
    const rules = {
      fieldLength: catFieldLength,
      downs: catDowns,
      rushCount: catRushCount,
      playersPerSide: catPlayers,
    };
    if (editingId !== null) {
      setCategories(prev => prev.map(c => c.id === editingId
        ? { ...c, name: catName.trim(), description: catDesc.trim() || "—", rules }
        : c));
      toast.success(`Category "${catName.trim()}" updated`);
    } else {
      setCategories(prev => [...prev, {
        id: Date.now(),
        name: catName.trim(),
        description: catDesc.trim() || "—",
        rules,
      }]);
      toast.success(`Category "${catName.trim()}" created`);
    }
    setCatOpen(false);
    resetCat();
  };

  const handleDelete = (cat: Category) => {
    setCategories(prev => prev.filter(c => c.id !== cat.id));
    toast.success(`Category "${cat.name}" removed`);
  };

  const divisionCount = (categoryId: number) =>
    initialDivisions.filter(d => d.categoryId === categoryId).length;

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <LeaguePageTitle title="Categories" />
          <p className="text-sm text-muted-foreground mt-1">
            Reusable rule templates (field length, downs, rush count, players per side). Divisions are managed on the Divisions page.
          </p>
        </div>
        <button
          onClick={openNew}
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> New Category
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="h-9 w-64 rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(cat => (
          <div key={cat.id} className="section-card overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-base font-semibold text-foreground">{cat.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{cat.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/structure/divisions"
                  className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                >
                  {divisionCount(cat.id)} division{divisionCount(cat.id) !== 1 ? "s" : ""}
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <button onClick={() => openEdit(cat)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Edit className="h-3.5 w-3.5" /></button>
                <button onClick={() => handleDelete(cat)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            <div className="border-t border-border px-5 py-4 bg-secondary/30">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Rule Configuration</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(cat.rules).map(([key, val]) => (
                  <div key={key} className="bg-card rounded-lg border border-border px-3 py-2.5">
                    <div className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</div>
                    <div className="text-sm font-semibold text-foreground mt-0.5">{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="section-card px-5 py-10 text-center text-sm text-muted-foreground">
            No categories found.
          </div>
        )}
      </div>

      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId !== null ? "Edit Category" : "New Category"}</DialogTitle>
            <DialogDescription>Create a reusable rule template for divisions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input id="cat-name" value={catName} onChange={e => setCatName(e.target.value)} placeholder="e.g. Masters 40+" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Input id="cat-desc" value={catDesc} onChange={e => setCatDesc(e.target.value)} placeholder="Short description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cat-field">Field Length</Label>
                <Input id="cat-field" value={catFieldLength} onChange={e => setCatFieldLength(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-downs">Downs</Label>
                <Input id="cat-downs" type="number" value={catDowns} onChange={e => setCatDowns(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-rush">Rush Count</Label>
                <Input id="cat-rush" type="number" value={catRushCount} onChange={e => setCatRushCount(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-players">Players / Side</Label>
                <Input id="cat-players" type="number" value={catPlayers} onChange={e => setCatPlayers(Number(e.target.value))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingId !== null ? "Save Changes" : "Create Category"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
