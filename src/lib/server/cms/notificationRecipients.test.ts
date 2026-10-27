import { describe, expect, test, vi } from 'vitest';
import { loadNotificationRecipients } from './notificationRecipients';
import { loadQuery } from './client';

vi.mock('./client', () => ({ client: {}, loadQuery: vi.fn() }));
const mockedLoadQuery = vi.mocked(loadQuery);

describe('loadNotificationRecipients', () => {
  test('reads the published private document and keeps only e-mail-looking strings, trimmed', async () => {
    mockedLoadQuery.mockResolvedValueOnce(['a@herev.com', '  b@herev.com ', 42, 'not-an-email', '', null]);
    await expect(loadNotificationRecipients()).resolves.toEqual(['a@herev.com', 'b@herev.com']);
    expect(mockedLoadQuery).toHaveBeenCalledWith(
      expect.any(String),
      { id: 'private.notificationRecipients' },
      false,
    );
  });

  test.each([null, undefined, 'a@herev.com', {}])('%s instead of a list → [] (caller falls back)', async (value) => {
    mockedLoadQuery.mockResolvedValueOnce(value);
    await expect(loadNotificationRecipients()).resolves.toEqual([]);
  });
});
