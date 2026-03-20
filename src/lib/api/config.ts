/**
 * Tenant / league configuration API module.
 *
 * C# equivalent: ConfigurationController
 */

import { apiClient } from '../http-client';

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

/** GET /api/v1/public-configuration */
export async function fetchPublicConfiguration(): Promise<TenantConfig> {
  return apiClient.get('/api/v1/public-configuration');
}
