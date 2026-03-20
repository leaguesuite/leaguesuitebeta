/**
 * Centralized API configuration.
 *
 * A C# / ASP.NET Core developer only needs to:
 *   1. Set VITE_API_BASE_URL to their server origin
 *   2. Optionally flip AUTH_MODE to 'bearer' and supply a token getter
 */

export const API_BASE: string =
  import.meta.env.VITE_API_BASE_URL ?? 'https://flagplusfootball.com';

/**
 * Authentication strategy.
 *   - 'cookie'  → Laravel-style session cookies + XSRF-TOKEN (current default)
 *   - 'bearer'  → JWT Bearer token in Authorization header (typical for ASP.NET Core)
 */
export type AuthMode = 'cookie' | 'bearer';

export const AUTH_MODE: AuthMode =
  (import.meta.env.VITE_AUTH_MODE as AuthMode) ?? 'cookie';

/**
 * Override this function when using bearer auth.
 * It should return a valid JWT access token (or null).
 */
let _tokenGetter: (() => string | null) = () => null;

export function setTokenGetter(fn: () => string | null) {
  _tokenGetter = fn;
}

export function getToken(): string | null {
  return _tokenGetter();
}

/**
 * Build the default headers for every API request.
 */
export function buildHeaders(extra: HeadersInit = {}): HeadersInit {
  const base: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (AUTH_MODE === 'cookie') {
    base['X-Requested-With'] = 'XMLHttpRequest';
  } else {
    const token = getToken();
    if (token) {
      base['Authorization'] = `Bearer ${token}`;
    }
  }

  return { ...base, ...(extra as Record<string, string>) };
}
