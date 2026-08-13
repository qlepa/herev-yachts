export const LOCALES = ['en', 'pl', 'es', 'it'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export function getLocalePaths() {
  return LOCALES.map((lang) => ({ params: { lang } }));
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
