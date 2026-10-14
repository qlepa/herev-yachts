import { describe, expect, test, vi } from 'vitest';
import { toHomePage } from './home';
import { localize } from './localize';

vi.mock('./client', () => ({ client: {}, loadQuery: vi.fn() }));

// Invisible characters the way stega appends them to strings in draft mode.
const STEGA = '​‌‍﻿'.repeat(8);

const LOCALES = ['en', 'pl', 'es', 'it'] as const;
const loc = (text: string, skip: string[] = []) =>
  LOCALES.filter((l) => !skip.includes(l)).map((language) => ({
    _key: language,
    _type: 'internationalizedArrayStringValue',
    language,
    value: `${text} ${language}`,
  }));
const image = (alt: string) => ({
  _type: 'pageImage',
  asset: { _type: 'reference', _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x1000-jpg' },
  alt: loc(alt),
});
const stat = (value: string, label: string) => ({ _type: 'stat', _key: value, value, label: loc(label) });
const block = (name: string) => ({
  heading: loc(`${name} heading`),
  bullets: [{ _key: 'b1', _type: 'bullet', lead: loc('lead'), rest: loc('rest') }],
  image: image(`${name} alt`),
});

function homeDoc() {
  return {
    _id: 'homePage',
    _type: 'homePage',
    hero: {
      heading: loc('heading'),
      subtext: loc('subtext'),
      cta1: loc('cta1'),
      cta2: loc('cta2'),
      video: 'https://player.vimeo.com/external/1.hd.mp4',
      image: image('hero alt'),
    },
    intro: {
      eyebrow: loc('eyebrow'),
      heading: loc('intro heading'),
      body: loc('body'),
      stats: [stat('5', 'ateliers'), stat('17', 'years'), stat('1', 'relationship')],
    },
    advisory: { advise: block('advise'), represent: block('represent') },
    guide: { heading: loc('g'), body: loc('g'), emailPlaceholder: loc('g'), cta: loc('g') },
    shipyards: { eyebrow: loc('s'), heading: loc('s'), body: loc('s'), image: image('shipyards alt') },
    statement: { headingLine1: loc('l1'), headingLine2: loc('l2'), body: loc('b') },
    network: {
      eyebrow: loc('n'),
      heading: loc('n'),
      body: loc('n'),
      countriesLabel: loc('countries'),
      stats: [stat('30+', 'berths'), stat('60+', 'models')],
      linkLabel: loc('n'),
      image: image('network alt'),
      imageCaption: loc('n'),
    },
    seo: LOCALES.map((language) => ({
      _key: language,
      _type: 'internationalizedArraySeoValue',
      language,
      value: { _type: 'seo', title: `Title ${language}`, description: `Description ${language}` },
    })),
  };
}

describe('localize', () => {
  test('picks the language version of every multilingual field, nested in objects and arrays', () => {
    const missing: string[] = [];
    const out = localize({ a: loc('x'), list: [{ b: loc('y') }], plain: 'z' }, 'pl', missing);
    expect(out).toEqual({ a: 'x pl', list: [{ b: 'y pl' }], plain: 'z' });
    expect(missing).toEqual([]);
  });

  test('reports a missing language by path', () => {
    const missing: string[] = [];
    localize({ hero: { heading: loc('x', ['it']) }, stats: [{ label: loc('y', ['it']) }] }, 'it', missing);
    expect(missing).toEqual(['hero.heading', 'stats.0.label']);
  });

  test('matches the language despite stega in draft mode', () => {
    const missing: string[] = [];
    const field = [{ _key: 'k', _type: 'internationalizedArrayStringValue', language: 'es' + STEGA, value: 'hola' }];
    expect(localize({ f: field }, 'es', missing)).toEqual({ f: 'hola' });
  });
});

describe('toHomePage', () => {
  test('maps the document to one language', () => {
    const page = toHomePage(homeDoc(), 'pl', false);
    expect(page.hero.heading).toBe('heading pl');
    expect(page.hero.video).toBe('https://player.vimeo.com/external/1.hd.mp4');
    expect(page.hero.image).toMatchObject({ width: 2000, height: 1000, alt: 'hero alt pl' });
    expect(page.hero.image.dataSanity).toBeUndefined();
    expect(page.intro.stats).toEqual([
      { value: '5', label: 'ateliers pl' },
      { value: '17', label: 'years pl' },
      { value: '1', label: 'relationship pl' },
    ]);
    expect(page.advisory.advise.bullets).toEqual([{ lead: 'lead pl', rest: 'rest pl' }]);
    expect(page.network.stats[1]).toEqual({ value: '60+', label: 'models pl' });
    expect(page.seo).toEqual({ title: 'Title pl', description: 'Description pl' });
  });

  test('a published page with a missing language or image fails the build', () => {
    const doc = homeDoc();
    doc.hero.heading = loc('heading', ['it']);
    delete (doc.shipyards as { image?: unknown }).image;
    expect(() => toHomePage(doc, 'it', false)).toThrow(/hero\.heading.*shipyards\.image/);
    expect(() => toHomePage(doc, 'en', false)).toThrow(/shipyards\.image/);
  });

  test('a draft renders blanks instead, and images are clickable in the preview', () => {
    const doc = homeDoc();
    doc.hero.heading = loc('heading', ['it']);
    const page = toHomePage(doc, 'it', true);
    expect(page.hero.heading).toBe('');
    expect(page.hero.image.dataSanity).toContain('hero.image');
  });

  test('no video when the field is empty', () => {
    const doc = homeDoc();
    delete (doc.hero as { video?: string }).video;
    expect(toHomePage(doc, 'en', false).hero.video).toBeUndefined();
  });

  test('a missing document is an error', () => {
    expect(() => toHomePage(null, 'en', false)).toThrow(/homePage/);
  });
});
