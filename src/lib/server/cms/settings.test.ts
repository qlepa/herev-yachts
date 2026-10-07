import { describe, expect, test, vi } from 'vitest';
import { toSiteSettings } from './settings';

vi.mock('./client', () => ({ client: {}, loadQuery: vi.fn() }));

// Invisible characters the way stega appends them to strings in draft mode.
const STEGA = '​‌‍﻿'.repeat(8);

describe('toSiteSettings', () => {
  test('strips stega from values used in hrefs, titles and JSON-LD', () => {
    const settings = toSiteSettings(
      {
        email: 'info@herev.com' + STEGA,
        phone: '+48 600 000 000' + STEGA,
        titleSuffix: '— Herev' + STEGA,
        socialProfiles: ['https://www.linkedin.com/company/herev' + STEGA],
      },
      true,
    );
    expect(settings).toEqual({
      email: 'info@herev.com',
      phone: '+48 600 000 000',
      titleSuffix: '— Herev',
      ogImageUrl: undefined,
      socialProfiles: ['https://www.linkedin.com/company/herev'],
    });
  });

  test('no phone and no share image when not set', () => {
    const settings = toSiteSettings({ email: 'info@herev.com', titleSuffix: '— Herev' }, false);
    expect(settings.phone).toBeUndefined();
    expect(settings.ogImageUrl).toBeUndefined();
    expect(settings.socialProfiles).toEqual([]);
  });

  test('fails the build when the document or required values are missing', () => {
    expect(() => toSiteSettings(null, false)).toThrow(/does not exist/);
    expect(() => toSiteSettings({ titleSuffix: '— Herev' }, false)).toThrow(/e-mail/);
  });

  test('tolerates an incomplete draft in the preview', () => {
    expect(toSiteSettings({ titleSuffix: '— Herev' }, true).email).toBe('');
  });
});
