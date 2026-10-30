import { describe, expect, test } from 'vitest';
import { getCollection } from 'astro:content';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { BRAND_KEYS } from '../content.config';
import { LOCALES } from '../lib/i18n';

/**
 * References between collections and locations.json resolve (B6). Zod
 * validates each entry on its own; nothing else checks that a brand's
 * dealer exists or that a stock unit's model is a published yacht.
 */
// docs/kontrakt-locations.md: brandKeys and dealerId are optional.
const locations = JSON.parse(readFileSync(path.resolve(import.meta.dirname, '../data/locations.json'), 'utf8')) as Array<{
  id: string;
  country: string;
  brandKeys?: string[];
  dealerId?: string;
}>;

describe('content references', () => {
  test('entry ids follow `lang/key` — pages look entries up by that id', async () => {
    const bad: string[] = [];
    for (const e of await getCollection('yachts')) if (e.id !== `${e.id.split('/')[0]}/${e.data.translationKey}`) bad.push(e.id);
    for (const e of await getCollection('stock')) if (e.id !== `${e.id.split('/')[0]}/${e.data.translationKey}`) bad.push(e.id);
    for (const e of await getCollection('brands')) if (e.id !== `${e.id.split('/')[0]}/${e.data.brandKey}`) bad.push(e.id);
    for (const id of [...(await getCollection('yachts')), ...(await getCollection('stock')), ...(await getCollection('brands'))].map((e) => e.id)) {
      if (!LOCALES.includes(id.split('/')[0] as (typeof LOCALES)[number])) bad.push(`${id}: unknown locale`);
    }
    expect(bad).toEqual([]);
  });

  test('every brand has a default dealer that exists and sells the brand', async () => {
    const dealers = await getCollection('dealers');
    const bad: string[] = [];
    for (const b of await getCollection('brands')) {
      const dealer = dealers.find((d) => d.data.dealerId === b.data.defaultDealer);
      if (!dealer) bad.push(`${b.id}: dealer ${b.data.defaultDealer} missing`);
      else if (!dealer.data.brands.includes(b.data.brandKey)) bad.push(`${b.id}: ${dealer.data.dealerId} does not sell ${b.data.brandKey}`);
    }
    expect(bad).toEqual([]);
  });

  test('a stock unit with modelKey points at a published yacht of the same brand in the same language', async () => {
    const yachts = await getCollection('yachts', (y) => !y.data.draft);
    const bad: string[] = [];
    for (const s of await getCollection('stock')) {
      if (!s.data.modelKey) continue;
      const lang = s.id.split('/')[0];
      const model = yachts.find((y) => y.id === `${lang}/${s.data.modelKey}`);
      if (!model) bad.push(`${s.id}: model ${s.data.modelKey} not published in ${lang}`);
      else if (model.data.brand !== s.data.brand) bad.push(`${s.id}: brand ${s.data.brand} ≠ model brand ${model.data.brand}`);
    }
    expect(bad).toEqual([]);
  });

  test('a published entry has the same brand in every locale it exists in', async () => {
    const bad: string[] = [];
    for (const collection of ['yachts', 'stock'] as const) {
      const byKey = new Map<string, Set<string>>();
      for (const e of await getCollection(collection)) {
        byKey.set(e.data.translationKey, (byKey.get(e.data.translationKey) ?? new Set()).add(e.data.brand));
      }
      for (const [key, brands] of byKey) if (brands.size > 1) bad.push(`${collection}/${key}: ${[...brands]}`);
    }
    expect(bad).toEqual([]);
  });

  test('locations.json: unique ids, ISO-2 countries, known brands; a dealerId (optional) exists and sells those brands', async () => {
    const dealers = await getCollection('dealers');
    const bad: string[] = [];
    const ids = new Set<string>();
    for (const l of locations) {
      if (ids.has(l.id)) bad.push(`${l.id}: duplicate id`);
      ids.add(l.id);
      if (!/^[A-Z]{2}$/.test(l.country)) bad.push(`${l.id}: country ${l.country}`);
      const brands = l.brandKeys ?? [];
      for (const b of brands) if (!(BRAND_KEYS as readonly string[]).includes(b)) bad.push(`${l.id}: brand ${b}`);
      if (!l.dealerId) continue;
      const dealer = dealers.find((d) => d.data.dealerId === l.dealerId);
      if (!dealer) bad.push(`${l.id}: dealer ${l.dealerId} missing`);
      else for (const b of brands) if (!(dealer.data.brands as string[]).includes(b)) bad.push(`${l.id}: ${l.dealerId} does not sell ${b}`);
    }
    expect(bad).toEqual([]);
  });
});
