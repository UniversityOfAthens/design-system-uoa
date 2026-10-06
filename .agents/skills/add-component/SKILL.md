---
name: add-component
description: Add a new component to the NKUA design system core (tokens, CSS, reference HTML, optional vanilla JS, bilingual docs pages, a11y and visual tests). Use when asked to build, create or add a component such as card, breadcrumb, modal or pagination.
---

# Add a core component

Model new work on an existing component of the same kind: **Button** or **Badge** (CSS only),
**Alert** (CSS + small JS), **Accordion** / **Tabs** (interactive, keyboard patterns). Read its
files before writing yours and match them.

## 0. Before writing code

- Check `docs/TODO.md` for the item and any notes.
- Find the WAI-ARIA Authoring Practices pattern for the component (if any) and decide the
  semantic HTML. Prefer native elements (`<details>`, `<dialog>`, `<nav>`, `<button>`) over ARIA.
- Decide what works without JS. If the answer is "nothing", rethink the markup.
- If the component is complex enough to warrant a Web Component, stop and propose an ADR first.

## 1. Tokens — `packages/tokens/src/component/<name>.json`

- DTCG format (`$type`, `$value`, optional `$description`), top-level key = component name.
- Reference **semantic** tokens (`{color.feedback.info-text}`, `{space.4}`, `{radius.surface}`).
  If a needed semantic token is missing, add it to `src/semantic/` (and every theme that
  overrides that group) rather than pointing at a primitive.
- Output becomes `--uoa-<name>-<token>`.

## 2. CSS — `packages/core/src/components/<name>/<name>.css`

- Import it in `packages/core/src/uoa.css` with `layer(uoa.components)`, alphabetically.
- BEM with `uoa-` prefix: `.uoa-<name>`, `.uoa-<name>__part`, `.uoa-<name>--variant`.
  State via ARIA / data attributes (`[aria-expanded="true"]`, `[aria-selected]`), not `.is-*`.
- Only `var(--uoa-…)`. Logical properties only.
- Visible `:focus-visible` style; `@media (prefers-reduced-motion: reduce)` for any motion;
  check `@media (forced-colors: active)` — borders/outlines must keep meaning visible.
- No `text-transform: uppercase` on text that may be Greek.

## 3. Reference markup — `<name>.html`

The contract every adapter outputs. Greek content. Include each variant and state. Every
string (including `aria-label`) is in the markup, never in CSS/JS.

Icons: copy the `<svg>` from `packages/icons/dist/svg/<name>.svg` (run `bun run build` first),
swap `uoa-icon` for the component's own icon class if it has one (`uoa-<name>__icon`), and keep
`aria-hidden="true" focusable="false" fill="currentColor"`. If the icon isn't in the set, add its
Iconify name to `packages/icons/src/icons.js`.

## 4. JS (only if needed) — `<name>.js`

Follow `alert.js` / `tabs.js`:

- `export function init(root = document)` that finds `[data-uoa-<name>]` inside **and including**
  `root`, skips already-initialised elements (`data-uoa-init="<name>"`), and auto-runs on load.
- Emit `uoa:<name>:<event>` CustomEvents (bubbling) for anything sites might hook into.
- No hard-coded strings; read them from the markup.
- Re-export from `packages/core/src/uoa.js` as `init<Name>`.

## 5. README — `<name>/README.md`

Short pointer, same shape as `alert/README.md`: one-line description, status, links to the docs
pages, markup/CSS/JS/tokens, and a one-paragraph class list.

## 6. Docs pages (Greek **and** English)

- Greek: `apps/docs/src/content/docs/components/<name>.mdx`
- English: `apps/docs/src/content/docs/en/components/<name>.mdx`
- Follow `docs/component-docs-template.md`; copy the frontmatter and imports from an existing
  component page. Use `<Example title="…" code={`…`} />` and `<TokenTable prefix="<name>-" />`.
- Status starts at `draft`. Write natural Greek, not a literal translation.
- New docs-site UI strings: both `apps/docs/src/content/i18n/{el,en}.yml` and the schema in
  `apps/docs/src/content.config.ts`.
- Nothing to register: the sidebar autogenerates from `components/`, and the a11y and visual
  tests pick up every built page and every `<Example>` automatically.

## 7. Verify

```sh
bun run docs:build
bun run test:a11y
cd apps/docs && bun run test:visual:update   # new component → new snapshots
```

Open the new PNGs in `apps/docs/tests/__screenshots__/` and look at them before committing.
Then check by hand (or say plainly that it wasn't done): keyboard only, 320px width, 200% zoom,
dark theme.

## 8. Finish

- Tick the item in `docs/TODO.md` (note status, e.g. `draft`).
- Commit as `feat(<name>): add <Name> component`.
