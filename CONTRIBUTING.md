# Contributing

Thanks for helping build the NKUA design system. This guide covers setup, where things live,
and what a change needs before it can be merged.

## Setup

Requires [Bun](https://bun.sh) 1.2+.

```sh
bun install
bun run dev          # build tokens + core, then the docs site at http://localhost:4321
```

`bun run dev` builds `@uoa/tokens` and `@uoa/core` once. After changing tokens or core CSS, run
`bun run build` again and reload the docs. Search in dev uses an index built at startup; run
`bun run search:index` in `apps/docs` to refresh it.

## Tests

| Command | What it checks |
| --- | --- |
| `bun run test:a11y` | axe (WCAG 2.2 A/AA) on every docs page, Greek and English, light and dark, including the example iframes |
| `bun run test:visual` | Screenshots of every component example against `apps/docs/tests/__screenshots__/` |
| `bun run test:wordpress` | Markup contract: every WordPress block's output vs the core reference HTML |

Both build the site first. The visual tests run in the Playwright Docker image
(`mcr.microsoft.com/playwright:v1.63.0-noble`, the same one CI uses), so you need Docker. After an
intended visual change, run `bun run test:visual:update` in `apps/docs`, look at the new PNGs, and
commit them with the change. CI (`.github/workflows/ci.yml`) runs both on every pull request.

## Where things live

| Folder | What it is | Who uses it |
| --- | --- | --- |
| `packages/tokens` | Design tokens as DTCG JSON, built to CSS variables, SCSS and JS | Published; every site and `core` |
| `packages/icons` | Material Symbols subset as SVG files, a sprite and JSON | Published; sites, adapters and the docs site |
| `packages/wordpress` | WordPress adapter: plugin `uoa-ds-blocks` + optional block theme `uoa-ds` (ADR 0003) | Published; the 7 live WordPress sites |
| `packages/core` | The CSS (reset, base, layout, components) and reference HTML | Published; every site |
| `apps/docs` | The documentation site (Astro + Starlight) | Not published as a package; deployed to GitHub Pages |
| `docs/` | Planning: architecture, conventions, roadmap, ADRs, research | Maintainers |

`packages/` is what sites install. `apps/` consumes those packages to show and document them.
The docs site never defines component styles: it loads `@uoa/core` like any other site would.

## Making a change

1. Branch from `develop` (`feat/alert`, `fix/button-focus`, `docs/typography`).
2. Make the change, with docs in **both languages** (see below).
3. `bun run docs:build`, `bun run test:a11y` and `bun run test:visual` must pass. Adapter changes also
   need `bun run test:wordpress`.
4. Open a pull request into `develop`.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):
`feat(alert): …`, `fix(tokens): …`, `docs(button): …`. Use the component or package as the scope.

## Adding a component

Use Button and Alert as models.

1. **Tokens**: `packages/tokens/src/component/<name>.json`. Point to semantic tokens
   (`{color.feedback.info-text}`), never to raw values or primitives where a semantic token exists.
2. **CSS**: `packages/core/src/components/<name>/<name>.css`, imported in `packages/core/src/uoa.css`
   inside `layer(uoa.components)`. Use only `--uoa-*` variables, BEM classes with the `uoa-` prefix
   and logical properties (`padding-inline`, `border-inline-start`).
3. **Reference markup**: `<name>.html` next to the CSS. Platform adapters must output exactly this.
4. **README**: a short `README.md` in the component folder pointing to the docs page.
5. **Docs pages**: Greek in `apps/docs/src/content/docs/components/<name>.mdx`, English in
   `apps/docs/src/content/docs/en/components/<name>.mdx`, following
   [docs/component-docs-template.md](docs/component-docs-template.md). Start with status `draft`; move to `beta` and `stable` per the
   [lifecycle](docs/conventions.md#component-lifecycle).
6. **Roadmap**: tick the item in [docs/TODO.md](docs/TODO.md).

See [docs/conventions.md](docs/conventions.md) for naming, accessibility and browser support rules.

## Docs in Greek and English

The docs site is bilingual: **Greek is the default** (served at `/`), English is under `/en/`.

| What | Greek | English |
| --- | --- | --- |
| Pages | `apps/docs/src/content/docs/…` | `apps/docs/src/content/docs/en/…` |
| UI strings of our components | `apps/docs/src/content/i18n/el.yml` | `apps/docs/src/content/i18n/en.yml` |
| Sidebar group labels, site title | `apps/docs/astro.config.mjs` (`label` / `translations.en`) | same |

- Every page exists in both languages with the **same file path** under its locale folder, so the
  language switch in the header lands on the matching page.
- New UI strings go in **both** YAML files and in the schema in `apps/docs/src/content.config.ts`.
  In components, read them with `Astro.locals.t('uoa.<key>')`. Don't hard-code text.
- Starlight's own strings (search, "On this page", pagination) are already translated.
- Code examples stay the same in both languages and use Greek content, since that's what the
  sites publish.
- Write natural Greek, not a word-for-word translation. Keep established English terms where
  Greek developers use them (tokens, hover, breakpoints) and explain them once if needed.

## Accessibility

WCAG 2.2 AA is a legal requirement for Greek universities (Law 4591/2019). Every component must:

- use semantic HTML, with ARIA only where HTML can't express it;
- work with the keyboard, with a visible focus style;
- meet 4.5:1 contrast for text and 3:1 for UI, and not rely on colour alone;
- work at 320px width and 200% zoom, and respect `prefers-reduced-motion`;
- stay usable in Windows High Contrast (`forced-colors`) mode.

Document keyboard behaviour, roles and screen-reader notes in the component's Accessibility section.
Say plainly what hasn't been tested yet.

## Decisions

Architectural choices (new tooling, a new platform adapter, breaking API changes) need an ADR in
[`docs/adr/`](docs/adr): context, options, decision, consequences. Open it with the pull request
or before it.

## Pull request checklist

- [ ] `bun run test:a11y` and `bun run test:visual` pass (new or changed screenshots reviewed and committed)
- [ ] Tokens, CSS, reference HTML and README for new components
- [ ] Docs pages in Greek **and** English; new UI strings in both YAML files
- [ ] Checked with the keyboard and at 320px; contrast checked for new colours
- [ ] Roadmap (`docs/TODO.md`) and, if needed, an ADR updated
