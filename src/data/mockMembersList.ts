import type { MemberRow, DivisionOption, PaginatedResponse } from '@/lib/api';

export const MOCK_DIVISIONS: DivisionOption[] = [
  { id: 'div-mens-a', name: "Men's A" },
  { id: 'div-mens-b', name: "Men's B" },
  { id: 'div-coed', name: 'Co-Ed' },
  { id: 'div-womens', name: "Women's" },
];

const members: MemberRow[] = [
  { id: 101, first_name: 'Marcus', last_name: 'Thompson', email: 'marcus.t@email.com', phone: '555-0201', team: { id: 't1', name: 'Thunderbolts' }, division: { id: 'div-mens-a', name: "Men's A" }, off_rating: 88, def_rating: 72, qb_rating: 91, is_qb: true, role: 'Captain', status: 'Active', avatar_url: null },
  { id: 102, first_name: 'Sarah', last_name: 'Chen', email: 'sarah.chen@email.com', phone: '555-0202', team: { id: 't2', name: 'Venom' }, division: { id: 'div-coed', name: 'Co-Ed' }, off_rating: 85, def_rating: 79, is_qb: false, role: 'Player', status: 'Active', avatar_url: null },
  { id: 103, first_name: 'DeAndre', last_name: 'Williams', email: 'dwilliams@email.com', phone: '555-0203', team: { id: 't3', name: 'Raptors' }, division: { id: 'div-mens-a', name: "Men's A" }, off_rating: 93, def_rating: 81, is_qb: false, role: 'Player', status: 'Active', avatar_url: null },
  { id: 104, first_name: 'Jessica', last_name: 'Martinez', email: 'jmartinez@email.com', phone: '555-0204', team: { id: 't4', name: 'Firestorm' }, division: { id: 'div-womens', name: "Women's" }, off_rating: 76, def_rating: 70, is_qb: false, role: 'Coach', status: 'Active', avatar_url: null },
  { id: 105, first_name: 'Tyler', last_name: 'Brooks', email: 'tbrooks@email.com', phone: '555-0205', team: { id: 't5', name: 'Grizzlies' }, division: { id: 'div-mens-b', name: "Men's B" }, off_rating: 68, def_rating: 65, qb_rating: 80, is_qb: true, role: 'Player', status: 'Active', avatar_url: null },
  { id: 106, first_name: 'Aisha', last_name: 'Johnson', email: 'aisha.j@email.com', phone: '555-0206', team: { id: 't2', name: 'Venom' }, division: { id: 'div-coed', name: 'Co-Ed' }, off_rating: 87, def_rating: 82, is_qb: false, role: 'Captain', status: 'Active', avatar_url: null },
  { id: 107, first_name: 'Brian', last_name: "O'Malley", email: 'bomalley@email.com', phone: '555-0207', team: { id: 't1', name: 'Thunderbolts' }, division: { id: 'div-mens-a', name: "Men's A" }, off_rating: 74, def_rating: 71, is_qb: false, role: 'Player', status: 'Inactive', avatar_url: null },
  { id: 108, first_name: 'Priya', last_name: 'Patel', email: 'ppatel@email.com', phone: '555-0208', team: { id: 't4', name: 'Firestorm' }, division: { id: 'div-womens', name: "Women's" }, off_rating: 82, def_rating: 78, is_qb: false, role: 'Player', status: 'Active', avatar_url: null },
  { id: 109, first_name: 'Chris', last_name: 'Rodriguez', email: 'crodriguez@email.com', phone: '555-0209', team: null, division: null, off_rating: null, def_rating: null, is_qb: false, role: 'Official', status: 'Active', avatar_url: null },
  { id: 110, first_name: 'Megan', last_name: 'Sawyer', email: 'msawyer@email.com', phone: '555-0210', team: { id: 't6', name: 'Falcons' }, division: { id: 'div-coed', name: 'Co-Ed' }, off_rating: 72, def_rating: 69, is_qb: false, role: 'Player', status: 'Inactive', avatar_url: null },
  { id: 111, first_name: 'Jamal', last_name: 'Harris', email: 'jharris@email.com', phone: '555-0211', team: { id: 't3', name: 'Raptors' }, division: { id: 'div-mens-a', name: "Men's A" }, off_rating: 90, def_rating: 84, qb_rating: 88, is_qb: true, role: 'Player', status: 'Active', avatar_url: null },
  { id: 112, first_name: 'Lauren', last_name: 'Kim', email: 'lkim@email.com', phone: '555-0212', team: { id: 't4', name: 'Firestorm' }, division: { id: 'div-womens', name: "Women's" }, off_rating: 79, def_rating: 75, is_qb: false, role: 'Captain', status: 'Active', avatar_url: null },
  { id: 113, first_name: 'David', last_name: 'Nguyen', email: 'dnguyen@email.com', phone: '555-0213', team: { id: 't5', name: 'Grizzlies' }, division: { id: 'div-mens-b', name: "Men's B" }, off_rating: 64, def_rating: 61, is_qb: false, role: 'Player', status: 'Active', avatar_url: null },
  { id: 114, first_name: 'Tanya', last_name: 'Wright', email: 'twright@email.com', phone: '555-0214', team: { id: 't6', name: 'Falcons' }, division: { id: 'div-coed', name: 'Co-Ed' }, off_rating: 73, def_rating: 70, is_qb: false, role: 'Coach', status: 'Active', avatar_url: null },
  { id: 115, first_name: 'Ryan', last_name: 'Foster', email: 'rfoster@email.com', phone: '555-0215', team: { id: 't5', name: 'Grizzlies' }, division: { id: 'div-mens-b', name: "Men's B" }, off_rating: 66, def_rating: 63, qb_rating: 75, is_qb: true, role: 'Player', status: 'Inactive', avatar_url: null },
];

export function getMockMembers(params: {
  search?: string;
  division?: string;
  role?: string;
  status?: string;
}): PaginatedResponse<MemberRow> {
  let filtered = [...members];

  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (m) =>
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.team?.name.toLowerCase().includes(q),
    );
  }
  if (params.division && params.division !== 'all') {
    filtered = filtered.filter((m) => m.division?.id === params.division);
  }
  if (params.role && params.role !== 'all') {
    filtered = filtered.filter((m) => m.role?.toLowerCase() === params.role!.toLowerCase());
  }
  if (params.status && params.status !== 'all') {
    filtered = filtered.filter((m) => m.status?.toLowerCase() === params.status!.toLowerCase());
  }

  return {
    data: filtered,
    meta: { current_page: 1, last_page: 1, per_page: 50, total: filtered.length },
  };
}
