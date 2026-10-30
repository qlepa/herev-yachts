import { describe, expect, test } from 'vitest';
import type { HTMLElement } from 'node-html-parser';
import { clientScripts, contentEntries, isBlog, pages, islandProps } from './pages';

/**
 * Business rules visible in the rendered HTML (docs/testing-strategy.md §3 L3):
 * prices only for stock units, every enquiry form carries the right context,
 * the dealer collection stays private, server code stays off the client.
 */

// "€604,652", "EUR 1 200", "1.200 zł", "GBP 95,000" — any currency token next to digits.
const PRICE = /(?:€|£|\bEUR\b|\bPLN\b|\bGBP\b|zł)\s?\d|\d\s?(?:€|£|\bEUR\b|\bPLN\b|\bGBP\b|zł)/;

/** Nearest of the element's ancestors (up to `depth` levels) that is a stock card. */
function inStockCard(el: HTMLElement, depth = 3): boolean {
  let node: HTMLElement | null = el;
  for (let i = 0; i < depth && node; i++) {
    if (node.querySelector('a[href*="/available-now/"]')) return true;
    node = node.parentNode;
  }
  return false;
}

describe('prices', () => {
  test('a price appears only on an available-now page or inside a stock card linking to one (D14)', () => {
    const bad: string[] = [];
    for (const p of pages()) {
      if (isBlog(p)) continue; // editorial prose may quote market prices
      const onStockPage = /^\/[a-z]{2}\/available-now\/[^/]+\/$/.test(p.route);
      for (const el of p.dom.querySelectorAll('body *')) {
        const own = el.childNodes
          .filter((n) => n.nodeType === 3)
          .map((n) => n.text)
          .join(' ');
        if (!PRICE.test(own)) continue;
        if (onStockPage || inStockCard(el)) continue;
        bad.push(`${p.route}: "${own.trim().slice(0, 60)}"`);
      }
    }
    expect(bad).toEqual([]);
  });

  test('a catalogue yacht page shows available units only when a new, unsold unit of that model exists', () => {
    const stock = contentEntries('stock').filter(
      (e) => e.data.draft !== 'true' && e.data.sold !== 'true' && e.data.condition === 'new',
    );
    const bad: string[] = [];
    for (const p of pages()) {
      const m = p.route.match(/^\/([a-z]{2})\/yachts\/[^/]+\/([^/]+)\/$/);
      if (!m) continue;
      const expected = stock
        .filter((e) => e.lang === m[1] && e.data.modelKey === m[2])
        .map((e) => `/${e.lang}/available-now/${e.data.translationKey}/`)
        .sort();
      const linked = [
        ...new Set(
          p.dom
            .querySelectorAll('a[href]')
            .map((a) => a.getAttribute('href')!)
            .filter((h) => /^\/[a-z]{2}\/available-now\/[^/]+\/$/.test(h)),
        ),
      ].sort();
      if (linked.join() !== expected.join()) bad.push(`${p.route}: links=[${linked}] expected=[${expected}]`);
    }
    expect(bad).toEqual([]);
  });
});

