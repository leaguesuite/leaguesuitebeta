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
  Eye, EyeOff, ExternalLink, Menu as MenuIcon, Globe, Upload,
  Facebook, Instagram, Twitter, Youtube, Linkedin, Github,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MenuItem {
  id: string;
  label: string;
  url: string;
  visible: boolean;
  openInNewTab: boolean;
  children: MenuItem[];
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  visible: boolean;
}

interface TopBarConfig {
  showLogo: boolean;
  logoUrl: string;
  showLanguagePicker: boolean;
  languages: { code: string; label: string; enabled: boolean }[];
  socialLinks: SocialLink[];
  customPages: MenuItem[];
}

interface MenuSet {
  id: string;
  name: string;
  description: string;
  items: MenuItem[];
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

const getSocialIcon = (platform: string) => {
  const found = SOCIAL_PLATFORMS.find(p => p.key === platform);
  return found ? found.icon : Globe;
};

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

const INITIAL_TOPBAR: TopBarConfig = {
  showLogo: true,
  logoUrl: "",
  showLanguagePicker: true,
  languages: [
    { code: "en", label: "English", enabled: true },
    { code: "fr", label: "Français", enabled: true },
    { code: "es", label: "Español", enabled: false },
  ],
  socialLinks: [
    { id: "s1", platform: "facebook", url: "https://facebook.com/metroflagleague", visible: true },
    { id: "s2", platform: "instagram", url: "https://instagram.com/metroflagleague", visible: true },
    { id: "s3", platform: "twitter", url: "https://x.com/metroflagleague", visible: true },
    { id: "s4", platform: "youtube", url: "", visible: false },
  ],
  customPages: [
    { id: "tb1", label: "Shop", url: "/shop", visible: true, openInNewTab: false, children: [] },
    { id: "tb2", label: "Contact", url: "/contact", visible: true, openInNewTab: false, children: [] },
  ],
};

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
  { label: "Shop", value: "/shop" },
  { label: "Rules & Policies", value: "/rules" },
  { label: "Custom URL...", value: "__custom__" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function NavigationMenusPage() {
  const [menus, setMenus] = useState<MenuSet[]>(INITIAL_MENUS);
  const [topBar, setTopBar] = useState<TopBarConfig>(INITIAL_TOPBAR);
  const [activeMenu, setActiveMenu] = useState("topbar");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ m2: true, m4: true, m5: true });
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [editParentId, setEditParentId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);

  const currentMenu = menus.find(m => m.id === activeMenu);

  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const updateMenuItems = (newItems: MenuItem[]) => {
    if (activeMenu === "topbar") {
      setTopBar(prev => ({ ...prev, customPages: newItems }));
    } else {
      setMenus(prev => prev.map(m => m.id === activeMenu ? { ...m, items: newItems } : m));
    }
  };

  const getActiveItems = () => {
    if (activeMenu === "topbar") return topBar.customPages;
    return currentMenu?.items || [];
  };

  const toggleVisibility = (id: string) => {
    const toggle = (items: MenuItem[]): MenuItem[] =>
      items.map(item => {
        if (item.id === id) return { ...item, visible: !item.visible };
        if (item.children.length) return { ...item, children: toggle(item.children) };
        return item;
      });
    updateMenuItems(toggle(getActiveItems()));
  };

  const deleteItem = (id: string) => {
    const remove = (items: MenuItem[]): MenuItem[] =>
      items.filter(item => item.id !== id).map(item => ({ ...item, children: remove(item.children) }));
    updateMenuItems(remove(getActiveItems()));
    toast({ title: "Removed", description: "Menu item deleted." });
  };

  const openEditItem = (item: MenuItem, parentId: string | null = null) => {
    setEditItem({ ...item });
    setEditParentId(parentId);
    setIsNew(false);
    setEditOpen(true);
  };

  const openNewItem = (parentId: string | null = null) => {
    setEditItem({ id: String(Date.now()), label: "", url: "/", visible: true, openInNewTab: false, children: [] });
    setEditParentId(parentId);
    setIsNew(true);
    setEditOpen(true);
  };

