---
name: add-adapter
description: Port an existing NKUA core component to a platform adapter (Drupal SDC, WordPress blocks/patterns, React, TYPO3 Fluid, or another platform). Use when asked to make a component available in a CMS or framework, or to scaffold a new adapter package.
---

# Port a component to a platform adapter

An adapter is a thin layer that renders the core's reference markup in a platform's templating
language and loads `@uoa/core` CSS/JS. It owns **no styles** and **no design decisions**.

## The contract (all platforms)

1. **Markup is identical** to `packages/core/src/components/<name>/<name>.html`: same elements,
   classes, attributes and nesting. Diff your rendered output against it. If the platform
   can't produce it, change the core markup first (and every existing adapter), don't fork it.
2. **No CSS in the adapter.** Load `@uoa/core`'s `dist/uoa.css` (or the per-platform library
   mechanism). Platform-specific wrappers the CMS forces on you get neutralised in core or
   left unstyled — never restyled in the adapter.
3. **No JS logic.** Load the core module and call its `init(root)` when the platform injects
   content (Drupal behaviors, block editor previews, React `useEffect` on mount, TYPO3 AJAX).
   React may replace a core script with a headless library (React Aria/Radix) only if the
   resulting DOM matches the reference markup.
4. **Every string is a prop/slot and translated by the platform** (`t()` / `|t`, `__()`,
   `f:translate`, React props). Greek defaults, English translations.
5. **Props map 1:1 to the documented variants** (classes/modifiers in the component's API
   section). Don't invent variants the core doesn't have.
6. **Document it** in the component's docs pages (both languages), "API → <Platform>" section:
   props/slots table + one usage example.

## Before the first component of a new platform

The platform needs an ADR in `docs/adr/`, and the first adapter is decided: WordPress, in ADR 0003
(theme `uoa` + standalone plugin `uoa-blocks`, WP 6.6+). 44 of 54 NKUA sites still run TYPO3, so any further platform needs
its own ADR before you scaffold `packages/<platform>/`.
The ADR should fix: supported platform versions, package location (`packages/<platform>/`),
how core assets are pulled in, and how it is tested.

When the ADR lands, add `references/<platform>.md` next to this file with the concrete file
layout, naming and a worked example, and list it below.

- **WordPress** — decided in [ADR 0003](../../../../docs/adr/0003-wordpress-first-adapter.md);
  see [`references/wordpress.md`](references/wordpress.md). WP 6.6+, block theme `uoa` plus standalone
  plugin `uoa-blocks`, `theme.json` generated from tokens, PHPUnit contract test in
  `packages/wordpress/tests/phpunit/`, Playwright + axe on wp-env in `packages/wordpress/tests/e2e-pw/`.

## Platform notes

Starting points from `docs/architecture.md`; confirm against the platform's ADR.

- **Drupal** — Drupal 10.3+/11, Single Directory Components in the `uoa_ds` base theme:
  `packages/drupal/components/<name>/<name>.component.yml` (JSON-schema props + slots) and
  `<name>.twig`. Referenced as `uoa_ds:<name>`. Most work is template overrides mapping Drupal
  render output (menus, pagers, forms, status messages) to core markup. Lint with twigcs.
- **WordPress** — decided in [ADR 0003](../../../../docs/adr/0003-wordpress-first-adapter.md);
  see [`references/wordpress.md`](references/wordpress.md). One custom block per component in the
  plugin `uoa-blocks` (works on any theme); the theme `uoa` adds base styles and templates. Block
  patterns for page-level compositions.
- **React** — `@uoa/react`, thin typed components rendering core classes; tokens via the TS
  export. No CSS-in-JS.
- **TYPO3** — likely Fluid templates / content elements in a site package. Not specified yet;
  wait for the ADR.

## Verify

- Rendered HTML matches the reference markup (whitespace aside).
- Works with JS disabled; re-inits on dynamically inserted content.
- Strings come out translated in both el and en.
- Platform tests (per ADR) pass, and the core `bun run test:a11y` still passes.

Commit as `feat(<platform>): add <name> component`.
