import { readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { basename, join } from 'node:path';
import StyleDictionary from 'style-dictionary';

const BASE = ['src/primitive/**/*.json', 'src/semantic/**/*.json', 'src/component/**/*.json'];
const CSS_DIR = 'dist/css/';
const DOCS_DIR = 'dist/docs/';
const WP_DIR = 'dist/wp/';

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

// WordPress theme.json v3 (ADR 0003). Resolved values only — the block editor rejects
// var() in palette colours — and no transforms, so dimensions stay as authored.
// The list of what the editor gets is deliberate: semantics, not the primitive ramps.
const WP_COLORS = [
  ['brand', 'primary', 'color.brand.primary'],
  ['brand', 'primary-hover', 'color.brand.primary-hover'],
  ['brand', 'link', 'color.brand.link'],
  ['brand', 'accent', 'color.brand.accent'],
  ['text', 'default', 'color.text.default'],
  ['text', 'muted', 'color.text.muted'],
  ['text', 'heading', 'color.text.heading'],
  ['text', 'link', 'color.text.link'],
  ['text', 'link-hover', 'color.text.link-hover'],
  ['text', 'inverse', 'color.text.inverse'],
  ['surface', 'default', 'color.surface.default'],
  ['surface', 'subtle', 'color.surface.subtle'],
  ['surface', 'muted', 'color.surface.muted'],
  ['surface', 'brand', 'color.surface.brand'],
  ['border', 'subtle', 'color.border.subtle'],
  ['border', 'default', 'color.border.default'],
  ['border', 'strong', 'color.border.strong'],
  ['action', 'primary', 'color.action.primary'],
  ['action', 'primary-hover', 'color.action.primary-hover'],
  ['action', 'primary-text', 'color.action.primary-text'],
  ['focus', 'ring', 'color.focus.ring'],
  ['feedback', 'info-text', 'color.feedback.info-text'],
  ['feedback', 'info-surface', 'color.feedback.info-surface'],
  ['feedback', 'success-text', 'color.feedback.success-text'],
  ['feedback', 'success-surface', 'color.feedback.success-surface'],
  ['feedback', 'warning-text', 'color.feedback.warning-text'],
  ['feedback', 'warning-surface', 'color.feedback.warning-surface'],
  ['feedback', 'danger-text', 'color.feedback.danger-text'],
  ['feedback', 'danger-surface', 'color.feedback.danger-surface'],
];

const WP_SPACING = [
  ['0', 'space.0'], ['1', 'space.1'], ['2', 'space.2'], ['3', 'space.3'], ['4', 'space.4'],
  ['5', 'space.5'], ['6', 'space.6'], ['8', 'space.8'], ['10', 'space.10'], ['12', 'space.12'],
  ['16', 'space.16'], ['20', 'space.20'], ['24', 'space.24'],
];

const WP_FONT_SIZES = [
  ['100', 'font.size.100'], ['200', 'font.size.200'], ['300', 'font.size.300'],
  ['400', 'font.size.400'], ['500', 'font.size.500'], ['600', 'font.size.600'],
  ['700', 'font.size.700'], ['800', 'font.size.800'], ['900', 'font.size.900'],
];

const WP_FONT_FAMILIES = [
  ['body', 'font.family.body'], ['heading', 'font.family.heading'],
  ['display', 'font.family.display'], ['code', 'font.family.code'],
];

StyleDictionary.registerFormat({
  name: 'uoa/wp-theme-json',
  format: ({ dictionary }) => {
    const at = (path) => {
      const token = dictionary.allTokens.find((t) => t.path.join('.') === path);
      if (!token) throw new Error(`theme.json: no token at ${path}`);
      return token.$value;
    };
    return JSON.stringify({
      $schema: 'https://schemas.wp.org/trunk/theme.json',
      version: 3,
      settings: {
        // Matches the core's container tokens so the editor's wide/full width match the front end.
        layout: { contentSize: at('container.narrow'), wideSize: at('container.max') },
        color: {
          custom: false,
          customDuotone: false,
          palette: WP_COLORS.map(([group, step, path]) => ({
            slug: `${group}-${step}`, name: `${group}-${step}`, color: at(path),
          })),
        },
        typography: {
          fontSizes: WP_FONT_SIZES.map(([slug, path]) => ({ slug, name: slug, size: at(path) })),
          fontFamilies: WP_FONT_FAMILIES.map(([slug, path]) => ({
            slug, name: slug, fontFamily: at(path).join(', '),
          })),
        },
        spacing: {
          units: ['px', 'rem', '%', 'vw'],
          spacingScale: {
            // 0 = the sizes below are used as authored, not multiplied by a ratio.
            steps: 0,
            spacingSizes: WP_SPACING.map(([slug, path]) => ({ slug, name: slug, size: at(path) })),
          },
        },
        border: { color: true, radius: true, style: true, width: true },
      },
    }, null, 2);
  },
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
    // theme.json for the WordPress block theme (ADR 0003). No transformGroup on purpose.
    wp: {
      buildPath: WP_DIR,
      files: [{ destination: 'theme.json', format: 'uoa/wp-theme-json' }],
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
