// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://herev.com',
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Never inline brochure PDFs as data: URIs — they must be real,
      // downloadable files regardless of size.
      assetsInlineLimit: (filePath, content) =>
        filePath.endsWith('.pdf') ? false : content.byteLength < 4096,
    },
  },
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', pl: 'pl', es: 'es', it: 'it' },
      },
      filter: (page) => !page.includes('/404') && !page.includes('/admin'),
    }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pl', 'es', 'it'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
