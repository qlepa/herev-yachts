import { createHmac, timingSafeEqual } from 'node:crypto';
import type { ClientPerspective } from '@sanity/client';

export const DRAFT_MODE_COOKIE = 'herev-draft-mode';

/**
 * Cookie value proving the visitor went through the Studio's preview
 * handshake. Derived from the read token, so it cannot be forged without it
 * and rotating the token invalidates every draft-mode session.
 */
export function draftModeToken(secret: string): string {
  return createHmac('sha256', secret).update('herev-draft-mode').digest('hex');
}

export function isValidDraftModeCookie(value: string | undefined, secret: string): boolean {
  if (!value || !secret) return false;
  const expected = Buffer.from(draftModeToken(secret));
  const actual = Buffer.from(value);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/**
 * Draft mode (CMS preview with the Studio's cookie) reads unpublished
 * drafts and stega-encodes strings so a click on text opens its field.
 * Everything else reads published content only.
 */
export function queryOptions(draftMode: boolean): {
  perspective: ClientPerspective;
  stega: boolean;
} {
  return draftMode
    ? { perspective: 'drafts', stega: true }
    : { perspective: 'published', stega: false };
}
