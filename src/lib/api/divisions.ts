/**
 * Divisions API module.
 *
 * C# equivalent: DivisionsController
 */

import { apiClient } from '../http-client';

export interface DivisionOption {
  id: string;
  name: string;
}

/** GET /api/v1/divisions */
export async function fetchDivisions(): Promise<DivisionOption[]> {
  const json = await apiClient.get<{ data?: DivisionOption[] }>(
    '/api/v1/divisions',
  );
  return (json as any).data ?? json;
}
