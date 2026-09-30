# Button

Starts an action (submit a form, open a dialog, download a file). Styled links use the same
look when they lead somewhere important.

Status: `draft` · Figma: — · Source: [`button.css`](button.css), [`button.html`](button.html)

## Examples

See the Button section of the playground (`bun run dev`) and [`button.html`](button.html).
Primary first, then secondary, tertiary, small, with icon, icon-only, disabled, full width.

## Structure

1. **Container**: `<button>` or `<a>` with `.uoa-button`. It carries the background, border and focus ring.
2. **Icon** (optional): inline SVG with `.uoa-button__icon`, before or after the label.
3. **Label**: plain text. Required, except on icon-only buttons, which need `aria-label`.

## Guidelines

### When to use
- The main action on a page or form (submit, apply, register).
- Actions that change something: save, delete, download, open a dialog.
- A link that must stand out, e.g. "Αιτήσεις" on an admissions landing page.

### When not to use
- Navigation inside running text: use a normal link.
- Several equal choices: use radio buttons or a select.
- Switching views on the same page: use Tabs (not yet built).
- More than one primary button in the same area. Pick one and make the rest secondary or tertiary.

### Variants
| Variant | Class | Use for |
| --- | --- | --- |
| Primary | `.uoa-button` | The one main action in an area |
| Secondary | `.uoa-button--secondary` | Other actions next to a primary |
| Tertiary | `.uoa-button--tertiary` | Low-emphasis actions (cancel, reset) |
| Small | `.uoa-button--sm` | Dense UI: filters, table rows. Not for main actions |
| Block | `.uoa-button--block` | Full width, e.g. login forms and mobile |

### Content
- Start with a verb that says what happens: "Υποβολή αίτησης", "Λήψη PDF", not "OK" or "Εδώ".
- Keep it short, about 1–3 words. Greek labels run 20–30% longer than English, so check that they fit.
- Sentence case. Don't use `text-transform: uppercase`: Greek loses its accents and screen readers can misread it.

### Behaviour
- States: hover (darker fill and a slightly larger shadow, or a tint), active (1px press), focus-visible (3px ring), disabled (50% opacity, no hover).
- The label doesn't wrap into a new shape; the button grows in height if the text wraps.
- Minimum target 44 × 44px at default size, and 36px tall at `--sm`. Both are above the WCAG 2.2 24px minimum.
- Loading state is not built yet.

## Accessibility

- Use `<button type="button|submit">` for actions and `<a href>` for navigation. Never a `<div>` or `<span>`.
- Keyboard:

  | Key | Action |
  | --- | --- |
  | `Tab` | Moves focus to the button |
  | `Enter` | Activates (button and link) |
  | `Space` | Activates (`<button>` only) |

- Icon-only buttons need `aria-label`. Decorative icons get `aria-hidden="true" focusable="false"`.
- Prefer leaving a button enabled and showing a validation error over disabling it. A disabled button can't be focused, so users can't find out why it's disabled.
- A disabled `<a>` uses `aria-disabled="true"` and no `href`.
- No JavaScript needed.
- In Windows High Contrast mode, filled buttons keep a visible border.
- The secondary button's light border is decorative: the label identifies the control (WCAG 1.4.11 doesn't require a 3:1 border when the text identifies it).
- Screen-reader testing (NVDA, VoiceOver) hasn't been done yet.

## Theming

Component tokens (`packages/tokens/src/component/button.json`). They follow the site's brand
through `data-uoa-brand`.

| Token | Default | Description |
| --- | --- | --- |
| `--uoa-button-padding-block` | `var(--uoa-space-3)` | Vertical padding, border included |
| `--uoa-button-padding-inline` | `var(--uoa-space-5)` | Horizontal padding, border included |
| `--uoa-button-padding-block-sm` / `-inline-sm` | `space-2` / `space-3` | Small size |
| `--uoa-button-gap` | `var(--uoa-space-2)` | Space between icon and label |
| `--uoa-button-radius` | `var(--uoa-radius-control)` | Corner radius |
| `--uoa-button-border-width` | `var(--uoa-border-width-thin)` | Border (secondary variant) |
| `--uoa-button-font-weight` | `var(--uoa-font-weight-body-strong)` | Label weight |
| `--uoa-button-primary-bg` / `-bg-hover` / `-text` | `action-primary` / `-hover` / `-text` | Primary colours |
| `--uoa-button-secondary-text` / `-border` / `-border-hover` / `-bg-hover` | `text-default` / `border-default` / `grey-300` / `surface-subtle` | Secondary colours |
| `--uoa-button-tertiary-text` / `-bg-hover` | `action-primary` / `surface-muted` | Tertiary colours |

## API

### HTML / CSS
`.uoa-button` + optional `--secondary | --tertiary`, `--sm`, `--block`; child `.uoa-button__icon`.
Disabled via `[disabled]` or `[aria-disabled="true"]`.

### JavaScript
None.

### Drupal / TYPO3 / WordPress / React
Filled in once the first platform adapter is chosen (see ADR 0003).

## Related

- Link: for navigation inside text.
- Tabs (planned): for switching views.

## Changelog
- 0.0.0: first draft.
