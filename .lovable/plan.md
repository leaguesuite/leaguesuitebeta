# Navigation & Menus — Header, Top Bar, Footer Builder

Rebuild `src/pages/settings/NavigationMenusPage.tsx` so admins can fully customize the public site's two header bars and the footer, matching the structure shown in the reference screenshot (white secondary bar on top, black main bar below).

## Three editable zones

Tabs at the top of the page:

1. **Top Bar (Secondary)** — white bar
2. **Main Menu (Header)** — black bar
3. **Footer**

Each zone shows a live preview at the top and an item list below.

## Locked vs. movable items

Items have a `locked` flag indicating which bar they belong to permanently. Locked items can be hidden, reordered, and renamed, but cannot be deleted or moved to another bar.

- **Locked to Main Menu:** Home, Calendar, Accolades, Roster Verification
- **Locked to Top Bar:** Social media icons, Language selector, Switch Leagues dropdown (shown only for multi-league tenants), Season selector, Divisions selector, Search

Custom items (CMS pages, external links, dropdowns) are **movable** — each row gets a "Move to…" action in its row menu listing the other zones it can be sent to (Top Bar ↔ Main Menu ↔ Footer-only).

## Dropdowns / submenus

Any non-locked item (and Main Menu locked items) can hold child items, rendered as a hover/click dropdown on the public site. Editor supports:

- Expand/collapse parent rows (already partially implemented)
- "Add sub-item" action on every parent row in Top Bar and Main Menu (today only Main Menu allows this)
- Two-level depth max

## Footer editor

New Footer tab replaces the existing simple list with a **column-based site map**:

- Up to 4 footer columns, each with a heading and a list of links
- "Add column", "Rename column", "Delete column", reorder columns left/right
- Inside each column: add link, reorder, hide, delete, edit URL/label/new-tab
- Footer-exclusive links: any link added in the footer has a "Show only in footer" toggle (default on); turning it off lets the admin also surface it in Top Bar or Main Menu
- Footer-level toggles: show social icons, show copyright line (editable text), show "Powered by" line

## Per-item edit dialog

Extends the existing dialog with:

- Label, URL (page picker + custom URL), Open in new tab, Visible
- **Bar assignment** dropdown (Top Bar / Main Menu / Footer) — disabled for locked items
- **Style** (link / button / dropdown parent)
- **Show only in footer** checkbox (footer items)

## Live previews

- Top Bar preview: white background, left = logo + league switcher + season/divisions selectors, right = custom pages + language + social icons (mirrors screenshot)
- Main Menu preview: black background bar showing locked + custom items in order, with dropdown indicators
- Footer preview: column grid with headings + links, social row, copyright line

## Technical notes

- Extend `MenuItem` with `locked: boolean`, `bar: 'topbar' | 'main' | 'footer'`, `footerOnly?: boolean`, `style?: 'link' | 'button' | 'dropdown'`.
- Replace `INITIAL_MENUS` / `INITIAL_TOPBAR` with a single `NavConfig` object holding `topBar`, `mainMenu`, `footer` (with `columns: FooterColumn[]`, `showSocial`, `copyrightText`, etc.).
- Add helpers `moveItemToBar(itemId, targetBar)` and guard against moving locked items.
- Reuse existing `renderItem`, social link, and language picker logic; generalize so it works for any bar.
- `PublicLayout.tsx` is **not** modified in this step — this task only builds the admin editor. Wiring the public site to this config is a follow-up.
- All styling via existing semantic tokens (`bg-foreground`, `bg-card`, `text-muted-foreground`, etc.); no hard-coded colors.

## Out of scope

- Persisting to backend (state stays local with mock initial data, matching current page)
- Rendering the new config on the actual public site (`PublicLayout.tsx`)
- Per-role visibility rules
