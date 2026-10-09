# WordPress adapter (ADR 0003)

`packages/wordpress` — the block theme `uoa` and its standalone companion plugin `uoa-blocks`.
WordPress 6.6+, PHP 8.1+. Conventions below are the ones the repo already follows; confirm against
the ADR and `packages/wordpress/README.md` before adding to them.

## Layout

```
packages/wordpress/
├── build/build.js                 # copies @uoa/core, @uoa/tokens, @uoa/icons outputs (gitignored)
├── uoa-blocks/                    # PLUGIN — standalone, works on any theme
│   ├── uoa-blocks.php             # scripts, blocks (directory scan), category, CSS, theme.json filter
│   ├── inc/icons.php              # icon( $name, $class ) → the core's inline <svg>
│   ├── editor/blocks.js           # the editor side of every block, plain JS, no build
│   └── blocks/<name>/{block.json,render.php}
├── uoa/                           # THEME — base CSS, fonts, theme.json, templates; recommends the plugin
│   ├── functions.php, inc/recommended-plugin.php
│   └── templates/, parts/
├── tests/phpunit/                 # markup contract (no WordPress)
├── tests/e2e-pw/                  # Playwright + axe on wp-env (+ mu-plugin.php: ?uoa-theme=…)
├── scripts/seed.sh, scripts/seed/ # wp-env content
├── scripts/bundle.sh              # dist/uoa-blocks.zip, dist/uoa.zip
└── .wp-env.json, phpcs.xml, phpunit.xml, composer.json
```

## Conventions

- **Blocks only in the plugin.** Themes may not register blocks, and content must survive a theme
  switch. The theme never styles a component either.
- **CSS split.** The plugin enqueues `uoa-components.css` (class-scoped, safe on any theme), the theme
  `uoa-base.css` (reset, typography, layout). Never enqueue the full `uoa.css` from the plugin. The
  fonts share the `uoa-fonts` handle.
- **Registration is by directory scan.** `blocks/<name>/block.json` plus `render.php` defining
  `UOA\Blocks\<Name>\render()` (`accordion-item` → `AccordionItem`). `uoa-blocks.php` requires the file
  once and passes the function as `render_callback`; block.json has **no `"render"` key**, because
  WordPress requires that file on every render (it would have to print, and a function defined in it
  fatals on the second block).
- **Pure `markup()`** next to `render()` when the render reads WordPress data (breadcrumb trail, card
  image and date, tab children). The PHPUnit test calls `markup()`; e2e covers the WordPress half.
- **Exact markup, no wrapper.** Don't call `get_block_wrapper_attributes()`; supports
  `html`, `className`, `customClassName` are `false`, and no colour/spacing/typography supports.
- **Editor**: `"editorScript": "uoa-blocks-editor"` (one shared handle). Leaf blocks preview with
  `ServerSideRender` and edit in the sidebar; containers draw the core classes around `InnerBlocks`
  and `save` returns `InnerBlocks.Content`. Editor JS adds no styles and runs no core behaviour.
- **Behaviour**: the core module is registered as a script module `@uoa/core/<name>` in
  `register_scripts()` and named in the block's `"viewScriptModule"`.
- **Strings**: Greek source, textdomain `uoa-blocks` (plugin) / `uoa` (theme), in `block.json`, every
  `__()` and the editor's `wp.i18n.__()`. `aria-label`s included. User content is escaped with
  `esc_html()`, never passed through `__()`.
- **Enum attributes mirror the core's documented variants** 1:1. `test_variants_are_styled` checks
  each one has a `.uoa-<name>--<variant>` rule.
- **Namespaced functions**, `declare( strict_types = 1 )`, `defined( 'ABSPATH' ) || exit;`, phpcs clean.

## Worked example — Badge

```php
namespace UOA\Blocks\Badge;

function markup( string $text, string $variant = 'neutral' ): string {
	if ( '' === $text ) {
		return '';
	}
	return sprintf(
		'<span class="uoa-badge%s">%s</span>',
		'neutral' === $variant ? '' : ' uoa-badge--' . esc_attr( $variant ),
		esc_html( $text )
	);
}

function render( array $attributes ): string {
	return markup( (string) ( $attributes['text'] ?? '' ), (string) ( $attributes['variant'] ?? 'neutral' ) );
}
```

`tests/phpunit/MarkupTest.php` renders it for each variant and asserts the output appears in
`packages/core/src/components/badge/badge.html` (comments, whitespace next to tags and image `src`
ignored).

## Gotchas

- **ServerSideRender in the editor runs over REST**: conditionals like `is_singular()` are false. Use
  block context (`usesContext: ["postId"]`) and pass `urlQueryArgs: { post_id }` from the editor.
- **`<details>` in the editor**: keep it `open` and `preventDefault` clicks/keyups on `<summary>`, or
  typing a space in the title toggles it.
- **RichText values are HTML-escaped already** (`&amp;`). `esc_html()` doesn't double-encode, so
  output them with `esc_html()` like plain attributes.
- **Block validation notices** in templates: keep block comments minimal; let the editor fill defaults.
- **`WP_Theme_JSON_Data::update_with()` takes an array**, not another `WP_Theme_JSON_Data`.
- **No `.pot` yet**: `bun run makepot` inside wp-env.
