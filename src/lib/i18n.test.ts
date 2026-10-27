import { describe, expect, test } from 'vitest';
import { buildAlternates, getLocalePaths, LOCALES } from './i18n';

describe('i18n', () => {
  test('getLocalePaths: one static path per locale, en first (x-default)', () => {
    expect(getLocalePaths().map((p) => p.params.lang)).toEqual(['en', 'pl', 'es', 'it']);
    expect(LOCALES[0]).toBe('en');
  });

  test('buildAlternates swaps the locale segment and keeps the rest of the path', () => {
    expect(buildAlternates('/pl/yachts/galeon/', 'https://herev.com')).toEqual([
      { lang: 'en', href: 'https://herev.com/en/yachts/galeon/' },
      { lang: 'pl', href: 'https://herev.com/pl/yachts/galeon/' },
      { lang: 'es', href: 'https://herev.com/es/yachts/galeon/' },
      { lang: 'it', href: 'https://herev.com/it/yachts/galeon/' },
    ]);
  });

  test('buildAlternates: locale root and relative output', () => {
    expect(buildAlternates('/it/').map((a) => a.href)).toEqual(['/en/', '/pl/', '/es/', '/it/']);
  });
});
