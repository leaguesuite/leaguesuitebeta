export interface MessageTemplate {
  id: string;
  name: string;
  subject?: string;
  message: string;
  channel: 'email' | 'sms' | 'both';
  category: string;
}

export const messageTemplates: MessageTemplate[] = [
  { id: '1', name: 'Season Welcome', subject: 'Welcome to the New Season!', message: 'Welcome to the upcoming season! We are excited to have you. Please make sure your waiver is signed and your profile is up to date.', channel: 'both', category: 'Season' },
  { id: '2', name: 'Game Reminder', subject: 'Game Reminder', message: 'Reminder: You have a game scheduled. Please arrive 15 minutes early for warm-ups.', channel: 'both', category: 'Games' },
  { id: '3', name: 'Waiver Reminder', subject: 'Action Required: Sign Your Waiver', message: 'Our records show your waiver is not yet signed. Please complete it before the season starts.', channel: 'email', category: 'Administrative' },
  { id: '4', name: 'Practice Update', message: 'Practice has been updated. Check the schedule for the latest times and locations.', channel: 'sms', category: 'Practice' },
  { id: '5', name: 'Payment Reminder', subject: 'Payment Reminder', message: 'This is a reminder that your season payment is due. Please submit payment at your earliest convenience.', channel: 'email', category: 'Payments' },
];
