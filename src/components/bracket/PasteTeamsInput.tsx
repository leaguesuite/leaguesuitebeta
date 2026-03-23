import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Check, X, FileText } from "lucide-react";
import type { ParsedTeam } from "@/types/bracket";

interface PasteTeamsInputProps {
  onTeamsParsed: (teams: ParsedTeam[]) => void;
  maxTeams: number;
}

export function PasteTeamsInput({ onTeamsParsed, maxTeams }: PasteTeamsInputProps) {
  const [textInput, setTextInput] = useState("");
  const [parsedTeams, setParsedTeams] = useState<ParsedTeam[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  const parseTeamText = (text: string): ParsedTeam[] => {
    if (!text.trim()) return [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const teams: ParsedTeam[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const numberedMatch = line.match(/^(\d+)\.?\s+(.+)$/);
      if (numberedMatch) {
        teams.push({ name: numberedMatch[2].trim(), ranking: parseInt(numberedMatch[1]) });
        continue;
      }
      if (line.length > 0) {
        teams.push({ name: line, ranking: i + 1 });
      }
    }
    return teams;
  };

  const handleTextChange = (value: string) => {
    setTextInput(value);
    setParseError(null);

    try {
      const parsed = parseTeamText(value);
      
      if (parsed.length > maxTeams) {
        setParseError(`Too many teams (${parsed.length}). Maximum: ${maxTeams}`);
        setParsedTeams([]);
        return;
      }

      if (parsed.length > 0) {
        const names = parsed.map(t => t.name.toLowerCase());
        const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
        
        if (duplicates.length > 0) {
          setParseError(`Duplicate team names: ${duplicates.join(', ')}`);
          setParsedTeams([]);
          return;
        }
        setParsedTeams(parsed);
      } else {
        setParsedTeams([]);
      }
    } catch {
      setParseError('Failed to parse team list');
      setParsedTeams([]);
    }
  };

  const handleConfirm = () => {
    if (parsedTeams.length >= 2) {
      onTeamsParsed(parsedTeams);
      setTextInput("");
      setParsedTeams([]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Paste Team List
        </label>
        <Textarea
          placeholder={`Enter team names, one per line:\n\n1. Lakers\n2. Warriors\n3. Celtics\n\nOr simply:\n\nLakers\nWarriors\nCeltics`}
          value={textInput}
          onChange={(e) => handleTextChange(e.target.value)}
          className="min-h-[120px] font-mono text-sm"
        />
      </div>

      {parseError && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {parseError}
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => { setTextInput(""); setParsedTeams([]); setParseError(null); }} disabled={!textInput}>
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
        <Button onClick={handleConfirm} disabled={parsedTeams.length < 2 || !!parseError}>
          <Check className="h-4 w-4 mr-2" />
          Add {parsedTeams.length} Teams
        </Button>
      </div>

      {parsedTeams.length > 0 && !parseError && (
        <div className="border border-border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Parsed Teams</span>
            <Badge variant="secondary">{parsedTeams.length} teams</Badge>
          </div>
          {parsedTeams.map((team, index) => (
            <div key={index}>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">#{team.ranking}</Badge>
                  <span className="font-medium text-sm">{team.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">Seed {index + 1}</span>
              </div>
              {index < parsedTeams.length - 1 && <Separator className="my-1" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
