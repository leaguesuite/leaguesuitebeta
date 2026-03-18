import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileSpreadsheet, Search, Users, Trophy, Calendar, MapPin, Shield, ClipboardList, Star, MessageSquare, AlertTriangle } from 'lucide-react';
import { exportToExcel } from '@/utils/exportToExcel';
import { mockMembers, mockPlayers } from '@/data/mockMembers';
import { mockSchedule } from '@/data/mockSchedule';
import { toast } from 'sonner';

interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  category: 'members' | 'season' | 'operations' | 'compliance';
  icon: React.ReactNode;
  generate: () => void;
}

const ReportsPage = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const reports: ReportDefinition[] = [
    {
      id: 'member-roster',
      title: 'Full Member Roster',
      description: 'Complete list of all members with contact info, status, and join date.',
      category: 'members',
      icon: <Users className="h-5 w-5" />,
      generate: () => {
        const data = mockMembers.map(m => ({
          'Member ID': m.member_id,
          'First Name': m.first_name,
          'Last Name': m.last_name,
          'Email': m.email,
          'Phone': m.phone || '',
          'Status': m.status,
          'Gender': m.gender || '',
          'Date of Birth': m.date_of_birth || '',
          'Joined': m.created_at,
        }));
        exportToExcel(data, 'member-roster', 'Members');
        toast.success('Member Roster exported');
      },
    },
    {
      id: 'active-players',
      title: 'Active Players by Team',
      description: 'All current players with team assignments and division placement.',
      category: 'season',
      icon: <Shield className="h-5 w-5" />,
      generate: () => {
        const data = mockPlayers.map(p => ({
          'Player ID': p.player_id,
          'Player Name': p.player_name,
          'Member ID': p.member_id,
          'Team': p.team_name,
          'Division': p.division,
        }));
        exportToExcel(data, 'active-players', 'Players');
        toast.success('Active Players exported');
      },
    },
    {
      id: 'member-ratings',
      title: 'Player Ratings',
      description: 'Offensive, defensive, and QB ratings for all rated members.',
      category: 'season',
      icon: <Star className="h-5 w-5" />,
      generate: () => {
        const data = mockMembers.filter(m => m.ratings).map(m => ({
          'Member ID': m.member_id,
          'Name': `${m.first_name} ${m.last_name}`,
          'Offensive': m.ratings?.offensive ?? '',
          'Defensive': m.ratings?.defensive ?? '',
          'QB': m.ratings?.qb ?? '',
          'Status': m.status,
        }));
        exportToExcel(data, 'player-ratings', 'Ratings');
        toast.success('Player Ratings exported');
      },
    },
    {
      id: 'game-schedule',
      title: 'Game Schedule',
      description: 'Full season schedule with dates, times, venues, and matchups.',
      category: 'season',
      icon: <Calendar className="h-5 w-5" />,
      generate: () => {
        const data = mockSchedule.map(g => ({
          'Game ID': g.id,
          'Date': g.date,
          'Time': g.time,
          'Home Team': g.home_team,
          'Away Team': g.away_team,
          'Venue': g.venue,
          'Division': g.division,
        }));
        exportToExcel(data, 'game-schedule', 'Schedule');
        toast.success('Game Schedule exported');
      },
    },
    {
      id: 'waiver-status',
      title: 'Waiver Status Report',
      description: 'All members with waiver signing status, dates, and expiration.',
      category: 'compliance',
      icon: <ClipboardList className="h-5 w-5" />,
      generate: () => {
        const data = mockMembers.flatMap(m =>
          (m.waivers || []).map(w => ({
            'Member ID': m.member_id,
            'Name': `${m.first_name} ${m.last_name}`,
            'Waiver Type': w.waiver_type,
            'Status': w.status,
            'Signed Date': w.signed_date || '',
            'Expiry Date': w.expiry_date || '',
          }))
        );
        exportToExcel(data, 'waiver-status', 'Waivers');
        toast.success('Waiver Status exported');
      },
    },
    {
      id: 'emergency-contacts',
      title: 'Emergency Contacts',
      description: 'Emergency contact information for all members who have provided it.',
      category: 'compliance',
      icon: <MessageSquare className="h-5 w-5" />,
      generate: () => {
        const data = mockMembers.filter(m => m.emergency_contact).map(m => ({
          'Member ID': m.member_id,
          'Member Name': `${m.first_name} ${m.last_name}`,
          'Contact Name': m.emergency_contact!.name,
          'Contact Phone': m.emergency_contact!.phone,
          'Relationship': m.emergency_contact!.relationship || '',
        }));
        exportToExcel(data, 'emergency-contacts', 'Emergency Contacts');
        toast.success('Emergency Contacts exported');
      },
    },
    {
      id: 'season-history',
      title: 'Season History',
      description: 'Historical record of all member participation across seasons and teams.',
      category: 'members',
      icon: <Trophy className="h-5 w-5" />,
      generate: () => {
        const data = mockMembers.flatMap(m =>
          (m.season_history || []).map(s => ({
            'Member ID': m.member_id,
            'Name': `${m.first_name} ${m.last_name}`,
            'Season': s.season_name,
            'Year': s.year,
            'Team': s.team_name,
            'Division': s.division,
            'Role': s.role,
          }))
        );
        exportToExcel(data, 'season-history', 'History');
        toast.success('Season History exported');
      },
    },
    {
      id: 'disciplinary-log',
      title: 'Disciplinary Records',
      description: 'All warnings, suspensions, and bans across members.',
      category: 'compliance',
      icon: <AlertTriangle className="h-5 w-5" />,
      generate: () => {
        const data = mockMembers.flatMap(m =>
          (m.disciplinary_records || []).map(d => ({
            'Member ID': m.member_id,
            'Name': `${m.first_name} ${m.last_name}`,
            'Type': d.type,
            'Reason': d.reason,
            'Start Date': d.start_date,
            'End Date': d.end_date || '',
            'Active': d.is_active ? 'Yes' : 'No',
            'Notes': d.notes || '',
          }))
        );
        exportToExcel(data, 'disciplinary-records', 'Disciplinary');
        toast.success('Disciplinary Records exported');
      },
    },
    {
      id: 'communication-log',
      title: 'Communication Log',
      description: 'Record of all emails and SMS messages sent to members.',
      category: 'operations',
      icon: <MessageSquare className="h-5 w-5" />,
      generate: () => {
        const data = mockMembers.flatMap(m =>
          (m.communications || []).map(c => ({
            'Member ID': m.member_id,
            'Name': `${m.first_name} ${m.last_name}`,
            'Channel': c.channel,
            'Subject': c.subject || '',
            'Message': c.message,
            'Sent At': c.sent_at,
            'Status': c.status,
          }))
        );
        exportToExcel(data, 'communication-log', 'Communications');
        toast.success('Communication Log exported');
      },
    },
    {
      id: 'venues',
      title: 'Venues & Locations',
      description: 'All venues referenced in the game schedule.',
      category: 'operations',
      icon: <MapPin className="h-5 w-5" />,
      generate: () => {
        const venues = [...new Set(mockSchedule.map(g => g.venue))];
        const data = venues.map(v => {
          const games = mockSchedule.filter(g => g.venue === v);
          return {
            'Venue': v,
            'Total Games': games.length,
            'Divisions': [...new Set(games.map(g => g.division))].join(', '),
          };
        });
        exportToExcel(data, 'venues', 'Venues');
        toast.success('Venues exported');
      },
    },
    {
      id: 'inactive-members',
      title: 'Inactive Members',
      description: 'Members marked inactive for follow-up or cleanup.',
      category: 'members',
      icon: <Users className="h-5 w-5" />,
      generate: () => {
        const data = mockMembers.filter(m => m.status === 'inactive').map(m => ({
          'Member ID': m.member_id,
          'First Name': m.first_name,
          'Last Name': m.last_name,
          'Email': m.email,
          'Phone': m.phone || '',
          'Joined': m.created_at,
          'Last Season': m.season_history?.length ? m.season_history[0].season_name : 'N/A',
        }));
        exportToExcel(data, 'inactive-members', 'Inactive');
        toast.success('Inactive Members exported');
      },
    },
    {
      id: 'team-captains',
      title: 'Team Captains & Roles',
      description: 'Members with leadership roles (captain, coach) in the current season.',
      category: 'season',
      icon: <Star className="h-5 w-5" />,
      generate: () => {
        const data = mockMembers.flatMap(m =>
          (m.season_history || [])
            .filter(s => s.role !== 'player')
            .map(s => ({
              'Member ID': m.member_id,
              'Name': `${m.first_name} ${m.last_name}`,
              'Role': s.role,
              'Team': s.team_name,
              'Division': s.division,
              'Season': s.season_name,
            }))
        );
        exportToExcel(data, 'team-captains', 'Captains & Roles');
        toast.success('Team Captains exported');
      },
    },
  ];

  const categoryLabels: Record<string, string> = {
    members: 'Members',
    season: 'Season',
    operations: 'Operations',
    compliance: 'Compliance',
  };

  const categoryColors: Record<string, string> = {
    members: 'bg-primary/10 text-primary',
    season: 'bg-accent/80 text-accent-foreground',
    operations: 'bg-muted text-muted-foreground',
    compliance: 'bg-destructive/10 text-destructive',
  };

  const filtered = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Exports</h1>
        <p className="text-muted-foreground mt-1">Download data as Excel spreadsheets.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="members">Members</SelectItem>
            <SelectItem value="season">Season</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(report => (
          <Card key={report.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-muted">{report.icon}</div>
                  <div>
                    <CardTitle className="text-base">{report.title}</CardTitle>
                    <Badge variant="secondary" className={`mt-1 text-xs font-normal ${categoryColors[report.category]}`}>
                      {categoryLabels[report.category]}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardDescription className="mt-2 text-sm">{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={report.generate}>
                <FileSpreadsheet className="h-4 w-4" />
                Export to Excel
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Download className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>No reports match your search.</p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
