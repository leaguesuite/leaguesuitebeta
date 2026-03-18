const API_BASE = 'https://flagplusfootball.com';

const defaultHeaders: HeadersInit = {
  'X-Requested-With': 'XMLHttpRequest',
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

export interface TenantConfig {
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  league: {
    id: string;
    name: string;
    key: string;
  };
  [key: string]: unknown;
}

export async function fetchPublicConfiguration(): Promise<TenantConfig> {
  const res = await fetch(`${API_BASE}/api/v1/public-configuration`, {
    credentials: 'include',
    headers: defaultHeaders,
  });
  if (!res.ok) throw new Error(`Config fetch failed: ${res.status}`);
  return res.json();
}

export interface MemberListParams {
  search?: string;
  division?: string;
  role?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

export interface MemberRow {
  id: number | string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  team?: { id: string; name: string } | null;
  division?: { id: string; name: string } | null;
  cap_rating?: number | null;
  role?: string;
  status?: string;
  avatar_url?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export async function fetchMembers(params: MemberListParams = {}): Promise<PaginatedResponse<MemberRow>> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.division) query.set('division', params.division);
  if (params.role) query.set('role', params.role);
  if (params.status) query.set('status', params.status);
  if (params.page) query.set('page', String(params.page));
  if (params.per_page) query.set('per_page', String(params.per_page));

  const res = await fetch(`${API_BASE}/api/v1/members?${query}`, {
    credentials: 'include',
    headers: defaultHeaders,
  });
  if (!res.ok) throw new Error(`Members fetch failed: ${res.status}`);
  return res.json();
}

export async function searchMembers(query: string): Promise<PaginatedResponse<MemberRow>> {
  const res = await fetch(`${API_BASE}/api/v1/search?${new URLSearchParams({ q: query })}`, {
    credentials: 'include',
    headers: defaultHeaders,
  });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json();
}

export interface DivisionOption {
  id: string;
  name: string;
}

export async function fetchDivisions(): Promise<DivisionOption[]> {
  const res = await fetch(`${API_BASE}/api/v1/divisions`, {
    credentials: 'include',
    headers: defaultHeaders,
  });
  if (!res.ok) throw new Error(`Divisions fetch failed: ${res.status}`);
  const json = await res.json();
  return json.data ?? json;
}
