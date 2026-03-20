

## Plan: Prepare API Layer for C# Backend Handoff

### What this does
Refactors the API integration layer so a C# developer can swap in an ASP.NET Core backend with minimal frontend changes.

### Changes

**1. Extract API config to a single environment-driven config file**

Create `src/lib/api-config.ts`:
- Move `API_BASE` here, read from `import.meta.env.VITE_API_BASE_URL` with fallback to `https://flagplusfootball.com`
- Export auth mode flag (`cookie` vs `bearer`) so the C# dev can switch to JWT tokens if preferred
- Export default headers as a function that can adapt based on auth mode

**2. Create a centralized HTTP client wrapper**

Create `src/lib/http-client.ts`:
- Single `apiClient.get()`, `apiClient.post()`, `apiClient.put()`, `apiClient.delete()` wrapper around fetch
- Handles headers, credentials, error parsing, and response typing in one place
- Adds a response interceptor pattern for 401 redirects (useful for both Laravel and ASP.NET)
- A C# dev only needs to update this one file if auth strategy changes

**3. Organize API functions into domain modules**

Split `src/lib/api.ts` into:
- `src/lib/api/members.ts` — member CRUD + search
- `src/lib/api/config.ts` — tenant/league configuration
- `src/lib/api/divisions.ts` — division lookups
- `src/lib/api/index.ts` — re-exports everything (no breaking changes to existing imports)

Each file imports from `http-client.ts`, keeping the actual endpoint paths visible and easy to map.

**4. Add an API contract reference document**

Create `docs/api-contract.md`:
- Documents every endpoint the frontend calls: method, path, query params, request body shape, response shape
- TypeScript interfaces listed alongside equivalent C# class signatures
- A C# developer reads this and knows exactly what controllers/actions to build

**5. Add `VITE_API_BASE_URL` to `.env.example`**

Create `.env.example` (not `.env` itself) documenting the available config vars so a new developer knows what to set.

### What stays the same
- All existing page components untouched
- Mock data files untouched
- No new dependencies

### Why this helps
A C# developer receiving this codebase would:
1. Read `docs/api-contract.md` to understand every endpoint needed
2. Build ASP.NET Core controllers matching those routes
3. Set `VITE_API_BASE_URL` to their server
4. Optionally flip auth mode from `cookie` to `bearer` in one config file
5. Everything works

