import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Plus, GripVertical, Edit, Trash2, ChevronRight, ChevronDown,
  Eye, EyeOff, ExternalLink, Menu as MenuIcon, Globe, Upload,
  Facebook, Instagram, Twitter, Youtube, Linkedin, Search, Lock,
  ArrowRightLeft, Columns3, Move,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Types ───────────────────────────────────────────────────────────────────

type BarId = "topbar" | "main" | "footer";

interface MenuItem {
  id: string;
  label: string;
  url: string;
  visible: boolean;
  openInNewTab: boolean;
  locked?: boolean;          // cannot delete or move out of its bar
  lockedKind?: string;       // e.g. 'social', 'language', 'leagueSwitch', 'season', 'divisions', 'search'
  footerOnly?: boolean;      // footer item not duplicated in headers
  style?: "link" | "button" | "dropdown";
  children: MenuItem[];
}

interface FooterColumn {
  id: string;
  heading: string;
  items: MenuItem[];
}

interface FooterConfig {
  columns: FooterColumn[];
  showSocial: boolean;
  showCopyright: boolean;
  copyrightText: string;
  showPoweredBy: boolean;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  visible: boolean;
}

interface NavConfig {
  topBar: MenuItem[];
  mainMenu: MenuItem[];
  footer: FooterConfig;
  showLogo: boolean;
  logoUrl: string;
  showLanguagePicker: boolean;
  languages: { code: string; label: string; enabled: boolean }[];
  socialLinks: SocialLink[];
  showLeagueSwitcher: boolean;
  showSeasonSelector: boolean;
  showDivisionsSelector: boolean;
  showSearch: boolean;
  mainMenuUppercase: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SOCIAL_PLATFORMS = [
  { key: "facebook", label: "Facebook", icon: Facebook },
  { key: "instagram", label: "Instagram", icon: Instagram },
  { key: "twitter", label: "X / Twitter", icon: Twitter },
  { key: "youtube", label: "YouTube", icon: Youtube },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin },
  { key: "tiktok", label: "TikTok", icon: Globe },
];

const getSocialIcon = (platform: string) => SOCIAL_PLATFORMS.find(p => p.key === platform)?.icon || Globe;

const PAGE_OPTIONS = [
  { label: "Home", value: "/" },
  { label: "Calendar", value: "/calendar" },
  { label: "Schedule", value: "/schedule" },
  { label: "Standings", value: "/standings" },
  { label: "Teams", value: "/teams" },
  { label: "Stats", value: "/stats" },
  { label: "News", value: "/news" },
  { label: "Articles", value: "/articles" },
  { label: "Accolades", value: "/accolades" },
  { label: "Roster Verification", value: "/roster-verification" },
  { label: "Register", value: "/register" },
  { label: "About", value: "/about" },
  { label: "Contact", value: "/contact" },
  { label: "Shop", value: "/shop" },
  { label: "Rules & Policies", value: "/rules" },
  { label: "Privacy Policy", value: "/privacy" },
  { label: "Custom URL...", value: "__custom__" },
];

const newId = () => String(Date.now()) + Math.random().toString(36).slice(2, 6);

