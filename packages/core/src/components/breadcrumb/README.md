# Breadcrumb

`.uoa-breadcrumb` — the trail of ancestors above the current page.

Status: `draft` (see [lifecycle](../../../../../docs/conventions.md#component-lifecycle))

- **Docs** (examples, guidelines, accessibility, tokens): `apps/docs/src/content/docs/components/breadcrumb.mdx`
  (English: `apps/docs/src/content/docs/en/components/breadcrumb.mdx`), or run `bun run dev` and open
  *Στοιχεία → Διαδρομή πλοήγησης*.
- **Reference markup**: [`breadcrumb.html`](breadcrumb.html) — adapters must output exactly this.
- **Styles**: [`breadcrumb.css`](breadcrumb.css) · **Tokens**: `packages/tokens/src/component/breadcrumb.json`

Classes: `.uoa-breadcrumb` (the `<nav>`, needs a translated `aria-label`) → `.uoa-breadcrumb__list`
(the `<ol>`) → `.uoa-breadcrumb__item` (each `<li>`) with `.uoa-breadcrumb__link` for the ancestors,
`.uoa-breadcrumb__current` for the last one (`aria-current="page"`, never a link) and
`.uoa-breadcrumb__separator` for the decorative chevron between them. No JavaScript.