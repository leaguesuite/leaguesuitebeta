import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Trophy, StickyNote, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Match } from "@/types/bracket";

interface MatchCardProps {
  match: Match;
  onTeamAdvance?: (matchId: string, teamId: string, teamSeed?: number) => void;
  readonly?: boolean;
  isDragging?: boolean;
  team1Note?: string;
  team2Note?: string;
  onNoteChange?: (matchId: string, team: 'team1' | 'team2', note: string) => void;
  onDropTeam?: (teamName: string) => void;
  onTeamNameChange?: (matchId: string, team: 'team1' | 'team2', name: string) => void;
  onSeedChange?: (matchId: string, team: 'team1' | 'team2', seed: number) => void;
}

const InlineNote = ({ note, onNoteChange, readonly }: { note?: string; onNoteChange?: (note: string) => void; readonly: boolean }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(note || '');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setValue(note || ''); }, [note]);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  if (readonly) return note ? <span className="text-[10px] leading-tight text-muted-foreground/70 italic truncate block mt-0.5">{note}</span> : null;

  if (editing) {
    return (
      <input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)}
        onBlur={() => { setEditing(false); onNoteChange?.(value); }}
        onKeyDown={(e) => { if (e.key === 'Enter') { setEditing(false); onNoteChange?.(value); } if (e.key === 'Escape') { setEditing(false); setValue(note || ''); } }}
        onClick={(e) => e.stopPropagation()}
        className="text-[10px] leading-tight text-muted-foreground italic w-full bg-transparent border-b border-dashed border-muted-foreground/30 outline-none py-0 mt-0.5"
        placeholder="Add note..." />
    );
  }
  return (
    <span className={cn("text-[10px] leading-tight italic truncate block mt-0.5 cursor-text", note ? "text-muted-foreground/70" : "text-muted-foreground/30 hover:text-muted-foreground/50")}
      onClick={(e) => { e.stopPropagation(); setEditing(true); }}>
      {note || <span className="flex items-center gap-0.5 opacity-0 group-hover/team:opacity-100 transition-opacity"><StickyNote className="w-2.5 h-2.5" /> note</span>}
    </span>
  );
};

const InlineSeed = ({ seed, onSeedChange, readonly, isWinner, primaryStyle }: { seed: number; onSeedChange?: (seed: number) => void; readonly: boolean; isWinner: boolean; primaryStyle?: React.CSSProperties }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(seed ? seed.toString() : '');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setValue(seed ? seed.toString() : ''); }, [seed]);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  if (readonly || !onSeedChange) {
    return (
      <span className={cn("text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5", isWinner ? "text-white" : "bg-muted text-muted-foreground")}
        style={isWinner ? primaryStyle : undefined}>{seed || '–'}</span>
    );
  }
  if (editing) {
    return (
      <input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
        onBlur={() => { setEditing(false); const n = parseInt(value); if (!isNaN(n) && n > 0) onSeedChange(n); else setValue(seed ? seed.toString() : ''); }}
        onKeyDown={(e) => { if (e.key === 'Enter') { setEditing(false); const n = parseInt(value); if (!isNaN(n) && n > 0) onSeedChange(n); } if (e.key === 'Escape') { setEditing(false); setValue(seed ? seed.toString() : ''); } }}
        onClick={(e) => e.stopPropagation()}
        className="text-xs font-bold w-6 h-6 rounded-full bg-muted text-center outline-none border border-dashed border-primary/40" placeholder="–" />
    );
  }
  return (
    <span className={cn("text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all", isWinner ? "text-white" : "bg-muted text-muted-foreground")}
      style={isWinner ? primaryStyle : undefined} onClick={(e) => { e.stopPropagation(); setEditing(true); }} title="Click to edit seed">{seed || '–'}</span>
  );
};

