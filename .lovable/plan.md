# Fix: Make "current league" explicit across the admin

## The problem

The header shows the tenant (Metro Flag League), but most configuration lives at the **league** level — Events, Phases, Tags, Categories, Divisions, Conferences, Locations, Standings Rules, Stats Tracking, Scorekeeper Categories, Games, Teams, Brackets, Standings, Reports, etc. Right now there's no way to tell (or change) which league those pages apply to. Single-league tenants barely notice; multi-league tenants have no way to work safely.

## Recommended UX: a persistent League Switcher

The cleanest pattern for multi-tenant SaaS with a nested scope (Linear's workspace/team switcher, Vercel's team/project, Shopify's store) is a **single always-visible scope switcher** that every scoped page reads from. One source of truth, zero ambiguity.

### 1. Tenant + League switcher in the header (top-left of the sidebar area)

Replace the current top-right "Metro Flag League" chip with a proper two-level switcher pinned to the **top of the sidebar** (above the nav), so it reads like a breadcrumb of scope:

```text
┌─────────────────────────────┐
│ 🏢 Acme Sports Group     ▾ │  ← tenant (rarely changes)
│  └ 🏈 Metro Flag League  ▾ │  ← active league (changes often)
├─────────────────────────────┤
│  Dashboard                  │
│  Events                     │
│  Phases                     │
│  …                          │
└─────────────────────────────┘
```

- Clicking the league row opens a popover listing all leagues in the tenant with search, plus "Manage leagues →" linking to `/structure/leagues`.
- Switching league re-scopes every league-level page instantly (React Query invalidates, URL stays on the same page).
- The tenant row is only interactive for users who belong to multiple tenants; otherwise it's a static label.

### 2. Page-level league badge on every scoped page

Every league-scoped page gets a small header strip below the page title:

```text
Events
Managing: 🏈 Metro Flag League  ·  Switch league
```

This is redundant with the sidebar switcher on purpose — it prevents mistakes when an admin bulk-edits Divisions or Phases and forgets which league they're in. The "Switch league" link opens the same popover.

### 3. Classify every menu item by scope

Add a tiny scope indicator in the sidebar so users learn what applies where:

- **Tenant-level** (no league needed): Members, Leagues, Users & Permissions, Branding, Domains, General Settings
- **League-level** (uses active league): Events, Phases, Tags, Categories, Divisions, Conferences & Subgroups, Locations & Fields, Standings Rules, Stats Tracking, Scorekeeper Categories
- **Event-level** (uses active league + selected event): Games, Teams & Rosters, Standings, Brackets, Stats, Reports

Visually: group them under section labels already present, and add a subtle "· league" caption under the section header for the league-scoped groups. When the user is on a tenant-level page, the league switcher dims to signal "not in use here."

### 4. Persistence & URL

- Persist active league id in `localStorage` (`activeLeagueId`) and expose via a `LeagueContext` provider wrapping `AppLayout`.
- Also reflect it in the URL as a query param on scoped pages (`?league=<id>`) so shared links land in the correct scope. If the param disagrees with localStorage, the URL wins and updates storage.
- If a user has zero leagues, scoped pages show an empty state pointing to "Create your first league".

### 5. Event-level scope (bonus, same pattern)

Games/Teams/Standings/Brackets pages already imply a current season/event. Add a second lightweight chip on those pages: `Metro Flag League › Spring 2026 ▾` so admins can jump between events without going back to Events.

## What this plan will change

**New:**
- `src/contexts/LeagueContext.tsx` — provider with `activeLeagueId`, `setActiveLeagueId`, `leagues[]`, tenant info. Reads/writes localStorage, syncs with `?league=` param.
- `src/components/layout/LeagueSwitcher.tsx` — the tenant/league popover for the sidebar.
- `src/components/layout/PageScopeBanner.tsx` — the "Managing: <league> · Switch league" strip used on every league-scoped page.

**Modified:**
- `src/components/layout/AppSidebar.tsx` — mount `LeagueSwitcher` at the top; add scope captions to league-scoped groups.
- `src/components/layout/AppHeader.tsx` — remove the redundant "Metro Flag League" chip on the right (now redundant with the sidebar switcher); keep tenant name only if multi-tenant.
- `src/components/layout/AppLayout.tsx` — wrap in `LeagueProvider`.
- All league-scoped pages under `src/pages/structure/*`, `src/pages/season/*`, `src/pages/scorekeeper/*` — mount `<PageScopeBanner />` under the page title. No business-logic changes yet; data hooks continue returning mock data but will read `activeLeagueId` so wiring to real data later is a one-line change.

**Not changing:**
- Tenant-level pages (Members, Leagues, Branding, Domains, Users & Permissions, General settings) — they get no banner and the sidebar switcher visibly dims.
- Data fetching logic and mock data.
- Any business rules, routing structure, or copy other than the scope banner.

## Technical notes (for the dev reader)

- `LeagueContext` value: `{ tenant, leagues, activeLeague, activeLeagueId, setActiveLeagueId, isMultiLeague }`. Consumers use a `useActiveLeague()` hook.
- Route-level scope classification lives in a single `src/lib/routeScope.ts` map (`route → 'tenant' | 'league' | 'event'`) so the sidebar and banners agree.
- Query keys for league-scoped `useQuery` calls should include `activeLeagueId` so switching leagues auto-invalidates.
- No new dependencies.

## Open question before I build

Do you want the switcher **at the top of the sidebar** (recommended — matches Linear/Vercel and keeps the header clean) or **in the top header bar** replacing the current chip? Both work; the sidebar placement reads more naturally as "scope" and gives room for the tenant → league hierarchy on two lines.
