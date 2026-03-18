import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Users, UserX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  fetchMembers,
  searchMembers,
  fetchDivisions,
  fetchPublicConfiguration,
  type MemberRow,
  type MemberListParams,
} from '@/lib/api';

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ─── Status badge helper ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string }) {
  const s = (status ?? 'unknown').toLowerCase();
  const variant = s === 'active' ? 'default' : s === 'inactive' ? 'secondary' : 'outline';
  const dotColor =
    s === 'active' ? 'bg-accent' : s === 'inactive' ? 'bg-muted-foreground' : 'bg-warning';
  return (
    <Badge variant={variant} className="gap-1.5 font-medium text-xs">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {status ?? 'Unknown'}
    </Badge>
  );
}

// ─── Loading skeleton ────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="px-5 py-3.5 flex items-center gap-4">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-24 hidden sm:block" />
          <Skeleton className="h-4 w-28 hidden md:block" />
          <Skeleton className="h-4 w-14 hidden lg:block" />
          <Skeleton className="h-4 w-16 hidden lg:block" />
          <Skeleton className="h-5 w-16 ml-auto" />
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
        <UserX className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">
        {hasFilters ? 'No members match your filters' : 'No members yet'}
      </h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        {hasFilters
          ? 'Try adjusting your search or filters to find what you're looking for.'
          : 'Add your first member to get started building your league roster.'}
      </p>
    </div>
  );
}

// ─── Add Member Sheet (UI only) ──────────────────────────────────────────────

function AddMemberSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Member</SheetTitle>
          <SheetDescription>Create a new member record in your league.</SheetDescription>
        </SheetHeader>
        <div className="space-y-5 mt-6">
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
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" placeholder="(555) 123-4567" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player">Player</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="official">Official</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue="active">
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="team">Team</Label>
            <Input id="team" placeholder="Search for a team…" />
          </div>
          <div className="pt-4 flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button disabled>Save Member</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function MembersAll() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [division, setDivision] = useState('all');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [sheetOpen, setSheetOpen] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch tenant context
  const { data: config } = useQuery({
    queryKey: ['public-configuration'],
    queryFn: fetchPublicConfiguration,
    staleTime: 1000 * 60 * 10,
  });

  // Fetch division options for filter dropdown
  const { data: divisionOptions } = useQuery({
    queryKey: ['divisions'],
    queryFn: fetchDivisions,
    staleTime: 1000 * 60 * 5,
  });

  // Build query params
  const queryParams: MemberListParams = useMemo(() => {
    const params: MemberListParams = { per_page: 50 };
    if (division !== 'all') params.division = division;
    if (role !== 'all') params.role = role;
    if (status !== 'all') params.status = status;
    if (debouncedSearch) params.search = debouncedSearch;
    return params;
  }, [debouncedSearch, division, role, status]);

  // Fetch members — use search endpoint when searching, members endpoint otherwise
  const {
    data: membersResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['members', queryParams],
    queryFn: () =>
      debouncedSearch
        ? searchMembers(debouncedSearch)
        : fetchMembers(queryParams),
    placeholderData: (prev) => prev,
  });

  const members: MemberRow[] = membersResponse?.data ?? [];
  const hasFilters = debouncedSearch !== '' || division !== 'all' || role !== 'all' || status !== 'all';

  const handleRowClick = useCallback(
    (id: string | number) => navigate(`/members/${id}`),
    [navigate],
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Members</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {config?.tenant?.name
              ? `Manage members for ${config.tenant.name}`
              : 'Manage your league member database.'}
          </p>
        </div>
        <Button onClick={() => setSheetOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Filters bar */}
      <div className="section-card">
        <div className="px-5 py-4 border-b border-border flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search members…"
              className="pl-9"
            />
          </div>

          {/* Division filter */}
          <Select value={division} onValueChange={setDivision}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Divisions</SelectItem>
              {divisionOptions?.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Role filter */}
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="player">Player</SelectItem>
              <SelectItem value="coach">Coach</SelectItem>
              <SelectItem value="official">Official</SelectItem>
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[1fr_140px_160px_80px_100px_90px] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
          <span>Name</span>
          <span>Team</span>
          <span>Division</span>
          <span className="text-center">CAP</span>
          <span>Role</span>
          <span className="text-right">Status</span>
        </div>

        {/* Table body */}
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-destructive font-medium">Failed to load members</p>
            <p className="text-xs text-muted-foreground mt-1">Check your connection and try again.</p>
          </div>
        ) : members.length === 0 ? (
          <EmptyState hasFilters={hasFilters} />
        ) : (
          <div className="divide-y divide-border">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => handleRowClick(member.id)}
                className="w-full text-left px-5 py-3.5 grid grid-cols-1 sm:grid-cols-[1fr_140px_160px_80px_100px_90px] items-center gap-2 sm:gap-4 hover:bg-muted/40 transition-colors cursor-pointer"
              >
                {/* Name + avatar */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 uppercase">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      `${member.first_name?.charAt(0) ?? ''}${member.last_name?.charAt(0) ?? ''}`
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {member.first_name} {member.last_name}
                    </p>
                    {member.email && (
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    )}
                  </div>
                </div>

                {/* Team */}
                <span className="text-sm text-foreground truncate hidden sm:block">
                  {member.team?.name ?? '—'}
                </span>

                {/* Division */}
                <span className="text-sm text-muted-foreground truncate hidden sm:block">
                  {member.division?.name ?? '—'}
                </span>

                {/* CAP Rating */}
                <span className="text-sm font-mono font-semibold text-foreground text-center hidden sm:block">
                  {member.cap_rating != null ? member.cap_rating : '—'}
                </span>

                {/* Role */}
                <span className="text-sm text-foreground capitalize hidden sm:block">
                  {member.role ?? '—'}
                </span>

                {/* Status */}
                <div className="hidden sm:flex justify-end">
                  <StatusBadge status={member.status} />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer with count */}
        {!isLoading && members.length > 0 && (
          <div className="px-5 py-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {membersResponse?.meta?.total ?? members.length} member{(membersResponse?.meta?.total ?? members.length) !== 1 ? 's' : ''}
            </span>
            {membersResponse?.meta && membersResponse.meta.last_page > 1 && (
              <span className="text-xs text-muted-foreground">
                Page {membersResponse.meta.current_page} of {membersResponse.meta.last_page}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Add Member Sheet */}
      <AddMemberSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
