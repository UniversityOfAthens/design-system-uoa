# References — what to borrow

## GitLab Pajamas — <https://design.gitlab.com/components/accordion>

Best model for **how to document** components and how to organise the site.

- **Site IA:** splits *Brand* (logo, messaging, colour, typography, motion, photography) from
  *Product* (foundations, components, patterns, content, data viz, accessibility).
  For a university this split fits well: brand = identity guidelines, product = web UI.
- **Component page shape** (accordion page):
  1. **Examples** — live example + link to the Figma kit.
  2. **Structure** — numbered anatomy diagram (caret, header, item).
  3. **Guidelines** — *When to use*, *When not to use*, *Content*, *Behaviour/interaction*.
  4. **Accessibility** — semantic markup, `aria-expanded`/`aria-controls`, focus, *no-JS fallback*.
  5. **Code reference** — props/slots per sub-component (`GlAccordion`, `GlAccordionItem`).
  6. **Related** — links to alternatives (Modal, Tabs, Tree).
- Takeaway: the "when **not** to use" and "related components" sections stop people
  misusing components — keep them mandatory.

## Material Web — <https://material-web.dev/components/switch/>

Best model for **API and theming reference**.

- Page: intro + links to design spec and source → interactive demo → usage variants →
  accessibility → **theming** → **API**.
- **Theming section** lists the component's CSS custom properties (tokens) with defaults,
  plus an example overriding them. We should do the same: each component documents
  its component-level tokens.
- **API section** has separate tables: *Properties/attributes*, *Methods*, *Events*.
- Web Components (`<md-switch>`) work in any framework — worth considering for the
  few interactive components if the vanilla-JS approach gets messy (see architecture.md).
- Two-tier tokens: *system* tokens (`--md-sys-color-primary`) → *component* tokens
  (`--md-switch-handle-color`). We adopt the same idea.

## shadcn/ui — <https://ui.shadcn.com/>

Best model for **distribution and ownership**.

- "Open code": components are copied into the consumer's project via a CLI/registry rather
  than locked in an npm package, so teams can adapt them.
- Theming is purely CSS variables (`--background`, `--primary`, …) with light/dark sets.
- Layers of content: *Components* → *Blocks* (pre-composed sections like dashboards,
  login pages) → templates.
- Component page: preview/code tabs → installation → usage → examples → API.
- Takeaway for us: offer **Blocks/Patterns** (hero, news list, staff card grid, event
  listing, footer) — for university sites these matter more than atoms. A registry-style
  "copy into your theme" option is a good fit for department sites that need to tweak.

## Others worth a look

- **GOV.UK Design System** — the closest analogue (public institution, server-rendered,
  accessibility-first, progressive enhancement, Nunjucks macros ≈ our Twig templates).
- **USWDS** (US Web Design System) — tokens + Sass + many CMS integrations.
- **CivicTheme** — Drupal + design system in the same model we want (SDC, Storybook).
- **Adobe Spectrum / IBM Carbon** — mature token pipelines and multi-framework packages.
