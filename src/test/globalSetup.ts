import { execFileSync } from 'node:child_process';
import { copyFile, mkdir } from 'node:fs/promises';

/**
 * Makes `astro:content` work inside Vitest. `astro sync` writes the content
 * data store to the cache dir (`node_modules/.astro/`), but Vite runs tests
 * in "serve" mode, where Astro reads it from `.astro/` — so sync, then copy.
 */
export default async function setup() {
  execFileSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'sync'], { stdio: 'ignore' });
  await mkdir('.astro', { recursive: true });
  await copyFile('node_modules/.astro/data-store.json', '.astro/data-store.json');
}
