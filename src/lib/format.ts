import type { Locale } from './i18n';
import type { CurrencyKey } from '../content.config';

export function metresToFeet(m: number): string {
  const totalInches = Math.round(m * 39.3701);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return inches === 0 ? `${feet}′` : `${feet}′${inches}″`;
}

const intlLocale: Record<Locale, string> = {
  en: 'en-GB',
  pl: 'pl-PL',
  es: 'es-ES',
  it: 'it-IT',
};

/** Whole-unit price with currency symbol, locale-aware grouping. */
export function formatPrice(price: number, currency: CurrencyKey, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(price);
}
