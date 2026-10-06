// Builds the icon set from src/icons.js and the Iconify Material Symbols data:
//   dist/svg/<name>.svg  one file per icon (inline it: Twig source(), PHP, React)
//   dist/sprite.svg      <symbol id="uoa-icon-<name>"> for <use href="sprite.svg#uoa-icon-<name>">
//   dist/icons.json      { name: { group, body } } for the docs site and adapters
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import groups from '../src/icons.js';

const set = JSON.parse(await readFile(
  fileURLToPath(import.meta.resolve('@iconify-json/material-symbols/icons.json')), 'utf8'));
if (set.width !== 24 || set.height !== 24) throw new Error('Expected a 24×24 icon set');

// Iconify bodies carry fill="currentColor" on each shape; the <svg> sets it instead.
const bodyOf = (name) => {
  const icon = set.icons[name];
  if (!icon) throw new Error(`Unknown icon "${name}" (not in material-symbols, or an alias)`);
  if (icon.width || icon.height || icon.left || icon.top) throw new Error(`"${name}" is not 24×24`);
  return icon.body.replaceAll(' fill="currentColor"', '');
};

const icons = {};
for (const [group, names] of Object.entries(groups)) {
  for (const name of names) {
    if (icons[name]) throw new Error(`"${name}" is listed twice`);
    icons[name] = { group, body: bodyOf(name) };
  }
}

await rm('dist', { recursive: true, force: true });
await mkdir('dist/svg', { recursive: true });

const attrs = 'viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"';
for (const [name, { body }] of Object.entries(icons)) {
  await writeFile(`dist/svg/${name}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" class="uoa-icon" ${attrs}>${body}</svg>\n`);
}

const symbols = Object.entries(icons)
  .map(([name, { body }]) => `<symbol id="uoa-icon-${name}" viewBox="0 0 24 24">${body}</symbol>`);
await writeFile('dist/sprite.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor">\n${symbols.join('\n')}\n</svg>\n`);

await writeFile('dist/icons.json', JSON.stringify(icons, null, 2) + '\n');
await copyFile('LICENSE', 'dist/LICENSE');

console.log(`@uoa/icons built → ${Object.keys(icons).length} icons in dist/svg/, dist/sprite.svg, dist/icons.json`);
