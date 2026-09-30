# UOA Design System — Docs

Planning docs for the NKUA (UOA) design system. Nothing is built yet; these files describe
what to build and how to organise it.

| Doc | What it covers |
| --- | --- |
| [references.md](references.md) | What we took from GitLab Pajamas, Material Web and shadcn/ui |
| [architecture.md](architecture.md) | Layered architecture and the proposed repo structure |
| [design-tokens.md](design-tokens.md) | Token naming, tiers, format and build outputs |
| [component-docs-template.md](component-docs-template.md) | The page template every component must follow |
| [conventions.md](conventions.md) | Naming, accessibility, i18n, browser support, versioning |
| [TODO.md](TODO.md) | Phased roadmap / checklist |
| [research/uoa-sites-audit.md](research/uoa-sites-audit.md) | Colours, schemes and CMS of the 54 live NKUA sites |
| [adr/](adr/) | Architecture decision records (0001: docs site in Astro + Starlight) |

## The short version

1. **Tokens are the source of truth.** Colours, type, spacing, radii, motion live in JSON
   and are compiled to CSS custom properties (plus `theme.json` for WordPress, TS for React).
2. **The core is plain HTML + CSS + a little vanilla JS.** It must work server-rendered
   (Drupal/Twig, WordPress/PHP) with JS as progressive enhancement.
3. **Platforms are thin adapters.** Drupal first (Single Directory Components), WordPress
   and React later — each one wraps the same markup and CSS, never re-implements styles.
4. **Every component ships with docs** in a fixed shape: examples, structure, guidelines,
   accessibility, API, related.
