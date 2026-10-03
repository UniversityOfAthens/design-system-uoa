// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// DOCS_SITE / DOCS_BASE let CI deploy to GitHub Pages (e.g. base "/design-system-uoa").
export default defineConfig({
  site: process.env.DOCS_SITE,
  base: process.env.DOCS_BASE ?? '/',
  integrations: [
    starlight({
      title: { el: 'Σύστημα σχεδίασης ΕΚΠΑ', en: 'UOA Design System' },
      description: 'Tokens, base styles and components for NKUA websites.',
      // Greek at the root like www.uoa.gr, English under /en/. Pages live in
      // src/content/docs/ (Greek) and src/content/docs/en/; UI strings in src/content/i18n/.
      defaultLocale: 'root',
      locales: {
        root: { label: 'Ελληνικά', lang: 'el' },
        en: { label: 'English', lang: 'en' },
      },
      favicon: '/favicon.svg',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/UniversityOfAthens/design-system-uoa' },
      ],
      customCss: [
        '@uoa/core/fonts.css',
        '@uoa/tokens/css',
        './src/styles/theme.css',
        './src/styles/chrome.css',
        './src/styles/content.css',
        './src/styles/home.css',
        './src/styles/token-docs.css',
      ],
      components: {
        Header: './src/components/Header.astro',
        PageTitle: './src/components/PageTitle.astro',
        Search: './src/components/Search.astro',
        SiteTitle: './src/components/SiteTitle.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
      },
      sidebar: [
        { label: 'Ξεκινήστε', translations: { en: 'Getting started' }, slug: 'getting-started' },
        { label: 'Θεμέλια', translations: { en: 'Foundations' }, items: [{ autogenerate: { directory: 'foundations' } }] },
        { label: 'Στοιχεία', translations: { en: 'Components' }, items: [{ autogenerate: { directory: 'components' } }] },
        { label: 'Παραδείγματα', translations: { en: 'Examples' }, items: [{ autogenerate: { directory: 'examples' } }] },
      ],
    }),
  ],
});
