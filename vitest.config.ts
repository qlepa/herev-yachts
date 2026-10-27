/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// Vitest runs inside Astro's Vite config so `astro:content` and friends
// resolve in tests. Layers (docs/testing-strategy.md §3):
//   unit    — logic in src/ and scripts/, no network, runs on every commit
//   dist    — invariants of the built site; needs `pnpm build` first
//   content — live Sanity content health; nightly only, needs a read token
export default getViteConfig(
  {
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            environment: 'node',
            include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
            exclude: ['src/test/dist/**', 'src/test/content/**'],
            globalSetup: ['src/test/globalSetup.ts'],
          },
        },
        {
          extends: true,
          test: {
            name: 'dist',
            environment: 'node',
            include: ['src/test/dist/**/*.test.ts'],
            testTimeout: 60_000,
          },
        },
        {
          extends: true,
          test: {
            name: 'content',
            environment: 'node',
            include: ['src/test/content/**/*.test.ts'],
            testTimeout: 60_000,
          },
        },
      ],
    },
  },
  { logLevel: 'error' },
);
