import { stegaClean } from '@sanity/client/stega';
import type { Locale } from '../../i18n';

/** One language version stored by sanity-plugin-internationalized-array. */
interface LocalizedItem {
  _type: string;
  language: string;
  value?: unknown;
}

const isLocalizedArray = (value: unknown[]): value is LocalizedItem[] =>
  value.length > 0 &&
  value.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      /^internationalizedArray\w+Value$/.test((item as LocalizedItem)._type ?? ''),
  );

const isEmpty = (value: unknown) =>
  value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

/**
 * Replaces every multilingual field of a document with its `locale` version,
 * keeping the rest as is. Paths of fields without that version are pushed to
 * `missing` (`hero.heading`, `intro.stats.1.label`) and come out as ''.
 * Fields listed by the caller as required but absent altogether are the
 * caller's to check.
 */
export function localize(value: unknown, locale: Locale, missing: string[], path: string[] = []): unknown {
  if (Array.isArray(value)) {
    if (isLocalizedArray(value)) {
      const item = value.find((i) => stegaClean(i.language) === locale);
      if (isEmpty(item?.value)) {
        missing.push(path.join('.'));
        return '';
      }
      return localize(item!.value, locale, missing, path);
    }
    return value.map((item, i) => localize(item, locale, missing, [...path, String(i)]));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, localize(child, locale, missing, [...path, key])]),
    );
  }
  return value;
}
