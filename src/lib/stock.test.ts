import { describe, expect, test } from 'vitest';
import { getCollection } from 'astro:content';
import { getNewStockForModel, getStockEntries, toStockCards } from './stock';
import { getTranslations } from './i18n-strings';
import { LOCALES } from './i18n';

// Runs on the real `stock` collection — these are the business rules of
// the "available now" listing (docs/backlog-mvp.md, docs/cms-plan.md D14/D15).
describe('stock', () => {
  test('listing = published, unsold units of that locale, newest first', async () => {
    const all = await getCollection('stock');
    const en = await getStockEntries('en');
    expect(en.length).toBeGreaterThan(0);
    expect(en.length).toBeLessThanOrEqual(all.length);
    for (const e of en) {
      expect(e.id.startsWith('en/')).toBe(true);
      expect(e.data.draft).toBe(false);
      expect(e.data.sold).toBe(false);
    }
    const years = en.map((e) => e.data.year);
    expect(years).toEqual([...years].sort((a, b) => b - a));
  });

  test('model page shows only factory-new units of that model', async () => {
    const en = await getStockEntries('en');
    const withModel = en.find((e) => e.data.modelKey && e.data.condition === 'new');
    expect(withModel, 'fixture: at least one new unit linked to a model').toBeDefined();
    const units = await getNewStockForModel('en', withModel!.data.modelKey!);
    expect(units.length).toBeGreaterThan(0);
    for (const u of units) {
      expect(u.data.modelKey).toBe(withModel!.data.modelKey);
      expect(u.data.condition).toBe('new');
    }
    await expect(getNewStockForModel('en', 'no-such-model')).resolves.toEqual([]);
  });

  test.each(LOCALES)('%s cards: price label, tax label and link to the unit page', async (lang) => {
    const entries = await getStockEntries(lang);
    const cards = await toStockCards(entries, lang, getTranslations(lang));
    expect(cards).toHaveLength(entries.length);
    for (const card of cards) {
      expect(card.priceLabel).toMatch(/\d/);
      expect(card.taxLabel).not.toBe('');
      expect(card.href).toBe(`/${lang}/available-now/${card.translationKey}/`);
      expect(card.brandDisplay).toMatch(/^[A-Z]/);
    }
  });
});
