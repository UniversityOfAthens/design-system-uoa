# ADR 0001 — Docs site: Astro + Starlight

- Status: accepted
- Date: 2026-09-30

## Context

The design system needs a public site that documents foundations and components the way GitLab
Pajamas and shadcn/ui do: guidelines, live examples, copyable code, "when not to use". Its
readers are department web teams, designers and content editors as much as developers.

The components are plain HTML + CSS (`@uoa/core`), rendered server-side by TYPO3, Drupal or
WordPress. Reference systems chose a docs framework that matches their components: Pajamas uses
Nuxt (Vue components), shadcn/ui uses Next.js (React components), Material Web uses Eleventy
(framework-free web components).

Options considered:

| Option | Notes |
| --- | --- |
| Storybook | Component workbench for developers; weak for long-form guidelines; heavy |
| Nuxt / Next.js | Would require Vue/React wrappers or raw-HTML injection for every example, and ship a framework runtime |
| Eleventy | Framework-free and simple; fewer docs features built in |
| **Astro + Starlight** | Static HTML output, Markdown/MDX pages, sidebar, search and i18n built in; can host React/Vue islands later |

## Decision

Build the docs site with **Astro + Starlight** in `apps/docs`.

- Live examples render real `@uoa/core` markup in **iframes** (`Example.astro`), so docs CSS and
  design-system CSS never interact and examples behave like a real page. The brand/accent picker
  in the header is mirrored into every iframe.
- Foundation pages are **generated from the tokens** (`@uoa/tokens/docs.json`), so values and
  contrast figures can't drift from the source.
- Component documentation lives in `apps/docs/src/content/docs/components/<name>.mdx`, following
  `docs/component-docs-template.md`. The component folder keeps a short README pointing there.

## Consequences

- One place to maintain docs; `apps/playground` is removed.
- Greek/English docs are possible later with Starlight's i18n.
- No isolated component workbench. If developers need one, add Storybook (HTML) alongside —
  it doesn't replace this site.
- Accessibility and visual-regression tests can run against the built docs pages.
- The Katsoulidis font is copied into the site's build output when present locally. CI checkouts
  don't have it (gitignored), so a deployed site uses the Georgia fallback until the licence is confirmed.
