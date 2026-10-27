import { describe, expect, test } from 'vitest';
import {
  compareHref,
  parseCompareKeys,
  sharedBrand,
  specGroups,
  verdictSentences,
  type CompareYacht,
  type VerdictTemplates,
} from './compare';

const base: CompareYacht = {
  translationKey: 'galeon-500-fly',
  name: '500 FLY',
  brand: 'galeon',
  brandDisplay: 'GALEON',
  fullName: 'GALEON 500 FLY',
  href: '/en/yachts/galeon/galeon-500-fly/',
  imageSrc: null,
  year: 2025,
  lengthM: 15.65,
  beamM: 4.69,
  cabins: 3,
  berths: 6,
  maxSpeedKn: 32,
  fuelL: 1800,
  layouts: [],
};
const other: CompareYacht = {
  ...base,
  translationKey: 'saxdor-400-gtc',
  name: '400 GTC',
  brand: 'saxdor',
  brandDisplay: 'SAXDOR',
  fullName: 'SAXDOR 400 GTC',
  lengthM: 12.3,
  beamM: 3.6,
  cabins: 2,
  berths: 4,
  maxSpeedKn: 40,
  fuelL: undefined,
};

const templates: VerdictTemplates = {
  longer: '{a} is longer than {b} — {n} m vs {m} m.',
  moreCabins: '{a} has more cabins than {b} — {n} vs {m}.',
  moreGuests: '{a} sleeps more guests than {b} — {n} vs {m}.',
  faster: '{a} is faster than {b} — {n} kn vs {m} kn.',
  moreFuel: '{a} carries more fuel than {b} — {n} l vs {m} l.',
};

describe('URL state', () => {
  test('href carries the keys in order; empty selection = bare page', () => {
    expect(compareHref('pl', ['a', 'b'])).toBe('/pl/compare/?y=a,b');
    expect(compareHref('en', [])).toBe('/en/compare/');
  });

  test('parse keeps known, unique keys in order and caps at three', () => {
    const known = new Set(['a', 'b', 'c', 'd']);
    expect(parseCompareKeys('?y=b,zzz,a,b,c,d', known)).toEqual(['b', 'a', 'c']);
    expect(parseCompareKeys('', known)).toEqual([]);
    expect(parseCompareKeys('?y=%20a%20', known)).toEqual(['a']);
  });
});

describe('verdictSentences', () => {
  test('one sentence per differing metric, highest vs lowest; missing numbers are skipped', () => {
    expect(verdictSentences([base, other], templates)).toEqual([
      'GALEON 500 FLY is longer than SAXDOR 400 GTC — 15.65 m vs 12.3 m.',
      'GALEON 500 FLY has more cabins than SAXDOR 400 GTC — 3 vs 2.',
      'GALEON 500 FLY sleeps more guests than SAXDOR 400 GTC — 6 vs 4.',
      'SAXDOR 400 GTC is faster than GALEON 500 FLY — 40 kn vs 32 kn.',
    ]);
  });

  test('equal values produce no sentence; fewer than two yachts produce nothing', () => {
    expect(verdictSentences([base, { ...base, translationKey: 'x' }], templates)).toEqual([]);
    expect(verdictSentences([base], templates)).toEqual([]);
  });

  test('three yachts: the extremes are named', () => {
    const mid = { ...other, translationKey: 'mid', fullName: 'MID', lengthM: 14, cabins: 3, berths: 6, maxSpeedKn: 35 };
    const [longer] = verdictSentences([other, mid, base], templates);
    expect(longer).toBe('GALEON 500 FLY is longer than SAXDOR 400 GTC — 15.65 m vs 12.3 m.');
  });
});

describe('specGroups', () => {
  const labels = {
    length: 'Length', beam: 'Beam', draft: 'Draft', cabins: 'Cabins', berths: 'Guests', engines: 'Engines',
    speed: 'Max speed', cruiseSpeed: 'Cruise', fuel: 'Fuel', water: 'Water', ceCategory: 'CE', year: 'Year',
  };
  const groups = { dimensions: 'DIM', accommodation: 'ACC', performance: 'PERF', capacities: 'CAP' };

  test('rows nobody fills are dropped, a dash marks a missing value, identical rows are flagged', () => {
    const out = specGroups([base, other], labels, groups);
    const dim = out.find((g) => g.title === 'DIM')!;
    expect(dim.rows.map((r) => r.label)).toEqual(['Length', 'Beam']); // no draft anywhere
    const cap = out.find((g) => g.title === 'CAP')!;
    expect(cap.rows).toEqual([{ label: 'Fuel', values: ['1800 l', '—'], same: false }]);
    const acc = out.find((g) => g.title === 'ACC')!;
    expect(acc.rows.find((r) => r.label === 'Year')).toEqual({ label: 'Year', values: ['2025', '2025'], same: true });
  });

  test('a group with no rows disappears', () => {
    const bare = { ...base, engines: undefined, maxSpeedKn: undefined, cruiseSpeedKn: undefined };
    expect(specGroups([bare, bare], labels, groups).map((g) => g.title)).toEqual(['DIM', 'ACC', 'CAP']);
  });
});

test('sharedBrand', () => {
  expect(sharedBrand([base, { ...base, translationKey: 'y' }])).toBe('galeon');
  expect(sharedBrand([base, other])).toBeUndefined();
  expect(sharedBrand([])).toBeUndefined();
});
