# @uoa/wordpress

The WordPress adapter (ADR 0003): a plugin that renders `@uoa/core`'s reference markup, plus an
optional block theme. It owns **no styles and no behaviour** — the core's CSS ships inside the plugin
and every string goes through WordPress translation.

Install **`uoa-ds-blocks`** on any WordPress site: the blocks, the styles and the design tokens in
the editor come from the plugin, so a faculty site keeps the theme it already has. Activate
**`uoa-ds`** only if you want the full-site-editing templates as well.

```sh
bun run build   # copies @uoa/core/dist and the generated theme.json into the theme/plugin
bun run test    # markup contract: each block's output vs the core reference HTML
```

Both directories are installable as-is (`wp-content/themes/uoa-ds`, `wp-content/plugins/uoa-ds-blocks`).
`bun run build` must run first: `uoa-ds/theme.json` and `uoa-ds-blocks/assets/` are generated and
gitignored.

| Path | What |
| --- | --- |
| `uoa-ds/` | Optional block theme: `theme.json` (generated), `templates/`, `parts/` |
| `uoa-ds-blocks/` | Plugin: block registration, enqueues `@uoa/core`, injects the tokens into the editor |
| `uoa-ds-blocks/blocks/<name>/` | `block.json` + `render.php` per component |
| `tests/markup.php` | Contract test — renders blocks and diffs them against `packages/core` |

## Porting a component

1. Copy `packages/core/src/components/<name>/<name>.html` and make `render.php` output exactly it.
2. Map the component's documented variants to block attributes (`block.json` `enum`) 1:1 — no extras.
3. Put every visible string, `aria-label` included, through `__()` / `esc_html__()` with the
   `uoa-ds` textdomain. Greek is the source language.
4. Disable the block supports that would let an editor add styling the core doesn't have
   (`color`, `typography.fontSize`, `spacing`).
5. Run `bun run test`. It diffs your render output against the core reference markup, so a
   divergence fails instead of shipping.

## Known gaps

- **Templates are placeholders.** `templates/` and `parts/` use core blocks because the Header, Footer
  and main navigation components don't exist in `@uoa/core` yet. They're replaced when those land.
- **No `.pot` file.** `languages/uoa-ds.pot` needs `wp i18n make-pot`, which runs in `wp-env`; until
  then English comes from the site's existing catalogue.
- **No editor JS yet.** Porting Alert, Accordion or Tabs means enqueuing `@uoa/core`'s ES modules
  (`wp_enqueue_script_module()`) and calling `init()` on the editor canvas.
- **Inline badges** (the `<h2>` case in `badge.html`) can't be produced by a standalone block; they
  need a heading block variation or a pattern, deferred until the typography patterns exist.
- **Palette is locked** (`theme.json` `color.custom: false`) so editors can't invent off-brand
  colours. Reversible in `packages/tokens/build/build.js`.