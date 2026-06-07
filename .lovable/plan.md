# Playoff & Bracket Manager — Wizard + Advancement Overhaul

Replace the current `src/pages/season/BracketsPage.tsx` flow with an interactive, mock-data-backed Playoff Wizard and supporting bracket controls. All work stays in frontend/presentation (no API changes).

## Scope (chosen by user)

**Core advancement set**
1. Bracket ↔ Schedule visual link (per match: game ID, date, time, field, status)
2. Pending advancement state (greyed feeder slots + per-round "Awaiting results" banner for reseeding)
3. Rollback / unadvance action (cascade preview before applying)
4. Advancement confirmation modal — review proposed advancers, then Apply (mobile-friendly)
5. Scorekeeper sync banner across the bracket view

**Setup & safety set**
6. Seed source selector per division/split (standings-as-of timestamp vs manual)
7. Bracket templates (save/load named configurations)
8. Public visibility toggle per round
9. Conflict warnings step in wizard (field / referee / team double-book detection)

## New entry point

`/season/brackets` is rebuilt around the wizard. Existing manual bracket UI is preserved internally and surfaced as the wizard's final "Review & Edit" step.

## File changes

**Replaced**
- `src/pages/season/BracketsPage.tsx` — becomes a shell that hosts `PlayoffWizard` (default view) and the existing manual editor (post-publish view).

**New under `src/components/playoffs/`**
- `PlayoffWizard.tsx` — multi-step wrapper, mock state in component
- `steps/FormatStep.tsx` — team count, bracket type (fixed / reseeding / pool-crossover), round count + names, bronze game toggle
- `steps/SeedSourceStep.tsx` — per-division: "Use standings as of [datetime]" or "Manual entry"; ties detected → tiebreaker note (no modal in this scope)
- `steps/PreviewStep.tsx` — renders full bracket with placeholder seed labels, public-visibility toggle per round
- `steps/ConflictsStep.tsx` — runs mock detector over scheduled games and lists field/team/ref overlaps with severity chips
- `steps/TemplatesPanel.tsx` — save current config as template, load existing (localStorage-backed mock)
- `AdvancementConfirmDialog.tsx` — modal showing proposed advancers from completed games + Apply / Cancel; responsive layout
- `RollbackDialog.tsx` — pick a match, shows downstream cascade list, Confirm rollback
- `BracketGameLinkBadge.tsx` — small chip on each match: `Game #G-128 · Sat 7:00 PM · Field 2 · Final`
- `PendingFeederSlot.tsx` — greyed "Winner of Game #G-118" slot styling + tooltip
- `ReseedingBanner.tsx` — round-level "Awaiting all QF results to reseed" banner
- `ScorekeeperSyncBanner.tsx` — sticky top banner: "Scorekeeper app last synced 2m ago · Re-sync"

**New mock data**
- `src/data/mockPlayoffs.ts` — divisions, scheduled playoff games (with mock conflicts), template presets

## Wizard flow

```text
1. Format        → teams, type, rounds, bronze
2. Seed Source   → per division/split
3. Preview       → bracket with placeholders + per-round public toggle
4. Conflicts     → list with severity chips, "Acknowledge & continue"
5. Templates     → optional save
6. Publish       → returns to bracket view with new bracket loaded
```

Templates panel is also accessible as a side button on step 1 (Load template).

## Bracket view additions (post-publish)

- `ScorekeeperSyncBanner` at top
- Each `MatchCard` gains `BracketGameLinkBadge` and `PendingFeederSlot` rendering
- Round headers gain `ReseedingBanner` when bracket is reseeding and prior round incomplete
- Toolbar buttons: **Advance from results** (opens `AdvancementConfirmDialog`), **Rollback** (opens `RollbackDialog`), **Public visibility** (per-round toggles in popover)

## Technical details

- Pure frontend. State held in `useState`/`useReducer` inside `PlayoffWizard` and `BracketsPage`. Templates use `localStorage` key `playoff_templates_v1`.
- Conflict detector: pure function over mock schedule comparing `(field, datetime±90min)`, `(team, date)`, `(referee, datetime±90min)`.
- Reuses `Dialog`, `Card`, `Button`, `Switch`, `Select`, `Tabs`, `Badge`, `Tooltip` from `@/components/ui/*`. Reuses existing `MatchCard` and `bracketGenerator` utils.
- Styling follows the `section-card` admin pattern from memory; semantic tokens only.
- No routing changes; `/season/brackets` continues to mount `BracketsPage`.

## Out of scope (deferred items the user didn't pick)

Change log, notification triggers, tiebreaker modal, forfeit/DQ outcome — not built now; can be added later.
