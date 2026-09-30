# Button

`.uoa-button` — starts an action; styled links use it when they must stand out.

Status: `draft`

- **Docs** (examples, guidelines, accessibility, tokens): `apps/docs/src/content/docs/components/button.mdx`,
  or run `bun run dev` and open *Components → Button*.
- **Reference markup**: [`button.html`](button.html) — adapters must output exactly this.
- **Styles**: [`button.css`](button.css) · **Tokens**: `packages/tokens/src/component/button.json`

Classes: `.uoa-button` + `--secondary | --tertiary`, `--sm`, `--block`; child `.uoa-button__icon`.
Disabled via `[disabled]` or `[aria-disabled="true"]`. No JavaScript.