const InlineTeamName = ({ name, onNameChange, readonly, isPlaceholder }: { name: string; onNameChange?: (name: string) => void; readonly: boolean; isPlaceholder: boolean }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setValue(name); }, [name]);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  if (readonly || !onNameChange) return <span className={cn("font-medium truncate", isPlaceholder ? "text-muted-foreground/40 italic" : "text-foreground")}>{name}</span>;
  if (editing) {
    return (
      <input ref={inputRef} value={value.startsWith('Seed ') || value === 'TBD' || value === 'TBA' ? '' : value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => { setEditing(false); onNameChange(value.trim() && !value.startsWith('Seed ') ? value.trim() : 'TBA'); }}
        onKeyDown={(e) => { if (e.key === 'Enter') { setEditing(false); onNameChange(value.trim() && !value.startsWith('Seed ') ? value.trim() : 'TBA'); } if (e.key === 'Escape') { setEditing(false); setValue(name); } }}
        onClick={(e) => e.stopPropagation()}
        className="font-medium text-sm w-full bg-transparent border-b border-dashed border-primary/40 outline-none py-0"
        placeholder={isPlaceholder && name.startsWith('Seed ') ? name : "Enter team name..."} />
    );
  }
  return (
    <span className={cn("font-medium truncate cursor-text transition-colors", isPlaceholder ? "text-muted-foreground/40 italic hover:text-muted-foreground/60" : "text-foreground hover:text-foreground/70")}
      onClick={(e) => { e.stopPropagation(); setEditing(true); }}>{name || 'TBD'} <span className="text-[10px] opacity-0 group-hover/team:opacity-100">✏️</span></span>
  );
};

