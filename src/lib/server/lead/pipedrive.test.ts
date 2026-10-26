import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  buildDealFields,
  createDeal,
  dealFieldValues,
  dealNote,
  dealTitle,
  DEAL_FIELD_NAMES,
  resetDealFieldsCache,
  type DealField,
} from './pipedrive';
import type { Lead } from '../../lead';

const fields: DealField[] = [
  { key: 'aaa', name: 'Dealer', field_type: 'enum', options: [{ id: 1, label: 'Herev Marine' }, { id: 2, label: 'Nautica Sur' }] },
  { key: 'bbb', name: 'Brand', field_type: 'varchar' },
  { key: 'ccc', name: 'Language', field_type: 'varchar' },
  { key: 'ddd', name: 'Compared yachts', field_type: 'set', options: [{ id: 9, label: 'x' }] },
];

const lead: Lead = {
  lang: 'es',
  source: 'yacht',
  name: 'Ana López',
  email: 'ana@example.com',
  phone: '+34 600 000 000',
  model: 'Galeon 500 Fly',
  message: 'Hola <b>mundo</b>\nsegunda línea',
  brand: 'galeon',
  yachtKey: 'galeon-500-fly',
  financing: false,
  stockInterest: true,
  consent: true,
  consentText: 'Acepto.',
};
const dealer = { dealerId: 'dealer-01', name: 'Herev Marine', email: 'info@herev.com', pipedriveOptionLabel: 'Herev Marine' };

describe('buildDealFields', () => {
  test('enum takes the option id of the exact label, text fields the string', () => {
    const { custom, unmapped } = buildDealFields(fields, { Dealer: 'Herev Marine', Brand: 'galeon', Language: 'es' });
    expect(custom).toEqual({ aaa: 1, bbb: 'galeon', ccc: 'es' });
    expect(unmapped).toEqual([]);
  });

  test('the option label is matched character for character — no normalisation', () => {
    const { custom, unmapped } = buildDealFields(fields, { Dealer: 'herev marine' });
    expect(custom).toEqual({});
    expect(unmapped).toEqual([['Dealer', 'herev marine']]);
  });

  test('fields missing in the account go to unmapped, empty values are skipped', () => {
    const { custom, unmapped } = buildDealFields(fields, { 'UTM Source': 'google', Brand: undefined, Language: '' });
    expect(custom).toEqual({});
    expect(unmapped).toEqual([['UTM Source', 'google']]);
  });

  test('set fields take an array of option ids', () => {
    expect(buildDealFields(fields, { 'Compared yachts': 'x' }).custom).toEqual({ ddd: [9] });
  });
});

describe('dealFieldValues / dealTitle / dealNote', () => {
  test('fills the documented field names from the lead', () => {
    const values = dealFieldValues(lead, dealer, '2026-10-26T10:00:00.000Z');
    expect(values[DEAL_FIELD_NAMES.dealer]).toBe('Herev Marine');
    expect(values[DEAL_FIELD_NAMES.consentText]).toBe('Acepto.');
    expect(values[DEAL_FIELD_NAMES.consentAt]).toBe('2026-10-26T10:00:00.000Z');
    expect(values[DEAL_FIELD_NAMES.stockInterest]).toBe('Yes');
    expect(values[DEAL_FIELD_NAMES.financing]).toBeUndefined();
  });

  test('title: model — name; compare variant lists the yachts', () => {
    expect(dealTitle(lead)).toBe('Galeon 500 Fly — Ana López');
    expect(dealTitle({ ...lead, model: undefined })).toBe('Enquiry — Ana López');
    expect(dealTitle({ ...lead, comparedKeys: ['a', 'b'] })).toBe('Compare: a vs b — Ana López');
  });

  test('note escapes HTML and lists unmapped values', () => {
    const note = dealNote(lead, [['UTM Source', 'google']]);
    expect(note).toContain('Hola &lt;b&gt;mundo&lt;/b&gt;<br>segunda línea');
    expect(note).toContain('UTM Source: google');
  });
});

describe('createDeal', () => {
  beforeEach(() => resetDealFieldsCache());

  function fakeFetch(responses: Record<string, unknown>) {
    const calls: Array<{ url: string; body?: unknown }> = [];
    const fetchFn = vi.fn(async (url: string, init?: RequestInit) => {
      const path = new URL(url).pathname.replace('/v1', '');
      calls.push({ url, body: init?.body ? JSON.parse(String(init.body)) : undefined });
      const data = responses[path];
      if (data === undefined) return new Response('not found', { status: 404 });
      return new Response(JSON.stringify({ success: true, data }), { status: 200 });
    });
    return { fetchFn: fetchFn as unknown as typeof fetch, calls };
  }

  test('reuses the person found by e-mail, posts the deal with mapped fields and a note', async () => {
    const { fetchFn, calls } = fakeFetch({
      '/dealFields': fields,
      '/persons/search': { items: [{ item: { id: 77 } }] },
      '/deals': { id: 501 },
      '/notes': { id: 1 },
    });
    const result = await createDeal(lead, dealer, '2026-10-26T10:00:00.000Z', { apiToken: 'secret', fetchFn });
    expect(result.dealId).toBe(501);
    expect(result.unmapped.map(([k]) => k)).toContain('Consent');
    const dealCall = calls.find((c) => c.url.includes('/deals'));
    expect(dealCall?.body).toMatchObject({ title: 'Galeon 500 Fly — Ana López', person_id: 77, aaa: 1, bbb: 'galeon', ccc: 'es' });
    expect(calls.find((c) => c.url.includes('/persons') && !c.url.includes('search'))).toBeUndefined();
    expect(calls.find((c) => c.url.includes('/notes'))?.body).toMatchObject({ deal_id: 501 });
    expect(calls[0].url).toContain('api_token=secret');
  });

  test('creates the person when the e-mail is unknown', async () => {
    const { fetchFn, calls } = fakeFetch({
      '/dealFields': [],
      '/persons/search': { items: [] },
      '/persons': { id: 88 },
      '/deals': { id: 1 },
      '/notes': { id: 1 },
    });
    await createDeal(lead, undefined, 'now', { apiToken: 't', fetchFn });
    const create = calls.find((c) => c.url.includes('/persons?'));
    expect(create?.body).toMatchObject({ name: 'Ana López', email: [{ value: 'ana@example.com', primary: true }] });
    expect(calls.find((c) => c.url.includes('/deals'))?.body).toMatchObject({ person_id: 88 });
  });

  test('an API error surfaces as a thrown error (the handler then falls back to e-mail)', async () => {
    const { fetchFn } = fakeFetch({ '/dealFields': [] });
    await expect(createDeal(lead, dealer, 'now', { apiToken: 't', fetchFn })).rejects.toThrow(/Pipedrive \/persons\/search 404/);
  });
});
