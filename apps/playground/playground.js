// Lists every --uoa-color-* variable found in the loaded stylesheets, shows its
// resolved value and contrast against white, and wires the theme switchers.

const root = document.documentElement;

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

// Semantic tokens are the ones whose names are not primitive palettes.
const PRIMITIVE = /^--uoa-color-(uoa|burgundy|teal|accent|grey|green|amber|red|blue)-/;

function toRgb(value) {
  const probe = document.createElement('div');
  probe.style.color = value;
  document.body.append(probe);
  const [r, g, b] = getComputedStyle(probe).color.match(/\d+(\.\d+)?/g).map(Number);
  probe.remove();
  return [r, g, b];
}

function luminance([r, g, b]) {
  const [R, G, B] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

const contrastOnWhite = (rgb) => 1.05 / (luminance(rgb) + 0.05);
const hex = (rgb) => '#' + rgb.map((c) => c.toString(16).padStart(2, '0')).join('');

function renderSwatches(container, names) {
  container.replaceChildren(...names.map((name) => {
    const rgb = toRgb(`var(${name})`);
    const ratio = contrastOnWhite(rgb);
    const verdict = ratio >= 4.5 ? ['pg-pass', 'AA text'] : ratio >= 3 ? ['pg-pass', 'UI only'] : ['pg-fail', 'decorative'];
    const el = document.createElement('div');
    el.className = 'pg-swatch';
    el.innerHTML = `
      <div class="pg-swatch__chip" style="background: var(${name})"></div>
      <div class="pg-swatch__meta">
        <code>${name.replace('--uoa-color-', '')}</code>
        <span>${hex(rgb)} · ${ratio.toFixed(2)}:1 <span class="${verdict[0]}">${verdict[1]}</span></span>
      </div>`;
    return el;
  }));
}

function render() {
  const all = colorVars();
  renderSwatches(document.getElementById('semantic'), all.filter((n) => !PRIMITIVE.test(n)));
  renderSwatches(document.getElementById('primitive'), all.filter((n) => PRIMITIVE.test(n)));
}

document.getElementById('weights').innerHTML = [300, 400, 600, 700, 800]
  .map((w) => `<span style="font-weight:${w}">Open Sans ${w} — Ελληνικά και English <small>(${w})</small></span>`)
  .join('');

// Themes must sit on <html>: semantic variables are resolved at :root.
for (const kind of ['brand', 'accent']) {
  const select = document.getElementById(kind);
  select.addEventListener('change', () => {
    if (select.value) root.dataset[`uoa${kind[0].toUpperCase()}${kind.slice(1)}`] = select.value;
    else delete root.dataset[`uoa${kind[0].toUpperCase()}${kind.slice(1)}`];
    render();
  });
}

render();
