# Accordion

`.uoa-accordion` — stacked disclosure rows (FAQ, form sections) on native `<details>/<summary>`.

Status: `beta` (see [lifecycle](../../../../../docs/conventions.md#component-lifecycle))

- **Docs** (examples, guidelines, accessibility, tokens): `apps/docs/src/content/docs/components/accordion.mdx`
  (English: `apps/docs/src/content/docs/en/components/accordion.mdx`), or run `bun run dev` and open
  *Στοιχεία → Ακορντεόν*.
- **Reference markup**: [`accordion.html`](accordion.html) — adapters must output exactly this.
- **Styles**: [`accordion.css`](accordion.css) · **Behaviour**: [`accordion.js`](accordion.js) (single-open only, auto-inits) · **Tokens**: `packages/tokens/src/component/accordion.json`

Classes: `.uoa-accordion` (+ `[data-uoa-accordion]` / `[data-uoa-accordion="single"]`); children
`.uoa-accordion__item` (`<details>`), `.uoa-accordion__trigger` (`<summary>`), `.uoa-accordion__title`,
`.uoa-accordion__icon`, `.uoa-accordion__panel`, `.uoa-accordion__content`.
