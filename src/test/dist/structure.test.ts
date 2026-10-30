import { describe, expect, test } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { LOCALES } from '../../lib/i18n';
import type { HTMLElement } from 'node-html-parser';
import { DIST, SITE, buildEnv, is404, isBlog, isBlogPost, pages, routes, type Page } from './pages';

/**
 * Structure, i18n and SEO contract of the production build
 * (docs/testing-strategy.md §3 L3). Every page is a real page: no language
 * fallback, no redirect stubs, every hreflang resolves to a file on disk.
 */

const head = (dom: HTMLElement, selector: string) => dom.querySelector(selector);

describe('pages', () => {
  test('every page is rendered — never a redirect stub (a missing entry must 404 at build time)', () => {
    const stubs = pages()
      .filter((p) => p.dom.querySelector('meta[http-equiv="refresh"]'))
      .map((p) => p.route);
    expect(stubs).toEqual([]);
  });

  test('html[lang] matches the locale in the path', () => {
    const wrong = pages()
      .filter((p) => p.dom.querySelector('html')?.getAttribute('lang') !== p.lang)
      .map((p) => p.route);
    expect(wrong).toEqual([]);
  });

  test('/admin, draft-mode routes and /api never land in the static output', () => {
    expect(existsSync(path.join(DIST, 'admin'))).toBe(false);
    expect(existsSync(path.join(DIST, 'api'))).toBe(false);
    const draft = pages().filter((p) => /draft-mode/.test(p.route)).map((p) => p.route);
    expect(draft).toEqual([]);
  });

  test('the 404 page exists in every locale and nowhere else', () => {
    expect(pages().filter(is404).map((p) => p.lang).sort()).toEqual([...LOCALES].sort());
  });
});

