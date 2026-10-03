# Button

`.uoa-button` — starts an action; styled links use it when they must stand out.

Status: `beta` (see [lifecycle](../../../../../docs/conventions.md#component-lifecycle))

- **Docs** (examples, guidelines, accessibility, tokens): `apps/docs/src/content/docs/components/button.mdx`
  (English: `apps/docs/src/content/docs/en/components/button.mdx`),
  or run `bun run dev` and open *Στοιχεία → Κουμπί*.
- **Reference markup**: [`button.html`](button.html) — adapters must output exactly this.
- **Styles**: [`button.css`](button.css) · **Tokens**: `packages/tokens/src/component/button.json`

Classes: `.uoa-button` + `--secondary | --tertiary`, `--sm`, `--block`; child `.uoa-button__icon`.
Disabled via `[disabled]` or `[aria-disabled="true"]`. No JavaScript.
