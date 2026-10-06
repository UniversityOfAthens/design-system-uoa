# Icon

`.uoa-icon` — an inline SVG icon from [`@uoa/icons`](../../../../icons/README.md) (Material Symbols).

Status: `draft` (see [lifecycle](../../../../../docs/conventions.md#component-lifecycle))

- **Docs** (the full set, usage, accessibility): `apps/docs/src/content/docs/foundations/iconography.mdx`
  (English: `apps/docs/src/content/docs/en/foundations/iconography.mdx`), or run `bun run dev` and open
  *Θεμέλια → Εικονίδια*.
- **Reference markup**: [`icon.html`](icon.html) · **Styles**: [`icon.css`](icon.css) · **Tokens**: `packages/tokens/src/component/icon.json`

Classes: `.uoa-icon` + `--sm | --lg` (default is 1.25em), `--directional` for arrows and chevrons that
flip in right-to-left text. Every icon is `aria-hidden="true" focusable="false" fill="currentColor"` (the fill keeps the text colour
even without the CSS); when an icon is the
only content of a control, the accessible name goes on the control (`aria-label`).
