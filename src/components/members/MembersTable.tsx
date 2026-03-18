import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pencil, Trash2, GitMerge, Search, Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { mockMembers, type Member } from "@/data/mockMembers";
import { MemberStatusBadge } from "./MemberStatusBadge";
import { MemberDetailDrawer } from "./MemberDetailDrawer";
import { WaiverStatusBadge } from "./WaiverStatusBadge";
import { MemberTags } from "./MemberTags";
import { DisciplinaryBadge } from "./DisciplinaryRecords";
import { toast } from "@/hooks/use-toast";

export function MembersTable() {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [detailMember, setDetailMember] = useState<Member | null>(null);
  const [sortField, setSortField] = useState<'id' | 'first_name' | 'last_name' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: 'id' | 'first_name' | 'last_name') => {
    if (sortField === field) { setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }
    else { setSortField(field); setSortDirection('asc'); }
  };

  const filteredMembers = members
    .filter(m => {
      const q = searchQuery.toLowerCase();
      return m.first_name.toLowerCase().includes(q) || m.last_name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.member_id.toString().includes(q) || m.tags.some(t => t.name.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      const mod = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'id') return (a.member_id - b.member_id) * mod;
      if (sortField === 'first_name') return a.first_name.localeCompare(b.first_name) * mod;
      if (sortField === 'last_name') return a.last_name.localeCompare(b.last_name) * mod;
      return 0;
    });

  const handleRowClick = (member: Member) => { setDetailMember(member); setDetailDrawerOpen(true); };

  const handleUpdateMember = (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.member_id === updatedMember.member_id ? updatedMember : m));
    setDetailMember(updatedMember);
  };

  const handleSendWaiver = (member: Member) => {
    toast({ title: "Waiver Sent", description: `League waiver has been sent to ${member.first_name} ${member.last_name}` });
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search members or tags..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <div className="text-sm text-muted-foreground">{filteredMembers.length} of {members.length} members</div>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast({ title: "Export", description: "All members exported." })}>All Members</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast({ title: "Export", description: "Active season roster exported." })}>Active Season Only</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-20 text-xs font-semibold">
                <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => handleSort('id')}>ID <SortIcon field="id" /></button>
              </TableHead>
              <TableHead className="w-12 text-xs font-semibold"></TableHead>
              <TableHead className="text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => handleSort('first_name')}>First <SortIcon field="first_name" /></button>
                  <span className="text-muted-foreground">/</span>
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => handleSort('last_name')}>Last <SortIcon field="last_name" /></button>
                </div>
              </TableHead>
              <TableHead className="text-xs font-semibold">Contact</TableHead>
              <TableHead className="w-24 text-xs font-semibold">Waiver</TableHead>
              <TableHead className="text-xs font-semibold">Tags</TableHead>
              <TableHead className="w-16 text-xs font-semibold text-center">OFF</TableHead>
              <TableHead className="w-16 text-xs font-semibold text-center">DEF</TableHead>
              <TableHead className="w-16 text-xs font-semibold text-center">QB</TableHead>
              <TableHead className="w-28 text-xs font-semibold">Status</TableHead>
              <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">No members found</TableCell></TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={member.member_id} className="text-sm cursor-pointer hover:bg-muted/50" onClick={() => handleRowClick(member)}>
                  <TableCell className="font-mono text-xs">{member.member_id}</TableCell>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar_url} alt={`${member.first_name} ${member.last_name}`} />
                      <AvatarFallback className="text-xs">{member.first_name[0]}{member.last_name[0]}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{member.first_name} {member.last_name}</span>
                      <DisciplinaryBadge records={member.disciplinary_records} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span className="text-muted-foreground">{member.email}</span>
                      <span className="text-muted-foreground">{member.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell><WaiverStatusBadge waivers={member.waivers} onClick={() => handleSendWaiver(member)} /></TableCell>
                  <TableCell><MemberTags tags={member.tags} compact /></TableCell>
                  <TableCell className="text-center font-mono text-xs">{member.ratings?.offensive.toFixed(1) ?? '—'}</TableCell>
                  <TableCell className="text-center font-mono text-xs">{member.ratings?.defensive.toFixed(1) ?? '—'}</TableCell>
                  <TableCell className="text-center font-mono text-xs">{member.ratings?.qb.toFixed(1) ?? '—'}</TableCell>
                  <TableCell><MemberStatusBadge status={member.status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleRowClick(member); }} title="Update"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); toast({ title: "Delete", description: `Delete action for ${member.first_name} ${member.last_name}` }); }} title="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <MemberDetailDrawer member={detailMember} open={detailDrawerOpen} onOpenChange={setDetailDrawerOpen} onUpdateMember={handleUpdateMember} />
    </div>
  );
}
