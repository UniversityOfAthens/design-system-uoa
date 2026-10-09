// Flattens src/uoa.css into dist/uoa.css and copies the fonts to dist/fonts/.
// Also splits it in two for hosts that own one half each (the WordPress theme and plugin):
//   dist/uoa-base.css        tokens + reset, base, layout, utilities — restyles the whole page
//   dist/uoa-components.css  tokens + components only — class-scoped, safe on any site
// Both repeat the @layer order statement, so loading both equals loading uoa.css.
//   dist/uoa-components-unlayered.css  the same components without @layer, for hosts whose own
//     CSS is unlayered (WordPress themes and global styles). Unlayered rules beat every layered
//     one regardless of specificity, so a theme's `a:where(…) { color }` would otherwise repaint
//     .uoa-button; unlayered, the component's class selectors win on specificity as intended.
// Hand-rolled because Bun's CSS bundler moves the `@layer` order statement to the
// end of the file, which changes which layer wins.
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ENTRY = 'src/uoa.css';
const IMPORT = /^@import\s+"([^"]+)"(?:\s+layer\(([\w.-]+)\))?\s*;\s*$/;

const resolveImport = (spec, from) =>
  spec.startsWith('.') ? resolve(dirname(from), spec) : fileURLToPath(import.meta.resolve(spec));

const out = [];
const base = [];
const components = [];
const unlayered = [];
const entry = await readFile(ENTRY, 'utf8');
for (const line of entry.replace(/\/\*[\s\S]*?\*\//g, '').split('\n')) {
  if (!line.trim()) continue;
  const match = line.match(IMPORT);
  if (!match) {
    if (!line.startsWith('@layer ')) throw new Error(`${ENTRY}: unsupported line: ${line}`);
    out.push(line);
    base.push(line);
    components.push(line);
    continue;
  }
  const [, spec, layer] = match;
  const css = (await readFile(resolveImport(spec, resolve(ENTRY)), 'utf8')).trim();
  if (/^\s*@import/m.test(css)) throw new Error(`${spec}: nested @import is not supported`);
  const block = `/* ${spec} */\n` + (layer ? `@layer ${layer} {\n${css}\n}` : css);
  out.push(block);
  // Unlayered imports are the tokens (custom properties only): both halves need them.
  if (layer !== 'uoa.components') base.push(block);
  if (!layer || layer === 'uoa.components') {
    components.push(block);
    unlayered.push(`/* ${spec} */\n${css}`);
  }
}

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await writeFile('dist/uoa.css', out.join('\n\n') + '\n');
await writeFile('dist/uoa-base.css', base.join('\n\n') + '\n');
await writeFile('dist/uoa-components.css', components.join('\n\n') + '\n');
await writeFile('dist/uoa-components-unlayered.css', unlayered.join('\n\n') + '\n');

// JS: copy the entry + component modules verbatim (no bundling for the spike;
// adapters and <script type="module"> import dist/uoa.js directly).
await mkdir('dist/components/accordion', { recursive: true });
await mkdir('dist/components/alert', { recursive: true });
await mkdir('dist/components/tabs', { recursive: true });
await cp('src/uoa.js', 'dist/uoa.js');
await cp('src/components/accordion/accordion.js', 'dist/components/accordion/accordion.js');
await cp('src/components/alert/alert.js', 'dist/components/alert/alert.js');
await cp('src/components/tabs/tabs.js', 'dist/components/tabs/tabs.js');

// Fonts: copy the whole folder so fonts.css keeps its relative urls.
const fontsDir = dirname(fileURLToPath(import.meta.resolve('@uoa/tokens/fonts.css')));
await cp(fontsDir, 'dist/fonts', { recursive: true, filter: (src) => !src.endsWith('.md') });

console.log('@uoa/core built → dist/uoa{,-base,-components,-components-unlayered}.css, dist/uoa.js, dist/fonts/');
