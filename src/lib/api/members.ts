/**
 * Members API module.
 *
 * C# equivalent: MembersController
 */

import { apiClient } from '../http-client';

/* ─── Types (mirror these as C# DTOs) ────────────────────────────────────── */

export interface MemberRow {
  id: number | string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  team?: { id: string; name: string } | null;
  division?: { id: string; name: string } | null;
  off_rating?: number | null;
  def_rating?: number | null;
  qb_rating?: number | null;
  is_qb?: boolean;
  role?: string;
  status?: string;
  avatar_url?: string | null;
}

export interface MemberListParams {
  search?: string;
  division?: string;
  role?: string;
  status?: string;
  page?: number;
  per_page?: number;
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

export interface PlayerInfo {
  id: number | string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string | null;
  role?: string;
  status?: string;
  off_rating?: number | null;
  def_rating?: number | null;
  qb_rating?: number | null;
  is_qb?: boolean;
}

export interface SeasonStatRow {
  season_name: string;
  team_name: string;
  division_name: string;
  GP?: number;
  TD?: number;
  YDS?: number;
  INT?: number;
  COM?: number;
}

export interface CareerTotals {
  GP?: number;
  TD?: number;
  YDS?: number;
  INT?: number;
  COM?: number;
}

/* ─── Endpoints ───────────────────────────────────────────────────────────── */

/** GET /api/v1/members */
export async function fetchMembers(
  params: MemberListParams = {},
): Promise<PaginatedResponse<MemberRow>> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.division) query.set('division', params.division);
  if (params.role) query.set('role', params.role);
  if (params.status) query.set('status', params.status);
  if (params.page) query.set('page', String(params.page));
  if (params.per_page) query.set('per_page', String(params.per_page));

  return apiClient.get(`/api/v1/members?${query}`);
}

/** GET /api/v1/search?q=... */
export async function searchMembers(
  query: string,
): Promise<PaginatedResponse<MemberRow>> {
  return apiClient.get(
    `/api/v1/search?${new URLSearchParams({ q: query })}`,
  );
}

/** GET /api/v1/{id} — single player info */
export async function fetchPlayer(id: string): Promise<PlayerInfo> {
  const json = await apiClient.get<{ data?: PlayerInfo }>(`/api/v1/${id}`);
  return (json as any).data ?? json;
}

/** GET /api/v1/player-stats-season?memberId={id}&statsCode[]=... */
export async function fetchSeasonStats(id: string): Promise<SeasonStatRow[]> {
  const codes = ['GP', 'TD', 'YDS', 'INT', 'COM'];
  const query = new URLSearchParams({ memberId: id });
  codes.forEach((c) => query.append('statsCode[]', c));

  const json = await apiClient.get<{ data?: SeasonStatRow[] }>(
    `/api/v1/player-stats-season?${query}`,
  );
  return (json as any).data ?? json;
}

/** GET /api/v1/career-totals?stat_type=passing */
export async function fetchCareerTotals(): Promise<CareerTotals> {
  const json = await apiClient.get<{ data?: CareerTotals }>(
    `/api/v1/career-totals?${new URLSearchParams({ stat_type: 'passing' })}`,
  );
  return (json as any).data ?? json;
}
