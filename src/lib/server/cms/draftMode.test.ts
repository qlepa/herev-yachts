import { describe, expect, test } from 'vitest';
import { draftModeToken, isValidDraftModeCookie, queryOptions } from './draftMode';

describe('draft mode cookie', () => {
  const secret = 'read-token';

  test('accepts the token derived from the secret', () => {
    expect(isValidDraftModeCookie(draftModeToken(secret), secret)).toBe(true);
  });

  test('rejects a missing, forged or stale cookie', () => {
    expect(isValidDraftModeCookie(undefined, secret)).toBe(false);
    expect(isValidDraftModeCookie('true', secret)).toBe(false);
    expect(isValidDraftModeCookie(draftModeToken('rotated-token'), secret)).toBe(false);
  });

  test('never validates without a secret', () => {
    expect(isValidDraftModeCookie(draftModeToken(''), '')).toBe(false);
  });
});

describe('queryOptions', () => {
  test('draft mode reads drafts with stega', () => {
    expect(queryOptions(true)).toEqual({ perspective: 'drafts', stega: true });
  });

  test('otherwise published content only, no stega', () => {
    expect(queryOptions(false)).toEqual({ perspective: 'published', stega: false });
  });
});
