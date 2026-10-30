export const LOCALES = ['en', 'pl', 'es', 'it'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export function getLocalePaths() {
  return LOCALES.map((lang) => ({ params: { lang } }));
}

/**
 * Locales in which an entry exists, from collection ids of the form
 * `lang/key`. Pages build hreflang and the language switcher from this —
 * a locale without the entry gets no alternate (never a fallback).
 */
export function entryLocales(ids: readonly string[]): Locale[] {
  return LOCALES.filter((l) => ids.some((id) => id.startsWith(`${l}/`)));
}

export function buildAlternates(
  pathname: string,
  absoluteBase = '',
): Array<{ lang: string; href: string }> {
  const segments = pathname.replace(/^\//, '').split('/');
  const rest = segments.slice(1).join('/');
  return LOCALES.map((l) => ({
    lang: l,
    href: `${absoluteBase}/${l}/${rest}`,
  }));
}
