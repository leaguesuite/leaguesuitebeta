import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, FileCheck, History, Tags, MessageSquare, Mail, Phone, AlertTriangle, Calendar, Heart, Pencil, Save, X, UserCircle, Plus } from 'lucide-react';
import type { Member, MemberNote, MemberTag, Gender, WaiverRecord, EmergencyContact } from '@/types/member';
import { WaiverStatusBadge } from './WaiverStatusBadge';
import { MemberTags } from './MemberTags';
import { DisciplinaryBadge, DisciplinaryRecordsList } from './DisciplinaryRecords';
import { MemberNotes } from './MemberNotes';
import { MemberHistory } from './MemberHistory';
import { CommunicationLog } from './CommunicationLog';
import { MemberStatusBadge } from './MemberStatusBadge';
import { toast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

interface MemberDetailDrawerProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateMember?: (updatedMember: Member) => void;
}

export function MemberDetailDrawer({ member, open, onOpenChange, onUpdateMember }: MemberDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '', phone: '', date_of_birth: '', gender: '' as Gender | '' });

  useEffect(() => {
    if (member) {
      setEditForm({ first_name: member.first_name, last_name: member.last_name, email: member.email, phone: member.phone, date_of_birth: member.date_of_birth || '', gender: member.gender || '' });
      setIsEditing(false);
    }
  }, [member]);

  if (!member) return null;

  const handleSave = () => {
    onUpdateMember?.({ ...member, first_name: editForm.first_name, last_name: editForm.last_name, email: editForm.email, phone: editForm.phone, date_of_birth: editForm.date_of_birth || undefined, gender: editForm.gender || undefined });
    setIsEditing(false);
    toast({ title: "Member Updated", description: "Member details have been saved." });
  };

  const handleCancel = () => {
    setEditForm({ first_name: member.first_name, last_name: member.last_name, email: member.email, phone: member.phone, date_of_birth: member.date_of_birth || '', gender: member.gender || '' });
    setIsEditing(false);
  };

  const handleAddNote = (note: Omit<MemberNote, 'id' | 'created_at'>) => {
    onUpdateMember?.({ ...member, notes: [...member.notes, { ...note, id: `n${Date.now()}`, created_at: new Date().toISOString() }] });
  };

  const handleAddTag = (tag: Omit<MemberTag, 'id'>) => {
    onUpdateMember?.({ ...member, tags: [...member.tags, { ...tag, id: `t${Date.now()}` }] });
  };

  const handleRemoveTag = (tagId: string) => {
    onUpdateMember?.({ ...member, tags: member.tags.filter(t => t.id !== tagId) });
  };

  const activeDisciplinary = member.disciplinary_records.filter(d => d.is_active);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={member.avatar_url} alt={`${member.first_name} ${member.last_name}`} />
              <AvatarFallback className="text-lg">{member.first_name[0]}{member.last_name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <SheetTitle className="text-xl">{member.first_name} {member.last_name}</SheetTitle>
              <p className="text-sm text-muted-foreground">ID: {member.member_id}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <MemberStatusBadge status={member.status} />
                <WaiverStatusBadge waivers={member.waivers} />
                <DisciplinaryBadge records={member.disciplinary_records} />
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="text-xs px-2"><User className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Overview</span></TabsTrigger>
            <TabsTrigger value="waiver" className="text-xs px-2"><FileCheck className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Waiver</span></TabsTrigger>
            <TabsTrigger value="history" className="text-xs px-2"><History className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">History</span></TabsTrigger>
            <TabsTrigger value="tags" className="text-xs px-2 relative"><Tags className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Tags</span>{activeDisciplinary.length > 0 && <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full" />}</TabsTrigger>
            <TabsTrigger value="comms" className="text-xs px-2"><MessageSquare className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Comms</span></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-4">
            <div className="flex justify-end">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleCancel}><X className="h-4 w-4 mr-1" />Cancel</Button>
                  <Button size="sm" onClick={handleSave}><Save className="h-4 w-4 mr-1" />Save</Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Pencil className="h-4 w-4 mr-1" />Edit</Button>
              )}
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-3">Contact Information</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>First Name</Label><Input value={editForm.first_name} onChange={(e) => setEditForm(f => ({ ...f, first_name: e.target.value }))} /></div>
                    <div className="space-y-2"><Label>Last Name</Label><Input value={editForm.last_name} onChange={(e) => setEditForm(f => ({ ...f, last_name: e.target.value }))} /></div>
                  </div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={editForm.email} onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input value={editForm.phone} onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={editForm.date_of_birth} onChange={(e) => setEditForm(f => ({ ...f, date_of_birth: e.target.value }))} /></div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select value={editForm.gender} onValueChange={(v) => setEditForm(f => ({ ...f, gender: v as Gender | '' }))}>
                        <SelectTrigger><SelectValue placeholder="Not set" /></SelectTrigger>
                        <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><a href={`mailto:${member.email}`} className="text-sm text-primary hover:underline">{member.email}</a></div>
                  <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /><a href={`tel:${member.phone}`} className="text-sm hover:underline">{member.phone}</a></div>
                  <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{member.date_of_birth ? format(parseISO(member.date_of_birth), 'MMMM d, yyyy') : <span className="text-muted-foreground italic">Not set</span>}</span></div>
                  <div className="flex items-center gap-3"><UserCircle className="h-4 w-4 text-muted-foreground" /><span className="text-sm capitalize">{member.gender || <span className="text-muted-foreground italic">Not set</span>}</span></div>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2"><Heart className="h-4 w-4" />Emergency Contact</h3>
              </div>
              {member.emergency_contact ? (
                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                  <p className="font-medium text-sm">{member.emergency_contact.name}</p>
                  <p className="text-sm text-muted-foreground">{member.emergency_contact.relationship}</p>
                  <a href={`tel:${member.emergency_contact.phone}`} className="text-sm text-primary hover:underline">{member.emergency_contact.phone}</a>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No emergency contact on file</p>
              )}
            </div>

            <Separator />

            {member.ratings && (
              <>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-3">Player Ratings</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/30 rounded-lg p-3 text-center"><div className="text-xl font-bold">{member.ratings.offensive.toFixed(1)}</div><div className="text-xs text-muted-foreground">Offensive</div></div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center"><div className="text-xl font-bold">{member.ratings.defensive.toFixed(1)}</div><div className="text-xs text-muted-foreground">Defensive</div></div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center"><div className="text-xl font-bold">{member.ratings.qb.toFixed(1)}</div><div className="text-xs text-muted-foreground">QB</div></div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-3">Notes</h3>
              <MemberNotes notes={member.notes} onAddNote={handleAddNote} />
            </div>
          </TabsContent>

          <TabsContent value="waiver" className="space-y-4 mt-4">
            <h3 className="font-medium">Waiver Status</h3>
            {member.waivers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground"><FileCheck className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No waivers on file</p></div>
            ) : (
              <div className="space-y-3">
                {member.waivers.map(waiver => (
                  <div key={waiver.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{waiver.waiver_type}</span>
                      <WaiverStatusBadge waivers={[waiver]} showTooltip={false} />
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {waiver.signed_date && <p>Signed: {format(parseISO(waiver.signed_date), 'MMMM d, yyyy')}</p>}
                      {waiver.expiry_date && <p>Expires: {format(parseISO(waiver.expiry_date), 'MMMM d, yyyy')}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <MemberHistory history={member.season_history} />
          </TabsContent>

          <TabsContent value="tags" className="space-y-6 mt-4">
            <div>
              <h3 className="font-medium mb-3">Tags</h3>
              <MemberTags tags={member.tags} editable onAddTag={handleAddTag} onRemoveTag={handleRemoveTag} />
            </div>
            <Separator />
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Disciplinary Records</h3>
              <DisciplinaryRecordsList records={member.disciplinary_records} />
            </div>
          </TabsContent>

          <TabsContent value="comms" className="mt-4">
            <CommunicationLog communications={member.communications} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
