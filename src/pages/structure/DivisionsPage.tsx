import { LeaguePageTitle } from "@/components/layout/LeaguePageTitle";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, Edit, Trash2, Eye } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { initialCategories, initialDivisions, type Division } from "@/data/structureData";

export default function DivisionsPage() {
  const [categories] = useState(initialCategories);
  const [divisions, setDivisions] = useState<Division[]>(initialDivisions);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [divOpen, setDivOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [divCategoryId, setDivCategoryId] = useState<string>("");
  const [divName, setDivName] = useState("");
  const [divTeamCap, setDivTeamCap] = useState(10);
  const [divQbCap, setDivQbCap] = useState(2);

  const catName = (id: number) => categories.find(c => c.id === id)?.name ?? "—";

  const resetDiv = () => {
    setEditingId(null);
    setDivCategoryId(categoryFilter !== "all" ? categoryFilter : "");
    setDivName("");
    setDivTeamCap(10);
    setDivQbCap(2);
  };

  const openNew = () => { resetDiv(); setDivOpen(true); };

  const openEdit = (d: Division) => {
    setEditingId(d.id);
    setDivCategoryId(String(d.categoryId));
    setDivName(d.name);
    setDivTeamCap(d.teamCap);
    setDivQbCap(d.qbCap);
    setDivOpen(true);
  };

  const handleSave = () => {
    if (!divCategoryId) { toast.error("Select a category"); return; }
    if (!divName.trim()) { toast.error("Division name is required"); return; }
    const cid = Number(divCategoryId);
    if (editingId !== null) {
      setDivisions(prev => prev.map(d => d.id === editingId
        ? { ...d, categoryId: cid, name: divName.trim(), teamCap: divTeamCap, qbCap: divQbCap }
        : d));
      toast.success(`Division "${divName.trim()}" updated`);
    } else {
      setDivisions(prev => [...prev, {
        id: Date.now(),
        categoryId: cid,
        name: divName.trim(),
        teamCap: divTeamCap,
        qbCap: divQbCap,
        teams: 0,
        status: "draft",
      }]);
      toast.success(`Division "${divName.trim()}" added`);
    }
    setDivOpen(false);
    resetDiv();
  };

  const handleDelete = (d: Division) => {
    setDivisions(prev => prev.filter(x => x.id !== d.id));
    toast.success(`Division "${d.name}" removed`);
  };

  const filtered = divisions.filter(d => {
    const matchSearch = `${catName(d.categoryId)} ${d.name}`.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || String(d.categoryId) === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <LeaguePageTitle title="Divisions" />
          <p className="text-sm text-muted-foreground mt-1">
            Manage divisions, team caps and QB caps. Each division belongs to a category.
          </p>
        </div>
        <button
          onClick={openNew}
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> New Division
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search divisions..."
            className="h-9 w-64 rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 w-[200px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="section-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="table-header text-left px-5 py-3">Division</th>
              <th className="table-header text-left px-5 py-3">Category</th>
              <th className="table-header text-left px-5 py-3">Team Cap</th>
              <th className="table-header text-left px-5 py-3">QB Cap</th>
              <th className="table-header text-left px-5 py-3">Teams</th>
              <th className="table-header text-left px-5 py-3">Status</th>
              <th className="table-header text-right px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No divisions found.
                </td>
              </tr>
            )}
            {filtered.map(div => (
              <tr key={div.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-5 py-3">
                  <span className="text-sm font-medium text-foreground">{catName(div.categoryId)} {div.name}</span>
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{catName(div.categoryId)}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{div.teamCap} teams max</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{div.qbCap} per team</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{div.teams}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <Badge variant={div.status === "active" ? "default" : "secondary"} className={`text-xs ${div.status === "active" ? "bg-success/10 text-success border border-success/20" : ""}`}>
                    {div.status === "active" ? "Active" : "Draft"}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Eye className="h-3.5 w-3.5" /></button>
                    <button onClick={() => openEdit(div)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Edit className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(div)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={divOpen} onOpenChange={setDivOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId !== null ? "Edit Division" : "New Division"}</DialogTitle>
            <DialogDescription>Divisions belong to a category and define team and QB caps.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={divCategoryId} onValueChange={setDivCategoryId}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="div-name">Division Name</Label>
              <Input id="div-name" value={divName} onChange={e => setDivName(e.target.value)} placeholder="e.g. Division 4, U14" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="div-cap">Team Cap</Label>
                <Input id="div-cap" type="number" value={divTeamCap} onChange={e => setDivTeamCap(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="div-qb">QB Cap</Label>
                <Input id="div-qb" type="number" value={divQbCap} onChange={e => setDivQbCap(Number(e.target.value))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDivOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingId !== null ? "Save Changes" : "Add Division"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
