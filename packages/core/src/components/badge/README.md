# Badge

`.uoa-badge` — a small status label: new programme, deadline, approved, cancelled.

Status: `beta` (see [lifecycle](../../../../../docs/conventions.md#component-lifecycle))

- **Docs** (examples, guidelines, accessibility, tokens): `apps/docs/src/content/docs/components/badge.mdx`
  (English: `apps/docs/src/content/docs/en/components/badge.mdx`), or run `bun run dev` and open
  *Στοιχεία → Σήμα*.
- **Reference markup**: [`badge.html`](badge.html) — adapters must output exactly this.
- **Styles**: [`badge.css`](badge.css) · **Tokens**: `packages/tokens/src/component/badge.json`

Classes: `.uoa-badge` + `--info | --success | --warning | --danger` (neutral is the default). No JavaScript.
