import { describe, expect, test, vi } from 'vitest';
import { verifyTurnstile } from './turnstile';

const respond = (body: unknown, status = 200) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

describe('verifyTurnstile', () => {
  test('passes only on success: true', async () => {
    expect(await verifyTurnstile('tok', '1.2.3.4', 'secret', respond({ success: true }))).toBe(true);
    expect(await verifyTurnstile('tok', undefined, 'secret', respond({ success: false }))).toBe(false);
  });

  test('missing token, HTTP error or network error all fail closed', async () => {
    const fetchFn = respond({ success: true });
    expect(await verifyTurnstile(undefined, undefined, 'secret', fetchFn)).toBe(false);
    expect(fetchFn).not.toHaveBeenCalled();
    expect(await verifyTurnstile('tok', undefined, 'secret', respond({}, 500))).toBe(false);
    const broken = vi.fn(async () => Promise.reject(new Error('offline'))) as unknown as typeof fetch;
    expect(await verifyTurnstile('tok', undefined, 'secret', broken)).toBe(false);
  });

  test('sends secret, response and remote ip as form data', async () => {
    const fetchFn = respond({ success: true });
    await verifyTurnstile('tok', '1.2.3.4', 'secret', fetchFn);
    const [url, init] = (fetchFn as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toContain('challenges.cloudflare.com');
    const body = init.body as URLSearchParams;
    expect(body.get('secret')).toBe('secret');
    expect(body.get('response')).toBe('tok');
    expect(body.get('remoteip')).toBe('1.2.3.4');
  });
});
