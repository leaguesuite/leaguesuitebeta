import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Plus, GripVertical, Edit, Trash2, ChevronRight, ChevronDown,
  Eye, EyeOff, ExternalLink, Menu as MenuIcon, Link2, Layers,
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  url: string;
  visible: boolean;
  openInNewTab: boolean;
  children: MenuItem[];
}

interface MenuSet {
  id: string;
  name: string;
  description: string;
  items: MenuItem[];
}

const INITIAL_MENUS: MenuSet[] = [
  {
    id: "main",
    name: "Main Navigation",
    description: "Primary site navigation shown in the header.",
    items: [
      { id: "m1", label: "Home", url: "/", visible: true, openInNewTab: false, children: [] },
      { id: "m2", label: "Schedule", url: "/schedule", visible: true, openInNewTab: false, children: [
        { id: "m2a", label: "Full Schedule", url: "/schedule", visible: true, openInNewTab: false, children: [] },
        { id: "m2b", label: "Scores & Results", url: "/scores", visible: true, openInNewTab: false, children: [] },
        { id: "m2c", label: "Playoffs", url: "/playoffs", visible: false, openInNewTab: false, children: [] },
      ]},
      { id: "m3", label: "Standings", url: "/standings", visible: true, openInNewTab: false, children: [] },
      { id: "m4", label: "Teams", url: "/teams", visible: true, openInNewTab: false, children: [
        { id: "m4a", label: "Division A", url: "/teams/division-a", visible: true, openInNewTab: false, children: [] },
        { id: "m4b", label: "Division B", url: "/teams/division-b", visible: true, openInNewTab: false, children: [] },
      ]},
      { id: "m5", label: "Stats", url: "/stats", visible: true, openInNewTab: false, children: [
        { id: "m5a", label: "Player Leaders", url: "/stats/leaders", visible: true, openInNewTab: false, children: [] },
        { id: "m5b", label: "Team Stats", url: "/stats/teams", visible: true, openInNewTab: false, children: [] },
      ]},
      { id: "m6", label: "News", url: "/news", visible: true, openInNewTab: false, children: [] },
      { id: "m7", label: "Register", url: "/register", visible: true, openInNewTab: false, children: [] },
    ],
  },
  {
    id: "footer",
    name: "Footer Navigation",
    description: "Links displayed in the site footer.",
    items: [
      { id: "f1", label: "About", url: "/about", visible: true, openInNewTab: false, children: [] },
      { id: "f2", label: "Contact", url: "/contact", visible: true, openInNewTab: false, children: [] },
      { id: "f3", label: "Rules & Policies", url: "/rules", visible: true, openInNewTab: false, children: [] },
      { id: "f4", label: "Privacy Policy", url: "/privacy", visible: true, openInNewTab: false, children: [] },
      { id: "f5", label: "Sponsorship", url: "/sponsors", visible: true, openInNewTab: false, children: [] },
    ],
  },
];

const PAGE_OPTIONS = [
  { label: "Home", value: "/" },
  { label: "Schedule", value: "/schedule" },
  { label: "Scores & Results", value: "/scores" },
  { label: "Standings", value: "/standings" },
  { label: "Teams", value: "/teams" },
  { label: "Stats", value: "/stats" },
  { label: "News", value: "/news" },
  { label: "Register", value: "/register" },
  { label: "About", value: "/about" },
  { label: "Contact", value: "/contact" },
  { label: "Rules & Policies", value: "/rules" },
  { label: "Custom URL...", value: "__custom__" },
];

