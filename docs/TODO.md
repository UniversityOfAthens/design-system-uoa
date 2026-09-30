# Roadmap / TODO

## Phase 0 — Decisions & groundwork

- [ ] Collect the official NKUA visual identity guidelines (logo, colours, fonts, usage rules)
- [ ] Confirm licensing for the brand fonts (self-hosting on the web, Greek coverage)
- [ ] Decide docs/workbench tool (Storybook vs Astro Starlight vs both) → ADR 0001
- [ ] Decide core approach (HTML/CSS/vanilla JS, Web Components only where needed) → ADR 0002
- [ ] Confirm target Drupal version (10.3+/11) and whether sites share one base theme → ADR 0003
- [ ] Set up Figma library and agree on the Figma ↔ tokens workflow
- [ ] Inventory existing NKUA sites: list recurring components/patterns and pain points

## Phase 1 — Repo scaffolding

- [ ] Bun workspace, `packages/` + `apps/` layout (see architecture.md)
- [ ] Prettier, ESLint, Stylelint, commitlint, EditorConfig
- [ ] Changesets
- [ ] GitHub Actions: lint, build, test, deploy Storybook (GitHub Pages)
- [ ] CONTRIBUTING.md, CODE_OF_CONDUCT.md, PR/issue templates

## Phase 2 — Foundations

- [ ] Tokens package: colour, typography, spacing, layout, radius, shadow, motion, z-index
- [ ] Style Dictionary build → CSS, SCSS, JS, WP theme.json
- [ ] Base CSS: reset, typography, links, focus styles, layout grid/container, utilities
- [ ] Icons package (SVG sprite) + usage rules
- [ ] Foundation doc pages: colour, typography, spacing, layout, iconography, accessibility

## Phase 3 — Core components (MVP for a Drupal site)

Atoms / basic
- [ ] Button / link button
- [ ] Link, Icon
- [ ] Badge / Tag
- [ ] Form elements: text input, textarea, select, checkbox, radio, switch, fieldset, error message
- [ ] Alert / status message

Molecules
- [ ] Accordion
- [ ] Tabs
- [ ] Card (news, event, person/staff, course)
- [ ] Breadcrumb
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
- [ ] Faculty accent theming

## Ongoing

- [ ] Visual regression + axe in CI for every component
- [ ] Manual accessibility audit before each `stable` release
- [ ] Release notes and migration guides per major version
- [ ] Adoption tracking: which sites use which version
