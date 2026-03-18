import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, UserX, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import type { MemberRow } from '@/lib/api';
import { getMockMembers } from '@/data/mockMembersList';

/* ─── Debounce hook ───────────────────────────────────────────────────────── */

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/* ─── Add Member Sheet ────────────────────────────────────────────────────── */

function AddMemberSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [isQb, setIsQb] = useState(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Member</SheetTitle>
          <SheetDescription>Create a new member record in your league.</SheetDescription>
        </SheetHeader>

        <div className="space-y-5 mt-6">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="John" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Doe" />
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" placeholder="(555) 123-4567" />
          </div>

          {/* Role + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select>
                <SelectTrigger id="role"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="player">Player</SelectItem>
                  <SelectItem value="captain">Captain</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="official">Official</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue="active">
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ratings */}
          <div className="space-y-4 pt-2 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground pt-2">Ratings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="offRating">OFF Rating <span className="text-destructive">*</span></Label>
                <Input id="offRating" type="number" min={0} max={100} placeholder="0–100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defRating">DEF Rating <span className="text-destructive">*</span></Label>
                <Input id="defRating" type="number" min={0} max={100} placeholder="0–100" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="isQb" className="text-sm font-medium cursor-pointer">Is QB</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Enable to set a quarterback rating</p>
              </div>
              <Switch id="isQb" checked={isQb} onCheckedChange={setIsQb} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qbRating" className={!isQb ? 'text-muted-foreground' : ''}>
                QB Rating {isQb && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="qbRating"
                type="number"
                min={0}
                max={100}
                placeholder="0–100"
                disabled={!isQb}
                className={!isQb ? 'opacity-50' : ''}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button disabled>Save Member</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */

export default function MembersAll() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [sheetOpen, setSheetOpen] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const queryParams = useMemo(() => {
    const p: { search?: string; role?: string; status?: string } = {};
    if (role !== 'all') p.role = role;
    if (status !== 'all') p.status = status;
    if (debouncedSearch) p.search = debouncedSearch;
    return p;
  }, [debouncedSearch, role, status]);

  const { data: membersResponse, isLoading } = useQuery({
    queryKey: ['members', queryParams],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));
      return getMockMembers(queryParams);
    },
    placeholderData: (prev) => prev,
  });

  const members: MemberRow[] = membersResponse?.data ?? [];
  const total = membersResponse?.meta?.total ?? members.length;

  const handleRowClick = useCallback(
    (id: string | number) => navigate(`/members/${id}`),
    [navigate],
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Members</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your league member database.</p>
        </div>
        <Button onClick={() => setSheetOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Member
        </Button>
      </div>

      {/* Card */}
      <div className="section-card">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name…"
              className="pl-9"
            />
          </div>

          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mr-auto">
            <Users className="h-3.5 w-3.5" />
            {total} member{total !== 1 ? 's' : ''}
          </span>

          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="player">Player</SelectItem>
              <SelectItem value="captain">Captain</SelectItem>
              <SelectItem value="coach">Coach</SelectItem>
              <SelectItem value="official">Official</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Column header */}
        <div className="hidden sm:grid grid-cols-[1fr_90px_55px_55px_55px_90px_80px] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
          <span>Name</span>
          <span>Member ID</span>
          <span className="text-center">OFF</span>
          <span className="text-center">DEF</span>
          <span className="text-center">QB</span>
          <span>Role</span>
          <span className="text-right">Status</span>
        </div>

        {/* Rows */}
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center gap-4">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16 hidden sm:block" />
                <Skeleton className="h-4 w-8 hidden sm:block" />
                <Skeleton className="h-4 w-8 hidden sm:block" />
                <Skeleton className="h-4 w-8 hidden sm:block" />
                <Skeleton className="h-4 w-14 hidden sm:block" />
                <Skeleton className="h-5 w-14 ml-auto hidden sm:block" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <UserX className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No members found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => handleRowClick(m.id)}
                className="w-full text-left px-5 py-3 grid grid-cols-1 sm:grid-cols-[1fr_90px_55px_55px_55px_90px_80px] items-center gap-2 sm:gap-4 hover:bg-muted/40 transition-colors cursor-pointer"
              >
                {/* Avatar + Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 uppercase">
                    {m.avatar_url ? (
                      <img src={m.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      `${m.first_name?.charAt(0) ?? ''}${m.last_name?.charAt(0) ?? ''}`
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground truncate">
                    {m.first_name} {m.last_name}
                  </span>
                </div>

                {/* Member ID */}
                <span className="text-sm font-mono text-muted-foreground hidden sm:block">#{m.id}</span>

                {/* OFF */}
                <span className="text-sm font-mono font-semibold text-foreground text-center hidden sm:block">
                  {m.off_rating ?? '—'}
                </span>

                {/* DEF */}
                <span className="text-sm font-mono font-semibold text-foreground text-center hidden sm:block">
                  {m.def_rating ?? '—'}
                </span>

                {/* QB */}
                <span className="text-sm font-mono font-semibold text-center hidden sm:block">
                  {m.is_qb && m.qb_rating != null ? (
                    <span className="text-primary">{m.qb_rating}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </span>

                {/* Role */}
                <span className="text-sm text-foreground capitalize hidden sm:block">{m.role ?? '—'}</span>

                {/* Status */}
                <div className="hidden sm:flex justify-end">
                  {(() => {
                    const s = (m.status ?? 'unknown').toLowerCase();
                    return (
                      <Badge
                        variant={s === 'active' ? 'default' : 'secondary'}
                        className="gap-1.5 font-medium text-xs"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${s === 'active' ? 'bg-accent' : 'bg-muted-foreground'}`} />
                        {m.status}
                      </Badge>
                    );
                  })()}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <AddMemberSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
