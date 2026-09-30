import { readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { basename, join } from 'node:path';
import StyleDictionary from 'style-dictionary';

const BASE = ['src/primitive/**/*.json', 'src/semantic/**/*.json', 'src/component/**/*.json'];
const CSS_DIR = 'dist/css/';

await rm('dist', { recursive: true, force: true });

// Base tokens: :root CSS, SCSS, JS.
await new StyleDictionary({
  source: BASE,
  usesDtcg: true,
  log: { verbosity: 'silent' },
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: 'uoa',
      buildPath: CSS_DIR,
      files: [{
        destination: 'base.css',
        format: 'css/variables',
        options: { outputReferences: true },
      }],
    },
    scss: {
      transformGroup: 'scss',
      prefix: 'uoa',
      buildPath: 'dist/scss/',
      files: [{ destination: '_tokens.scss', format: 'scss/variables' }],
    },
    js: {
      transformGroup: 'js',
      buildPath: 'dist/js/',
      files: [
        { destination: 'tokens.js', format: 'javascript/es6' },
        { destination: 'tokens.d.ts', format: 'typescript/es6-declarations' },
      ],
    },
  },
}).buildAllPlatforms();

// Themes: src/themes/<kind>/<name>.json → [data-uoa-<kind>="<name>"] { … }
// Only the theme's own tokens are output; references resolve to :root variables.
const themeFiles = [];
for (const kind of await readdir('src/themes')) {
  for (const file of await readdir(join('src/themes', kind))) {
    const name = basename(file, '.json');
    const source = join('src/themes', kind, file);
    const destination = `themes/${kind}-${name}.css`;
    await new StyleDictionary({
      source: [...BASE, source],
      usesDtcg: true,
      log: { verbosity: 'silent', warnings: 'disabled' },
      platforms: {
        css: {
          transformGroup: 'css',
          prefix: 'uoa',
          buildPath: CSS_DIR,
          files: [{
            destination,
            format: 'css/variables',
            filter: (token) => token.filePath === source,
            options: { outputReferences: true, selector: `[data-uoa-${kind}="${name}"]` },
          }],
        },
      },
    }).buildAllPlatforms();
    themeFiles.push(destination);
  }
}

// tokens.css = base + every theme, so consumers need a single import.
const parts = await Promise.all(['base.css', ...themeFiles].map((f) => readFile(CSS_DIR + f, 'utf8')));
await writeFile(CSS_DIR + 'tokens.css', parts.join('\n'));

console.log(`@uoa/tokens built: base + ${themeFiles.length} themes → ${CSS_DIR}tokens.css`);
