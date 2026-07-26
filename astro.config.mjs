// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pl', 'es', 'it'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
