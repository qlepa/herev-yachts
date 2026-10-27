import { expect, test } from 'vitest';
import { leadFormStrings } from './lead-strings';
import { getTranslations } from './i18n-strings';
import { LOCALES } from './i18n';

test.each(LOCALES)('%s: every text the form island renders is present', (lang) => {
  const s = leadFormStrings(getTranslations(lang));
  for (const [key, value] of Object.entries(s)) {
    if (key === 'errors') {
      expect(Object.keys(value as object).length).toBeGreaterThan(0);
      for (const msg of Object.values(value as Record<string, string>)) expect(msg).not.toBe('');
    } else {
      expect(value, key).toEqual(expect.any(String));
      expect(value, key).not.toBe('');
    }
  }
  expect(leadFormStrings(getTranslations(lang), 'Custom CTA').cta).toBe('Custom CTA');
});
