/**
 * Thin HTTP client wrapping fetch.
 *
 * Centralises headers, credentials, JSON parsing, and error handling
 * so every API module stays focused on endpoint paths and types.
 *
 * To swap authentication strategy (e.g. from Laravel cookies to
 * ASP.NET Core JWT), update api-config.ts — no changes needed here.
 */

import { API_BASE, AUTH_MODE, buildHeaders } from './api-config';

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body?: unknown,
  ) {
    super(`API ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

/** Registered response interceptors (e.g. 401 redirect). */
type Interceptor = (response: Response) => void;
const interceptors: Interceptor[] = [];

export function addResponseInterceptor(fn: Interceptor) {
  interceptors.push(fn);
}

/** Default: redirect to /login on 401. */
addResponseInterceptor((res) => {
  if (res.status === 401 && typeof window !== 'undefined') {
    // Consumers can remove this interceptor and add their own logic.
    console.warn('[http-client] 401 — session expired');
  }
});

/* ─── Internal helpers ────────────────────────────────────────────────────── */

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: HeadersInit,
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

  const init: RequestInit = {
    method,
    headers: buildHeaders(extraHeaders),
    ...(AUTH_MODE === 'cookie' ? { credentials: 'include' as const } : {}),
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const res = await fetch(url, init);

  // Run interceptors
  for (const fn of interceptors) fn(res);

  if (!res.ok) {
    let parsed: unknown;
    try { parsed = await res.json(); } catch { /* ignore */ }
    throw new ApiError(res.status, res.statusText, parsed);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json();
}

/* ─── Public API ──────────────────────────────────────────────────────────── */

export const apiClient = {
  get<T>(path: string, headers?: HeadersInit): Promise<T> {
    return request<T>('GET', path, undefined, headers);
  },
  post<T>(path: string, body?: unknown, headers?: HeadersInit): Promise<T> {
    return request<T>('POST', path, body, headers);
  },
  put<T>(path: string, body?: unknown, headers?: HeadersInit): Promise<T> {
    return request<T>('PUT', path, body, headers);
  },
  patch<T>(path: string, body?: unknown, headers?: HeadersInit): Promise<T> {
    return request<T>('PATCH', path, body, headers);
  },
  delete<T>(path: string, headers?: HeadersInit): Promise<T> {
    return request<T>('DELETE', path, undefined, headers);
  },
};
