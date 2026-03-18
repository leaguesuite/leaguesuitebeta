import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Phone, Users, AlertCircle, Clock, Plus } from 'lucide-react';
import type { MemberNote } from '@/types/member';
import { format, parseISO } from 'date-fns';

const categoryConfig = {
  general: { icon: MessageSquare, label: 'General', color: 'text-blue-600' },
  phone_call: { icon: Phone, label: 'Phone Call', color: 'text-green-600' },
  meeting: { icon: Users, label: 'Meeting', color: 'text-purple-600' },
  issue: { icon: AlertCircle, label: 'Issue', color: 'text-red-600' },
  follow_up: { icon: Clock, label: 'Follow-up', color: 'text-amber-600' },
};

export function MemberNotes({ notes, onAddNote }: { notes: MemberNote[]; onAddNote?: (note: Omit<MemberNote, 'id' | 'created_at'>) => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [category, setCategory] = useState<MemberNote['category']>('general');

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    onAddNote?.({ text: newNote.trim(), author: 'Admin', category });
    setNewNote(''); setCategory('general'); setIsAdding(false);
  };

  const sorted = [...notes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-4">
      {isAdding ? (
        <div className="border rounded-lg p-3 space-y-3">
          <Select value={category} onValueChange={(v) => setCategory(v as MemberNote['category'])}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}><span className="flex items-center gap-2"><config.icon className={`h-4 w-4 ${config.color}`} />{config.label}</span></SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea placeholder="Write a note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} className="min-h-[80px]" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>Add Note</Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setIsAdding(true)} className="w-full gap-2"><Plus className="h-4 w-4" />Add Note</Button>
      )}
      {sorted.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground"><MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No notes yet</p></div>
      ) : (
        <div className="space-y-3">
          {sorted.map(note => {
            const config = categoryConfig[note.category];
            const Icon = config.icon;
            return (
              <div key={note.id} className="border rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <Icon className={`h-4 w-4 mt-1 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{note.text}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{note.author}</span><span>•</span><span>{format(parseISO(note.created_at), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
