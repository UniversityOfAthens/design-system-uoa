# ADR 0003 — WordPress is the first platform adapter

- Status: accepted (revisitable)
- Date: 2026-10-08
- Amended: 2026-10-09 — theme `uoa` + standalone companion plugin `uoa-blocks` with a block per core
  component; the CSS split between them; PHPUnit + Playwright tests on wp-env.
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

**Packaging** — a block theme and its companion plugin, the same split as any well-behaved WordPress
theme/plugin pair (blocks in the plugin, presentation in the theme):

- `packages/wordpress/uoa-blocks/` — the **plugin**, standalone: one block per core component
  (`block.json` + a PHP render callback + one shared, unbuilt editor script), the component half of
  `@uoa/core`'s CSS, its behaviour modules and the icon set. This is what a faculty site installs: it
  works on top of whatever theme the site already uses, and it changes nothing on the page except
  its own blocks. Themes may not register blocks, and content must survive a theme switch, so blocks
  live here only.
- `packages/wordpress/uoa/` — the **theme**: the page-level half of the CSS, the fonts, the generated
  `theme.json`, templates and parts. It recommends the plugin with a dismissible admin notice but
  works without it.

A plugin can't ship a `theme.json` file, so when the UOA theme isn't active the plugin supplies the
same generated data through the `wp_theme_json_data_theme` filter: the palette, font sizes and spacing
are ours in the editor on any theme.

**`theme.json` is generated, never hand-written.** `packages/tokens/build/build.js` emits
`dist/wp/theme.json` from the same DTCG tokens as the CSS custom properties (palette, font sizes,
spacing scale, radius). This closes the outstanding `theme.json` item in Phase 2. The theme copies it
at build time; hand edits are a bug.

**The adapter owns no styles and no behaviour.**

- CSS: `@uoa/core` builds `dist/uoa.css` and, from the same source, two halves:
  `uoa-components.css` (tokens + the `uoa.components` layer — every rule scoped to a `.uoa-*` class)
  for the plugin, and `uoa-base.css` (tokens + reset, base, layout, utilities) for the theme. Both
  repeat the `@layer` order, so loading both equals loading `uoa.css`. Loading the full file from the
  plugin would restyle a host theme's whole page. The fonts share one style handle, so a site running
  both downloads them once.
- JS: `@uoa/core`'s component modules auto-init on load. The plugin registers each as a script module
  (`wp_register_script_module`) and names it in the block's `viewScriptModule`, so it loads only on
  pages with that block. It doesn't run in the editor, where every tab panel and accordion item stays
  open for editing.
- Markup: every block's render output must match
  `packages/core/src/components/<name>/<name>.html` — same elements, classes, attributes, nesting, and
  no `wp-block-*` wrapper class. Where WordPress can't produce it, the core markup changes first, for
  every platform.

**Blocks, one per component.** Every core component gets a custom block, with attributes that map
the component's documented variants 1:1, and no colour, spacing, typography or class supports an editor
could use to fork the design. Block patterns (PHP files under `patterns/` in the theme) cover
page-level compositions.

**Strings.** Greek is the source language: literals in the render callback passed through `__()` with
the textdomain `uoa-blocks` (plugin) or `uoa` (theme), and a `.pot` per package. English comes from the site's translation
catalogues. Every visible and accessible string is a translatable call, including `aria-label`s.

**Testing.** The same tooling as a standalone WordPress theme/plugin, in its own CI workflow
(`.github/workflows/wordpress.yml`):

- PHPUnit, no WordPress loaded (`tests/phpunit/`): renders each block with stubbed escaping and
  translation functions and asserts the output is one of the examples in the core reference markup,
  whitespace aside. It also fails when a core component has no block. Runs on PHP 8.1–8.4.
- Playwright + axe against `wp-env` (`tests/e2e-pw/`): the seeded blocks on the front end under the
  UOA theme **and** under Twenty Twenty-Five (proving the plugin stands alone), the core behaviour
  (tabs, single-open accordion, dismissal), the breadcrumb trail, the editor (blocks registered,
  saved content valid, canvas styled), WCAG 2.2 AA.
- `phpcs` with WordPress, WordPress-Docs and PHPCompatibility (8.1+).

The core `bun run test:a11y` and `bun run test:visual` suites must keep passing — they cover the
markup the adapters output.

## Consequences

- Phase 4 is reordered: the Drupal adapter stays on the roadmap behind a Drupal SDC ADR, and the
  WordPress work moves out of Phase 6.
- The 7 live WordPress sites get a maintainable path to the design system's components **without
  changing theme**: the plugin carries the blocks, their styles and the tokens, and leaves the rest
  of the page alone.
- `theme.json` joins the generated token outputs, so a token change shows up in the block editor —
  on any theme, because the plugin injects it.
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
- **Theme as the only distribution** — rejected: the 7 live sites have their own themes, and
  switching theme is not something a design system can require.
- **Plugin only, no theme** — rejected as the *only* artefact: faculties starting from scratch still
  need templates and patterns. The theme ships as an option, not as a requirement.
- **Plugin loads the full `uoa.css`** (the first version of this ADR) — rejected: its reset and base
  typography restyle every page of a site that keeps its own theme.
- **Core blocks with block style variations instead of custom blocks** (the first version of this
  ADR) — rejected: most components (alert, accordion, tabs, card, breadcrumb) need markup no core
  block produces, and style variations add `is-style-*` classes the core doesn't have.