describe('enquiry forms', () => {
  interface Context {
    lang: string;
    source: string;
    brand?: string;
    yachtKey?: string;
    stockKey?: string;
  }
  const forms = (p: ReturnType<typeof pages>[number]) =>
    p.dom
      .querySelectorAll('astro-island[component-url*="LeadForm"]')
      .map((i) => (islandProps(i) as { context: Context }).context);

  test('yacht, stock, brand, home and services pages carry a form with the context the lead router expects', () => {
    const bad: string[] = [];
    for (const p of pages()) {
      const want = ((): Partial<Context> | null => {
        let m;
        if ((m = p.route.match(/^\/([a-z]{2})\/yachts\/([^/]+)\/([^/]+)\/$/)))
          return { lang: m[1], source: 'yacht', brand: m[2], yachtKey: m[3] };
        if ((m = p.route.match(/^\/([a-z]{2})\/available-now\/([^/]+)\/$/)))
          return { lang: m[1], source: 'stock', stockKey: m[2] };
        if ((m = p.route.match(/^\/([a-z]{2})\/brands\/([^/]+)\/$/))) return { lang: m[1], source: 'brand', brand: m[2] };
        if ((m = p.route.match(/^\/([a-z]{2})\/$/))) return { lang: m[1], source: 'home' };
        if ((m = p.route.match(/^\/([a-z]{2})\/services\/$/))) return { lang: m[1], source: 'services' };
        return null;
      })();
      if (!want) continue;
      const found = forms(p);
      if (found.length !== 1) {
        bad.push(`${p.route}: ${found.length} forms`);
        continue;
      }
      for (const [k, v] of Object.entries(want)) {
        if (found[0][k as keyof Context] !== v) bad.push(`${p.route}: ${k}=${found[0][k as keyof Context]}, expected ${v}`);
      }
    }
    expect(bad).toEqual([]);
  });

  test('every form on every page is in the language of the page', () => {
    const bad = pages()
      .flatMap((p) => forms(p).map((c) => [p.route, c] as const))
      .filter(([route, c]) => c.lang !== route.split('/')[1])
      .map(([route, c]) => `${route}: form lang=${c.lang}`);
    expect(bad).toEqual([]);
  });

  test('brand on a form is a real brand of a real dealer', () => {
    const dealerBrands = new Set(contentEntries('dealers').flatMap((d) => d.data.brands as string[]));
    const bad = pages()
      .flatMap((p) => forms(p).map((c) => [p.route, c] as const))
      .filter(([, c]) => c.brand && !dealerBrands.has(c.brand))
      .map(([route, c]) => `${route}: brand=${c.brand}`);
    expect(bad).toEqual([]);
  });
});

describe('private data', () => {
  test('dealer ids and Pipedrive labels never reach the HTML (the dealer collection is not public)', () => {
    const needles = contentEntries('dealers').flatMap((d) => [d.data.dealerId as string, 'pipedriveOptionLabel']);
    const bad = pages()
      .filter((p) => needles.some((n) => p.html.includes(n)))
      .map((p) => p.route);
    expect(bad).toEqual([]);
  });
});

describe('client bundle', () => {
  test('no secret names and no server-only modules in the client JavaScript', () => {
    const needles = [
      'PIPEDRIVE_API_TOKEN',
      'RESEND_API_KEY',
      'TURNSTILE_SECRET_KEY',
      'SANITY_API_READ_TOKEN',
      'api.pipedrive.com',
      'api.resend.com',
      'siteverify',
      'createDeal',
      'handleLead',
      'verifyTurnstile',
      'loadNotificationRecipients',
      'renderNotificationMail',
      'loadTranslations',
      'loadSiteSettings',
    ];
    const bad = clientScripts().flatMap(({ file, source }) => needles.filter((n) => source.includes(n)).map((n) => `${file}: ${n}`));
    expect(bad).toEqual([]);
  });

  test('island props never carry a Sanity token or a Pipedrive label', () => {
    const bad = pages()
      .flatMap((p) => p.dom.querySelectorAll('astro-island[props]').map((i) => [p.route, i.getAttribute('props')!] as const))
      .filter(([, props]) => /sk[A-Za-z0-9]{20,}|pipedriveOptionLabel|api_token/.test(props))
      .map(([route]) => route);
    expect(bad).toEqual([]);
  });
});

describe('brand pages', () => {
  test('a brand page is built for every locale that has the brand entry, and links to its model pages', () => {
    const brands = contentEntries('brands');
    const yachts = contentEntries('yachts').filter((y) => y.data.draft !== 'true');
    const byRoute = new Map(pages().map((p) => [p.route, p]));
    const bad: string[] = [];
    for (const b of brands) {
      const route = `/${b.lang}/brands/${b.data.brandKey}/`;
      const page = byRoute.get(route);
      if (!page) {
        bad.push(`${route}: missing`);
        continue;
      }
      const hrefs = new Set(page.dom.querySelectorAll('a[href]').map((a) => a.getAttribute('href')));
      for (const y of yachts.filter((y) => y.lang === b.lang && y.data.brand === b.data.brandKey)) {
        const href = `/${b.lang}/yachts/${b.data.brandKey}/${y.data.translationKey}/`;
        if (!hrefs.has(href)) bad.push(`${route}: no link to ${href}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
