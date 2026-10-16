# Premium UI Refresh

A visual-only update: no features, data or flows change.

## 1. Global look (applies everywhere)
- New font pairing: a sharper display font for headings (Space Grotesk), DM Sans for body text, and a monospace font for scores, stats and game IDs.
- A refined palette: deeper sidebar, softer neutral backgrounds, a slightly brighter blue accent, and clearer success/warning/live colors.
- Thinner borders, softer layered shadows and slightly larger corner rounding on cards.
- Consistent page headers: the league name sits as a small label above the page title instead of inline.

## 2. Sidebar and top bar
- Sidebar: tighter spacing, a subtle highlight bar on the active item, quieter section labels, and a cleaner league picker card.
- Top bar: a frosted, slightly translucent bar, a search box with a "Ctrl K" hint, and a tenant pill.

## 3. Games / Schedule page as the flagship
- A polished filter toolbar (search, division, location, field, sort grouped in one bar).
- Status chips (Scheduled, Live with a pulsing dot, Final) and score numbers in the monospace font.
- Cleaner row hover, aligned columns and roomier spacing.

## 4. Shared pieces
- Tables: sticky uppercase headers, zebra-free rows with soft hover.
- Buttons and badges: refined variants (subtle, outline, soft-color).
- Section cards gain a header strip style used across pages.

## Technical details
- Update tokens in `src/index.css` and `tailwind.config.ts` (fonts, colors, shadows, `font-display`/`font-mono`).
- Restyle `LeaguePageTitle`, `AppSidebar`, `AppHeader`, `section-card`/`table-header` utilities, badge/button variants.
- Restyle `GamesPage.tsx` toolbar, status badges and rows only (no logic changes).
- Remove unused `App.css` template styles. Public `/site` pages are left unchanged.
