import { afterEach, describe, expect, test } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { compareDist, normalize, report } from './compare-dist';

describe('normalize', () => {
  test('hashed asset names and island uids are ignored, everything else counts', () => {
    const a = '<img src="/_astro/hero.CRin7Pae_Z2eGyCu.webp"><astro-island uid="Z2eCeHC" props="{}">';
    const b = '<img src="/_astro/hero.DIFFERENT_1.webp"><astro-island uid="other" props="{}">';
    expect(normalize(a)).toBe(normalize(b));
    expect(normalize('<p>€604,652</p>')).not.toBe(normalize('<p>€604,653</p>'));
  });
});

describe('compareDist', () => {
  const dirs: string[] = [];
  const build = (files: Record<string, string>) => {
    const dir = mkdtempSync(path.join(tmpdir(), 'herev-dist-'));
    dirs.push(dir);
    for (const [file, html] of Object.entries(files)) {
      mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
      writeFileSync(path.join(dir, file), html);
    }
    return dir;
  };
  afterEach(() => {
    for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
  });

  test('identical builds (modulo hashes) → zero differences', () => {
    const before = build({ 'en/index.html': '<a href="/_astro/a.1.js">x</a>', 'pl/index.html': '<p>pl</p>' });
    const after = build({ 'en/index.html': '<a href="/_astro/a.2.js">x</a>', 'pl/index.html': '<p>pl</p>' });
    const result = compareDist(before, after);
    expect(result).toEqual({ pagesBefore: 2, pagesAfter: 2, differences: [] });
    expect(report(result)).toBe('2 pages before, 2 after, 0 differences');
  });

  test('missing, new and changed pages are each reported once, with the first differing fragment', () => {
    const before = build({ 'en/index.html': '<h1>Hello</h1>', 'en/old/index.html': '<p>old</p>' });
    const after = build({ 'en/index.html': '<h1>Hallo</h1>', 'en/new/index.html': '<p>new</p>' });
    const { differences } = compareDist(before, after);
    expect(differences).toHaveLength(3);
    expect(differences).toContain('missing after: en/old/index.html');
    expect(differences).toContain('new after: en/new/index.html');
    const changed = differences.find((d) => d.startsWith('changed: en/index.html'))!;
    expect(changed).toContain('before: …<h1>Hello</h1>…');
    expect(changed).toContain('after:  …<h1>Hallo</h1>…');
  });

  test('non-HTML files are not compared', () => {
    const before = build({ 'en/index.html': '<p>x</p>', 'sitemap-0.xml': '<a/>' });
    const after = build({ 'en/index.html': '<p>x</p>', 'sitemap-0.xml': '<b/>' });
    expect(compareDist(before, after).differences).toEqual([]);
  });
});