  const saveEditItem = () => {
    if (!editItem || !editItem.label.trim()) return;
    const items = getActiveItems();
    if (isNew) {
      if (editParentId) {
        const addChild = (list: MenuItem[]): MenuItem[] =>
          list.map(item => item.id === editParentId ? { ...item, children: [...item.children, editItem] } : { ...item, children: addChild(item.children) });
        updateMenuItems(addChild(items));
      } else {
        updateMenuItems([...items, editItem]);
      }
    } else {
      const update = (list: MenuItem[]): MenuItem[] =>
        list.map(item => item.id === editItem.id ? { ...editItem, children: item.children } : { ...item, children: update(item.children) });
      updateMenuItems(update(items));
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

  // ─── Social Links Management ────────────────────────────────────────────

  const updateSocialUrl = (id: string, url: string) => {
    setTopBar(prev => ({ ...prev, socialLinks: prev.socialLinks.map(s => s.id === id ? { ...s, url } : s) }));
  };

  const toggleSocialVisible = (id: string) => {
    setTopBar(prev => ({ ...prev, socialLinks: prev.socialLinks.map(s => s.id === id ? { ...s, visible: !s.visible } : s) }));
  };

  const addSocialLink = (platform: string) => {
    if (topBar.socialLinks.some(s => s.platform === platform)) return;
    setTopBar(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { id: String(Date.now()), platform, url: "", visible: true }],
    }));
  };

  const removeSocialLink = (id: string) => {
    setTopBar(prev => ({ ...prev, socialLinks: prev.socialLinks.filter(s => s.id !== id) }));
  };

  const toggleLanguage = (code: string) => {
    setTopBar(prev => ({
      ...prev,
      languages: prev.languages.map(l => l.code === code ? { ...l, enabled: !l.enabled } : l),
    }));
  };

  // ─── Render Menu Item ───────────────────────────────────────────────────

  const renderItem = (item: MenuItem, depth: number = 0, parentId: string | null = null) => {
    const hasChildren = item.children.length > 0;
    const isOpen = expanded[item.id];
    const items = getActiveItems();

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
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              {!item.visible && <Badge variant="secondary" className="text-[10px] gap-0.5"><EyeOff className="h-2.5 w-2.5" /> Hidden</Badge>}
              {item.openInNewTab && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
            </div>
            <span className="text-xs text-muted-foreground font-mono">{item.url}</span>
          </div>

          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleVisibility(item.id)}>
              {item.visible ? <Eye className="h-3.5 w-3.5 text-muted-foreground" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateMenuItems(moveItem(item.id, "up", items))}>
              <span className="text-xs text-muted-foreground">↑</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateMenuItems(moveItem(item.id, "down", items))}>
              <span className="text-xs text-muted-foreground">↓</span>
            </Button>
            {depth === 0 && activeMenu !== "topbar" && (
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

  // ─── Render ─────────────────────────────────────────────────────────────

  const allTabs = [
    { id: "topbar", name: "Top Bar" },
    ...menus.map(m => ({ id: m.id, name: m.name })),
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Navigation & Menus</h1>
        <p className="text-sm text-muted-foreground mt-1">Customize the top bar, main menu, sub-menus, and footer navigation on your site.</p>
      </div>

      {/* Menu Tabs */}
      <div className="flex items-center gap-2">
        {allTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveMenu(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeMenu === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* ─── TOP BAR ─────────────────────────────────────────────────── */}
      {activeMenu === "topbar" && (
        <>
          {/* Top Bar Preview */}
          <div className="section-card">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview</h2>
            </div>
            <div className="px-5 py-2.5 bg-foreground/95">
              <div className="flex items-center justify-between">
                {/* Left: Social Icons */}
                <div className="flex items-center gap-2">
                  {topBar.socialLinks.filter(s => s.visible).map(s => {
                    const Icon = getSocialIcon(s.platform);
                    return <Icon key={s.id} className="h-3.5 w-3.5 text-background/70 hover:text-background cursor-pointer transition-colors" />;
                  })}
                </div>

                {/* Center: Logo */}
                {topBar.showLogo && (
                  <div className="flex items-center gap-2">
                    {topBar.logoUrl ? (
                      <img src={topBar.logoUrl} alt="Logo" className="h-5" />
                    ) : (
                      <div className="w-5 h-5 rounded bg-primary/80 flex items-center justify-center text-[10px] font-bold text-primary-foreground">M</div>
                    )}
                    <span className="text-xs font-semibold text-background/90">Metro Flag League</span>
                  </div>
                )}

                {/* Right: Pages + Language */}
                <div className="flex items-center gap-3">
                  {topBar.customPages.filter(p => p.visible).map(p => (
                    <span key={p.id} className="text-[11px] text-background/70 hover:text-background cursor-pointer transition-colors">{p.label}</span>
                  ))}
                  {topBar.showLanguagePicker && (
                    <div className="flex items-center gap-1 text-[11px] text-background/70">
                      <Globe className="h-3 w-3" />
                      <span>{topBar.languages.filter(l => l.enabled).map(l => l.code.toUpperCase()).join(" / ")}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="section-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">League Logo</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Displayed in the top bar. Upload your league's logo or hide it.</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Label>Show logo in top bar</Label>
                <Switch checked={topBar.showLogo} onCheckedChange={v => setTopBar(prev => ({ ...prev, showLogo: v }))} />
              </div>
              {topBar.showLogo && (
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  {topBar.logoUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={topBar.logoUrl} alt="Logo" className="h-12 object-contain" />
                      <Button variant="ghost" size="sm" onClick={() => setTopBar(prev => ({ ...prev, logoUrl: "" }))}>Remove</Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="h-8 w-8" />
                      <span className="text-sm">Click to upload logo</span>
                      <span className="text-xs">PNG, SVG, or JPG</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="section-card">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Social Media Icons</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Add social media links that display as icons in the top bar.</p>
              </div>
              <Select onValueChange={addSocialLink}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Add platform" />
                </SelectTrigger>
                <SelectContent>
                  {SOCIAL_PLATFORMS.filter(p => !topBar.socialLinks.some(s => s.platform === p.key)).map(p => (
                    <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 space-y-2">
              {topBar.socialLinks.map(s => {
                const plat = SOCIAL_PLATFORMS.find(p => p.key === s.platform);
                const Icon = plat?.icon || Globe;
                return (
                  <div key={s.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border group ${!s.visible ? "opacity-50" : ""}`}>
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-foreground w-20 shrink-0">{plat?.label}</span>
                    <Input
                      value={s.url}
                      onChange={e => updateSocialUrl(s.id, e.target.value)}
                      placeholder={`https://${s.platform}.com/...`}
                      className="h-8 text-xs flex-1"
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleSocialVisible(s.id)}>
                      {s.visible ? <Eye className="h-3.5 w-3.5 text-muted-foreground" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeSocialLink(s.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
              {topBar.socialLinks.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">No social links added. Use the dropdown above to add one.</p>
              )}
            </div>
          </div>

          {/* Language Picker */}
          <div className="section-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Language Picker</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Allow visitors to switch the site language.</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Label>Show language picker</Label>
                <Switch checked={topBar.showLanguagePicker} onCheckedChange={v => setTopBar(prev => ({ ...prev, showLanguagePicker: v }))} />
              </div>
              {topBar.showLanguagePicker && (
                <div className="space-y-2">
                  {topBar.languages.map(lang => (
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
              )}
            </div>
          </div>

          {/* Custom Pages in Top Bar */}
          <div className="section-card">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Top Bar Links</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Custom page links displayed alongside social icons and the language picker.</p>
              </div>
              <Button size="sm" className="gap-2" onClick={() => openNewItem(null)}>
                <Plus className="h-4 w-4" /> Add Link
              </Button>
            </div>
            <div className="p-4 space-y-1">
              {topBar.customPages.map(item => renderItem(item))}
              {topBar.customPages.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <MenuIcon className="h-6 w-6 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No top bar links yet.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ─── MAIN NAV / FOOTER ───────────────────────────────────────── */}
      {activeMenu !== "topbar" && currentMenu && (
        <>
          {/* Preview */}
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
                            <span key={child.id} className="block px-3 py-1.5 text-sm text-foreground hover:bg-muted cursor-pointer">{child.label}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              ) : (
                <div className="flex items-center gap-4">
                  {currentMenu.items.filter(i => i.visible).map(item => (
                    <span key={item.id} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">{item.label}</span>
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
        </>
      )}

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
                  onValueChange={v => { if (v !== "__custom__") setEditItem({ ...editItem, url: v }); }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAGE_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
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
