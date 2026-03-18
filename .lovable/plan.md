

# Database Architecture Plan for LeagueSuite

## Overview

Design a multitenant Supabase database schema that mirrors the existing UI hierarchy and supports historical stat tracking, with proper tenant isolation via Row-Level Security.

## Entity Hierarchy

```text
Organization (tenant)
  └── League
        └── Season
              └── Division
                    └── Team
                          └── Roster Entry (team_player)
                                └── Player Game Stats
              └── Game (references division, teams, venue)
              └── Bracket / Playoff
```

## Table Design

### Tenant & Auth Layer
- **organizations** -- top-level tenant (id, name, slug, logo_url, settings jsonb, created_at)
- **organization_members** -- maps auth.users to orgs with roles (org_id, user_id, role via app_role enum)
- **user_roles** -- global roles table per the security pattern (user_id, role)

### League Structure (Configuration)
- **leagues** -- (id, org_id, name, sport_type, status, settings jsonb)
- **categories** -- reusable rule templates (id, league_id, name, description, rules jsonb) -- maps to Men's/Women's/Co-Ed/Youth
- **seasons** -- (id, league_id, name, start_date, end_date, status, registration_open)
- **divisions** -- (id, season_id, category_id, name, team_cap, qb_cap, status)
- **conferences** -- optional grouping within a division (id, division_id, name)

### Teams & Rosters
- **teams** -- (id, division_id, name, primary_color, secondary_color, logo_url, team_photo_url)
- **members** -- league-wide people table (id, org_id, user_id nullable FK to auth.users, first_name, last_name, email, phone, dob, gender, avatar_url, status, created_at)
- **team_players** -- roster join table (id, team_id, member_id, role enum[player/captain/coach], jersey_number, joined_at) -- one member can appear on multiple teams across seasons
- **emergency_contacts** -- (id, member_id, name, phone, relationship)

### Venues
- **locations** -- (id, org_id, name, google_maps_url, address)
- **fields** -- (id, location_id, name)

### Games & Schedule
- **games** -- (id, division_id, home_team_id, away_team_id, field_id, scheduled_date, scheduled_time, status, home_score, away_score, notes)

### Playoffs / Brackets
- **brackets** -- (id, division_id, name, team_count, status, is_reseeding, config jsonb)
- **bracket_matches** -- (id, bracket_id, round_number, match_number, team1_id, team2_id, team1_score, team2_score, winner_id, scheduled_date, venue, status)

### Stats Engine
- **stat_definitions** -- (id, org_id, stat_key, label, abbreviation, category, description, is_default) -- mirrors current statDefinitions.ts
- **stat_tracking_config** -- (id, category_id, stat_definition_id, enabled) -- per-category toggle
- **player_game_stats** -- (id, game_id, member_id, team_id, stat_key, value numeric) -- one row per stat per player per game; enables historical rollups
- **member_ratings** -- (id, member_id, season_id, offensive, defensive, qb, updated_at) -- snapshot ratings per season

### Standings
- **standings_profiles** -- (id, league_id, name, is_default, points_config jsonb, sort_criteria jsonb, tiebreak_rules jsonb)
- **standing_overrides** -- (id, division_id, team_id, field, old_value, new_value, reason, created_by, created_at)

### CRM / Member Extras
- **member_tags** -- (id, org_id, name, color)
- **member_tag_assignments** -- (member_id, tag_id)
- **member_notes** -- (id, member_id, text, author_id, category, created_at)
- **waivers** -- (id, member_id, waiver_type, status, signed_date, expiry_date, document_url)
- **disciplinary_records** -- (id, member_id, type, reason, start_date, end_date, notes, is_active)
- **communications** -- (id, member_id, channel, subject, message, sent_at, status)

### Registration
- **registration_forms** -- (id, season_id, name, type, status, capacity, opens_at, closes_at)
- **registration_submissions** -- (id, form_id, member_id, team_name, data jsonb, status, submitted_at)

### Accolades
- **awards** -- (id, org_id, name, description, icon)
- **award_recipients** -- (id, award_id, member_id, season_id, notes, awarded_at)

### CMS
- **pages** -- (id, org_id, title, slug, content, status, published_at)
- **articles** -- (id, org_id, title, slug, content, author_id, category, featured_image, status, published_at)

### Settings
- **domains** -- (id, org_id, domain, status, ssl_status, dns_provider, verified_at)

## Row-Level Security Strategy

All tables get RLS enabled. The core pattern:
1. `has_role(user_id, role)` security definer function for global roles
2. `is_org_member(user_id, org_id)` security definer function for tenant isolation
3. Every data table includes org_id (directly or via parent chain) for tenant scoping
4. Policies use these functions to avoid recursive RLS

## Key Indexes
- `member_id + season_id` on team_players for historical lookups
- `game_id + member_id` on player_game_stats for stat aggregation
- `org_id` on all tenant-scoped tables
- `division_id` on games, teams, brackets

## Migration Plan

This would be implemented as a series of Supabase migrations:
1. Enums and org/auth tables
2. League structure tables (leagues, categories, seasons, divisions)
3. Teams, members, rosters
4. Games, brackets, venues
5. Stats engine tables
6. CRM tables (tags, notes, waivers, disciplinary)
7. Registration, accolades, CMS, settings
8. RLS policies on all tables

After migrations, the existing mock data files would be replaced with Supabase queries using the client, and React Query hooks would be created for each domain.

