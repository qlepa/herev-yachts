// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { cmsPreview } from './src/cms/integration';

// CMS deployment (cms.herev.com): Studio + draft preview, see docs/cms-plan.md.
// Production stays a plain static build without an adapter.
// The flag comes from the process env (Vercel) or .env (local) — Astro
// loads .env only after the config is evaluated, so read it here.
const dotenv = existsSync('.env') ? parseEnv(readFileSync('.env', 'utf8')) : {};
const cmsMode = (process.env.SANITY_PREVIEW ?? dotenv.SANITY_PREVIEW) === 'true';

export default defineConfig({
  site: 'https://herev.com',
  ...(cmsMode && { adapter: vercel() }),
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
    ...(cmsMode ? [cmsPreview()] : []),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pl', 'es', 'it'],
    // On the CMS deployment pages render on demand, where Astro's i18n
    // middleware would 404 every path without a locale prefix (/admin).
    // Nothing uses astro:i18n; on-demand pages validate the locale themselves.
    routing: cmsMode ? 'manual' : {
      prefixDefaultLocale: true,
    },
  },
});
