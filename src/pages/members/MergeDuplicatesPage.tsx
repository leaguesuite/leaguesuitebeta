import { useState } from "react";
import { Search, Merge, ChevronRight, AlertTriangle, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface DuplicateGroup {
  id: string;
  members: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    off_rating: number;
    def_rating: number;
    created_at: string;
  }[];
  match_reason: string;
  confidence: number;
}

const mockDuplicateGroups: DuplicateGroup[] = [
  {
    id: "dup-1",
    members: [
      { id: 1001, first_name: "Marcus", last_name: "Johnson", email: "marcus.j@email.com", phone: "(555) 123-4567", role: "Player", status: "Active", off_rating: 78, def_rating: 72, created_at: "2024-01-15" },
      { id: 1042, first_name: "Marcus", last_name: "Johnson", email: "marcusjohnson@gmail.com", phone: "(555) 123-4567", role: "Player", status: "Inactive", off_rating: 75, def_rating: 70, created_at: "2024-06-20" },
    ],
    match_reason: "Same name & phone number",
    confidence: 95,
  },
  {
    id: "dup-2",
    members: [
      { id: 1005, first_name: "Sarah", last_name: "Williams", email: "swilliams@flagplus.com", phone: "(555) 234-5678", role: "Coach", status: "Active", off_rating: 0, def_rating: 0, created_at: "2023-08-10" },
      { id: 1038, first_name: "Sara", last_name: "Williams", email: "sara.williams@email.com", phone: "(555) 234-5679", role: "Coach", status: "Active", off_rating: 0, def_rating: 0, created_at: "2024-03-05" },
    ],
    match_reason: "Similar name (fuzzy match)",
    confidence: 82,
  },
  {
    id: "dup-3",
    members: [
      { id: 1012, first_name: "David", last_name: "Chen", email: "dchen@email.com", phone: "(555) 345-6789", role: "Player", status: "Active", off_rating: 85, def_rating: 80, created_at: "2023-11-01" },
      { id: 1029, first_name: "David", last_name: "Chen", email: "david.chen@work.com", phone: "(555) 999-8888", role: "Player", status: "Pending", off_rating: 82, def_rating: 78, created_at: "2024-07-15" },
      { id: 1044, first_name: "Dave", last_name: "Chen", email: "dchen@email.com", phone: "(555) 345-6789", role: "Player", status: "Inactive", off_rating: 80, def_rating: 75, created_at: "2024-01-20" },
    ],
    match_reason: "Same email address",
    confidence: 90,
  },
  {
    id: "dup-4",
    members: [
      { id: 1008, first_name: "Tyler", last_name: "Brooks", email: "tbrooks@email.com", phone: "(555) 456-7890", role: "Player", status: "Active", off_rating: 70, def_rating: 68, created_at: "2024-02-14" },
      { id: 1033, first_name: "Tyler", last_name: "Brooks", email: "tyler.brooks22@gmail.com", phone: "(555) 456-7890", role: "Player", status: "Active", off_rating: 72, def_rating: 65, created_at: "2024-05-30" },
    ],
    match_reason: "Same name & phone number",
    confidence: 93,
  },
];

export default function MergeDuplicatesPage() {
  const [search, setSearch] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [activeMerge, setActiveMerge] = useState<DuplicateGroup | null>(null);
  const [primaryId, setPrimaryId] = useState<string>("");

  const filtered = mockDuplicateGroups.filter((g) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return g.members.some(
      (m) =>
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  });

  const toggleGroup = (id: string) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const openMerge = (group: DuplicateGroup) => {
    setActiveMerge(group);
    setPrimaryId(String(group.members[0].id));
    setMergeDialogOpen(true);
  };

  const handleMerge = () => {
    if (!activeMerge) return;
    toast.success(
      `Merged ${activeMerge.members.length} records into Member #${primaryId}`
    );
    setMergeDialogOpen(false);
    setActiveMerge(null);
  };

  const getInitials = (first: string, last: string) =>
    `${first[0]}${last[0]}`.toUpperCase();

  const confidenceBadge = (confidence: number) => {
    if (confidence >= 90)
      return <Badge variant="destructive">{confidence}% — High</Badge>;
    if (confidence >= 75)
      return <Badge variant="secondary">{confidence}% — Medium</Badge>;
    return <Badge variant="outline">{confidence}%</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Merge Duplicate Members
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and merge potential duplicate member records.
        </p>
      </div>

      {/* Controls */}
      <div className="section-card">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filtered.length} duplicate group{filtered.length !== 1 ? "s" : ""} found
          </div>
          {selectedGroups.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                toast.info("Batch merge not yet implemented")
              }
            >
              <Merge className="h-4 w-4 mr-1" />
              Merge {selectedGroups.length} Selected
            </Button>
          )}
        </div>
      </div>

      {/* Duplicate Groups */}
      {filtered.length === 0 ? (
        <div className="section-card text-center py-12">
          <Check className="h-12 w-12 text-primary mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground">No Duplicates Found</h3>
          <p className="text-muted-foreground mt-1">
            All member records appear to be unique.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((group) => (
            <div key={group.id} className="section-card">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedGroups.includes(group.id)}
                  onCheckedChange={() => toggleGroup(group.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {group.match_reason}
                    </span>
                    {confidenceBadge(group.confidence)}
                    <span className="text-xs text-muted-foreground">
                      {group.members.length} records
                    </span>
                  </div>

                  <div className="space-y-2">
                    {group.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 text-sm"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(member.first_name, member.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 grid grid-cols-[1fr_1fr_auto_auto_auto] gap-x-4 items-center">
                          <div>
                            <div className="font-medium text-foreground truncate">
                              {member.first_name} {member.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              #{member.id}
                            </div>
                          </div>
                          <div className="text-muted-foreground truncate">
                            {member.email}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                          <Badge
                            variant={
                              member.status === "Active"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {member.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            Added {member.created_at}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openMerge(group)}
                >
                  <Merge className="h-4 w-4 mr-1" />
                  Merge
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Merge Dialog */}
      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Merge Duplicate Records</DialogTitle>
            <DialogDescription>
              Select the primary record to keep. Data from other records will
              be merged into it, and duplicates will be removed.
            </DialogDescription>
          </DialogHeader>

          {activeMerge && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Primary Record (keep)
                </label>
                <Select value={primaryId} onValueChange={setPrimaryId}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activeMerge.members.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.first_name} {m.last_name} — #{m.id} ({m.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground space-y-1">
                <p>The following will happen:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Season history from all records will be combined</li>
                  <li>The highest ratings will be kept</li>
                  <li>
                    {activeMerge.members.length - 1} duplicate record
                    {activeMerge.members.length - 1 > 1 ? "s" : ""} will be
                    removed
                  </li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMergeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleMerge}>
              <Merge className="h-4 w-4 mr-1" />
              Confirm Merge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
