import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, Users, Trophy, Settings, FileText,
  ClipboardList, Shield, Plug, ChevronDown, ChevronRight, MapPin,
  BarChart3, UserCheck, Download, Globe, Layers, FolderOpen, Zap,
  PlusCircle, Flag, GitBranch, BookOpen, Image, Menu as MenuIcon,
  ScrollText, CreditCard, Code, Share2, Bell, Lock, Palette, Link2
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: { label: string; path: string; icon?: React.ElementType }[];
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/" },
    ],
  },
  {
    title: "Active Season",
    items: [
      {
        label: "Active Season", icon: CalendarDays,
        children: [
          { label: "Overview", path: "/season/overview" },
          { label: "Games / Schedule", path: "/season/games" },
          { label: "Teams / Rosters", path: "/season/teams" },
          { label: "Standings", path: "/season/standings" },
          { label: "Stats", path: "/season/stats" },
          { label: "Officials / Staff", path: "/season/officials" },
          { label: "Reports / Exports", path: "/season/reports" },
        ],
      },
    ],
  },
  {
    title: "Setup",
    items: [
      {
        label: "Season & Tournament", icon: PlusCircle,
        children: [
          { label: "New Season Wizard", path: "/setup/new-season", icon: Zap },
          { label: "Seasons", path: "/setup/seasons" },
          { label: "Tournaments", path: "/setup/tournaments" },
          { label: "Division Assignment", path: "/setup/division-assignment" },
          { label: "Conferences", path: "/setup/conferences" },
          { label: "Scheduling Setup", path: "/setup/scheduling" },
        ],
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      {
        label: "League Structure", icon: Layers,
        children: [
          { label: "Leagues", path: "/structure/leagues" },
          { label: "Categories", path: "/structure/categories" },
          { label: "Divisions", path: "/structure/divisions" },
          { label: "Conferences", path: "/structure/conferences" },
          { label: "Subdivisions", path: "/structure/subdivisions" },
          { label: "Locations & Fields", path: "/structure/locations" },
          { label: "Rules Settings", path: "/structure/rules" },
          { label: "Stats Tracking", path: "/structure/stats-tracking" },
        ],
      },
    ],
  },
  {
    title: "Registration",
    items: [
      { label: "Registration", icon: ClipboardList, path: "/registration" },
    ],
  },
  {
    title: "People",
    items: [
      {
        label: "Members", icon: Users,
        children: [
          { label: "All Members", path: "/members/all" },
          { label: "Players", path: "/members/players" },
          { label: "Coaches", path: "/members/coaches" },
          { label: "Staff", path: "/members/staff" },
          { label: "Imports / Exports", path: "/members/imports" },
        ],
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        label: "CMS", icon: FileText,
        children: [
          { label: "Pages", path: "/cms/pages" },
          { label: "Articles", path: "/cms/articles" },
          { label: "Authors", path: "/cms/authors" },
          { label: "Media / Documents", path: "/cms/media" },
          { label: "Navigation / Menus", path: "/cms/navigation" },
        ],
      },
      {
        label: "Forms", icon: ClipboardList,
        children: [
          { label: "All Forms", path: "/forms/all" },
          { label: "Submissions", path: "/forms/submissions" },
          { label: "Templates", path: "/forms/templates" },
          { label: "Payments", path: "/forms/payments" },
          { label: "Embed Settings", path: "/forms/embed" },
        ],
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        label: "Users & Permissions", icon: Shield,
        children: [
          { label: "Users", path: "/admin/users" },
          { label: "Roles", path: "/admin/roles" },
          { label: "Permission Groups", path: "/admin/permissions" },
          { label: "App Access Controls", path: "/admin/access" },
        ],
      },
      {
        label: "Integrations", icon: Plug,
        children: [
          { label: "Social Media Links", path: "/integrations/social" },
          { label: "Embeds / Widgets", path: "/integrations/embeds" },
          { label: "External Tools", path: "/integrations/tools" },
        ],
      },
      {
        label: "Settings", icon: Settings,
        children: [
          { label: "General", path: "/settings/general" },
          { label: "Branding", path: "/settings/branding" },
          { label: "Domains", path: "/settings/domains" },
          { label: "Notifications", path: "/settings/notifications" },
          { label: "Audit Log", path: "/settings/audit" },
        ],
      },
    ],
  },
];

export default function AppSidebar() {
  const location = useLocation();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navSections.forEach(s => s.items.forEach(item => {
      if (item.children?.some(c => location.pathname === c.path)) {
        initial[item.label] = true;
      }
    }));
    return initial;
  });
  const [collapsed, setCollapsed] = useState(false);

  const toggle = (label: string) => {
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path: string) => location.pathname === path;

  if (collapsed) {
    return (
      <aside className="w-14 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 shrink-0">
        <button onClick={() => setCollapsed(false)} className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground mb-4">
          <MenuIcon className="h-5 w-5" />
        </button>
        <div className="flex flex-col gap-1 items-center">
          {navSections.flatMap(s => s.items).map(item => (
            <Link
              key={item.label}
              to={item.path || item.children?.[0]?.path || "/"}
              className={`p-2 rounded-lg transition-colors ${
                item.path && isActive(item.path) ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
              title={item.label}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-60 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 overflow-hidden">
      <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Trophy className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-bold text-sm text-sidebar-accent-foreground tracking-tight">League Suite</span>
        </div>
        <button onClick={() => setCollapsed(true)} className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground">
          <MenuIcon className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navSections.map((section, si) => (
          <div key={si} className={section.title ? "mt-4 first:mt-0" : ""}>
            {section.title && (
              <div className="sidebar-section-label">{section.title}</div>
            )}
            {section.items.map(item => (
              <div key={item.label}>
                {item.path ? (
                  <Link
                    to={item.path}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                      isActive(item.path)
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => toggle(item.label)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                        item.children?.some(c => isActive(c.path))
                          ? "text-sidebar-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {openSections[item.label] ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                    {openSections[item.label] && item.children && (
                      <div className="ml-4 pl-3 border-l border-sidebar-border space-y-0.5 mt-0.5 mb-1">
                        {item.children.map(child => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`block px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                              isActive(child.path)
                                ? "bg-sidebar-accent text-sidebar-primary font-medium"
                                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-sidebar-accent-foreground">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-sidebar-accent-foreground truncate">John Doe</div>
            <div className="text-[11px] text-sidebar-foreground truncate">Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
