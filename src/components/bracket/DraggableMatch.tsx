import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { MatchCard } from './MatchCard';
import type { Match } from '@/types/bracket';

interface DraggableMatchProps {
  match: Match;
  onTeamAdvance?: (matchId: string, teamId: string, teamSeed?: number) => void;
  readonly?: boolean;
  isDragEnabled?: boolean;
  team1Note?: string;
  team2Note?: string;
  onNoteChange?: (matchId: string, team: 'team1' | 'team2', note: string) => void;
  onDropTeam?: (teamName: string) => void;
  onTeamNameChange?: (matchId: string, team: 'team1' | 'team2', name: string) => void;
  onSeedChange?: (matchId: string, team: 'team1' | 'team2', seed: number) => void;
}

export const DraggableMatch = ({ 
  match, 
  onTeamAdvance, 
  readonly = false,
  isDragEnabled = true,
  team1Note,
  team2Note,
  onNoteChange,
  onDropTeam,
  onTeamNameChange,
  onSeedChange,
}: DraggableMatchProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: match.id,
    disabled: !isDragEnabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className="flex items-stretch">
        {isDragEnabled && (
          <div 
            {...attributes}
            {...listeners}
            data-drag-handle
            className="flex items-center justify-center px-2 bg-muted hover:bg-muted/80 cursor-grab active:cursor-grabbing border border-r-0 border-border transition-colors match-card-skew"
            style={{ marginRight: '-2px', zIndex: 1 }}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground match-card-inner" />
          </div>
        )}
        <div className={isDragEnabled ? "flex-1" : "w-full"}>
          <MatchCard 
            match={match} 
            onTeamAdvance={onTeamAdvance}
            readonly={readonly}
            isDragging={isDragging}
            team1Note={team1Note}
            team2Note={team2Note}
            onNoteChange={onNoteChange}
            onDropTeam={onDropTeam}
            onTeamNameChange={onTeamNameChange}
            onSeedChange={onSeedChange}
          />
        </div>
      </div>
    </div>
  );
};
