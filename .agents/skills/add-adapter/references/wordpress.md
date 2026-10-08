# WordPress adapter (ADR 0003)

`packages/wordpress` — the plugin `uoa-ds-blocks` (what sites install) plus an optional block theme
`uoa-ds`. WordPress 6.6+. Conventions below are the ones the repo already follows; confirm against
the ADR before adding to them.

## Layout

```
packages/wordpress/
├── build/build.js                     # copies @uoa/core/dist + generated theme.json (gitignored outputs)
├── uoa-ds/                            # optional block theme
│   ├── style.css                      # theme header only, no rules
│   ├── theme.json                     # GENERATED from tokens — never hand-edit
│   ├── templates/{index,page,single}.html
│   └── parts/{header,footer}.html
├── uoa-ds-blocks/                     # plugin: blocks, @uoa/core enqueue, tokens in the editor
│   ├── uoa-ds-blocks.php              # register_block_type per blocks/*/block.json, enqueue on
│   │                                  #   enqueue_block_assets, wp_theme_json_data_theme filter
│   └── blocks/<name>/{block.json,render.php}
└── tests/markup.php                   # contract test, run with `bun run test`
```

## Conventions

- **Registration is by directory scan.** Drop `block.json` in `blocks/<name>/` and `register_blocks()`
  picks it up. Nothing else to wire.
- **`"render": "file:./render.php"`** in `block.json`, not a callback name in PHP — the file stays
  next to its schema.
- **`render.php` is a namespaced function**, not a class: `UOA\DS\Blocks\<Name>\render( $attributes )`.
  The contract test includes the file and calls it directly with stubbed WP functions, so no WordPress
  bootstrap is needed to test it.
- **Namespaced plugin functions**, `declare( strict_types = 1 )`, `defined( 'ABSPATH' ) || exit;`.
- **Assets load on `enqueue_block_assets`**, not `wp_enqueue_scripts`, so the block editor canvas is
  styled by the same file as the front end.
- **Tokens reach the editor through `wp_theme_json_data_theme`**, because a plugin cannot ship a
  `theme.json` file. The same generated file is copied into the optional theme; WordPress merges both.
- **Cache-busting by `filemtime()`** of the built CSS — the plugin has no version to bump.
- **Lock the styling supports** an editor shouldn't have: `color`, `typography.fontSize`, `spacing`,
  `html`. If the core component has no such variant, the block must not offer it.
- **Greek source strings**, `textdomain` `uoa-ds` in both `block.json` and the `__()` calls. WordPress
  translates block titles from `block.json` using that textdomain.
- **Enum attributes mirror the core's documented variants** 1:1 (`"enum": ["neutral", "info", …]`).

## Worked example — Badge

`block.json` exposes `text` (string, Greek default) and `variant` (string enum). `render.php` maps the
enum to the core's modifier class and returns:

```php
$classes = 'uoa-badge';
if ( 'neutral' !== $variant ) {
    $classes .= ' uoa-badge--' . $variant;
}

return sprintf(
    '<span class="%s">%s</span>',
    esc_attr( $classes ),
    esc_html__( $text, 'uoa-ds' )
);
```

`packages/wordpress/tests/markup.php` renders this for every `<span class="uoa-badge…">` line in
`packages/core/src/components/badge/badge.html` and diffs the strings, so a variant or attribute order
that drifts from the core fails the test.

## Gotchas

- **Block validation notices.** Keep template block comments minimal (`{"query":{"inherit":true}}`);
  invented attribute keys make the editor flag the template as invalid. Let the editor fill defaults.
- **Don't invent classes.** `uoa-site-header` and friends are not core components — a template using
  them would fork the design system.
- **`wp:post-excerpt` / `wp:query-*`** blocks are used in templates before their components exist in
  core (Header, Footer, main navigation). They're placeholders.
- **ES modules**: `@uoa/core`'s JS is unbundled ESM. Use `wp_enqueue_script_module()` (WP 6.5+) and
  serve the whole `dist/components/` tree next to `uoa.js` so relative imports resolve.
- **No `.pot` yet**: generate with `wp i18n make-pot` inside `wp-env`.