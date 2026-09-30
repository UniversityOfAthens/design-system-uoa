// Renders token-driven sections (colours, type, spacing, shape), adds "Show code"
// panels to examples, wires the theme switchers and highlights the current section.

const root = document.documentElement;
const $ = (id) => document.getElementById(id);

// --- Colour ---------------------------------------------------------------

function colorVars() {
  const names = new Set();
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of rules) {
      if (rule.selectorText !== ':root') continue;
      for (const prop of rule.style) if (prop.startsWith('--uoa-color-')) names.add(prop);
    }
  }
  return [...names];
}

const PALETTES = ['uoa', 'burgundy', 'teal', 'accent', 'grey', 'green', 'amber', 'red', 'blue'];
const PRIMITIVE = new RegExp(`^--uoa-color-(${PALETTES.join('|')})-`);

function toRgb(value) {
  const probe = document.createElement('div');
  probe.style.color = value;
  document.body.append(probe);
  const [r, g, b] = getComputedStyle(probe).color.match(/\d+(\.\d+)?/g).map(Number);
  probe.remove();
  return [r, g, b];
}

function luminance(rgb) {
  const [R, G, B] = rgb.map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

const contrastOnWhite = (rgb) => 1.05 / (luminance(rgb) + 0.05);
const hex = (rgb) => '#' + rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');

function verdict(ratio) {
  if (ratio >= 4.5) return ['aa', 'AA'];
  if (ratio >= 3) return ['ui', 'UI'];
  return ['deco', 'Decorative'];
}

function swatch(name) {
  const rgb = toRgb(`var(${name})`);
  const ratio = contrastOnWhite(rgb);
  const [level, label] = verdict(ratio);
  return `
    <div class="pg-swatch">
      <div class="pg-swatch__chip" style="background: var(${name})"></div>
      <div class="pg-swatch__meta">
        <span class="pg-swatch__name">${name.replace(/^--uoa-color-[a-z]+-/, '')}</span>
        <span class="pg-swatch__row">${hex(rgb)} <span class="pg-pill" data-level="${level}">${label} ${ratio.toFixed(1)}</span></span>
      </div>
    </div>`;
}

function renderColours() {
  const all = colorVars();

  // Semantic tokens grouped by their first segment: brand, text, surface, …
  const groups = new Map();
  for (const name of all.filter((n) => !PRIMITIVE.test(n))) {
    const group = name.replace('--uoa-color-', '').split('-')[0];
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(name);
  }
  $('colour-groups').innerHTML = [...groups]
    .map(([group, names]) => `
      <div class="pg-colour-group">
        <h3>${group}</h3>
        <div class="pg-swatches">${names.map(swatch).join('')}</div>
      </div>`)
    .join('');

  // Primitive palettes as strips.
  $('palettes').innerHTML = PALETTES
    .map((palette) => {
      const names = all.filter((n) => n.startsWith(`--uoa-color-${palette}-`));
      const cells = names.map((n) => {
        const rgb = toRgb(`var(${n})`);
        const ink = luminance(rgb) > 0.4 ? 'var(--uoa-color-grey-900)' : 'var(--uoa-color-grey-0)';
        const step = n.replace(`--uoa-color-${palette}-`, '');
        return `<span style="background: var(${n}); color: ${ink}" title="${n}: ${hex(rgb)}">${step}</span>`;
      });
      return `<div class="pg-palette"><span class="pg-palette__name">${palette}</span><div class="pg-palette__strip">${cells.join('')}</div></div>`;
    })
    .join('');
}

// --- Typography, spacing, shape -------------------------------------------

const SPECIMENS = [
  ['display', 'uoa-display', 'Εθνικό και Καποδιστριακό'],
  ['heading-1', 'h1', 'Σχολές και Τμήματα'],
  ['heading-2', 'h2', 'Προπτυχιακές σπουδές'],
  ['heading-3', 'h3', 'Τμήμα Φυσικής — Department of Physics'],
  ['heading-4', 'h4', 'Ανακοινώσεις φοιτητών'],
  ['heading-5', 'h5', 'Πρόγραμμα εξεταστικής περιόδου'],
  ['heading-6', 'h6', 'Ώρες γραφείου · Office hours'],
  ['body-lg', 'uoa-lead', 'Κείμενο εισαγωγής για σελίδες και ενότητες.'],
  ['body-md', 'p', 'Κύριο κείμενο — Open Sans 16px, ύψος γραμμής 1.5.'],
  ['body-sm', 'small', 'Μικρό κείμενο για βοηθητικές πληροφορίες.'],
];

function renderTypography() {
  $('specimens').innerHTML = SPECIMENS
    .map(([token, el, text]) => {
      const tag = el.startsWith('h') ? el : 'p';
      const cls = el.startsWith('uoa-') ? el : '';
      const style = el === 'small' ? 'font-size: var(--uoa-font-size-body-sm)' : '';
      return `
        <div class="pg-specimen">
          <div class="pg-specimen__meta"><strong>${token}</strong><span data-size="${token}"></span></div>
          <${tag} class="pg-specimen__sample ${cls}" style="${style}">${text}</${tag}>
        </div>`;
    })
    .join('');
  updateSpecimenSizes();

  $('weights').innerHTML = [300, 400, 600, 700, 800]
    .map((w) => `<p style="font-weight: ${w}">Ελληνικά και English <small>${w}</small></p>`)
    .join('');
}

// Show the rendered px size, which changes with the viewport for fluid sizes.
function updateSpecimenSizes() {
  for (const meta of document.querySelectorAll('[data-size]')) {
    const sample = meta.closest('.pg-specimen').querySelector('.pg-specimen__sample');
    meta.textContent = `${Math.round(parseFloat(getComputedStyle(sample).fontSize))}px`;
  }
}

function renderSpacing() {
  const steps = ['1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24'];
  $('spacing-scale').innerHTML = steps
    .map((n) => `
      <div class="pg-scale__row">
        <code>space-${n}</code>
        <span>${n * 4}px</span>
        <span class="pg-scale__bar" style="width: var(--uoa-space-${n})"></span>
      </div>`)
    .join('');
}

function renderShape() {
  $('shape-tiles').innerHTML = [
    ...['none', 'sm', 'md', 'lg', 'xl', 'pill'].map((r) => `<div class="pg-tile" style="border-radius: var(--uoa-radius-${r})">radius-${r}</div>`),
    ...['sm', 'md', 'lg'].map((s) => `<div class="pg-tile" style="border: 0; border-radius: var(--uoa-radius-surface); box-shadow: var(--uoa-shadow-${s})">shadow-${s}</div>`),
  ].join('');
}

// --- Code panels ------------------------------------------------------------

function dedent(html) {
  const lines = html.replace(/^\n+|\s+$/g, '').split('\n');
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return lines.map((l) => l.slice(indent)).join('\n');
}

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function addCodePanels() {
  for (const canvas of document.querySelectorAll('.pg-example__canvas')) {
    const source = dedent(canvas.innerHTML);
    const details = document.createElement('details');
    details.className = 'pg-example__code';
    details.innerHTML = `
      <summary>Show code</summary>
      <div class="pg-code">
        <pre><code>${escapeHtml(source)}</code></pre>
        <button class="uoa-button uoa-button--sm uoa-button--secondary" type="button">Copy</button>
      </div>`;
    const copy = details.querySelector('button');
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(source);
        copy.textContent = 'Copied';
      } catch {
        copy.textContent = 'Copy failed';
      }
      setTimeout(() => { copy.textContent = 'Copy'; }, 1500);
    });
    canvas.after(details);
  }
}

// --- Navigation -------------------------------------------------------------

function highlightNav() {
  const links = [...document.querySelectorAll('.pg-nav a')];
  const byId = new Map(links.map((a) => [a.hash.slice(1), a]));
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const a of links) a.removeAttribute('aria-current');
      byId.get(entry.target.id)?.setAttribute('aria-current', 'true');
    }
  }, { rootMargin: '-20% 0px -70% 0px' });
  for (const id of byId.keys()) {
    const section = $(id);
    if (section) observer.observe(section);
  }
}

// --- Theme switchers --------------------------------------------------------

// Themes must sit on <html>: semantic variables are resolved at :root.
for (const kind of ['brand', 'accent']) {
  const key = `uoa${kind[0].toUpperCase()}${kind.slice(1)}`;
  const select = $(kind);
  select.addEventListener('change', () => {
    if (select.value) root.dataset[key] = select.value;
    else delete root.dataset[key];
    renderColours();
  });
}

renderColours();
renderTypography();
renderSpacing();
renderShape();
addCodePanels();
highlightNav();
addEventListener('resize', updateSpecimenSizes);
