# Audit of existing NKUA sites (2026-09-30)

Automated scan of www.uoa.gr and the 53 school/department sites linked from
<https://www.uoa.gr/scholes_kai_tmimata>: homepage HTML + same-host stylesheets,
colours counted per site.

## Platforms

| CMS | Sites |
| --- | --- |
| **TYPO3** (shared extension `uoa_website`) | 44 (incl. www.uoa.gr) |
| WordPress | 7 — baag, deaneconpol, agro, ecd, econ, pms, soc |
| Drupal | 1 — di |
| Other/static | 2 — aerospace, cce |

This contradicts the "Drupal first" assumption in [architecture.md](../architecture.md):
the adapter order needs revisiting (ADR 0003).

## The shared TYPO3 template

All TYPO3 department sites load `typo3conf/ext/uoa_website/Resources/Public/Css/…`
plus **one base scheme** and optionally **one accent scheme** (counts from the 38 sites whose
scheme files could be read):

| Base scheme | Primary | Dark | Sites |
| --- | --- | --- | --- |
| `Red/red.css` | `#862c23` burgundy | `#551c16` | 15 |
| `Green/green.css` | `#2c5454` teal | `#172c2c` | 23 |

| Accent scheme | Colour | Contrast on white |
| --- | --- | --- |
| Azure | `#0d5eaf` | 6.49 |
| Navy | `#2711ab` | 11.97 |
| Serice | `#a62e4a` | 6.75 |
| Olive | `#787637` | 4.72 |
| Orange | `#c24a38` | 4.85 |
| Redwood | `#862c23` | 8.76 |
| Sacramento | `#2c5454` | 8.39 |

www.uoa.gr itself uses navy `#161f57`, link blue `#0075cb` (4.77:1) and cyan `#00afcb`
(2.63:1 — decorative only).

These map 1:1 to our tokens: `data-uoa-brand="red|green"` and
`data-uoa-accent="…"` on `<html>` (see `packages/tokens/src/themes/`).

## Fonts in use today

The TYPO3 template loads **GFS Didot** (headings), **Open Sans** 400–800 and **Roboto**
from Google Fonts. Katsoulidis is not used on the live sites.

## Other observations

- Neutrals everywhere: `#333`, `#444`, `#ccc`, `#eee`, `#f4f4f4`. Blue `#0075cb`/`#0072c4`
  and red `#ff0000` appear on 40+ sites via the shared CSS.
- Blue `#0075cb` and the olive/orange accents drop below 4.5:1 on the `#f4f4f4` grey
  used by the template — our `surface-subtle` is `#f7f7f7` for that reason.
