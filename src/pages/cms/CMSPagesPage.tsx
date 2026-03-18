import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  Plus, ArrowLeft, ArrowRight, FileText, Palette, Layers, Zap, Check, Star,
  Users, Mail, MapPin, LayoutList, GalleryHorizontal, Trophy, ImageIcon,
  Upload, X, Eye, Trash2, Edit, Globe, Sparkles, Send, Undo2, Redo2,
  Monitor, Smartphone, Copy, ExternalLink, FolderOpen, Clock, MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Types ────────────────────────────────────────────────────────────────────

type ContentMode = "ai" | "exact";
type PageStatus = "draft" | "published" | "archived";
type ViewMode = "list" | "wizard" | "editor";

interface SectionConfig {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  contentMode: ContentMode;
  briefPrompt: string;
  questions: { key: string; label: string; placeholder?: string; type: "text" | "textarea" | "toggle" }[];
  answers: Record<string, string | boolean>;
}

interface PageProject {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  logoPreview: string | null;
  status: PageStatus;
  sections: SectionConfig[];
  htmlContent: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Default Sections ─────────────────────────────────────────────────────────

const DEFAULT_SECTIONS: SectionConfig[] = [
  {
    id: "hero", label: "Hero Banner", description: "Eye-catching banner with your league name and tagline",
    icon: Star, enabled: true, contentMode: "ai", briefPrompt: "",
    questions: [
      { key: "tagline", label: "Tagline or slogan", placeholder: "Where champions are made", type: "text" },
      { key: "ctaText", label: "Call-to-action button text", placeholder: "Register Now", type: "text" },
    ],
    answers: { tagline: "", ctaText: "Register Now" },
  },
  {
    id: "about", label: "About / Mission", description: "Tell visitors about your league's story and mission",
    icon: Users, enabled: true, contentMode: "ai", briefPrompt: "",
    questions: [
      { key: "mission", label: "Mission statement or about text", placeholder: "Our league was founded in 2005 to provide...", type: "textarea" },
      { key: "stats", label: "Key stats to highlight (e.g. teams, players, years)", placeholder: "24 teams, 500+ players, 18 seasons", type: "text" },
    ],
    answers: { mission: "", stats: "" },
  },
  {
    id: "features", label: "Features / Services", description: "Highlight key programs, leagues, or services you offer",
    icon: LayoutList, enabled: false, contentMode: "ai", briefPrompt: "",
    questions: [
      { key: "features", label: "List your key features or programs", placeholder: "Youth leagues, Adult leagues, Summer camps", type: "textarea" },
      { key: "featureCount", label: "How many features to highlight", placeholder: "3-6", type: "text" },
    ],
    answers: { features: "", featureCount: "" },
  },
  {
    id: "carousel", label: "Image Carousel", description: "A sliding showcase of photos and action shots",
    icon: GalleryHorizontal, enabled: false, contentMode: "ai", briefPrompt: "",
    questions: [
      { key: "carouselHeading", label: "Carousel section heading", placeholder: "See Us in Action", type: "text" },
      { key: "autoplay", label: "Auto-rotate slides", type: "toggle" },
    ],
    answers: { carouselHeading: "", autoplay: true },
  },
  {
    id: "locations", label: "Locations / Venues", description: "Show where your games and events take place",
    icon: MapPin, enabled: false, contentMode: "ai", briefPrompt: "",
    questions: [
      { key: "venues", label: "Venue names and addresses", placeholder: "Central Arena — 100 Main St", type: "textarea" },
      { key: "showMap", label: "Include an embedded map", type: "toggle" },
    ],
    answers: { venues: "", showMap: true },
  },
  {
    id: "gallery", label: "Photo / Video Gallery", description: "Showcase action photos and highlight reels",
    icon: ImageIcon, enabled: false, contentMode: "ai", briefPrompt: "",
    questions: [
      { key: "videoUrl", label: "Featured video URL (optional)", placeholder: "https://youtube.com/embed/...", type: "text" },
    ],
    answers: { videoUrl: "" },
  },
  {
    id: "sponsors", label: "Sponsors", description: "Feature your league's sponsors and partners",
    icon: Trophy, enabled: false, contentMode: "ai", briefPrompt: "",
    questions: [
      { key: "sponsorNames", label: "Sponsor names (comma-separated)", placeholder: "Nike, Gatorade, City Parks Dept", type: "text" },
    ],
    answers: { sponsorNames: "" },
  },
  {
    id: "cta", label: "Registration / CTA", description: "Drive sign-ups with a clear call-to-action",
    icon: Zap, enabled: true, contentMode: "ai", briefPrompt: "",
    questions: [
      { key: "ctaHeading", label: "CTA heading", placeholder: "Ready to join the league?", type: "text" },
      { key: "ctaDescription", label: "CTA description", placeholder: "Registration is open for the upcoming season", type: "text" },
      { key: "registrationUrl", label: "Registration link (optional)", placeholder: "https://yourleague.com/register", type: "text" },
    ],
    answers: { ctaHeading: "", ctaDescription: "", registrationUrl: "" },
  },
  {
    id: "contact", label: "Contact Info", description: "How visitors can reach your league",
    icon: Mail, enabled: false, contentMode: "ai", briefPrompt: "",
    questions: [
      { key: "email", label: "Contact email", placeholder: "info@yourleague.com", type: "text" },
      { key: "phone", label: "Phone number (optional)", placeholder: "(555) 123-4567", type: "text" },
      { key: "address", label: "Location / facility address (optional)", placeholder: "123 Sports Complex Dr", type: "text" },
    ],
    answers: { email: "", phone: "", address: "" },
  },
];

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PAGES: PageProject[] = [
  {
    id: "p1", name: "League Home Page", description: "Main landing page for the 2025 season",
    primaryColor: "#1a365d", secondaryColor: "#e53e3e", logoPreview: null,
    status: "published", sections: [], htmlContent: generateMockHtml("League Home Page", "#1a365d"),
    createdAt: "2025-11-15T10:00:00Z", updatedAt: "2026-02-20T14:30:00Z",
  },
  {
    id: "p2", name: "Spring Registration", description: "Spring season registration landing page",
    primaryColor: "#276749", secondaryColor: "#d69e2e", logoPreview: null,
    status: "draft", sections: [], htmlContent: generateMockHtml("Spring Registration", "#276749"),
    createdAt: "2026-01-10T08:00:00Z", updatedAt: "2026-03-01T09:15:00Z",
  },
  {
    id: "p3", name: "Tournament Info 2025", description: "End-of-season tournament details",
    primaryColor: "#744210", secondaryColor: "#2b6cb0", logoPreview: null,
    status: "archived", sections: [], htmlContent: generateMockHtml("Tournament Info 2025", "#744210"),
    createdAt: "2025-06-01T12:00:00Z", updatedAt: "2025-09-15T16:45:00Z",
  },
];

function generateMockHtml(title: string, color: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a2e}
.hero{background:linear-gradient(135deg,${color},${color}dd);color:#fff;padding:80px 40px;text-align:center}
.hero h1{font-size:3rem;font-weight:800;margin-bottom:16px}
.hero p{font-size:1.2rem;opacity:.9;max-width:600px;margin:0 auto 32px}
.hero button{background:#fff;color:${color};border:none;padding:14px 32px;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer}
.section{padding:60px 40px;max-width:900px;margin:0 auto}
.section h2{font-size:2rem;font-weight:700;margin-bottom:16px;color:${color}}
.section p{font-size:1.05rem;line-height:1.7;color:#444}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:32px;text-align:center}
.stat{padding:24px;border-radius:12px;background:#f8f9fa}
.stat .num{font-size:2rem;font-weight:800;color:${color}}
.stat .label{font-size:.9rem;color:#666;margin-top:4px}
.cta{background:#f8f9fa;padding:60px 40px;text-align:center}
.cta h2{font-size:2rem;font-weight:700;margin-bottom:12px}
.cta p{color:#666;margin-bottom:24px}
.cta button{background:${color};color:#fff;border:none;padding:14px 32px;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer}
footer{background:#1a1a2e;color:#fff;padding:32px 40px;text-align:center;font-size:.9rem;opacity:.7}
</style>
</head>
<body>
<div class="hero"><h1>${title}</h1><p>Your premier destination for competitive and recreational sports. Join thousands of athletes in our community.</p><button>Register Now</button></div>
<div class="section"><h2>About Our League</h2><p>Founded with a passion for developing athletes and building community, our league has grown to become one of the most respected organizations in the region. We offer programs for all ages and skill levels.</p>
<div class="stats"><div class="stat"><div class="num">24</div><div class="label">Teams</div></div><div class="stat"><div class="num">500+</div><div class="label">Players</div></div><div class="stat"><div class="num">18</div><div class="label">Seasons</div></div></div></div>
<div class="cta"><h2>Ready to Join?</h2><p>Registration for the upcoming season is now open. Don't miss your chance to be part of something great.</p><button>Sign Up Today</button></div>
<footer>&copy; 2026 ${title}. All rights reserved.</footer>
</body></html>`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CMSPagesPage() {
  const [view, setView] = useState<ViewMode>("list");
  const [pages, setPages] = useState<PageProject[]>(MOCK_PAGES);
  const [editingPage, setEditingPage] = useState<PageProject | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardName, setWizardName] = useState("");
  const [wizardDesc, setWizardDesc] = useState("");
  const [wizardPrimary, setWizardPrimary] = useState("#1a365d");
  const [wizardSecondary, setWizardSecondary] = useState("#e53e3e");
  const [wizardSections, setWizardSections] = useState<SectionConfig[]>(() =>
    DEFAULT_SECTIONS.map(s => ({ ...s, questions: s.questions.map(q => ({ ...q })), answers: { ...s.answers } }))
  );
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Editor state
  const [feedbackText, setFeedbackText] = useState("");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [revisionHistory, setRevisionHistory] = useState<string[]>([]);
  const [revisionIndex, setRevisionIndex] = useState(-1);

  const currentHtml = revisionHistory.length > 0 ? revisionHistory[revisionIndex] : editingPage?.htmlContent ?? null;

  // ─── List Actions ─────────────────────────────────────────────────────────

  const startWizard = () => {
    setWizardStep(1);
    setWizardName("");
    setWizardDesc("");
    setWizardPrimary("#1a365d");
    setWizardSecondary("#e53e3e");
    setWizardSections(DEFAULT_SECTIONS.map(s => ({ ...s, questions: s.questions.map(q => ({ ...q })), answers: { ...s.answers } })));
    setExpandedSection(null);
    setView("wizard");
  };

  const finishWizard = () => {
    const newPage: PageProject = {
      id: `p${Date.now()}`,
      name: wizardName,
      description: wizardDesc,
      primaryColor: wizardPrimary,
      secondaryColor: wizardSecondary,
      logoPreview: null,
      status: "draft",
      sections: wizardSections.filter(s => s.enabled),
      htmlContent: generateMockHtml(wizardName, wizardPrimary),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPages(prev => [newPage, ...prev]);
    openEditor(newPage);
    toast({ title: "Page created!", description: "AI is generating your content page. You can now refine it." });
  };

  const openEditor = (page: PageProject) => {
    setEditingPage(page);
    const html = page.htmlContent || generateMockHtml(page.name, page.primaryColor);
    setRevisionHistory([html]);
    setRevisionIndex(0);
    setFeedbackText("");
    setPreviewMode("desktop");
    setView("editor");
  };

  const deletePage = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);
    toast({ title: "Page deleted" });
  };

  const togglePageStatus = (id: string) => {
    setPages(prev => prev.map(p =>
      p.id === id ? { ...p, status: p.status === "published" ? "draft" : "published", updatedAt: new Date().toISOString() } : p
    ));
  };

  // ─── Wizard Helpers ───────────────────────────────────────────────────────

  const toggleSection = (id: string) => {
    setWizardSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const updateAnswer = (sectionId: string, key: string, value: string | boolean) => {
    setWizardSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, answers: { ...s.answers, [key]: value } } : s
    ));
  };

  const setContentMode = (sectionId: string, mode: ContentMode) => {
    setWizardSections(prev => prev.map(s => s.id === sectionId ? { ...s, contentMode: mode } : s));
  };

  const setBriefPrompt = (sectionId: string, value: string) => {
    setWizardSections(prev => prev.map(s => s.id === sectionId ? { ...s, briefPrompt: value } : s));
  };

  // ─── Editor Helpers ───────────────────────────────────────────────────────

  const handleRefine = () => {
    if (!feedbackText.trim() || !currentHtml) return;
    // Simulate AI refinement by adding a comment to HTML
    const refined = currentHtml.replace("</body>", `<!-- Refined: ${feedbackText} -->\n</body>`);
    const newHistory = [...revisionHistory.slice(0, revisionIndex + 1), refined];
    setRevisionHistory(newHistory);
    setRevisionIndex(newHistory.length - 1);
    setFeedbackText("");
    toast({ title: "Changes applied!", description: "Your design has been updated. (Connect Cloud for real AI generation)" });
  };

  const handleUndo = () => { if (revisionIndex > 0) setRevisionIndex(revisionIndex - 1); };
  const handleRedo = () => { if (revisionIndex < revisionHistory.length - 1) setRevisionIndex(revisionIndex + 1); };

  const handleSave = () => {
    if (!editingPage || !currentHtml) return;
    setPages(prev => prev.map(p =>
      p.id === editingPage.id ? { ...p, htmlContent: currentHtml, updatedAt: new Date().toISOString() } : p
    ));
    toast({ title: "Page saved!" });
  };

  const statusColor = (s: PageStatus) => {
    if (s === "published") return "default";
    if (s === "draft") return "secondary";
    return "outline";
  };

  // ─── Wizard Steps Config ─────────────────────────────────────────────────

  const wizardSteps = [
    { icon: FileText, label: "Details" },
    { icon: Palette, label: "Colors" },
    { icon: Layers, label: "Sections" },
  ];

  const canProceed = () => {
    if (wizardStep === 1) return wizardName.trim().length > 0;
    if (wizardStep === 3) return wizardSections.some(s => s.enabled);
    return true;
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  // LIST VIEW
  if (view === "list") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pages</h1>
            <p className="text-sm text-muted-foreground">Create and manage content pages with AI-powered generation</p>
          </div>
          <Button onClick={startWizard} className="gap-2">
            <Sparkles className="h-4 w-4" />
            New Page with AI
          </Button>
        </div>

        {pages.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold text-foreground">No pages yet</h3>
              <p className="mb-6 text-sm text-muted-foreground">Create your first content page using the AI builder</p>
              <Button onClick={startWizard} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Create First Page
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pages.map(page => (
              <Card key={page.id} className="group transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: page.primaryColor }} />
                      <div className="h-8 w-3 rounded-md" style={{ backgroundColor: page.secondaryColor }} />
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={statusColor(page.status)} className="text-[10px] uppercase">
                        {page.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditor(page)}>
                            <Edit className="h-3.5 w-3.5 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePageStatus(page.id)}>
                            <Globe className="h-3.5 w-3.5 mr-2" />
                            {page.status === "published" ? "Unpublish" : "Publish"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            const dup: PageProject = { ...page, id: `p${Date.now()}`, name: `${page.name} (Copy)`, status: "draft", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
                            setPages(prev => [dup, ...prev]);
                            toast({ title: "Page duplicated" });
                          }}>
                            <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteConfirm(page.id)}>
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardTitle className="text-base cursor-pointer" onClick={() => openEditor(page)}>
                    {page.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">{page.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Updated {new Date(page.updatedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete confirmation */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Page</DialogTitle>
              <DialogDescription>This action cannot be undone. The page and all its content will be permanently deleted.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteConfirm && deletePage(deleteConfirm)}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // WIZARD VIEW
  if (view === "wizard") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setView("list")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">New Page — AI Builder</h1>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2">
          {wizardSteps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i + 1 === wizardStep;
            const isDone = i + 1 < wizardStep;
            return (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <div className={`h-px w-8 ${isDone ? "bg-primary" : "bg-border"}`} />}
                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : isDone ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  <Icon className="h-3.5 w-3.5" />
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Step 1: Details */}
        {wizardStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Page Details</CardTitle>
              <CardDescription>Name and describe your content page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pageName">Page Name *</Label>
                <Input id="pageName" value={wizardName} onChange={e => setWizardName(e.target.value)} placeholder="2026 Season Home Page" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pageDesc">Description</Label>
                <Textarea id="pageDesc" value={wizardDesc} onChange={e => setWizardDesc(e.target.value)}
                  placeholder="Main landing page for the upcoming season with registration info..." rows={3} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Colors */}
        {wizardStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>Set your league's primary and accent colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={wizardPrimary} onChange={e => setWizardPrimary(e.target.value)}
                      className="h-10 w-10 rounded-lg border border-input cursor-pointer" />
                    <Input value={wizardPrimary} onChange={e => setWizardPrimary(e.target.value)} className="font-mono text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={wizardSecondary} onChange={e => setWizardSecondary(e.target.value)}
                      className="h-10 w-10 rounded-lg border border-input cursor-pointer" />
                    <Input value={wizardSecondary} onChange={e => setWizardSecondary(e.target.value)} className="font-mono text-sm" />
                  </div>
                </div>
              </div>
              {/* Preview strip */}
              <div className="rounded-lg overflow-hidden">
                <div className="h-16" style={{ background: `linear-gradient(135deg, ${wizardPrimary}, ${wizardSecondary})` }} />
                <div className="bg-card p-3 border border-t-0 rounded-b-lg">
                  <p className="text-xs text-muted-foreground text-center">Color preview</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Sections */}
        {wizardStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Page Sections</CardTitle>
              <CardDescription>Choose which sections to include. Toggle on/off and configure each one.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {wizardSections.map(section => {
                const Icon = section.icon;
                const isExpanded = expandedSection === section.id;
                return (
                  <div key={section.id} className={`rounded-lg border transition-colors ${section.enabled ? "border-primary/30 bg-primary/5" : "border-border"}`}>
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <Switch checked={section.enabled} onCheckedChange={() => toggleSection(section.id)} />
                      <Icon className={`h-4 w-4 shrink-0 ${section.enabled ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${section.enabled ? "text-foreground" : "text-muted-foreground"}`}>{section.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{section.description}</p>
                      </div>
                      {section.enabled && (
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setExpandedSection(isExpanded ? null : section.id)}>
                          {isExpanded ? "Collapse" : "Configure"}
                        </Button>
                      )}
                    </div>

                    {section.enabled && isExpanded && (
                      <div className="px-3 pb-3 space-y-3 border-t border-border/50 pt-3">
                        {/* Content mode toggle */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">Content:</span>
                          <div className="flex items-center rounded-md border border-border bg-muted p-0.5">
                            <button onClick={() => setContentMode(section.id, "ai")}
                              className={`rounded-sm px-2 py-1 text-xs font-medium transition-colors ${section.contentMode === "ai" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
                              <Sparkles className="inline h-3 w-3 mr-1" /> AI Generated
                            </button>
                            <button onClick={() => setContentMode(section.id, "exact")}
                              className={`rounded-sm px-2 py-1 text-xs font-medium transition-colors ${section.contentMode === "exact" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
                              <FileText className="inline h-3 w-3 mr-1" /> Exact Text
                            </button>
                          </div>
                        </div>

                        {section.contentMode === "ai" ? (
                          <div className="space-y-2">
                            <Label className="text-xs">Brief for AI</Label>
                            <Textarea value={section.briefPrompt} onChange={e => setBriefPrompt(section.id, e.target.value)}
                              placeholder="Describe what you want this section to convey..." rows={2} className="text-sm" />
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {section.questions.map(q => (
                              <div key={q.key} className="space-y-1">
                                <Label className="text-xs">{q.label}</Label>
                                {q.type === "toggle" ? (
                                  <div className="flex items-center gap-2">
                                    <Switch checked={!!section.answers[q.key]} onCheckedChange={v => updateAnswer(section.id, q.key, v)} />
                                    <span className="text-xs text-muted-foreground">{section.answers[q.key] ? "Enabled" : "Disabled"}</span>
                                  </div>
                                ) : q.type === "textarea" ? (
                                  <Textarea value={String(section.answers[q.key] || "")} onChange={e => updateAnswer(section.id, q.key, e.target.value)}
                                    placeholder={q.placeholder} rows={2} className="text-sm" />
                                ) : (
                                  <Input value={String(section.answers[q.key] || "")} onChange={e => updateAnswer(section.id, q.key, e.target.value)}
                                    placeholder={q.placeholder} className="text-sm" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Nav buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => wizardStep === 1 ? setView("list") : setWizardStep(wizardStep - 1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> {wizardStep === 1 ? "Cancel" : "Back"}
          </Button>
          {wizardStep < 3 ? (
            <Button onClick={() => setWizardStep(wizardStep + 1)} disabled={!canProceed()} className="gap-2">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={finishWizard} disabled={!canProceed()} className="gap-2">
              <Sparkles className="h-4 w-4" /> Generate Page
            </Button>
          )}
        </div>
      </div>
    );
  }

  // EDITOR VIEW
  if (view === "editor" && editingPage) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Editor header */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setView("list")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">{editingPage.name}</h1>
              <p className="text-xs text-muted-foreground">AI Page Editor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleUndo} disabled={revisionIndex <= 0}>
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleRedo} disabled={revisionIndex >= revisionHistory.length - 1}>
              <Redo2 className="h-3.5 w-3.5" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Device preview */}
            <div className="flex items-center rounded-md border border-border bg-muted p-0.5">
              <button onClick={() => setPreviewMode("desktop")}
                className={`rounded-sm p-1.5 transition-colors ${previewMode === "desktop" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setPreviewMode("mobile")}
                className={`rounded-sm p-1.5 transition-colors ${previewMode === "mobile" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            <Button variant="outline" size="sm" onClick={handleSave} className="gap-1.5">
              <Check className="h-3.5 w-3.5" /> Save
            </Button>
          </div>
        </div>

        {/* Editor body */}
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Preview */}
          <div className="flex-1 bg-muted/30 rounded-lg border border-border overflow-hidden flex items-start justify-center p-4">
            <div className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all ${
              previewMode === "mobile" ? "w-[375px]" : "w-full"
            }`} style={{ height: "100%" }}>
              {currentHtml ? (
                <iframe
                  srcDoc={currentHtml}
                  title="Page Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No content generated yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Refinement panel */}
          <div className="w-80 shrink-0 flex flex-col gap-3">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Refinement
                </CardTitle>
                <CardDescription className="text-xs">
                  Describe changes and the AI will update your page. Enable Cloud for full AI generation.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3">
                <Textarea
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  placeholder="e.g. Make the hero section taller, change the CTA text to 'Join Now', add a gradient overlay..."
                  rows={4}
                  className="flex-1 text-sm resize-none"
                />
                <Button onClick={handleRefine} disabled={!feedbackText.trim()} className="gap-2 w-full">
                  <Send className="h-3.5 w-3.5" /> Apply Changes
                </Button>

                <div className="border-t border-border pt-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Quick Actions</p>
                  {["Make it more modern", "Add more whitespace", "Make colors bolder", "Improve mobile layout"].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => setFeedbackText(suggestion)}
                      className="block w-full text-left text-xs px-2.5 py-1.5 rounded-md bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-xs text-center text-muted-foreground px-2">
              Revision {revisionIndex + 1} of {revisionHistory.length}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
