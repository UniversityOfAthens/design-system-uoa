# Card

`.uoa-card` — a teaser for one item: news, event, person/staff, course.

Status: `draft` (see [lifecycle](../../../../../docs/conventions.md#component-lifecycle))

- **Docs** (examples, guidelines, accessibility, tokens): `apps/docs/src/content/docs/components/card.mdx`
  (English: `apps/docs/src/content/docs/en/components/card.mdx`), or run `bun run dev` and open
  *Στοιχεία → Κάρτα*.
- **Reference markup**: [`card.html`](card.html) — adapters must output exactly this.
- **Styles**: [`card.css`](card.css) · **Tokens**: `packages/tokens/src/component/card.json`

Classes: `.uoa-card` + `--horizontal` (person/staff); children
`.uoa-card__media`, `.uoa-card__body`, `.uoa-card__eyebrow`, `.uoa-card__title`,
`.uoa-card__meta`, `.uoa-card__text`, `.uoa-card__footer`.
When the title is a link it stretches over the whole card (CSS only). No JavaScript.
