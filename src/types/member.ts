// Centralized CRM type definitions for Members

export type WaiverStatus = 'signed' | 'unsigned' | 'expired';
export type DisciplinaryType = 'warning' | 'suspension' | 'ban';
export type CommunicationChannel = 'email' | 'sms';
export type DeliveryStatus = 'sent' | 'failed' | 'pending';
export type Gender = 'male' | 'female';

export interface WaiverRecord {
  id: string;
  waiver_type: string;
  status: WaiverStatus;
  signed_date?: string;
  expiry_date?: string;
  document_url?: string;
}

export interface SeasonHistory {
  id: string;
  season_name: string;
  team_name: string;
  division: string;
  role: 'player' | 'captain' | 'coach';
  year: number;
}

export interface MemberTag {
  id: string;
  name: string;
  color: string;
}

export interface DisciplinaryRecord {
  id: string;
  type: DisciplinaryType;
  reason: string;
  start_date: string;
  end_date?: string;
  notes?: string;
  is_active: boolean;
}

export interface MemberNote {
  id: string;
  text: string;
  author: string;
  category: 'general' | 'phone_call' | 'meeting' | 'issue' | 'follow_up';
  created_at: string;
}

export interface CommunicationRecord {
  id: string;
  channel: CommunicationChannel;
  subject?: string;
  message: string;
  sent_at: string;
  status: DeliveryStatus;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface MemberRatings {
  offensive: number;
  defensive: number;
  qb: number;
}

export interface Member {
  member_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: Gender;
  ratings?: MemberRatings;
  emergency_contact?: EmergencyContact;
  waivers: WaiverRecord[];
  season_history: SeasonHistory[];
  tags: MemberTag[];
  disciplinary_records: DisciplinaryRecord[];
  notes: MemberNote[];
  communications: CommunicationRecord[];
}

export interface Player {
  player_id: number;
  player_name: string;
  member_id: number;
  team_name: string;
  division: string;
}

export const PREDEFINED_TAGS: Omit<MemberTag, 'id'>[] = [
  { name: 'Team Captain', color: 'hsl(221, 83%, 53%)' },
  { name: 'Coach', color: 'hsl(142, 71%, 45%)' },
  { name: 'Volunteer', color: 'hsl(280, 65%, 60%)' },
  { name: 'New Member', color: 'hsl(45, 93%, 47%)' },
  { name: 'VIP', color: 'hsl(340, 82%, 52%)' },
];

export const TAG_COLORS = [
  'hsl(221, 83%, 53%)',
  'hsl(142, 71%, 45%)',
  'hsl(280, 65%, 60%)',
  'hsl(45, 93%, 47%)',
  'hsl(340, 82%, 52%)',
  'hsl(199, 89%, 48%)',
  'hsl(25, 95%, 53%)',
  'hsl(0, 84%, 60%)',
];
