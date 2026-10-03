import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

// Our own UI strings, translated in src/content/i18n/{el,en}.yml.
const uoaStrings = z.object({
  'uoa.siteTitle': z.string(),
  'uoa.nav.label': z.string(),
  'uoa.nav.getStarted': z.string(),
  'uoa.nav.foundations': z.string(),
  'uoa.nav.components': z.string(),
  'uoa.nav.examples': z.string(),
  'uoa.language.switch': z.string(),
  'uoa.language.switchLabel': z.string(),
  'uoa.theme.button': z.string(),
  'uoa.theme.brand': z.string(),
  'uoa.theme.accent': z.string(),
  'uoa.theme.accentDefault': z.string(),
  'uoa.theme.darkMode': z.string(),
  'uoa.theme.toggleDarkMode': z.string(),
  'uoa.example.default': z.string(),
  'uoa.example.view': z.string(),
  'uoa.example.preview': z.string(),
  'uoa.example.code': z.string(),
  'uoa.contrast.onWhite': z.string(),
  'uoa.contrast.decorative': z.string(),
  'uoa.table.token': z.string(),
  'uoa.table.value': z.string(),
  'uoa.table.notes': z.string(),
  'uoa.table.attribute': z.string(),
  'uoa.table.sets': z.string(),
}).partial();

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema({ extend: uoaStrings }) }),
};
