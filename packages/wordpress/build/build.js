// Copies the generated design-system artefacts into the WordPress packages, so the
// theme and the plugin are self-contained when zipped and installed (ADR 0003).
// Nothing here transforms: `@uoa/core` and `@uoa/tokens` stay the single source.
import { cp, mkdir, rm } from 'node:fs/promises';

const CORE = '../core/dist';
const TOKENS = '../tokens/dist/wp';

// Plugin: @uoa/core's CSS and web fonts, served from the plugin so blocks keep their
// styles even when a site switches theme.
const assets = 'uoa-ds-blocks/assets/uoa';
await rm('uoa-ds-blocks/assets', { recursive: true, force: true });
await mkdir(assets, { recursive: true });
await cp(`${CORE}/uoa.css`, `${assets}/uoa.css`);
await cp(`${CORE}/fonts`, `${assets}/fonts`, { recursive: true });

// Theme: theme.json generated from the tokens. Never hand-edit uoa-ds/theme.json.
await cp(`${TOKENS}/theme.json`, 'uoa-ds/theme.json');

console.log('@uoa/wordpress built → uoa-ds/theme.json, uoa-ds-blocks/assets/uoa/');