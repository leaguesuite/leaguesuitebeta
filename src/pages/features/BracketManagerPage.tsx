import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Settings, Save, Plus, Trash2 } from 'lucide-react';
import { PasteTeamsInput } from '@/components/bracket/PasteTeamsInput';
import { toast } from 'sonner';
import type { ParsedTeam } from '@/types/bracket';

export default function BracketManagerPage() {
  const [bracketName, setBracketName] = useState('');
  const [bracketType, setBracketType] = useState('single-elimination');
  const [participants, setParticipants] = useState('8');
  const [isReseeding, setIsReseeding] = useState(false);
  const [pastedTeams, setPastedTeams] = useState<ParsedTeam[]>([]);

  const participantCount = Math.max(3, Math.min(32, parseInt(participants) || 8));
  const numRounds = Math.ceil(Math.log2(participantCount));

  const handlePastedTeams = (teams: ParsedTeam[]) => {
    setPastedTeams(teams);
    setParticipants(teams.length.toString());
    toast.success(`${teams.length} teams added`);
  };

  const handleSave = () => {
    if (!bracketName) {
      toast.error('Please enter a bracket name');
      return;
    }
    toast.success('Bracket saved successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center">
            <Trophy className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Bracket Manager</h1>
            <p className="text-sm text-muted-foreground">Create and manage playoff brackets</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-6">
        {/* Settings Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="w-5 h-5" />
                Tournament Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tournament Name</Label>
                <Input placeholder="Enter tournament name" value={bracketName} onChange={(e) => setBracketName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Tournament Type</Label>
                <Select value={bracketType} onValueChange={setBracketType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-elimination">Single Elimination</SelectItem>
                    <SelectItem value="double-elimination">Double Elimination</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Total Teams</Label>
                <Input type="number" placeholder="# of teams" value={participants} onChange={(e) => setParticipants(e.target.value)} min={3} max={32} />
                {participants && (parseInt(participants) < 3 || parseInt(participants) > 32) && (
                  <p className="text-xs text-destructive">Enter a number between 3 and 32</p>
                )}
              </div>

              <div className="space-y-3 py-2">
                <Label className="text-sm font-semibold">Tournament Flow</Label>
                <div className="space-y-2">
                  <button type="button" onClick={() => setIsReseeding(true)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors cursor-pointer ${isReseeding ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isReseeding ? 'border-primary' : 'border-muted-foreground/40'}`}>
                        {isReseeding && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <span className="font-medium text-sm text-foreground">Re-Seed after each round</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-6">Top seed always faces the lowest seed.</p>
                  </button>
                  <button type="button" onClick={() => setIsReseeding(false)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors cursor-pointer ${!isReseeding ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${!isReseeding ? 'border-primary' : 'border-muted-foreground/40'}`}>
                        {!isReseeding && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <span className="font-medium text-sm text-foreground">Follow bracket path</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-6">Winners advance along fixed bracket positions.</p>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teams */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Teams</CardTitle>
                <Badge variant="secondary">{pastedTeams.length} added</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <PasteTeamsInput onTeamsParsed={handlePastedTeams} maxTeams={32} />
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full" disabled={!bracketName}>
            <Save className="w-4 h-4 mr-2" />Save Tournament
          </Button>
        </div>

        {/* Preview */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                {bracketName || 'Tournament Bracket'}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{participantCount} Teams</Badge>
                <Badge variant="outline">{numRounds} Rounds</Badge>
                <Badge variant={isReseeding ? 'default' : 'secondary'}>{isReseeding ? 'Reseeding' : 'Standard'}</Badge>
              </div>
            </div>
            <CardDescription>
              {pastedTeams.length >= 2
                ? `${pastedTeams.length} teams seeded • Click on teams to advance them`
                : 'Add teams using the paste input on the left to populate the bracket'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pastedTeams.length >= 2 ? (
              <div className="overflow-x-auto">
                <div className="flex gap-8 min-w-max p-4">
                  {Array.from({ length: numRounds }).map((_, ri) => {
                    const roundsFromEnd = numRounds - ri - 1;
                    const roundName = roundsFromEnd === 0 ? 'Finals' : roundsFromEnd === 1 ? 'Semi-Finals' : roundsFromEnd === 2 ? 'Quarter-Finals' : `Round ${ri + 1}`;
                    const matchCount = Math.pow(2, numRounds - ri - 1);
                    const gap = Math.pow(2, ri) * 2;

                    return (
                      <div key={ri} className="flex-shrink-0 w-56 flex flex-col">
                        <h3 className="font-semibold text-sm text-primary text-center mb-4">{roundName}</h3>
                        <div className="flex flex-col justify-center" style={{ gap: `${gap}rem` }}>
                          {Array.from({ length: matchCount }).map((_, mi) => {
                            const seed1 = ri === 0 ? mi * 2 + 1 : null;
                            const seed2 = ri === 0 ? mi * 2 + 2 : null;
                            const team1Name = seed1 && seed1 <= pastedTeams.length ? pastedTeams[seed1 - 1].name : 'TBD';
                            const team2Name = seed2 && seed2 <= pastedTeams.length ? pastedTeams[seed2 - 1].name : 'TBD';

                            return (
                              <Card key={mi} className="shadow-sm border-2 border-border">
                                <CardContent className="p-0">
                                  <div className="flex items-center gap-2 p-2.5 border-b border-border/50">
                                    {seed1 && <span className="text-xs font-bold bg-muted text-muted-foreground rounded-full w-5 h-5 flex items-center justify-center">{seed1}</span>}
                                    <span className={`text-sm font-medium truncate ${ri > 0 ? 'text-muted-foreground/50 italic' : 'text-foreground'}`}>{team1Name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 p-2.5">
                                    {seed2 && <span className="text-xs font-bold bg-muted text-muted-foreground rounded-full w-5 h-5 flex items-center justify-center">{seed2}</span>}
                                    <span className={`text-sm font-medium truncate ${ri > 0 ? 'text-muted-foreground/50 italic' : 'text-foreground'}`}>{team2Name}</span>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 border border-dashed border-border rounded-lg text-muted-foreground text-sm">
                <p>Add at least 2 teams to display bracket</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