describe('canonical and hreflang', () => {
  test('exactly one canonical equal to the page URL; og:url equals canonical', () => {
    const bad: string[] = [];
    for (const p of pages()) {
      const canonicals = p.dom.querySelectorAll('link[rel="canonical"]').map((l) => l.getAttribute('href'));
      const ogUrl = head(p.dom, 'meta[property="og:url"]')?.getAttribute('content');
      if (canonicals.length !== 1 || canonicals[0] !== SITE + p.route || ogUrl !== canonicals[0]) {
        bad.push(`${p.route}: canonical=${canonicals.join(',')} og:url=${ogUrl}`);
      }
    }
    expect(bad).toEqual([]);
  });

  test('every hreflang points to a page that exists in the build (no fallback to a missing locale)', () => {
    const existing = routes();
    const bad: string[] = [];
    for (const p of pages()) {
      for (const link of p.dom.querySelectorAll('link[rel="alternate"][hreflang]')) {
        const href = link.getAttribute('href') ?? '';
        if (!href.startsWith(SITE + '/') || !existing.has(href.slice(SITE.length))) {
          bad.push(`${p.route} → ${link.getAttribute('hreflang')} ${href}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  test('hreflang sets are symmetric, include the page itself and have x-default = the English version', () => {
    const byRoute = new Map(pages().map((p) => [p.route, p]));
    const alternatesOf = (p: Page) =>
      new Map(
        p.dom
          .querySelectorAll('link[rel="alternate"][hreflang]')
          .map((l) => [l.getAttribute('hreflang')!, (l.getAttribute('href') ?? '').slice(SITE.length)] as const),
      );
    const bad: string[] = [];
    for (const p of pages()) {
      if (is404(p)) continue;
      const alts = alternatesOf(p);
      if (alts.get(p.lang) !== p.route) bad.push(`${p.route}: no self alternate (${alts.get(p.lang)})`);
      const xDefault = alts.get('x-default');
      const expectedDefault = alts.get('en') ?? '/en/';
      if (xDefault !== expectedDefault) bad.push(`${p.route}: x-default=${xDefault}, expected ${expectedDefault}`);
      for (const [lang, route] of alts) {
        if (lang === 'x-default') continue;
        const other = byRoute.get(route);
        if (!other) continue; // reported by the test above
        const back = alternatesOf(other);
        if (back.get(p.lang) !== p.route) bad.push(`${p.route} ↔ ${route}: not symmetric`);
      }
    }
    expect(bad).toEqual([]);
  });

  test('404 pages carry no hreflang', () => {
    const with404 = pages()
      .filter(is404)
      .filter((p) => p.dom.querySelectorAll('link[rel="alternate"][hreflang]').length > 0)
      .map((p) => p.route);
    expect(with404).toEqual([]);
  });
});

describe('indexing', () => {
  test('robots follows PUBLIC_INDEXING_ENABLED; 404 is always noindex', () => {
    const indexing = buildEnv('PUBLIC_INDEXING_ENABLED') === 'true';
    const bad: string[] = [];
    for (const p of pages()) {
      const robots = head(p.dom, 'meta[name="robots"]')?.getAttribute('content');
      const expected = is404(p) || !indexing ? 'noindex,nofollow' : 'index,follow';
      if (robots !== expected) bad.push(`${p.route}: robots=${robots}, expected ${expected}`);
    }
    expect(bad).toEqual([]);
  });

  test('robots.txt points to the sitemap index and blocks /admin and /api', () => {
    const robots = readFileSync(path.join(DIST, 'robots.txt'), 'utf8');
    expect(robots).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
    expect(robots).toMatch(/Disallow: \/admin\//);
    expect(robots).toMatch(/Disallow: \/api\//);
  });
});

describe('sitemap', () => {
  const entries = () => {
    const xml = readFileSync(path.join(DIST, 'sitemap-0.xml'), 'utf8');
    return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
      loc: m[1].match(/<loc>([^<]+)<\/loc>/)![1],
      alternates: [...m[1].matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map((a) => [a[1], a[2]] as const),
    }));
  };

  test('sitemap-index.xml lists sitemap-0.xml', () => {
    expect(readFileSync(path.join(DIST, 'sitemap-index.xml'), 'utf8')).toContain(`${SITE}/sitemap-0.xml`);
  });

  test('URL set = every page except 404 (one entry per page, nothing that is not a page)', () => {
    const expected = pages()
      .filter((p) => !is404(p))
      .map((p) => SITE + p.route)
      .sort();
    expect(entries().map((e) => e.loc).sort()).toEqual(expected);
  });

  test('sitemap alternates equal the hreflang in the page head', () => {
    const byRoute = new Map(pages().map((p) => [SITE + p.route, p]));
    const bad: string[] = [];
    for (const e of entries()) {
      const page = byRoute.get(e.loc)!;
      const inHead = page.dom
        .querySelectorAll('link[rel="alternate"][hreflang]')
        .filter((l) => l.getAttribute('hreflang') !== 'x-default')
        .map((l) => `${l.getAttribute('hreflang')} ${l.getAttribute('href')}`)
        .sort();
      const inSitemap = e.alternates.map(([lang, href]) => `${lang} ${href}`).sort();
      // The sitemap lists alternates only for pages that exist in ≥ 2 locales.
      if (inSitemap.length === 0 && inHead.length <= 1) continue;
      if (inHead.join('|') !== inSitemap.join('|')) bad.push(`${e.loc}: head=[${inHead}] sitemap=[${inSitemap}]`);
    }
    expect(bad).toEqual([]);
  });
});

describe('meta', () => {
  test('title and description are non-empty; unique within a locale for code-generated pages', () => {
    // Blog post descriptions come from the CMS — duplicates there belong to
    // the `content` project (editorial), not to the build contract; listing
    // pages 1…N of one language legitimately share theirs.
    const bad: string[] = [];
    for (const lang of LOCALES) {
      const seenTitle = new Map<string, string>();
      const seenDesc = new Map<string, string>();
      for (const p of pages().filter((p) => p.lang === lang && !is404(p))) {
        const title = head(p.dom, 'title')?.text.trim() ?? '';
        const desc = head(p.dom, 'meta[name="description"]')?.getAttribute('content')?.trim() ?? '';
        if (!title) bad.push(`${p.route}: empty title`);
        if (!desc) bad.push(`${p.route}: empty description`);
        if (seenTitle.has(title)) bad.push(`${p.route}: title duplicates ${seenTitle.get(title)}`);
        seenTitle.set(title, p.route);
        if (isBlog(p)) continue;
        if (seenDesc.has(desc)) bad.push(`${p.route}: description duplicates ${seenDesc.get(desc)}`);
        seenDesc.set(desc, p.route);
      }
    }
    expect(bad).toEqual([]);
  });

  test('og:locale is the page locale; og:type is article only on blog posts', () => {
    const bad: string[] = [];
    for (const p of pages()) {
      const locale = head(p.dom, 'meta[property="og:locale"]')?.getAttribute('content');
      const type = head(p.dom, 'meta[property="og:type"]')?.getAttribute('content');
      if (locale !== p.lang) bad.push(`${p.route}: og:locale=${locale}`);
      if (type !== (isBlogPost(p) ? 'article' : 'website')) bad.push(`${p.route}: og:type=${type}`);
    }
    expect(bad).toEqual([]);
  });
});
