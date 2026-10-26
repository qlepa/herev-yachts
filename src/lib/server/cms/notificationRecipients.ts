import { NOTIFICATION_RECIPIENTS_ID } from '../../../sanity/documentIds';
import { loadQuery } from './client';

/**
 * Lead notification addresses, read from Sanity at request time (published
 * version; the `private.` ID is invisible without the token). An empty or
 * missing document returns [] — the caller falls back and logs.
 */
export async function loadNotificationRecipients(): Promise<string[]> {
  const emails = await loadQuery<unknown>('*[_id == $id][0].emails', { id: NOTIFICATION_RECIPIENTS_ID }, false);
  if (!Array.isArray(emails)) return [];
  return emails.filter((e): e is string => typeof e === 'string' && e.includes('@')).map((e) => e.trim());
}
