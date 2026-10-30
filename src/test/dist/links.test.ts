import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { LOCALES } from '../../lib/i18n';
import { ROOT, contentEntries, fileForPath, isBlogPost, pages, redirectMatchers } from './pages';

/**
 * Links, images and structured data of the production build
 * (docs/testing-strategy.md §3 L3). Internal links are checked here, not by
 * lychee: only this test knows the redirects in vercel.json.
 */

describe('internal links', () => {
  test('every site-absolute href/src resolves to a built file or a vercel.json redirect', () => {
    const redirects = redirectMatchers();
    const ok = new Map<string, boolean>();
    const resolves = (url: string) => {
      const p = url.split(/[?#]/)[0];
      if (!ok.has(p)) ok.set(p, fileForPath(p) !== null || redirects.some((r) => r.test(p.replace(/\/$/, '')) || r.test(p)));
      return ok.get(p)!;
    };
    const bad: string[] = [];
    for (const page of pages()) {
      const urls = new Set<string>();
      for (const el of page.dom.querySelectorAll('[href], [src], [srcset]')) {
        for (const attr of ['href', 'src']) {
          const v = el.getAttribute(attr);
          if (v?.startsWith('/') && !v.startsWith('//')) urls.add(v);
        }
        const srcset = el.getAttribute('srcset');
        if (srcset) {
          for (const part of srcset.split(',')) {
            const u = part.trim().split(/\s+/)[0];
            if (u.startsWith('/') && !u.startsWith('//')) urls.add(u);
          }
        }
      }
      for (const u of urls) if (!resolves(u)) bad.push(`${page.route} → ${u}`);
    }
    expect(bad).toEqual([]);
  });

  test('every vercel.json redirect lands on a built page (old URLs must not 404 after a rename)', () => {
    const json = JSON.parse(readFileSync(path.join(ROOT, 'vercel.json'), 'utf8')) as {
      redirects: Array<{ source: string; destination: string }>;
    };
    // A redirect may wait for a draft entry — but only at the URL the entry will get.
    const draftRoutes = new Set([
      ...contentEntries('yachts')
        .filter((e) => e.data.draft === 'true')
        .map((e) => `/${e.lang}/yachts/${e.data.brand}/${e.data.translationKey}/`),
      ...contentEntries('stock')
        .filter((e) => e.data.draft === 'true')
        .map((e) => `/${e.lang}/available-now/${e.data.translationKey}/`),
    ]);
    const bad: string[] = [];
    for (const r of json.redirects) {
      // Studio lives on the CMS deployment; dynamic tails cannot be enumerated.
      if (!r.destination.startsWith('/') || r.destination.includes('admin') || r.destination.includes(':path')) continue;
      const targets = r.destination.includes(':lang') ? LOCALES.map((l) => r.destination.replace(':lang', l)) : [r.destination];
      for (const t of targets) {
        if (fileForPath(t) || draftRoutes.has(t.endsWith('/') ? t : t + '/')) continue;
        bad.push(`${r.source} → ${t}`);
      }
    }
    expect(bad).toEqual([]);
  });

  test('the language switcher links of every page exist (no fallback to a missing locale)', () => {
    // Any link into another locale must exist as a page; the switcher is the
    // most common source of such links.
    const bad: string[] = [];
    for (const page of pages()) {
      for (const a of page.dom.querySelectorAll('a[href^="/"]')) {
        const href = a.getAttribute('href')!.split(/[?#]/)[0];
        const m = href.match(/^\/([a-z]{2})\//);
        if (!m || m[1] === page.lang) continue;
        if (!fileForPath(href)) bad.push(`${page.route} → ${href}`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('images', () => {
  test('every <img> has alt; static local images have width and height; no lazy LCP; one fetchpriority=high per page', () => {
    const bad: string[] = [];
    for (const page of pages()) {
      const imgs = page.dom.querySelectorAll('img');
      let high = 0;
      for (const img of imgs) {
        const src = img.getAttribute('src') ?? '';
        if (!img.hasAttribute('alt')) bad.push(`${page.route}: <img src="${src.slice(0, 60)}"> without alt`);
        // Islands reserve the box with CSS (aspect-ratio / fixed size), static markup must use width/height.
        const inIsland = img.closest('astro-island') !== null;
        if (src.startsWith('/_astro/') && !inIsland && (!img.getAttribute('width') || !img.getAttribute('height'))) {
          bad.push(`${page.route}: <img src="${src.slice(0, 60)}"> without width/height`);
        }
        if (img.getAttribute('fetchpriority') === 'high') {
          high++;
          if (img.getAttribute('loading') === 'lazy') bad.push(`${page.route}: LCP image is lazy`);
        }
      }
      if (high > 1) bad.push(`${page.route}: ${high} images with fetchpriority=high`);
    }
    expect(bad).toEqual([]);
  });

  test('brochure PDFs are files, never data: URIs', () => {
    const bad = pages()
      .filter((p) => p.html.includes('data:application/pdf'))
      .map((p) => p.route);
    expect(bad).toEqual([]);
  });
});

describe('structured data', () => {
  const graphs = (html: ReturnType<typeof pages>[number]['dom']) =>
    html.querySelectorAll('script[type="application/ld+json"]').map((s) => JSON.parse(s.text) as Record<string, unknown>);
  const types = (doc: Record<string, unknown>): string[] => {
    const nodes = Array.isArray(doc['@graph']) ? (doc['@graph'] as Record<string, unknown>[]) : [doc];
    return nodes.map((n) => String(n['@type']));
  };

  test('every JSON-LD block parses, has @context, and every page carries Organization + WebSite + WebPage', () => {
    const bad: string[] = [];
    for (const page of pages()) {
      let found: string[] = [];
      try {
        const docs = graphs(page.dom);
        if (docs.length === 0) bad.push(`${page.route}: no JSON-LD`);
        for (const d of docs) if (d['@context'] !== 'https://schema.org') bad.push(`${page.route}: @context=${d['@context']}`);
        found = docs.flatMap(types);
      } catch (e) {
        bad.push(`${page.route}: ${(e as Error).message}`);
      }
      for (const t of ['Organization', 'WebSite', 'WebPage']) if (!found.includes(t)) bad.push(`${page.route}: no ${t}`);
      if (isBlogPost(page) && !found.includes('BreadcrumbList')) bad.push(`${page.route}: no BreadcrumbList`);
    }
    expect(bad).toEqual([]);
  });

  test('each network country page lists one LocalBusiness per showroom with its ISO country', () => {
    const locations = JSON.parse(readFileSync(path.join(ROOT, 'src/data/locations.json'), 'utf8')) as Array<{
      name: string;
      country: string;
    }>;
    const bad: string[] = [];
    for (const page of pages()) {
      const m = page.route.match(/^\/[a-z]{2}\/network\/([a-z]{2})\/$/);
      if (!m) continue;
      const iso = m[1].toUpperCase();
      const expected = locations.filter((l) => l.country === iso).map((l) => l.name).sort();
      const businesses = graphs(page.dom)
        .flatMap((d) => (Array.isArray(d['@graph']) ? (d['@graph'] as Record<string, unknown>[]) : [d]))
        .filter((n) => n['@type'] === 'LocalBusiness');
      const names = businesses.map((b) => String(b.name)).sort();
      if (names.join() !== expected.join()) bad.push(`${page.route}: [${names}] expected [${expected}]`);
      for (const b of businesses) {
        const country = (b.address as { addressCountry?: string } | undefined)?.addressCountry;
        if (country !== iso) bad.push(`${page.route}: ${b.name} addressCountry=${country}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
