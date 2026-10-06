# @uoa/icons

The NKUA design system's icons: a curated subset of Google's
[Material Symbols](https://icones.js.org/collection/material-symbols), taken from the Iconify data
(`@iconify-json/material-symbols`, pinned).

- **Docs** (the full set, usage, accessibility): `apps/docs/src/content/docs/foundations/iconography.mdx`,
  or run `bun run dev` and open *Θεμέλια → Εικονίδια*.
- **Styles**: `.uoa-icon` lives in `@uoa/core` (`packages/core/src/components/icon/`).

## Output (`bun run build`)

| File | Use |
| --- | --- |
| `dist/svg/<name>.svg` | One icon, ready to inline (Twig `source()`, PHP, React) |
| `dist/sprite.svg` | All icons as `<symbol id="uoa-icon-<name>">` for `<use href>` |
| `dist/icons.json` | `{ name: { group, body } }` for tooling and the docs site |

## Adding an icon

Add its Iconify name (as shown on icones.js.org) to the right group in [`src/icons.js`](src/icons.js) and
run `bun run build`. The build fails on unknown names and duplicates.

## Licence

The icons are © Google, licensed under the [Apache License 2.0](LICENSE)
(from [google/material-design-icons](https://github.com/google/material-design-icons)). The licence file is
shipped with the package and in `dist/`. The rest of this repository is GPL-3.0.
