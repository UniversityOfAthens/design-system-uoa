# Alert

`.uoa-alert` — a status message in the page flow: information, success, warning or error.

Status: `beta` (see [lifecycle](../../../../../docs/conventions.md#component-lifecycle))

- **Docs** (examples, guidelines, accessibility, tokens): `apps/docs/src/content/docs/components/alert.mdx`
  (English: `apps/docs/src/content/docs/en/components/alert.mdx`), or run `bun run dev` and open
  *Στοιχεία → Ειδοποίηση*.
- **Reference markup**: [`alert.html`](alert.html) — adapters must output exactly this.
- **Styles**: [`alert.css`](alert.css) · **Tokens**: `packages/tokens/src/component/alert.json`

Classes: `.uoa-alert` + `--success | --warning | --danger` (info is the default); children
`.uoa-alert__icon`, `.uoa-alert__content`, `.uoa-alert__title`. No JavaScript.
