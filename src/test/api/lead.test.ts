import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { APIContext } from 'astro';
import { POST } from '../../pages/api/lead';
import { resetDedupe } from '../../lib/server/lead/handler';
import { resetDealFieldsCache } from '../../lib/server/lead/pipedrive';
import { loadNotificationRecipients } from '../../lib/server/cms/notificationRecipients';
import { fakeFetch, json } from '../fakeFetch';

/**
 * The endpoint as deployed: real Turnstile / Pipedrive / Resend modules and
 * the real content collections (brand → default dealer), only the network
 * and Sanity faked. Orchestration cases live in handler.test.ts.
 */
vi.mock('../../lib/server/cms/notificationRecipients', () => ({ loadNotificationRecipients: vi.fn() }));

const body = {
  lang: 'en',
  source: 'yacht',
  name: 'Jane Doe',
  email: 'jane@example.com',
  model: 'Galeon 500 Fly',
  brand: 'galeon',
  yachtKey: 'galeon-500-fly',
  consent: true,
  consentText: 'I agree.',
  turnstileToken: 'tok',
};

function post(payload: unknown, headers: Record<string, string> = {}) {
  const request = new Request('https://herev.com/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  });
  return POST({ request, clientAddress: '10.0.0.1' } as APIContext) as Promise<Response>;
}

const dealFields = [{ key: 'f_dealer', name: 'Dealer', field_type: 'enum', options: [{ id: 7, label: 'Herev Marine' }] }];

function integrations(overrides: Parameters<typeof fakeFetch>[0] = {}) {
  return fakeFetch({
    'challenges.cloudflare.com/turnstile/v0/siteverify': () => json({ success: true }),
    'api.pipedrive.com/v1/dealFields': () => json({ success: true, data: dealFields }),
    'api.pipedrive.com/v1/persons/search': () => json({ success: true, data: { items: [] } }),
    'api.pipedrive.com/v1/persons': () => json({ success: true, data: { id: 5 } }),
    'api.pipedrive.com/v1/deals': () => json({ success: true, data: { id: 501 } }),
    'api.pipedrive.com/v1/notes': () => json({ success: true, data: { id: 1 } }),
    'api.resend.com/emails': () => json({ id: 'msg' }),
    ...overrides,
  });
}

beforeEach(() => {
  resetDedupe();
  resetDealFieldsCache();
  vi.mocked(loadNotificationRecipients).mockResolvedValue(['ops@herev.com']);
  vi.stubEnv('PROD', true);
  vi.stubEnv('TURNSTILE_SECRET_KEY', 'ts-secret');
  vi.stubEnv('PIPEDRIVE_API_TOKEN', 'pd-token');
  vi.stubEnv('RESEND_API_KEY', 're-key');
  vi.stubEnv('LEAD_FROM_EMAIL', 'Herev <leads@herev.com>');
  vi.stubEnv('LEAD_FALLBACK_EMAIL', 'fallback@herev.com');
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('POST /api/lead', () => {
  test('happy path through the real modules: Turnstile → person → deal with the dealer option → note → mail', async () => {
    const { fetchFn, calls } = integrations();
    vi.stubGlobal('fetch', fetchFn);

    const res = await post(body, { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });

    const hosts = calls.map((c) => `${c.method} ${c.url.host}${c.url.pathname}`);
    expect(hosts[0]).toBe('POST challenges.cloudflare.com/turnstile/v0/siteverify');
    expect(calls[0].body).toMatchObject({ secret: 'ts-secret', response: 'tok', remoteip: '203.0.113.9' });

    const deal = calls.find((c) => c.url.pathname === '/v1/deals');
    expect(deal?.url.searchParams.get('api_token')).toBe('pd-token');
    // Brand galeon → dealer-01 (content collections) → "Herev Marine" option id.
    expect(deal?.body).toMatchObject({ title: 'Galeon 500 Fly — Jane Doe', person_id: 5, f_dealer: 7 });

    const mails = calls.filter((c) => c.url.host === 'api.resend.com');
    expect(mails[0].headers.authorization).toBe('Bearer re-key');
    expect(mails[0].body).toMatchObject({ to: ['ops@herev.com'], reply_to: 'jane@example.com' });
    expect(mails[1].body).toMatchObject({ to: ['jane@example.com'], reply_to: 'info@herev.com' });
  });

  test('malformed JSON → 400 validation, nothing called', async () => {
    const { fetchFn, calls } = integrations();
    vi.stubGlobal('fetch', fetchFn);
    const res = await post('{not json');
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ ok: false, error: 'validation' });
    expect(calls).toEqual([]);
  });

  test('production without TURNSTILE_SECRET_KEY → 500 misconfigured, no lead passes', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '');
    const { fetchFn, calls } = integrations();
    vi.stubGlobal('fetch', fetchFn);
    const res = await post(body);
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ ok: false, error: 'misconfigured' });
    expect(calls).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('TURNSTILE_SECRET_KEY'));
  });

  test('dev without the secret: check skipped with a warning (never silently)', async () => {
    vi.stubEnv('PROD', false);
    vi.stubEnv('TURNSTILE_SECRET_KEY', '');
    const { fetchFn, calls } = integrations();
    vi.stubGlobal('fetch', fetchFn);
    expect((await post(body)).status).toBe(200);
    expect(calls.some((c) => c.url.host === 'challenges.cloudflare.com')).toBe(false);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('check skipped'));
  });

  test('Turnstile rejects → 400 and no CRM or mail traffic', async () => {
    const { fetchFn, calls } = integrations({
      'challenges.cloudflare.com/turnstile/v0/siteverify': () => json({ success: false, 'error-codes': ['invalid-input-response'] }),
    });
    vi.stubGlobal('fetch', fetchFn);
    const res = await post(body);
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ ok: false, error: 'turnstile' });
    expect(calls).toHaveLength(1);
  });

  test('Pipedrive down → the notification carries the failure, the enquirer still gets 200', async () => {
    const { fetchFn, calls } = integrations({
      'api.pipedrive.com/v1/dealFields': () => new Response('upstream', { status: 503 }),
    });
    vi.stubGlobal('fetch', fetchFn);
    expect((await post(body)).status).toBe(200);
    const notification = calls.find((c) => c.url.host === 'api.resend.com');
    expect((notification?.body as { text: string }).text).toContain('Pipedrive: FAILED');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Pipedrive failed'));
  });

  test('missing PIPEDRIVE_API_TOKEN is a delivery failure of the CRM only — mail still goes out', async () => {
    vi.stubEnv('PIPEDRIVE_API_TOKEN', '');
    const { fetchFn, calls } = integrations();
    vi.stubGlobal('fetch', fetchFn);
    expect((await post(body)).status).toBe(200);
    expect(calls.some((c) => c.url.host === 'api.pipedrive.com')).toBe(false);
    expect(calls.some((c) => c.url.host === 'api.resend.com')).toBe(true);
  });

  test('CRM and mail both unreachable → 502 delivery, payload in the error log', async () => {
    const { fetchFn } = integrations({
      'api.pipedrive.com/v1/dealFields': () => new Response('x', { status: 500 }),
      'api.resend.com/emails': () => new Response('x', { status: 500 }),
    });
    vi.stubGlobal('fetch', fetchFn);
    const res = await post(body);
    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({ ok: false, error: 'delivery' });
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('LOST'));
  });
});
