// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// DOCS_SITE / DOCS_BASE let CI deploy to GitHub Pages (e.g. base "/design-system-uoa").
export default defineConfig({
  site: process.env.DOCS_SITE,
  base: process.env.DOCS_BASE ?? '/',
  integrations: [
    starlight({
      title: 'UOA Design System',
      description: 'Tokens, base styles and components for NKUA websites.',
      favicon: '/favicon.svg',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/UniversityOfAthens/design-system-uoa' },
      ],
      customCss: [
        '@uoa/core/fonts.css',
        '@uoa/tokens/css',
        './src/styles/docs.css',
      ],
      components: {
        SiteTitle: './src/components/SiteTitle.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
      },
      sidebar: [
        { label: 'Getting started', slug: 'getting-started' },
        { label: 'Foundations', items: [{ autogenerate: { directory: 'foundations' } }] },
        { label: 'Components', items: [{ autogenerate: { directory: 'components' } }] },
        { label: 'Examples', items: [{ autogenerate: { directory: 'examples' } }] },
      ],
    }),
  ],
});
