# ADR 0003 — WordPress is the first platform adapter

- Status: accepted (revisitable)
- Date: 2026-10-08
- Supersedes nothing. ADR 0002 (core approach) is decided and built but still unwritten.

## Context

The design system needs its first platform adapter before any component can leave `beta` (see the
per-component notes in `docs/TODO.md`). The platform was undecided, and the repo contradicted itself
about it:

- `docs/research/uoa-sites-audit.md` counts **TYPO3 44** (incl. `www.uoa.gr`), **WordPress 7**
  (`baag`, `deaneconpol`, `agro`, `ecd`, `econ`, `pms`, `soc`), **Drupal 1** (`di`).
- `docs/architecture.md` and Phase 4 of the roadmap assumed Drupal first, despite the counts.

So the first adapter is a real choice, not an obvious one. What matters is that the choice is cheap to
reverse: an adapter is a thin rendering layer, so picking one does not commit the core's markup, its
tokens or the other adapters' roadmap.

The purpose of a first adapter is to prove the contract in `packages/core` — that a platform can
output the reference markup verbatim, load `@uoa/core`, and translate every string — before the
system is pointed at 44 production sites. WordPress is the cheapest place to do that:

| Option | Notes |
| --- | --- |
| TYPO3 first | Largest estate, but needs a TYPO3 instance, TypoScript and a site package before a single component renders; slow to prove the contract |
| Drupal first | The Phase 4 assumption, but only one live site; contradicts the audit |
| **WordPress first** | Block themes render server-side from PHP with no build step; `wp-env` gives a local instance for free; the 7 live sites can adopt it immediately |
| React first | Not a CMS; editors get nothing, so it doesn't exercise the contract |

## Decision

Build the first WordPress adapter in `packages/wordpress`, targeting **WordPress 6.6+** (block
themes, `theme.json` v3, the current block registration APIs).

**Packaging** — a block theme plus a companion plugin:

- `packages/wordpress/uoa-ds/` — the **block theme**: `theme.json`, `templates/`, `parts/`,
  `patterns/`. Faculty sites activate it, or a child theme extends it.
- `packages/wordpress/uoa-ds-blocks/` — the **plugin**: block registration (`block.json` + PHP render
  callbacks) and the enqueue of `@uoa/core`. Blocks live in the plugin so they survive a theme switch
  and can be used site-wide.

**`theme.json` is generated, never hand-written.** `packages/tokens/build/build.js` emits
`dist/wp/theme.json` from the same DTCG tokens as the CSS custom properties (palette, font sizes,
spacing scale, radius). This closes the outstanding `theme.json` item in Phase 2. The theme copies it
at build time; hand edits are a bug.

**The adapter owns no styles and no behaviour.**

- CSS: enqueue `@uoa/core`'s `dist/uoa.css` and `fonts.css`. `theme.json` sets the editor palette and
  spacing so the block editor looks like the front end, but it never restyles a component.
- JS: enqueue `@uoa/core`'s module and call its `init(root)` on `wp.domReady()` (front end and editor
  canvas, since the editor loads assets in a document of its own).
- Markup: every block's render output must match
  `packages/core/src/components/<name>/<name>.html` — same elements, classes, attributes, nesting.
  Where WordPress can't produce it, the core markup changes first, for every platform.

**Blocks vs patterns.** Prefer core blocks with block style variations (e.g. `core/paragraph` styled
as a badge where that suffices); add a custom block only when a core block can't produce the markup.
Block patterns (PHP files under `patterns/`) cover page-level compositions.

**Strings.** Greek is the source language: literals in the render callback passed through `__()` with
a `textdomain` of `uoa-ds`, and a `languages/uoa-ds.pot`. English comes from the site's translation
catalogues. Every visible and accessible string is a translatable call, including `aria-label`s.

**Testing.** Each ported block has a contract test (`packages/wordpress/tests/`) that renders it with
stubbed WordPress escaping/translation functions and diffs the result against the core reference
markup, whitespace aside. `phpcs` with the WordPress standard lints the PHP. The core
`bun run test:a11y` and `bun run test:visual` suites must keep passing — they cover the markup the
adapters output.

## Consequences

- Phase 4 is reordered: the Drupal adapter stays on the roadmap behind a Drupal SDC ADR, and the
  WordPress work moves out of Phase 6.
- The 7 live WordPress sites get a maintainable path to the design system's components.
- `theme.json` joins the generated token outputs, so a token change shows up in the block editor.
- WordPress is **not** declared the strategic platform. 44 TYPO3 sites still need an adapter, and
  which one lands next is a separate decision — a later ADR may reorder this without invalidating
  anything here.
- The plugin/theme split means two artefacts to version and release; Changesets is not set up yet, so
  versioning is manual until Phase 1 finishes.

## Alternatives considered

- **TYPO3 first** — rejected only because it is the slowest way to exercise the markup contract. Not
  rejected on merit; it remains the biggest estate.
- **Drupal first** — rejected because the roadmap's assumption wasn't supported by the audit.
- **One theme, no plugin** — rejected: blocks would disappear when a site switches themes.
- **Plugin only, no theme** — rejected: faculties then get no templates and no `theme.json` defaults.