const INITIAL_CONFIG: NavConfig = {
  showLogo: true,
  logoUrl: "",
  showLanguagePicker: true,
  showLeagueSwitcher: true,
  showSeasonSelector: true,
  showDivisionsSelector: true,
  showSearch: true,
  mainMenuUppercase: true,
  languages: [
    { code: "en", label: "English", enabled: true },
    { code: "fr", label: "Français", enabled: true },
    { code: "es", label: "Español", enabled: false },
  ],
  socialLinks: [
    { id: "s1", platform: "facebook", url: "https://facebook.com/metroflagleague", visible: true },
    { id: "s2", platform: "instagram", url: "https://instagram.com/metroflagleague", visible: true },
    { id: "s3", platform: "twitter", url: "https://x.com/metroflagleague", visible: true },
  ],
  topBar: [
    { id: "tb-about", label: "About Us", url: "/about", visible: true, openInNewTab: false, children: [] },
    { id: "tb-rules", label: "Rules and Regulations", url: "/rules", visible: true, openInNewTab: false, children: [] },
    { id: "tb-faq", label: "FAQs", url: "/faq", visible: true, openInNewTab: false, children: [] },
    { id: "tb-news", label: "Latest News", url: "/news", visible: true, openInNewTab: false, children: [] },
  ],
  mainMenu: [
    { id: "m-home", label: "Home", url: "/", visible: true, openInNewTab: false, locked: true, children: [] },
    { id: "m-cal", label: "Calendar", url: "/calendar", visible: true, openInNewTab: false, locked: true, children: [] },
    { id: "m-acc", label: "Accolades", url: "/accolades", visible: true, openInNewTab: false, locked: true, children: [] },
    { id: "m-rv", label: "Roster Verification", url: "/roster-verification", visible: true, openInNewTab: false, locked: true, children: [] },
    { id: "m-articles", label: "Articles", url: "/articles", visible: true, openInNewTab: false, children: [] },
  ],
  footer: {
    showSocial: true,
    showCopyright: true,
    copyrightText: "© Metro Flag League. All rights reserved.",
    showPoweredBy: true,
    columns: [
      { id: "fc1", heading: "League", items: [
        { id: "f1", label: "About", url: "/about", visible: true, openInNewTab: false, footerOnly: true, children: [] },
        { id: "f2", label: "Contact", url: "/contact", visible: true, openInNewTab: false, footerOnly: true, children: [] },
        { id: "f3", label: "Sponsors", url: "/sponsors", visible: true, openInNewTab: false, footerOnly: true, children: [] },
      ]},
      { id: "fc2", heading: "Compete", items: [
        { id: "f4", label: "Schedule", url: "/schedule", visible: true, openInNewTab: false, footerOnly: false, children: [] },
        { id: "f5", label: "Standings", url: "/standings", visible: true, openInNewTab: false, footerOnly: false, children: [] },
        { id: "f6", label: "Stats", url: "/stats", visible: true, openInNewTab: false, footerOnly: false, children: [] },
      ]},
      { id: "fc3", heading: "Legal", items: [
        { id: "f7", label: "Privacy Policy", url: "/privacy", visible: true, openInNewTab: false, footerOnly: true, children: [] },
        { id: "f8", label: "Terms of Use", url: "/terms", visible: true, openInNewTab: false, footerOnly: true, children: [] },
      ]},
    ],
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function NavigationMenusPage() {
  const [config, setConfig] = useState<NavConfig>(INITIAL_CONFIG);
  const [activeBar, setActiveBar] = useState<BarId>("main");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [editContext, setEditContext] = useState<{
    bar: BarId;
    parentId: string | null;
    columnId?: string;
    isNew: boolean;
  } | null>(null);

  const toggleExpand = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  // ─── Item helpers ──────────────────────────────────────────────────────

  const getBarItems = (bar: BarId): MenuItem[] => {
    if (bar === "topbar") return config.topBar;
    if (bar === "main") return config.mainMenu;
    return config.footer.columns.flatMap(c => c.items);
  };

  const setBarItems = (bar: BarId, items: MenuItem[]) => {
    if (bar === "topbar") setConfig(p => ({ ...p, topBar: items }));
    else if (bar === "main") setConfig(p => ({ ...p, mainMenu: items }));
  };

  const updateColumnItems = (columnId: string, items: MenuItem[]) => {
    setConfig(p => ({
      ...p,
      footer: { ...p.footer, columns: p.footer.columns.map(c => c.id === columnId ? { ...c, items } : c) },
    }));
  };

  const mapTree = (items: MenuItem[], fn: (i: MenuItem) => MenuItem | null): MenuItem[] =>
    items.flatMap(item => {
      const r = fn(item);
      if (r === null) return [];
      return [{ ...r, children: mapTree(r.children, fn) }];
    });

  const toggleVisibility = (bar: BarId, id: string, columnId?: string) => {
    const fn = (i: MenuItem) => i.id === id ? { ...i, visible: !i.visible } : i;
    if (bar === "footer" && columnId) {
      const col = config.footer.columns.find(c => c.id === columnId);
      if (col) updateColumnItems(columnId, mapTree(col.items, fn));
    } else {
      setBarItems(bar, mapTree(getBarItems(bar), fn));
    }
  };

  const deleteItem = (bar: BarId, id: string, columnId?: string) => {
    const fn = (i: MenuItem) => i.id === id ? null : i;
    if (bar === "footer" && columnId) {
      const col = config.footer.columns.find(c => c.id === columnId);
      if (col) updateColumnItems(columnId, mapTree(col.items, fn));
    } else {
      setBarItems(bar, mapTree(getBarItems(bar), fn));
    }
    toast({ title: "Removed", description: "Menu item deleted." });
  };

  const moveItem = (items: MenuItem[], id: string, dir: "up" | "down"): MenuItem[] => {
    const idx = items.findIndex(i => i.id === id);
    if (idx < 0) return items.map(i => ({ ...i, children: moveItem(i.children, id, dir) }));
    if ((dir === "up" && idx === 0) || (dir === "down" && idx === items.length - 1)) return items;
    const out = [...items];
    const swap = dir === "up" ? idx - 1 : idx + 1;
    [out[idx], out[swap]] = [out[swap], out[idx]];
    return out;
  };

  const moveBar = (bar: BarId, id: string, dir: "up" | "down", columnId?: string) => {
    if (bar === "footer" && columnId) {
      const col = config.footer.columns.find(c => c.id === columnId);
      if (col) updateColumnItems(columnId, moveItem(col.items, id, dir));
    } else {
      setBarItems(bar, moveItem(getBarItems(bar), id, dir));
    }
  };

  const findItem = (items: MenuItem[], id: string): MenuItem | null => {
    for (const i of items) {
      if (i.id === id) return i;
      const f = findItem(i.children, id);
      if (f) return f;
    }
    return null;
  };

  const moveItemToBar = (fromBar: BarId, itemId: string, toBar: BarId, fromColumnId?: string) => {
    let item: MenuItem | null = null;
    if (fromBar === "footer" && fromColumnId) {
      const col = config.footer.columns.find(c => c.id === fromColumnId);
      item = col ? findItem(col.items, itemId) : null;
    } else {
      item = findItem(getBarItems(fromBar), itemId);
    }
    if (!item || item.locked) {
      toast({ title: "Cannot move", description: "This item is locked to its bar.", variant: "destructive" });
      return;
    }
    // Remove from source
    if (fromBar === "footer" && fromColumnId) {
      const col = config.footer.columns.find(c => c.id === fromColumnId);
      if (col) updateColumnItems(fromColumnId, mapTree(col.items, i => i.id === itemId ? null : i));
    } else {
      setBarItems(fromBar, mapTree(getBarItems(fromBar), i => i.id === itemId ? null : i));
    }
    // Add to destination
    const cleaned = { ...item, footerOnly: toBar === "footer" ? true : false };
    setTimeout(() => {
      if (toBar === "footer") {
        const firstCol = config.footer.columns[0];
        if (firstCol) updateColumnItems(firstCol.id, [...firstCol.items, cleaned]);
      } else if (toBar === "topbar") {
        setConfig(p => ({ ...p, topBar: [...p.topBar, cleaned] }));
      } else {
        setConfig(p => ({ ...p, mainMenu: [...p.mainMenu, cleaned] }));
      }
    }, 0);
    toast({ title: "Moved", description: `"${item.label}" moved to ${toBar === "topbar" ? "Top Bar" : toBar === "main" ? "Main Menu" : "Footer"}.` });
  };

  // ─── Edit dialog ───────────────────────────────────────────────────────

  const openNewItem = (bar: BarId, parentId: string | null = null, columnId?: string) => {
    setEditItem({
      id: newId(), label: "", url: "/", visible: true, openInNewTab: false,
      footerOnly: bar === "footer", style: "link", children: [],
    });
    setEditContext({ bar, parentId, columnId, isNew: true });
    setEditOpen(true);
  };

  const openEditItem = (bar: BarId, item: MenuItem, parentId: string | null = null, columnId?: string) => {
    setEditItem({ ...item });
    setEditContext({ bar, parentId, columnId, isNew: false });
    setEditOpen(true);
  };

  const saveEditItem = () => {
    if (!editItem || !editItem.label.trim() || !editContext) return;
    const { bar, parentId, columnId, isNew } = editContext;

    const insertChild = (list: MenuItem[]): MenuItem[] =>
      list.map(i => i.id === parentId
        ? { ...i, children: [...i.children, editItem] }
        : { ...i, children: insertChild(i.children) });

    const updateExisting = (list: MenuItem[]): MenuItem[] =>
      list.map(i => i.id === editItem.id
        ? { ...editItem, children: i.children }
        : { ...i, children: updateExisting(i.children) });

    if (bar === "footer" && columnId) {
      const col = config.footer.columns.find(c => c.id === columnId);
      if (!col) return;
      const items = col.items;
      if (isNew) {
        updateColumnItems(columnId, parentId ? insertChild(items) : [...items, editItem]);
      } else {
        updateColumnItems(columnId, updateExisting(items));
      }
    } else {
      const items = getBarItems(bar);
      if (isNew) {
        setBarItems(bar, parentId ? insertChild(items) : [...items, editItem]);
      } else {
        setBarItems(bar, updateExisting(items));
      }
    }
    setEditOpen(false);
    toast({ title: "Saved", description: `"${editItem.label}" ${isNew ? "added" : "updated"}.` });
  };

  // ─── Footer columns ────────────────────────────────────────────────────

  const addFooterColumn = () => {
    if (config.footer.columns.length >= 4) {
      toast({ title: "Limit reached", description: "Up to 4 footer columns allowed.", variant: "destructive" });
      return;
    }
    setConfig(p => ({
      ...p,
      footer: { ...p.footer, columns: [...p.footer.columns, { id: newId(), heading: "New Column", items: [] }] },
    }));
  };

  const renameColumn = (id: string, heading: string) => {
    setConfig(p => ({
      ...p,
      footer: { ...p.footer, columns: p.footer.columns.map(c => c.id === id ? { ...c, heading } : c) },
    }));
  };

  const deleteColumn = (id: string) => {
    setConfig(p => ({ ...p, footer: { ...p.footer, columns: p.footer.columns.filter(c => c.id !== id) } }));
  };

  const moveColumn = (id: string, dir: "left" | "right") => {
    const cols = [...config.footer.columns];
    const idx = cols.findIndex(c => c.id === id);
    if (idx < 0) return;
    const swap = dir === "left" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= cols.length) return;
    [cols[idx], cols[swap]] = [cols[swap], cols[idx]];
    setConfig(p => ({ ...p, footer: { ...p.footer, columns: cols } }));
  };

  // ─── Social / language / locked toggles ────────────────────────────────

  const updateSocialUrl = (id: string, url: string) =>
    setConfig(p => ({ ...p, socialLinks: p.socialLinks.map(s => s.id === id ? { ...s, url } : s) }));
  const toggleSocialVisible = (id: string) =>
    setConfig(p => ({ ...p, socialLinks: p.socialLinks.map(s => s.id === id ? { ...s, visible: !s.visible } : s) }));
  const addSocialLink = (platform: string) => {
    if (config.socialLinks.some(s => s.platform === platform)) return;
    setConfig(p => ({ ...p, socialLinks: [...p.socialLinks, { id: newId(), platform, url: "", visible: true }] }));
  };
  const removeSocialLink = (id: string) =>
    setConfig(p => ({ ...p, socialLinks: p.socialLinks.filter(s => s.id !== id) }));
  const toggleLanguage = (code: string) =>
    setConfig(p => ({ ...p, languages: p.languages.map(l => l.code === code ? { ...l, enabled: !l.enabled } : l) }));

  // ─── Render menu item row ──────────────────────────────────────────────

  const renderItem = (
    item: MenuItem, bar: BarId, depth: number = 0,
    parentId: string | null = null, columnId?: string,
  ) => {
    const hasChildren = item.children.length > 0;
    const isOpen = expanded[item.id];

    const moveTargets: BarId[] = (["topbar", "main", "footer"] as BarId[]).filter(b => b !== bar);

    return (
      <div key={item.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors group ${!item.visible ? "opacity-50" : ""}`}
          style={{ marginLeft: depth * 28 }}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          {hasChildren ? (
            <button onClick={() => toggleExpand(item.id)} className="p-0.5">
              {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
          ) : <div className="w-[18px]" />}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              {item.locked && <Badge variant="secondary" className="text-[10px] gap-0.5"><Lock className="h-2.5 w-2.5" /> Locked</Badge>}
              {!item.visible && <Badge variant="secondary" className="text-[10px] gap-0.5"><EyeOff className="h-2.5 w-2.5" /> Hidden</Badge>}
              {item.openInNewTab && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
              {hasChildren && <Badge variant="outline" className="text-[10px]">Dropdown</Badge>}
            </div>
            <span className="text-xs text-muted-foreground font-mono">{item.url}</span>
          </div>

          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleVisibility(bar, item.id, columnId)} title={item.visible ? "Hide" : "Show"}>
              {item.visible ? <Eye className="h-3.5 w-3.5 text-muted-foreground" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveBar(bar, item.id, "up", columnId)}>
              <span className="text-xs text-muted-foreground">↑</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveBar(bar, item.id, "down", columnId)}>
              <span className="text-xs text-muted-foreground">↓</span>
            </Button>
            {depth === 0 && bar !== "footer" && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openNewItem(bar, item.id)} title="Add sub-item">
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            )}
            {!item.locked && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Move to another bar">
                    <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {moveTargets.map(t => (
                    <DropdownMenuItem key={t} onClick={() => moveItemToBar(bar, item.id, t, columnId)}>
                      <Move className="h-3.5 w-3.5 mr-2" />
                      Move to {t === "topbar" ? "Top Bar" : t === "main" ? "Main Menu" : "Footer"}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditItem(bar, item, parentId, columnId)}>
              <Edit className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            {!item.locked && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteItem(bar, item.id, columnId)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        {hasChildren && isOpen && (
          <div className="mt-1 space-y-1">
            {item.children.map(child => renderItem(child, bar, depth + 1, item.id, columnId))}
          </div>
        )}
      </div>
    );
  };

  // ─── Previews ──────────────────────────────────────────────────────────

  const TopBarPreview = () => (
    <div className="px-5 py-2.5 bg-card border-b border-border">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {config.showLogo && (
            config.logoUrl
              ? <img src={config.logoUrl} alt="Logo" className="h-7" />
              : <div className="w-7 h-7 rounded-full border-2 border-foreground/40 flex items-center justify-center text-[9px] font-bold text-foreground">LOGO</div>
          )}
          {config.showSeasonSelector && (
            <div className="text-xs px-3 py-1 border border-border rounded text-foreground bg-background">Winter 2025-26 ▾</div>
          )}
          {config.showLeagueSwitcher && (
            <div className="text-xs px-3 py-1 border border-border rounded text-foreground bg-background">Switch League ▾</div>
          )}
          {config.showDivisionsSelector && (
            <div className="text-xs px-3 py-1 text-foreground font-semibold">Divisions ▾</div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {config.topBar.filter(p => p.visible).map(p => (
            <span key={p.id} className="text-xs text-foreground/70 hover:text-foreground cursor-pointer flex items-center gap-1">
              {p.label}{p.children.length > 0 && <ChevronDown className="h-3 w-3" />}
            </span>
          ))}
          {config.showLanguagePicker && (
            <div className="flex items-center gap-1 text-xs text-foreground/70">
              <Globe className="h-3 w-3" />
              {config.languages.filter(l => l.enabled).map(l => l.code.toUpperCase()).join(" / ")}
            </div>
          )}
          <span className="w-px h-4 bg-border" />
          {config.socialLinks.filter(s => s.visible).map(s => {
            const I = getSocialIcon(s.platform);
            return <I key={s.id} className="h-3.5 w-3.5 text-foreground/60 hover:text-foreground cursor-pointer" />;
          })}
        </div>
      </div>
    </div>
  );

  const MainMenuPreview = () => (
    <div className="px-5 py-3 bg-foreground">
      <nav className="flex items-center gap-1 justify-between">
        <div className="flex items-center gap-1">
          {config.mainMenu.filter(i => i.visible).map(item => (
            <span key={item.id} className="px-3 py-1.5 rounded text-sm font-semibold text-background hover:bg-background/10 cursor-pointer flex items-center gap-1 uppercase tracking-wide">
              {item.label}
              {item.children.filter(c => c.visible).length > 0 && <ChevronDown className="h-3 w-3" />}
            </span>
          ))}
        </div>
        {config.showSearch && <Search className="h-4 w-4 text-background/70" />}
      </nav>
    </div>
  );

  const FooterPreview = () => (
    <div className="px-5 py-6 bg-foreground text-background space-y-4">
      <div className={`grid gap-6`} style={{ gridTemplateColumns: `repeat(${config.footer.columns.length || 1}, minmax(0, 1fr))` }}>
        {config.footer.columns.map(col => (
          <div key={col.id} className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-background">{col.heading}</h4>
            <div className="space-y-1">
              {col.items.filter(i => i.visible).map(i => (
                <div key={i.id} className="text-xs text-background/70 hover:text-background cursor-pointer">{i.label}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {config.footer.showSocial && (
        <div className="flex items-center gap-3 pt-3 border-t border-background/10">
          {config.socialLinks.filter(s => s.visible).map(s => {
            const I = getSocialIcon(s.platform);
            return <I key={s.id} className="h-4 w-4 text-background/60 hover:text-background cursor-pointer" />;
          })}
        </div>
      )}
      {config.footer.showCopyright && (
        <div className="text-[11px] text-background/50">{config.footer.copyrightText}</div>
      )}
      {config.footer.showPoweredBy && (
        <div className="text-[11px] text-background/40">Powered by LeagueSuite</div>
      )}
    </div>
  );

  // ─── Render ─────────────────────────────────────────────────────────────

  const tabs: { id: BarId; name: string }[] = [
    { id: "main", name: "Main Menu (Header)" },
    { id: "topbar", name: "Top Bar (Secondary)" },
    { id: "footer", name: "Footer" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Navigation & Menus</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize the main header, secondary top bar, and footer of your public site. Move pages between bars, add dropdowns, and build a footer site map.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveBar(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeBar === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Combined header preview always visible */}
      <div className="section-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</h2>
        </div>
        {activeBar === "footer" ? <FooterPreview /> : (<><TopBarPreview /><MainMenuPreview /></>)}
      </div>

      {/* ─── MAIN MENU ────────────────────────────────────────────────── */}
      {activeBar === "main" && (
        <>
          <div className="section-card">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Main Menu Items</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Locked items (Home, Calendar, Accolades, Roster Verification) can be hidden and reordered but not removed. Add custom pages and dropdowns below.</p>
              </div>
              <Button size="sm" className="gap-2" onClick={() => openNewItem("main")}>
                <Plus className="h-4 w-4" /> Add Item
              </Button>
            </div>
            <div className="p-4 space-y-1">
              {config.mainMenu.map(item => renderItem(item, "main"))}
            </div>
          </div>

          <div className="section-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Header Tools</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Toggle utilities locked to the main header bar.</p>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Show search icon</Label>
                <Switch checked={config.showSearch} onCheckedChange={v => setConfig(p => ({ ...p, showSearch: v }))} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── TOP BAR ─────────────────────────────────────────────────── */}
      {activeBar === "topbar" && (
        <>
          <div className="section-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Locked Top Bar Tools</h2>
              <p className="text-xs text-muted-foreground mt-0.5">These utilities live in the top bar permanently. Toggle them on or off.</p>
            </div>
            <div className="p-5 space-y-3">
              {[
                { key: "showLogo", label: "Logo" },
                { key: "showSeasonSelector", label: "Season selector" },
                { key: "showLeagueSwitcher", label: "Switch leagues dropdown (multi-league tenants)" },
                { key: "showDivisionsSelector", label: "Divisions dropdown" },
                { key: "showLanguagePicker", label: "Language picker" },
              ].map(o => (
                <div key={o.key} className="flex items-center justify-between">
                  <Label className="flex items-center gap-2"><Lock className="h-3 w-3 text-muted-foreground" />{o.label}</Label>
                  <Switch
                    checked={(config as any)[o.key]}
                    onCheckedChange={v => setConfig(p => ({ ...p, [o.key]: v } as NavConfig))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Logo upload */}
          {config.showLogo && (
            <div className="section-card">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">League Logo</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Displayed at the left of the top bar.</p>
              </div>
              <div className="p-5">
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  {config.logoUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={config.logoUrl} alt="Logo" className="h-12 object-contain" />
                      <Button variant="ghost" size="sm" onClick={() => setConfig(p => ({ ...p, logoUrl: "" }))}>Remove</Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="h-8 w-8" />
                      <span className="text-sm">Click to upload logo</span>
                      <span className="text-xs">PNG, SVG, or JPG</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Social links */}
          <div className="section-card">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Social Media Icons</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Shown on the right of the top bar.</p>
              </div>
              <Select onValueChange={addSocialLink}>
                <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Add platform" /></SelectTrigger>
                <SelectContent>
                  {SOCIAL_PLATFORMS.filter(p => !config.socialLinks.some(s => s.platform === p.key)).map(p => (
                    <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 space-y-2">
              {config.socialLinks.map(s => {
                const plat = SOCIAL_PLATFORMS.find(p => p.key === s.platform);
                const Icon = plat?.icon || Globe;
                return (
                  <div key={s.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border ${!s.visible ? "opacity-50" : ""}`}>
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-foreground w-20 shrink-0">{plat?.label}</span>
                    <Input value={s.url} onChange={e => updateSocialUrl(s.id, e.target.value)} placeholder={`https://${s.platform}.com/...`} className="h-8 text-xs flex-1" />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleSocialVisible(s.id)}>
                      {s.visible ? <Eye className="h-3.5 w-3.5 text-muted-foreground" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeSocialLink(s.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Languages */}
          {config.showLanguagePicker && (
            <div className="section-card">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Languages</h2>
              </div>
              <div className="p-5 space-y-2">
                {config.languages.map(lang => (
                  <div key={lang.code} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{lang.label}</span>
                      <Badge variant="secondary" className="text-[10px] font-mono">{lang.code.toUpperCase()}</Badge>
                    </div>
                    <Switch checked={lang.enabled} onCheckedChange={() => toggleLanguage(lang.code)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom links */}
          <div className="section-card">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Top Bar Links</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Custom page links and dropdowns. Move them to the Main Menu or Footer at any time.</p>
              </div>
              <Button size="sm" className="gap-2" onClick={() => openNewItem("topbar")}>
                <Plus className="h-4 w-4" /> Add Link
              </Button>
            </div>
            <div className="p-4 space-y-1">
              {config.topBar.map(item => renderItem(item, "topbar"))}
              {config.topBar.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <MenuIcon className="h-6 w-6 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No top bar links yet.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ─── FOOTER ──────────────────────────────────────────────────── */}
      {activeBar === "footer" && (
        <>
          <div className="section-card">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><Columns3 className="h-4 w-4" /> Footer Columns</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Group footer links into up to 4 columns. Add a column for a site map.</p>
              </div>
              <Button size="sm" className="gap-2" onClick={addFooterColumn} disabled={config.footer.columns.length >= 4}>
                <Plus className="h-4 w-4" /> Add Column
              </Button>
            </div>
            <div className="p-4 space-y-4">
              {config.footer.columns.map((col, idx) => (
                <div key={col.id} className="border border-border rounded-lg">
                  <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-muted/30">
                    <Input
                      value={col.heading}
                      onChange={e => renameColumn(col.id, e.target.value)}
                      className="h-8 text-sm font-semibold max-w-xs"
                    />
                    <div className="flex-1" />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveColumn(col.id, "left")} disabled={idx === 0}>
                      <span className="text-xs">←</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveColumn(col.id, "right")} disabled={idx === config.footer.columns.length - 1}>
                      <span className="text-xs">→</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 h-7" onClick={() => openNewItem("footer", null, col.id)}>
                      <Plus className="h-3.5 w-3.5" /> Link
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteColumn(col.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="p-3 space-y-1">
                    {col.items.map(item => renderItem(item, "footer", 0, null, col.id))}
                    {col.items.length === 0 && (
                      <p className="text-center text-xs text-muted-foreground py-3">No links in this column yet.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Footer Settings</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Label>Show social media icons</Label>
                <Switch checked={config.footer.showSocial} onCheckedChange={v => setConfig(p => ({ ...p, footer: { ...p.footer, showSocial: v } }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show "Powered by LeagueSuite"</Label>
                <Switch checked={config.footer.showPoweredBy} onCheckedChange={v => setConfig(p => ({ ...p, footer: { ...p.footer, showPoweredBy: v } }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show copyright line</Label>
                <Switch checked={config.footer.showCopyright} onCheckedChange={v => setConfig(p => ({ ...p, footer: { ...p.footer, showCopyright: v } }))} />
              </div>
              {config.footer.showCopyright && (
                <div className="space-y-2">
                  <Label>Copyright text</Label>
                  <Textarea
                    value={config.footer.copyrightText}
                    onChange={e => setConfig(p => ({ ...p, footer: { ...p.footer, copyrightText: e.target.value } }))}
                    rows={2}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Edit / New Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editContext?.isNew ? "Add Menu Item" : "Edit Menu Item"}</DialogTitle>
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
                  onValueChange={v => { if (v !== "__custom__") setEditItem({ ...editItem, url: v }); else setEditItem({ ...editItem, url: "" }); }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAGE_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {!PAGE_OPTIONS.some(p => p.value === editItem.url && p.value !== "__custom__") && (
                  <Input value={editItem.url} onChange={e => setEditItem({ ...editItem, url: e.target.value })} placeholder="https://... or /path" className="mt-2" />
                )}
              </div>
              <div className="space-y-2">
                <Label>Style</Label>
                <Select value={editItem.style || "link"} onValueChange={(v: any) => setEditItem({ ...editItem, style: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="link">Plain link</SelectItem>
                    <SelectItem value="button">Button (highlighted)</SelectItem>
                    <SelectItem value="dropdown">Dropdown parent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Visible</Label>
                <Switch checked={editItem.visible} onCheckedChange={v => setEditItem({ ...editItem, visible: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Open in new tab</Label>
                <Switch checked={editItem.openInNewTab} onCheckedChange={v => setEditItem({ ...editItem, openInNewTab: v })} />
              </div>
              {editContext?.bar === "footer" && (
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Show only in footer</Label>
                  <Switch checked={!!editItem.footerOnly} onCheckedChange={v => setEditItem({ ...editItem, footerOnly: v })} />
                </div>
              )}
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
