// Copies the generated design-system artefacts into the WordPress theme and plugin, so
// each is self-contained when zipped and installed (ADR 0003). Nothing here
// transforms: @uoa/core, @uoa/tokens and @uoa/icons stay the single source.
import { cp, mkdir, rm } from 'node:fs/promises';

const CORE = '../core/dist';
const TOKENS = '../tokens/dist/wp';
const ICONS = '../icons/dist';

// Shared by both: the fonts and the generated theme.json.
async function common(assets) {
  await rm(assets, { recursive: true, force: true });
  await mkdir(assets, { recursive: true });
  await cp(`${CORE}/fonts`, `${assets}/fonts`, { recursive: true });
  await cp(`${TOKENS}/theme.json`, `${assets}/theme.json`);
}

// Plugin (uoa-blocks): the component half of the CSS, the behaviour modules and the
// icon set. Works on any theme; theme.json reaches the editor through a filter.
const plugin = 'uoa-blocks/assets/uoa';
await common(plugin);
// Unlayered: WordPress themes and global styles are unlayered and would beat any layer.
await cp(`${CORE}/uoa-components-unlayered.css`, `${plugin}/uoa-components.css`);
await cp(`${CORE}/components`, `${plugin}/components`, { recursive: true });
await cp(`${ICONS}/icons.json`, `${plugin}/icons.json`);

// Theme (uoa): the page-level half of the CSS. Its theme.json sits at the theme root,
// where WordPress reads it. Never hand-edit either copy.
const theme = 'uoa/assets/uoa';
await common(theme);
await cp(`${CORE}/uoa-base.css`, `${theme}/uoa-base.css`);
await cp(`${TOKENS}/theme.json`, 'uoa/theme.json');

console.log('@uoa/wordpress built → uoa-blocks/assets/uoa/, uoa/assets/uoa/, uoa/theme.json');
