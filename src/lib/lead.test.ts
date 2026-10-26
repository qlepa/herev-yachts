import { describe, expect, test } from 'vitest';
import { leadFieldErrors, leadSchema, splitContact } from './lead';

const base = {
  lang: 'en',
  source: 'home',
  name: 'Ann Smith',
  consent: true,
  consentText: 'I agree.',
};

describe('leadSchema', () => {
  test('needs an e-mail or a phone', () => {
    expect(leadSchema.safeParse({ ...base, email: 'ann@example.com' }).success).toBe(true);
    expect(leadSchema.safeParse({ ...base, phone: '+44 7700 900000' }).success).toBe(true);
    const r = leadSchema.safeParse(base);
    expect(r.success).toBe(false);
    if (!r.success) expect(leadFieldErrors(r.error.issues)).toEqual({ contact: true });
  });

  test('consent must be true and the shown wording must travel with the lead', () => {
    const r = leadSchema.safeParse({ ...base, email: 'ann@example.com', consent: false });
    expect(r.success).toBe(false);
    if (!r.success) expect(leadFieldErrors(r.error.issues)).toEqual({ consent: true });
    expect(leadSchema.safeParse({ ...base, email: 'ann@example.com', consentText: '' }).success).toBe(false);
  });

  test('defaults: flags false, empty optional texts dropped', () => {
    const r = leadSchema.parse({ ...base, email: 'ann@example.com', model: '  ', message: '', utm: { source: '' } });
    expect(r.financing).toBe(false);
    expect(r.stockInterest).toBe(false);
    expect(r.model).toBeUndefined();
    expect(r.message).toBeUndefined();
    expect(r.utm).toEqual({ source: undefined, medium: undefined, campaign: undefined });
  });

  test('compare variant needs 2–3 yachts', () => {
    const ok = { ...base, source: 'compare', email: 'a@b.co', comparedKeys: ['a', 'b'] };
    expect(leadSchema.safeParse(ok).success).toBe(true);
    expect(leadSchema.safeParse({ ...ok, comparedKeys: ['a'] }).success).toBe(false);
    expect(leadSchema.safeParse({ ...ok, comparedKeys: ['a', 'b', 'c', 'd'] }).success).toBe(false);
  });

  test('rejects unknown language and oversize message', () => {
    expect(leadSchema.safeParse({ ...base, lang: 'de', email: 'a@b.co' }).success).toBe(false);
    expect(leadSchema.safeParse({ ...base, email: 'a@b.co', message: 'x'.repeat(2001) }).success).toBe(false);
  });
});

describe('splitContact', () => {
  test('e-mail when it contains @, phone otherwise, nothing when empty', () => {
    expect(splitContact(' ann@example.com ')).toEqual({ email: 'ann@example.com' });
    expect(splitContact('+48 600 000 000')).toEqual({ phone: '+48 600 000 000' });
    expect(splitContact('   ')).toEqual({});
  });
});
