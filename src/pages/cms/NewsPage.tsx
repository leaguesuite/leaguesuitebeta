import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Search, Edit, Trash2, Eye, Pin, Clock, CheckCircle2,
  Megaphone, Calendar, Tag, MoreHorizontal,
} from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  status: "published" | "draft" | "scheduled";
  pinned: boolean;
  date: string;
  author: string;
}

const CATEGORIES = ["Announcement", "League Update", "Schedule Change", "Results", "Community", "Reminder"];

const INITIAL_NEWS: NewsItem[] = [
  { id: "1", title: "Spring 2025 Season Kicks Off March 15!", summary: "The new season is here! Check the schedule for your team's first game and make sure your roster is finalized.", category: "Announcement", status: "published", pinned: true, date: "Mar 10, 2025", author: "John Doe" },
  { id: "2", title: "Week 9 Schedule Updated — Field Change for Eagles vs Tigers", summary: "Due to maintenance, the Eagles vs Tigers game has been moved from Memorial Field 1 to Riverside Field 2.", category: "Schedule Change", status: "published", pinned: false, date: "Mar 16, 2025", author: "John Doe" },
  { id: "3", title: "Playoff Seeding Tiebreaker Rules Reminder", summary: "With the regular season winding down, here's a reminder of how tiebreakers work for playoff seeding.", category: "League Update", status: "published", pinned: false, date: "Mar 14, 2025", author: "Admin" },
  { id: "4", title: "Registration Open for Summer 2025 Season", summary: "Early bird registration is now open! Sign up by April 15 to save $20 on your registration fee.", category: "Announcement", status: "scheduled", pinned: false, date: "Mar 20, 2025", author: "John Doe" },
  { id: "5", title: "Community BBQ & Awards Night — Save the Date", summary: "Join us April 5 for our end-of-season BBQ, awards ceremony, and pickup games at Central Park.", category: "Community", status: "draft", pinned: false, date: "Mar 18, 2025", author: "Admin" },
  { id: "6", title: "Reminder: Waiver Forms Due Before Week 10", summary: "All players must have signed waivers on file before they can participate in Week 10 games.", category: "Reminder", status: "published", pinned: false, date: "Mar 17, 2025", author: "Admin" },
];

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<NewsItem | null>(null);

  const filtered = news.filter(n => {
    if (categoryFilter !== "All" && n.category !== categoryFilter) return false;
    if (statusFilter !== "All" && n.status !== statusFilter) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openNew = () => {
    setEditItem({
      id: String(Date.now()),
      title: "",
      summary: "",
      category: "Announcement",
      status: "draft",
      pinned: false,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      author: "John Doe",
    });
    setEditOpen(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditItem({ ...item });
    setEditOpen(true);
  };

  const saveItem = () => {
    if (!editItem || !editItem.title.trim()) return;
    setNews(prev => {
      const exists = prev.find(n => n.id === editItem.id);
      if (exists) return prev.map(n => n.id === editItem.id ? editItem : n);
      return [editItem, ...prev];
    });
    setEditOpen(false);
    toast({ title: "Saved", description: `"${editItem.title}" has been saved.` });
  };

  const deleteItem = (id: string) => {
    setNews(prev => prev.filter(n => n.id !== id));
    toast({ title: "Deleted", description: "News item removed." });
  };

  const togglePin = (id: string) => {
    setNews(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const statusIcon = (s: string) => {
    if (s === "published") return <CheckCircle2 className="h-3 w-3" />;
    if (s === "scheduled") return <Clock className="h-3 w-3" />;
    return <Edit className="h-3 w-3" />;
  };

  const sorted = [...filtered].sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">News</h1>
          <p className="text-sm text-muted-foreground mt-1">Quick updates, announcements, and league bulletins.</p>
        </div>
        <Button size="sm" className="gap-2" onClick={openNew}>
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search news..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* News List */}
      <div className="space-y-3">
        {sorted.map(item => (
          <div key={item.id} className={`section-card p-4 flex items-start gap-4 hover:shadow-md transition-shadow ${item.pinned ? "ring-1 ring-primary/15" : ""}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              item.category === "Announcement" ? "bg-primary/10" :
              item.category === "Schedule Change" ? "bg-warning/10" :
              item.category === "Results" ? "bg-accent/10" :
              item.category === "Reminder" ? "bg-destructive/10" :
              "bg-muted"
            }`}>
              <Megaphone className={`h-4 w-4 ${
                item.category === "Announcement" ? "text-primary" :
                item.category === "Schedule Change" ? "text-warning" :
                item.category === "Results" ? "text-accent" :
                item.category === "Reminder" ? "text-destructive" :
                "text-muted-foreground"
              }`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {item.pinned && <Pin className="h-3 w-3 text-primary" />}
                <h3 className="text-sm font-semibold text-foreground truncate">{item.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.summary}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-[10px]">
                  <Tag className="h-2.5 w-2.5 mr-0.5" /> {item.category}
                </Badge>
                <Badge
                  variant={item.status === "published" ? "default" : "secondary"}
                  className={`text-[10px] gap-0.5 ${item.status === "scheduled" ? "border-warning/30 text-warning bg-warning/10" : ""}`}
                >
                  {statusIcon(item.status)} {item.status}
                </Badge>
                <span className="text-[11px] text-muted-foreground">{item.date}</span>
                <span className="text-[11px] text-muted-foreground">by {item.author}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => togglePin(item.id)} title={item.pinned ? "Unpin" : "Pin"}>
                <Pin className={`h-3.5 w-3.5 ${item.pinned ? "text-primary" : "text-muted-foreground"}`} />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteItem(item.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <div className="section-card p-8 text-center text-muted-foreground">
            <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No news posts found.</p>
          </div>
        )}
      </div>

      {/* Edit / New Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem && news.find(n => n.id === editItem.id) ? "Edit Post" : "New Post"}</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={editItem.title} onChange={e => setEditItem({ ...editItem, title: e.target.value })} placeholder="Post title..." />
              </div>
              <div className="space-y-2">
                <Label>Summary</Label>
                <Textarea value={editItem.summary} onChange={e => setEditItem({ ...editItem, summary: e.target.value })} placeholder="Brief summary or full content..." rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={editItem.category} onValueChange={v => setEditItem({ ...editItem, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editItem.status} onValueChange={v => setEditItem({ ...editItem, status: v as NewsItem["status"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Pin to top</Label>
                <Switch checked={editItem.pinned} onCheckedChange={v => setEditItem({ ...editItem, pinned: v })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveItem} disabled={!editItem?.title.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
