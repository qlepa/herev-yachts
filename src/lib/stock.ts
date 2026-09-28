import { getCollection } from 'astro:content';
import type { Locale } from './i18n';
import type { Translations } from './i18n-strings';
import type { BrandKey } from '../content.config';
import { getStockHero } from './images';
import { formatPrice } from './format';
import type { StockCardData } from '../components/sections/StockStrip.astro';

export const brandDisplayMap: Record<BrandKey, string> = {
  galeon:        'GALEON',
  parker:        'PARKER',
  saxdor:        'SAXDOR',
  'de-antonio':  'DE ANTONIO',
  'chris-craft': 'CHRIS-CRAFT',
};

/** Published, unsold stock units for a locale — newest first. */
export async function getStockEntries(lang: Locale) {
  const entries = await getCollection(
    'stock',
    (e) => e.id.startsWith(`${lang}/`) && !e.data.draft && !e.data.sold,
  );
  entries.sort((a, b) => b.data.year - a.data.year || a.data.name.localeCompare(b.data.name));
  return entries;
}

export async function toStockCards(
  entries: Awaited<ReturnType<typeof getStockEntries>>,
  lang: Locale,
  t: Translations,
): Promise<StockCardData[]> {
  return Promise.all(
    entries.map(async (e) => ({
      translationKey: e.data.translationKey,
      name:           e.data.name,
      brandDisplay:   brandDisplayMap[e.data.brand],
      year:           e.data.year,
      priceLabel:     formatPrice(e.data.price, e.data.currency, lang),
      taxLabel:       e.data.taxStatus === 'tax-paid' ? t.stock.taxPaid : t.stock.exTax,
      image:          await getStockHero(e.data.translationKey, e.data.draft),
      href:           `/${lang}/available-now/${e.data.translationKey}/`,
    })),
  );
}
