import { describe, expect, test } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Rules from CLAUDE.md that no compiler enforces (docs/testing-strategy.md
 * §3 L0). Plain file scans — no linter dependency.
 */
const ROOT = path.resolve(import.meta.dirname, '../..');

function files(dir: string, exts: string[]): string[] {
  return readdirSync(path.join(ROOT, dir), { recursive: true, encoding: 'utf8' })
    .filter((f) => exts.some((e) => f.endsWith(e)))
    .map((f) => path.join(dir, f).split(path.sep).join('/'));
}
const read = (file: string) => readFileSync(path.join(ROOT, file), 'utf8');
/** Runtime imports only — `import type` never reaches a bundle. */
const importSpecifiers = (source: string) =>
  [...source.matchAll(/(?:^|\n)\s*(?:import|export)\b(?!\s+type\b)[^'"]*?from\s*['"]([^'"]+)['"]|(?:^|\n)\s*import\s*['"]([^'"]+)['"]/g)].map(
    (m) => m[1] ?? m[2],
  );

describe('import boundaries', () => {
  test('src/lib/server is never imported by code that can reach the client bundle', () => {
    const clientSide = [
      ...files('src/components', ['.astro', '.ts', '.tsx']),
      ...files('src/islands', ['.ts', '.tsx']),
      ...files('src/layouts', ['.astro']),
      ...files('src/lib', ['.ts']).filter((f) => !f.startsWith('src/lib/server/') && !f.endsWith('.test.ts')),
    ];
    const offenders = clientSide.filter((f) => importSpecifiers(read(f)).some((s) => /(^|\/)lib\/server(\/|$)/.test(s)));
    expect(offenders).toEqual([]);
  });

  test('client:* directives render islands from src/islands only', () => {
    const offenders: string[] = [];
    for (const f of files('src', ['.astro'])) {
      const src = read(f);
      const islandImports = new Set(
        [...src.matchAll(/import\s+(\w+)\s+from\s*['"]([^'"]+)['"]/g)].filter((m) => /\/islands\//.test(m[2])).map((m) => m[1]),
      );
      for (const m of src.matchAll(/<([A-Z]\w*)[^>]*\sclient:(\w+)/g)) {
        if (!islandImports.has(m[1])) offenders.push(`${f}: <${m[1]} client:${m[2]}>`);
      }
    }
    expect(offenders).toEqual([]);
  });

  test('src/cms (Studio, draft mode) is referenced only by the integration and astro.config', () => {
    const offenders = files('src', ['.astro', '.ts', '.tsx'])
      .filter((f) => !f.startsWith('src/cms/'))
      .filter((f) => importSpecifiers(read(f)).some((s) => /(^|\/)cms\/(integration|routes|visual-editing)/.test(s)));
    expect(offenders).toEqual([]);
  });
});

describe('contracts', () => {
  test('pipedriveOptionLabel is passed through untouched — no trim/case/normalize', () => {
    const offenders: string[] = [];
    for (const f of files('src', ['.astro', '.ts', '.tsx']).filter((f) => !f.endsWith('.test.ts'))) {
      for (const line of read(f).split('\n')) {
        if (/pipedriveOptionLabel\s*\??\.\s*(trim|toLowerCase|toUpperCase|normalize|replace)\(/.test(line)) offenders.push(`${f}: ${line.trim()}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  test('every env variable the code reads is documented in .env.example', () => {
    const documented = new Set(
      read('.env.example')
        .split('\n')
        .map((l) => l.match(/^([A-Z][A-Z0-9_]+)=/)?.[1])
        .filter((v): v is string => Boolean(v)),
    );
    const builtIn = new Set(['PROD', 'DEV', 'MODE', 'SSR', 'BASE_URL', 'SITE', 'ASSETS_PREFIX', 'NODE_ENV', 'CI']);
    const used = new Map<string, string>();
    const sources = [
      ...files('src', ['.astro', '.ts', '.tsx']).filter((f) => !f.endsWith('.test.ts') && !f.startsWith('src/test/')),
      'astro.config.mjs',
    ];
    for (const f of sources) {
      for (const m of read(f).matchAll(/(?:import\.meta\.env|process\.env|\benv|\bdotenv)\.([A-Z][A-Z0-9_]+)\b/g)) {
        if (!builtIn.has(m[1])) used.set(m[1], f);
      }
    }
    const undocumented = [...used].filter(([name]) => !documented.has(name)).map(([name, f]) => `${name} (${f})`);
    expect(undocumented).toEqual([]);
  });

  test('no TODO/FIXME left behind in src/ (leftovers go to the trackers in docs/)', () => {
    const offenders: string[] = [];
    for (const f of files('src', ['.astro', '.ts', '.tsx']).filter((f) => !f.endsWith('.test.ts'))) {
      read(f).split('\n').forEach((line, i) => {
        if (/\b(TODO|FIXME|HACK|XXX)\b/.test(line)) offenders.push(`${f}:${i + 1}`);
      });
    }
    expect(offenders).toEqual([]);
  });
});
