# Component docs template

Copy this into `packages/core/src/components/<name>/README.md` for every component.
Merges the Pajamas guideline structure with Material Web's theming/API tables.

---

````md
# <Component name>

One-sentence description of what it is and what it's for.

Status: `draft | beta | stable | deprecated` · Figma: <link> · Source: <link>

## Examples

Live example(s) (Storybook embed) with the default variant first, then variants/states.

## Structure

Numbered anatomy image, then a list:
1. **Part** — what it is.
2. …

## Guidelines

### When to use
- …

### When not to use
- … (point to the right alternative component)

### Variants
| Variant | Use for |
| --- | --- |

### Content
Writing guidance: labels, length, capitalisation, Greek/English notes.

### Behaviour
Interaction, states (hover, focus, active, disabled, loading, error), responsive behaviour.

## Accessibility

- Semantic HTML used and why.
- Keyboard interaction table:

  | Key | Action |
  | --- | --- |

- ARIA attributes and what updates them.
- Behaviour without JavaScript.
- Screen-reader testing notes (NVDA/VoiceOver).

## Theming

| Token | Default | Description |
| --- | --- | --- |
| `--uoa-<component>-…` | `var(--uoa-…)` | |

## API

### HTML / CSS
Classes and modifiers (`.uoa-accordion`, `.uoa-accordion__item`, `.uoa-accordion--flush`).

### JavaScript
| Option / method / event | Type | Description |
| --- | --- | --- |

### Drupal (SDC)
`uoa_ds:<component>` — props and slots (mirrors `*.component.yml`), plus a Twig usage example.

### WordPress / React
Filled in when those adapters exist.

## Related

- [Other component](…) — when to pick it instead.

## Changelog
Link to the package changelog entries.
````
