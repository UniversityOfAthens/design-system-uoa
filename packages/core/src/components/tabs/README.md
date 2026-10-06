# Tabs

`.uoa-tabs` — switch between equivalent views (programme, enrolment, grants) in place.

Status: `beta` (see [lifecycle](../../../../../docs/conventions.md#component-lifecycle))

- **Docs** (examples, guidelines, accessibility, tokens): `apps/docs/src/content/docs/components/tabs.mdx`
  (English: `apps/docs/src/content/docs/en/components/tabs.mdx`), or run `bun run dev` and open
  *Στοιχεία → Καρτέλες*.
- **Reference markup**: [`tabs.html`](tabs.html) — adapters must output exactly this.
- **Styles**: [`tabs.css`](tabs.css) · **Behaviour**: [`tabs.js`](tabs.js) (APG pattern, auto-inits) · **Tokens**: `packages/tokens/src/component/tabs.json`

Classes: `.uoa-tabs` (+ `[data-uoa-tabs]`); children `.uoa-tabs__list`, `.uoa-tabs__tab`, `.uoa-tabs__panel`.
IDs plus `aria-controls`/`aria-labelledby` pairs are required in the markup; `tabs.js` adds the rest.
