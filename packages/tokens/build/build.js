import { readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { basename, join } from 'node:path';
import StyleDictionary from 'style-dictionary';

const BASE = ['src/primitive/**/*.json', 'src/semantic/**/*.json', 'src/component/**/*.json'];
const CSS_DIR = 'dist/css/';
const DOCS_DIR = 'dist/docs/';

// Flat token list for the docs site: CSS name, resolved value, raw reference, tier.
StyleDictionary.registerFormat({
  name: 'uoa/docs-json',
  format: ({ dictionary }) => JSON.stringify(dictionary.allTokens.map((token) => ({
    name: `--${token.name}`,
    path: token.path,
    type: token.$type,
    value: token.$value,
    ref: typeof token.original.$value === 'string' && token.original.$value.startsWith('{') ? token.original.$value : undefined,
    description: token.$description,
    tier: token.filePath.split('/')[1],
  })), null, 2),
});

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
    docs: {
      transformGroup: 'css',
      prefix: 'uoa',
      buildPath: DOCS_DIR,
      files: [{ destination: 'base.json', format: 'uoa/docs-json' }],
    },
  },
}).buildAllPlatforms();

// Themes: src/themes/<kind>/<name>.json → [data-uoa-<kind>="<name>"] { … }
// Only the theme's own tokens are output; references resolve to :root variables.
const themeFiles = [];
const themes = [];
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
        docs: {
          transformGroup: 'css',
          prefix: 'uoa',
          buildPath: DOCS_DIR,
          files: [{
            destination: `themes/${kind}-${name}.json`,
            format: 'uoa/docs-json',
            filter: (token) => token.filePath === source,
          }],
        },
      },
    }).buildAllPlatforms();
    themeFiles.push(destination);
    themes.push({ kind, name });
  }
}

// tokens.css = base + every theme, so consumers need a single import.
const parts = await Promise.all(['base.css', ...themeFiles].map((f) => readFile(CSS_DIR + f, 'utf8')));
await writeFile(CSS_DIR + 'tokens.css', parts.join('\n'));

// docs/tokens.json = { tokens, themes: [{ kind, name, attribute, tokens }] }
const readJson = async (f) => JSON.parse(await readFile(DOCS_DIR + f, 'utf8'));
await writeFile(DOCS_DIR + 'tokens.json', JSON.stringify({
  tokens: await readJson('base.json'),
  themes: await Promise.all(themes.map(async ({ kind, name }) => ({
    kind,
    name,
    attribute: `data-uoa-${kind}="${name}"`,
    tokens: await readJson(`themes/${kind}-${name}.json`),
  }))),
}, null, 2));

console.log(`@uoa/tokens built: base + ${themeFiles.length} themes → ${CSS_DIR}tokens.css`);
