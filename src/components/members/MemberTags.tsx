import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PREDEFINED_TAGS, type MemberTag } from '@/types/member';
import { useState } from 'react';

interface MemberTagsProps {
  tags: MemberTag[];
  editable?: boolean;
  compact?: boolean;
  onAddTag?: (tag: Omit<MemberTag, 'id'>) => void;
  onRemoveTag?: (tagId: string) => void;
}

export function MemberTags({ tags, editable = false, compact = false, onAddTag, onRemoveTag }: MemberTagsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const availableTags = PREDEFINED_TAGS.filter(pt => !tags.some(t => t.name === pt.name));

  if (compact && tags.length === 0) return <span className="text-xs text-muted-foreground">—</span>;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {tags.slice(0, 2).map((tag) => (
          <Badge key={tag.id} variant="outline" className="text-xs px-1.5 py-0" style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color, color: tag.color }}>
            {tag.name}
          </Badge>
        ))}
        {tags.length > 2 && <Badge variant="outline" className="text-xs px-1.5 py-0 text-muted-foreground">+{tags.length - 2}</Badge>}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {tags.map((tag) => (
        <Badge key={tag.id} variant="outline" className="gap-1 text-sm" style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color, color: tag.color }}>
          {tag.name}
          {editable && onRemoveTag && <button onClick={() => onRemoveTag(tag.id)} className="ml-1 hover:opacity-70"><X className="h-3 w-3" /></button>}
        </Badge>
      ))}
      {editable && availableTags.length > 0 && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 gap-1"><Plus className="h-3 w-3" />Add Tag</Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="space-y-1">
              {availableTags.map((tag, idx) => (
                <button key={idx} onClick={() => { onAddTag?.(tag); setIsOpen(false); }} className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-muted flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                  {tag.name}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
      {tags.length === 0 && !editable && <span className="text-sm text-muted-foreground">No tags</span>}
    </div>
  );
}
