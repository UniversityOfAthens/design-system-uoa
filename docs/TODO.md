# Roadmap / TODO

## Phase 0 — Decisions & groundwork

- [ ] Collect the official NKUA visual identity guidelines (logo, colours, fonts, usage rules)
  — partial: fonts in hand; colours derived from live sites (research/uoa-sites-audit.md), not official
- [ ] Confirm licensing for the brand fonts (self-hosting on the web, Greek coverage)
  — Open Sans is OFL (fine); Katsoulidis pending, gitignored until confirmed
- [x] Decide docs/workbench tool → ADR 0001: Astro + Starlight (`apps/docs`)
- [ ] Decide core approach (HTML/CSS/vanilla JS, Web Components only where needed) → ADR 0002
  — decided and built (plain CSS core, no Tailwind/Bootstrap); ADR not written yet
- [ ] Choose the first platform adapter → ADR 0003. 44/54 live sites run TYPO3, only 1 Drupal:
  confirm whether NKUA stays on TYPO3 or migrates, then pick the adapter (and version)
- [ ] Set up Figma library and agree on the Figma ↔ tokens workflow
- [ ] Inventory existing NKUA sites: list recurring components/patterns and pain points
  — partial: CMS, colour schemes, fonts done (research/uoa-sites-audit.md); components/pain points not

## Phase 1 — Repo scaffolding

- [x] Bun workspace, `packages/` + `apps/` layout (see architecture.md)
- [ ] Prettier, ESLint, Stylelint, commitlint, EditorConfig
- [ ] Changesets
- [ ] GitHub Actions: lint, build, test, deploy docs site (GitHub Pages)
  — partial: docs site deploys to GitHub Pages (`.github/workflows/docs.yml`); lint/test not yet
- [ ] CONTRIBUTING.md, CODE_OF_CONDUCT.md, PR/issue templates — CONTRIBUTING.md done

## Phase 2 — Foundations

- [x] Tokens package: colour, typography, spacing, layout, radius, shadow, motion, z-index
- [ ] Style Dictionary build → CSS, SCSS, JS, WP theme.json — CSS/SCSS/JS done, theme.json missing
- [x] Base CSS: reset, typography, links, focus styles, layout grid/container, utilities
- [x] Icons package (SVG sprite) + usage rules — `@uoa/icons`, Material Symbols (Apache-2.0); `.uoa-icon` in core
- [ ] Foundation doc pages: colour, typography, spacing, layout, iconography, accessibility
  — partial: colour, typography, spacing & layout, shape & motion, iconography in `apps/docs`; accessibility missing

## Phase 3 — Core components (MVP for the first platform)

Atoms / basic
- [x] Button / link button (`beta` — for stable: screen-reader pass, design review, adapter)
- [ ] Link
- [x] Icon (`draft` — `.uoa-icon` + sizes; Alert, Accordion and Button use the set)
- [x] Badge / Tag (`beta` — for stable: screen-reader pass, design review, adapter)
- [ ] Form elements: text input, textarea, select, checkbox, radio, switch, fieldset, error message
- [x] Alert / status message (`beta` — for stable: screen-reader pass, design review, adapter; dismissible via `alert.js`)

Molecules
- [x] Accordion (`beta` — for stable: screen-reader pass, design review, adapter; single-open via `accordion.js`)
- [x] Tabs (`beta` — for stable: screen-reader pass, design review, adapter; APG automatic activation via `tabs.js`)
- [x] Card (news, event, person/staff, course) (`draft` — CSS-only, stretched title link)
- [x] Breadcrumb (`draft` — CSS-only, wraps instead of truncating; no JS)
- [ ] Pagination
- [ ] Table
- [ ] Modal/dialog
- [ ] Search field
- [ ] Skip link

Organisms / layout
- [ ] Header (logo, language switcher EL/EN, search, utility links)
- [ ] Main navigation (mega menu + mobile)
- [ ] Footer
- [ ] Side navigation (section menus)
- [ ] Hero / page banner

## Phase 4 — Drupal adapter

- [ ] `uoa_ds` base theme skeleton (info, libraries, regions)
- [ ] SDC for each Phase 3 component
- [ ] Template overrides: menus, pager, breadcrumbs, forms, messages, fields, views
- [ ] Starter sub-theme for faculties/departments
- [ ] Paragraphs / Layout Builder integration guidance
- [ ] Demo site (DDEV) with sample content for QA

## Phase 5 — Patterns / Blocks

- [ ] Page templates: home, landing, article/news, event, staff profile, course, contact
- [ ] Listings: news list, event calendar, staff directory, publications
- [ ] Content guidelines (voice & tone, Greek/English writing rules)

## Phase 6 — Later platforms

- [ ] WordPress: block theme, theme.json from tokens, block patterns
- [ ] React: `@uoa/react` wrappers (+ optional shadcn-style registry)
- [ ] Dark mode / high-contrast theme
- [x] Faculty accent theming (`data-uoa-brand` red/green + `data-uoa-accent`, mirrors the TYPO3 schemes)

## Ongoing

- [x] Visual regression + axe in CI for every component (`.github/workflows/ci.yml`)
- [ ] Manual accessibility audit before each `stable` release
- [ ] Release notes and migration guides per major version
- [ ] Adoption tracking: which sites use which version