export default function NavigationMenusPage() {
  const [menus, setMenus] = useState<MenuSet[]>(INITIAL_MENUS);
  const [activeMenu, setActiveMenu] = useState("main");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ m2: true, m4: true, m5: true });
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [editParentId, setEditParentId] = useState<string | null>(null); // null = top-level
  const [isNew, setIsNew] = useState(false);
  const [addSubTo, setAddSubTo] = useState<string | null>(null);

  const currentMenu = menus.find(m => m.id === activeMenu)!;

  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const updateMenuItems = (newItems: MenuItem[]) => {
    setMenus(prev => prev.map(m => m.id === activeMenu ? { ...m, items: newItems } : m));
  };

  const toggleVisibility = (id: string, parentId?: string) => {
    const toggle = (items: MenuItem[]): MenuItem[] =>
      items.map(item => {
        if (item.id === id) return { ...item, visible: !item.visible };
        if (item.children.length) return { ...item, children: toggle(item.children) };
        return item;
      });
    updateMenuItems(toggle(currentMenu.items));
  };

  const deleteItem = (id: string) => {
    const remove = (items: MenuItem[]): MenuItem[] =>
      items.filter(item => item.id !== id).map(item => ({
        ...item,
        children: remove(item.children),
      }));
    updateMenuItems(remove(currentMenu.items));
    toast({ title: "Removed", description: "Menu item deleted." });
  };

  const openEditItem = (item: MenuItem, parentId: string | null = null) => {
    setEditItem({ ...item });
    setEditParentId(parentId);
    setIsNew(false);
    setEditOpen(true);
  };

  const openNewItem = (parentId: string | null = null) => {
    setEditItem({
      id: String(Date.now()),
      label: "",
      url: "/",
      visible: true,
      openInNewTab: false,
      children: [],
    });
    setEditParentId(parentId);
    setIsNew(true);
    setEditOpen(true);
  };

  const saveEditItem = () => {
    if (!editItem || !editItem.label.trim()) return;

    if (isNew) {
      if (editParentId) {
        const addChild = (items: MenuItem[]): MenuItem[] =>
          items.map(item => item.id === editParentId
            ? { ...item, children: [...item.children, editItem] }
            : { ...item, children: addChild(item.children) }
          );
        updateMenuItems(addChild(currentMenu.items));
      } else {
        updateMenuItems([...currentMenu.items, editItem]);
      }
    } else {
      const update = (items: MenuItem[]): MenuItem[] =>
        items.map(item => {
          if (item.id === editItem.id) return { ...editItem, children: item.children };
          return { ...item, children: update(item.children) };
        });
      updateMenuItems(update(currentMenu.items));
    }

    setEditOpen(false);
    toast({ title: "Saved", description: `"${editItem.label}" ${isNew ? "added" : "updated"}.` });
  };

  const moveItem = (id: string, dir: "up" | "down", items: MenuItem[]): MenuItem[] => {
    const idx = items.findIndex(i => i.id === id);
    if (idx < 0) return items.map(i => ({ ...i, children: moveItem(id, dir, i.children) }));
    if ((dir === "up" && idx === 0) || (dir === "down" && idx === items.length - 1)) return items;
    const newItems = [...items];
    const swap = dir === "up" ? idx - 1 : idx + 1;
    [newItems[idx], newItems[swap]] = [newItems[swap], newItems[idx]];
    return newItems;
  };

  const renderItem = (item: MenuItem, depth: number = 0, parentId: string | null = null) => {
    const hasChildren = item.children.length > 0;
    const isOpen = expanded[item.id];

    return (
      <div key={item.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors group ${
            !item.visible ? "opacity-50" : ""
          }`}
          style={{ marginLeft: depth * 28 }}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />

          {hasChildren ? (
            <button onClick={() => toggleExpand(item.id)} className="p-0.5">
              {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
          ) : (
            <div className="w-[18px]" />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              {!item.visible && (
                <Badge variant="secondary" className="text-[10px] gap-0.5">
                  <EyeOff className="h-2.5 w-2.5" /> Hidden
                </Badge>
              )}
              {item.openInNewTab && (
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <span className="text-xs text-muted-foreground font-mono">{item.url}</span>
          </div>

          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleVisibility(item.id)} title={item.visible ? "Hide" : "Show"}>
              {item.visible ? <Eye className="h-3.5 w-3.5 text-muted-foreground" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateMenuItems(moveItem(item.id, "up", currentMenu.items))}>
              <span className="text-xs text-muted-foreground">↑</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateMenuItems(moveItem(item.id, "down", currentMenu.items))}>
              <span className="text-xs text-muted-foreground">↓</span>
            </Button>
            {depth === 0 && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openNewItem(item.id)} title="Add sub-item">
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditItem(item, parentId)}>
              <Edit className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteItem(item.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {hasChildren && isOpen && (
          <div className="mt-1 space-y-1">
            {item.children.map(child => renderItem(child, depth + 1, item.id))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Navigation & Menus</h1>
          <p className="text-sm text-muted-foreground mt-1">Customize the main menu, sub-menus, and footer navigation on your site.</p>
        </div>
      </div>

      {/* Menu Tabs */}
      <div className="flex items-center gap-2">
        {menus.map(m => (
          <button
            key={m.id}
            onClick={() => setActiveMenu(m.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeMenu === m.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Live Preview */}
      <div className="section-card">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview</h2>
        </div>
        <div className="px-5 py-3 bg-muted/30">
          {activeMenu === "main" ? (
            <nav className="flex items-center gap-1">
              {currentMenu.items.filter(i => i.visible).map(item => (
                <div key={item.id} className="relative group/nav">
                  <span className="px-3 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-muted cursor-pointer flex items-center gap-1">
                    {item.label}
                    {item.children.filter(c => c.visible).length > 0 && <ChevronDown className="h-3 w-3" />}
                  </span>
                  {item.children.filter(c => c.visible).length > 0 && (
                    <div className="hidden group-hover/nav:block absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[160px] z-10">
                      {item.children.filter(c => c.visible).map(child => (
                        <span key={child.id} className="block px-3 py-1.5 text-sm text-foreground hover:bg-muted cursor-pointer">
                          {child.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          ) : (
            <div className="flex items-center gap-4">
              {currentMenu.items.filter(i => i.visible).map(item => (
                <span key={item.id} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                  {item.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="section-card">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">{currentMenu.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{currentMenu.description}</p>
          </div>
          <Button size="sm" className="gap-2" onClick={() => openNewItem(null)}>
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </div>
        <div className="p-4 space-y-1">
          {currentMenu.items.map(item => renderItem(item))}
          {currentMenu.items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MenuIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No menu items yet. Click "Add Item" to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit / New Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isNew ? "Add Menu Item" : "Edit Menu Item"}</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Label</Label>
                <Input value={editItem.label} onChange={e => setEditItem({ ...editItem, label: e.target.value })} placeholder="Menu label..." />
              </div>
              <div className="space-y-2">
                <Label>Link To</Label>
                <Select
                  value={PAGE_OPTIONS.some(p => p.value === editItem.url) ? editItem.url : "__custom__"}
                  onValueChange={v => {
                    if (v !== "__custom__") setEditItem({ ...editItem, url: v });
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAGE_OPTIONS.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!PAGE_OPTIONS.some(p => p.value === editItem.url) && (
                  <Input value={editItem.url} onChange={e => setEditItem({ ...editItem, url: e.target.value })} placeholder="https://... or /path" className="mt-2" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Visible</Label>
                <Switch checked={editItem.visible} onCheckedChange={v => setEditItem({ ...editItem, visible: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Open in new tab</Label>
                <Switch checked={editItem.openInNewTab} onCheckedChange={v => setEditItem({ ...editItem, openInNewTab: v })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEditItem} disabled={!editItem?.label.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
