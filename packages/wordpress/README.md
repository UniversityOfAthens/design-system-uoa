# @uoa/wordpress

The WordPress adapter (ADR 0003): a block theme and its companion plugin, built from `@uoa/core`.
Neither owns styles or behaviour — both ship the core's CSS and JS, split by who needs it.

| | What it is | What it ships |
| --- | --- | --- |
| **`uoa-blocks/`** | Plugin, **standalone**: works on any theme | One block per core component, the component half of the CSS (`uoa-components.css`, every rule scoped to a `.uoa-*` class), the behaviour modules, the icon set, the fonts; the tokens in the editor when the UOA theme isn't active |
| **`uoa/`** | Block theme, recommends the plugin | The page-level half of the CSS (`uoa-base.css`: reset, typography, layout, utilities), the fonts, the generated `theme.json`, templates and parts |

A faculty site that keeps its own theme installs only the plugin: the blocks look right and nothing
else on the site changes. A site that wants the full NKUA look installs both. Blocks live only in the
plugin, so content survives a theme switch (and themes may not register blocks).

## Blocks

All in the inserter category «Σύστημα σχεδίασης ΕΚΠΑ». Each one outputs
`packages/core/src/components/<name>/<name>.html` exactly, without `wp-block-*` wrapper classes.

| Block | Core component | Edited |
| --- | --- | --- |
| `uoa/accordion` + `uoa/accordion-item` | Accordion (single-open option) | In place |
| `uoa/alert` | Alert (4 variants, optional title, dismissible) | In place |
| `uoa/badge` | Badge | Sidebar, live preview |
| `uoa/breadcrumb` | Breadcrumb, from the page hierarchy; omitted on the front page | — |
| `uoa/button` | Button (link when it has a URL; variants, size, full width, icon, icon-only, disabled) | Sidebar, live preview |
| `uoa/card` | Card (image, eyebrow, title/link, date, meta, badge, text, footer, horizontal) | Sidebar, live preview |
| `uoa/icon` | Icon (decorative; size; directional icons flip in RTL) | Sidebar, live preview |
| `uoa/tabs` + `uoa/tab` | Tabs | In place |

The editor script is one plain-JS file on the `wp.*` globals (`uoa-blocks/editor/blocks.js`), so
there is no build step. Leaf blocks preview the PHP render through `ServerSideRender`; container
blocks draw the core classes around `InnerBlocks`.

## Develop

```sh
bun run build                # at the repo root: tokens → icons → core → copies into uoa/ and uoa-blocks/
cd packages/wordpress
composer install
bun run start                # wp-env on :8888 (admin / password): theme + plugin active, content seeded
bun run test                 # PHPUnit — the markup contract, no WordPress needed
bun run lint                 # phpcs (WordPress, WordPress-Docs, PHPCompatibility 8.1+)
bun run test:e2e             # Playwright + axe against wp-env, desktop and mobile
bun run bundle               # dist/uoa-blocks.zip and dist/uoa.zip, ready to upload
```

`uoa/assets/`, `uoa/theme.json` and `uoa-blocks/assets/` are build outputs (gitignored); never edit
them.

| Path | What |
| --- | --- |
| `uoa-blocks/uoa-blocks.php` | Registers scripts, blocks (`blocks/*/`), the category, the CSS, the theme.json filter |
| `uoa-blocks/blocks/<name>/` | `block.json` + `render.php` (`UOA\Blocks\<Name>\render()`, and a pure `markup()` where WordPress data is involved) |
| `uoa-blocks/editor/blocks.js` | The editor side of every block |
| `uoa-blocks/inc/icons.php` | `icon( $name, $class )` → the core's inline `<svg>` |
| `uoa/functions.php`, `uoa/inc/` | Base CSS + fonts, the plugin recommendation notice |
| `tests/phpunit/` | Markup contract: renders each block and asserts its output is one of the core's examples |
| `tests/e2e-pw/` | Front end under the UOA theme **and** Twenty Twenty-Five, the editor, axe |
| `scripts/seed.sh`, `scripts/seed/` | wp-env content: `/`, `/components/`, `/studies/undergraduate/philology/` |

## Porting a component

1. Add `uoa-blocks/blocks/<name>/block.json` (`"name": "uoa/<name>"`, category `uoa`, textdomain
   `uoa-blocks`, `"supports": { "html": false, "className": false, "customClassName": false }`,
   `"editorScript": "uoa-blocks-editor"`) — no `"render"` key; `uoa-blocks.php` passes the callback.
2. Write `render.php` with `UOA\Blocks\<Name>\render()` returning exactly the core markup. Variants map
   to `enum` attributes 1:1 — no extras. Every visible and accessible string goes through `__()`
   with the `uoa-blocks` textdomain; Greek is the source language.
3. Add the block's `edit` to `editor/blocks.js`, and a JS module to `register_scripts()` +
   `viewScriptModule` if the core component has one.
4. Add cases to `tests/phpunit/MarkupTest.php` (one per reference example) and to
   `scripts/seed/components.html`; `test_every_component_is_ported` fails until you do.

## Known gaps

- **No `.pot` files yet.** `bun run makepot` (in wp-env) generates `languages/uoa-blocks.pot` and
  `languages/uoa.pot`; English translations follow.
- **Templates are placeholders.** `uoa/templates/` and `parts/` use core blocks because Header, Footer
  and main navigation don't exist in `@uoa/core` yet.
- **Alerts have no `role`.** A message placed in content is there on page load; the core adds
  `role="status"`/`"alert"` only to messages inserted later, which a content block never is.
- **Inline badges** (the `<h2>` case in `badge.html`) need a heading variation or a pattern.
- **Katsoulidis** is copied into both zips when it's present locally; it's a commercial font, so
  don't distribute a bundle built on a machine that has it until the NKUA licence is confirmed.
