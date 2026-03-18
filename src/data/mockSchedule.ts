export interface ScheduleGame {
  id: string;
  date: string;
  time: string;
  home_team: string;
  away_team: string;
  venue: string;
  division: string;
}

export const mockSchedule: ScheduleGame[] = [
  { id: 'g1', date: '2025-03-18', time: '6:00 PM', home_team: 'Eagles', away_team: 'Tigers', venue: 'Memorial Field 1', division: 'Division A' },
  { id: 'g2', date: '2025-03-18', time: '7:30 PM', home_team: 'Hawks', away_team: 'Lions', venue: 'Central Park A', division: 'Division B' },
  { id: 'g3', date: '2025-03-20', time: '6:00 PM', home_team: 'Tigers', away_team: 'Eagles', venue: 'Memorial Field 2', division: 'Division A' },
  { id: 'g4', date: '2025-03-22', time: '10:00 AM', home_team: 'Lions', away_team: 'Hawks', venue: 'Riverside Field 1', division: 'Division B' },
];
