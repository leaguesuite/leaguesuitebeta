# API Contract — League Suite Beta

> **Purpose**: This document lists every HTTP endpoint the React frontend calls.
> A backend developer (C# / ASP.NET Core or otherwise) must implement these
> routes to make the frontend work against their server.

---

## Global Notes

| Item | Value |
|---|---|
| Default base URL | `https://flagplusfootball.com` |
| Config env var | `VITE_API_BASE_URL` |
| Auth (Laravel) | Session cookie + `X-Requested-With: XMLHttpRequest` |
| Auth (ASP.NET) | `Authorization: Bearer <JWT>` |
| Content type | `application/json` |

All request/response bodies are JSON. Paginated responses follow the `PaginatedResponse<T>` shape below.

---

## Shared Types

### PaginatedResponse\<T\>

```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
```

```csharp
public class PaginatedResponse<T>
{
    public List<T> Data { get; set; }
    public PaginationMeta? Meta { get; set; }
}

public class PaginationMeta
{
    public int CurrentPage { get; set; }
    public int LastPage { get; set; }
    public int PerPage { get; set; }
    public int Total { get; set; }
}
```

---

## Endpoints

### 1. GET `/api/v1/public-configuration`

Returns tenant + league context for the current session.

**Response** — `TenantConfig`

```typescript
interface TenantConfig {
  tenant: { id: string; name: string; slug: string };
  league: { id: string; name: string; key: string };
}
```

```csharp
public class TenantConfig
{
    public TenantInfo Tenant { get; set; }
    public LeagueInfo League { get; set; }
}
public class TenantInfo { public string Id; public string Name; public string Slug; }
public class LeagueInfo { public string Id; public string Name; public string Key; }
```

---

### 2. GET `/api/v1/members`

List members with optional filters.

| Query Param | Type | Required |
|---|---|---|
| `search` | string | No |
| `division` | string | No |
| `role` | string | No |
| `status` | string | No |
| `page` | int | No |
| `per_page` | int | No |

**Response** — `PaginatedResponse<MemberRow>`

```typescript
interface MemberRow {
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
```

```csharp
public class MemberRow
{
    public string Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public IdNamePair? Team { get; set; }
    public IdNamePair? Division { get; set; }
    public int? OffRating { get; set; }
    public int? DefRating { get; set; }
    public int? QbRating { get; set; }
    public bool IsQb { get; set; }
    public string? Role { get; set; }
    public string? Status { get; set; }
    public string? AvatarUrl { get; set; }
}

public class IdNamePair { public string Id; public string Name; }
```

---

### 3. GET `/api/v1/search`

Full-text search across members.

| Query Param | Type | Required |
|---|---|---|
| `q` | string | Yes |

**Response** — `PaginatedResponse<MemberRow>`

---

### 4. GET `/api/v1/{id}`

Get a single player/member by ID.

**Response** — `{ data: PlayerInfo }` (unwrapped to `PlayerInfo` by the client)

```typescript
interface PlayerInfo {
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
```

```csharp
public class PlayerInfo
{
    public string Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Role { get; set; }
    public string? Status { get; set; }
    public int? OffRating { get; set; }
    public int? DefRating { get; set; }
    public int? QbRating { get; set; }
    public bool IsQb { get; set; }
}
```

---

### 5. GET `/api/v1/player-stats-season`

Season-by-season stats for a player.

| Query Param | Type | Required |
|---|---|---|
| `memberId` | string | Yes |
| `statsCode[]` | string (repeated) | Yes — e.g. `GP`, `TD`, `YDS`, `INT`, `COM` |

**Response** — `{ data: SeasonStatRow[] }`

```typescript
interface SeasonStatRow {
  season_name: string;
  team_name: string;
  division_name: string;
  GP?: number;
  TD?: number;
  YDS?: number;
  INT?: number;
  COM?: number;
}
```

```csharp
public class SeasonStatRow
{
    public string SeasonName { get; set; }
    public string TeamName { get; set; }
    public string DivisionName { get; set; }
    public int? GP { get; set; }
    public int? TD { get; set; }
    public int? YDS { get; set; }
    public int? INT { get; set; }
    public int? COM { get; set; }
}
```

---

### 6. GET `/api/v1/career-totals`

Aggregated career stats.

| Query Param | Type | Required |
|---|---|---|
| `stat_type` | string | Yes — e.g. `passing` |

**Response** — `{ data: CareerTotals }`

```typescript
interface CareerTotals {
  GP?: number;
  TD?: number;
  YDS?: number;
  INT?: number;
  COM?: number;
}
```

```csharp
public class CareerTotals
{
    public int? GP { get; set; }
    public int? TD { get; set; }
    public int? YDS { get; set; }
    public int? INT { get; set; }
    public int? COM { get; set; }
}
```

---

### 7. GET `/api/v1/divisions`

List all divisions.

**Response** — `{ data: DivisionOption[] }` or `DivisionOption[]`

```typescript
interface DivisionOption {
  id: string;
  name: string;
}
```

```csharp
public class DivisionOption
{
    public string Id { get; set; }
    public string Name { get; set; }
}
```

---

## ASP.NET Core Quick Start

```csharp
// Program.cs — minimal setup
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:8080").AllowAnyHeader().AllowAnyMethod().AllowCredentials()));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(/* ... */);

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Controllers/MembersController.cs
[ApiController]
[Route("api/v1")]
public class MembersController : ControllerBase
{
    [HttpGet("members")]
    public async Task<PaginatedResponse<MemberRow>> List(
        [FromQuery] string? search, [FromQuery] string? role,
        [FromQuery] string? status, [FromQuery] int page = 1) { ... }

    [HttpGet("{id}")]
    public async Task<ActionResult<PlayerInfo>> Get(string id) { ... }
}
```

Set `VITE_API_BASE_URL` to your server and `VITE_AUTH_MODE=bearer` in `.env`.