export const MatchCard = ({ match, onTeamAdvance, readonly = false, isDragging = false, team1Note, team2Note, onNoteChange, onDropTeam, onTeamNameChange, onSeedChange }: MatchCardProps) => {
  const handleTeamSelect = (teamId: string, teamSeed?: number) => {
    if (!readonly) {
      if (match.winner === teamId && onTeamAdvance) onTeamAdvance(match.id, '', undefined);
      else if (onTeamAdvance) onTeamAdvance(match.id, teamId, teamSeed);
    }
  };

  const getSeedNumber = (team?: { id: string; seed?: number }) => {
    if (!team) return null;
    if (team.seed) return team.seed;
    const m = team.id.match(/seed-(\d+)/);
    return m ? parseInt(m[1]) : null;
  };

  const team1Seed = getSeedNumber(match.team1);
  const team2Seed = getSeedNumber(match.team2);
  const showTeam1Seed = team1Seed !== null || !!onSeedChange;
  const showTeam2Seed = team2Seed !== null || !!onSeedChange;

  const isPlaceholderTeam = (team?: { id: string; name?: string }) =>
    !team || team.id.startsWith('tbd-') || team.id.startsWith('reseed-placeholder') || team.id.startsWith('extra-tbd');

  const hasRealName = (team?: { id: string; name?: string }) =>
    team?.name && team.name !== 'TBD' && !team.name.startsWith('Seed ');

  if (match.bye) {
    return (
      <div className={cn("match-card-skew", isDragging && "opacity-50 ring-2 ring-primary")}>
        <Card className="w-full bg-muted/50 border-2 border-[color:var(--bracket-secondary,hsl(var(--border)))] rounded-none border-l-0">
          <div className="flex"><div className="match-card-accent" />
            <CardContent className="match-card-inner p-4 flex-1">
              <div className="flex items-center justify-center text-muted-foreground">
                {showTeam1Seed && <span className="text-xs font-bold bg-muted text-muted-foreground rounded-full w-6 h-6 flex items-center justify-center mr-2">{team1Seed}</span>}
                <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                <span className="font-medium">{match.team1?.name || "TBD"}</span>
                <span className="text-sm ml-2 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Bye</span>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    );
  }

  const isBothTBD = isPlaceholderTeam(match.team1) && isPlaceholderTeam(match.team2) && !hasRealName(match.team1) && !hasRealName(match.team2);

  if (isBothTBD) {
    return (
      <div className={cn("match-card-skew", isDragging && "opacity-50 ring-2 ring-primary")}>
        <Card className="w-full bg-card shadow-sm rounded-none border-l-0 border-2 border-[color:var(--bracket-secondary,hsl(var(--border)))]">
          <div className="flex"><div className="match-card-accent" />
            <CardContent className="match-card-inner p-0 flex-1">
              <div className="space-y-0">
                <div className="group/team flex items-start p-3 border-b border-border/50">
                  {showTeam1Seed && <InlineSeed seed={team1Seed || 0} onSeedChange={onSeedChange ? (s) => onSeedChange(match.id, 'team1', s) : undefined} readonly={readonly} isWinner={false} />}
                  <div className="flex-1 min-w-0 ml-2">
                    <InlineTeamName name={match.team1?.name || 'TBD'} readonly={readonly} isPlaceholder={isPlaceholderTeam(match.team1)} onNameChange={onTeamNameChange ? (n) => onTeamNameChange(match.id, 'team1', n) : undefined} />
                    <InlineNote note={team1Note} onNoteChange={(n) => onNoteChange?.(match.id, 'team1', n)} readonly={readonly} />
                  </div>
                </div>
                <div className="group/team flex items-start p-3">
                  {showTeam2Seed && <InlineSeed seed={team2Seed || 0} onSeedChange={onSeedChange ? (s) => onSeedChange(match.id, 'team2', s) : undefined} readonly={readonly} isWinner={false} />}
                  <div className="flex-1 min-w-0 ml-2">
                    <InlineTeamName name={match.team2?.name || 'TBD'} readonly={readonly} isPlaceholder={isPlaceholderTeam(match.team2)} onNameChange={onTeamNameChange ? (n) => onTeamNameChange(match.id, 'team2', n) : undefined} />
                    <InlineNote note={team2Note} onNoteChange={(n) => onNoteChange?.(match.id, 'team2', n)} readonly={readonly} />
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    );
  }

  const renderTeamRow = (team: typeof match.team1, teamKey: 'team1' | 'team2', seed: number | null, showSeed: boolean, note?: string, isTop?: boolean) => {
    const isWinner = match.winner === team?.id;
    return (
      <div className={cn(
        "group/team flex items-start justify-between p-3 transition-all duration-200",
        isTop && "border-b border-border",
        team?.id?.startsWith('tbd-') || team?.id?.startsWith('reseed-placeholder')
          ? "cursor-default opacity-70"
          : isWinner ? "winner-highlight" : "hover:bg-muted/50 cursor-pointer",
        !readonly && !team?.id?.startsWith('tbd-') && !team?.id?.startsWith('reseed-placeholder') && "cursor-pointer"
      )}
        onClick={() => team?.id && !team.id.startsWith('tbd-') && !team.id.startsWith('reseed-placeholder') && handleTeamSelect(team.id, seed || undefined)}
      >
        <div className="flex items-start space-x-2 flex-1 min-w-0">
          {showSeed && (
            <InlineSeed seed={seed || 0} onSeedChange={onSeedChange ? (s) => onSeedChange(match.id, teamKey, s) : undefined}
              readonly={readonly} isWinner={isWinner}
              primaryStyle={isWinner ? { backgroundColor: 'var(--bracket-primary, #16a34a)' } : undefined} />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              {isWinner ? (
                <span className="font-semibold truncate text-foreground" style={{ color: 'var(--bracket-primary, #16a34a)' }}>{team?.name || "TBD"}</span>
              ) : (
                <InlineTeamName name={team?.name || 'TBD'} readonly={readonly} isPlaceholder={isPlaceholderTeam(team)} onNameChange={onTeamNameChange ? (n) => onTeamNameChange(match.id, teamKey, n) : undefined} />
              )}
              {team?.byeAdvanced && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full flex-shrink-0">Bye</span>}
            </div>
            <InlineNote note={note} onNoteChange={(n) => onNoteChange?.(match.id, teamKey, n)} readonly={readonly} />
          </div>
          {isWinner && (
            <div className="flex items-center space-x-1 animate-fade-in flex-shrink-0" style={{ color: 'var(--bracket-primary, #16a34a)' }}>
              <Check className="w-4 h-4" /><Trophy className="w-4 h-4" />
            </div>
          )}
          {match.winner && match.winner !== team?.id && !readonly && onDropTeam && team?.name && team.name !== 'TBD' && team.name !== 'TBA' && !team.id.startsWith('tbd-') && (
            <button className="flex items-center justify-center w-6 h-6 rounded bg-muted hover:bg-destructive/10 hover:text-destructive transition-colors flex-shrink-0 animate-fade-in"
              title={`Drop ${team.name} to another bracket`} onClick={(e) => { e.stopPropagation(); onDropTeam(team!.name); }}>
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("match-card-skew", isDragging && "opacity-50 ring-2 ring-primary")}>
      <Card className={cn("w-full bg-card shadow-sm hover:shadow-md transition-all duration-200 rounded-none border-l-0 border-2", "border-[color:var(--bracket-secondary,hsl(var(--border)))]")}>
        <div className="flex"><div className="match-card-accent" />
          <CardContent className="match-card-inner p-0 flex-1">
            <div className="space-y-0">
              {renderTeamRow(match.team1, 'team1', team1Seed, showTeam1Seed, team1Note, true)}
              {renderTeamRow(match.team2, 'team2', team2Seed, showTeam2Seed, team2Note, false)}
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};
