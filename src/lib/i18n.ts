export const LOCALES = ['en', 'pl', 'es', 'it', 'ru'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export function getLocalePaths() {
  return LOCALES.map((lang) => ({ params: { lang } }));
}
