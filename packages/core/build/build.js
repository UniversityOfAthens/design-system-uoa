// Flattens src/uoa.css into dist/uoa.css and copies the fonts to dist/fonts/.
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
const entry = await readFile(ENTRY, 'utf8');
for (const line of entry.replace(/\/\*[\s\S]*?\*\//g, '').split('\n')) {
  if (!line.trim()) continue;
  const match = line.match(IMPORT);
  if (!match) {
    if (!line.startsWith('@layer ')) throw new Error(`${ENTRY}: unsupported line: ${line}`);
    out.push(line);
    continue;
  }
  const [, spec, layer] = match;
  const css = (await readFile(resolveImport(spec, resolve(ENTRY)), 'utf8')).trim();
  if (/^\s*@import/m.test(css)) throw new Error(`${spec}: nested @import is not supported`);
  out.push(`/* ${spec} */\n` + (layer ? `@layer ${layer} {\n${css}\n}` : css));
}

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await writeFile('dist/uoa.css', out.join('\n\n') + '\n');

// Fonts: copy the whole folder so fonts.css keeps its relative urls.
const fontsDir = dirname(fileURLToPath(import.meta.resolve('@uoa/tokens/fonts.css')));
await cp(fontsDir, 'dist/fonts', { recursive: true, filter: (src) => !src.endsWith('.md') });

console.log('@uoa/core built → dist/uoa.css, dist/fonts/');
