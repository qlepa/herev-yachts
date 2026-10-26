import { beforeEach, describe, expect, test, vi } from 'vitest';
import { formatLeadMail, handleLead, resetDedupe, type LeadDeps } from './handler';
import type { Lead } from '../../lead';

const validBody = {
  lang: 'pl',
  source: 'yacht',
  name: 'Jan Kowalski',
  email: 'jan@example.com',
  model: 'Galeon 500 Fly',
  message: 'Chciałbym obejrzeć łódź.',
  brand: 'galeon',
  yachtKey: 'galeon-500-fly',
  consent: true,
  consentText: 'Zgadzam się na kontakt.',
  turnstileToken: 'tok',
};

const dealer = { dealerId: 'dealer-01', name: 'Herev Marine', email: 'info@herev.com', pipedriveOptionLabel: 'Herev Marine' };

function deps(overrides: Partial<LeadDeps> = {}) {
  const d: LeadDeps = {
    verifyTurnstile: vi.fn(async () => true),
    resolveDealer: vi.fn(async () => dealer),
    createDeal: vi.fn(async () => ({ dealId: 42, unmapped: [] })),
    loadRecipients: vi.fn(async () => ['a@herev.com', 'b@herev.com']),
    sendMail: vi.fn(async () => {}),
    fallbackEmail: 'fallback@herev.com',
    log: { error: vi.fn(), warn: vi.fn() },
    ...overrides,
  };
  return d;
}

beforeEach(() => resetDedupe());

describe('handleLead', () => {
  test('happy path: deal created, every recipient from Sanity mailed', async () => {
    const d = deps();
    const res = await handleLead(validBody, d);
    expect(res).toEqual({ status: 200, body: { ok: true } });
    expect(d.resolveDealer).toHaveBeenCalledWith('galeon');
    expect(d.createDeal).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jan Kowalski' }), dealer, expect.any(String));
    const mail = (d.sendMail as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(mail.to).toEqual(['a@herev.com', 'b@herev.com']);
    expect(mail.replyTo).toBe('jan@example.com');
    expect(mail.text).toContain('deal #42');
    expect(d.log.error).not.toHaveBeenCalled();
  });

  test('failed Turnstile → 400 and zero side effects', async () => {
    const d = deps({ verifyTurnstile: vi.fn(async () => false) });
    const res = await handleLead(validBody, d);
    expect(res).toEqual({ status: 400, body: { ok: false, error: 'turnstile' } });
    expect(d.createDeal).not.toHaveBeenCalled();
    expect(d.sendMail).not.toHaveBeenCalled();
    expect(d.loadRecipients).not.toHaveBeenCalled();
  });

  test('invalid payload → 400 with the offending fields, no side effects', async () => {
    const d = deps();
    const res = await handleLead({ ...validBody, name: 'J', email: 'nope', consent: false }, d);
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: 'validation' });
    expect((res.body as { fields: string[] }).fields).toEqual(expect.arrayContaining(['name', 'email', 'consent']));
    expect(d.createDeal).not.toHaveBeenCalled();
    expect(d.sendMail).not.toHaveBeenCalled();
  });

  test('Pipedrive failure does not lose the lead: mail says FAILED, client gets 200, error logged', async () => {
    const d = deps({ createDeal: vi.fn(async () => Promise.reject(new Error('Pipedrive /deals 500'))) });
    const res = await handleLead(validBody, d);
    expect(res).toEqual({ status: 200, body: { ok: true } });
    const mail = (d.sendMail as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(mail.text).toContain('Pipedrive: FAILED');
    expect(mail.text).toContain('Pipedrive /deals 500');
    expect(mail.text).toContain('jan@example.com');
    expect(d.log.error).toHaveBeenCalledWith(expect.stringContaining('Pipedrive failed'));
  });

  test('empty recipients → fallback address + error log', async () => {
    const d = deps({ loadRecipients: vi.fn(async () => []) });
    await handleLead(validBody, d);
    expect((d.sendMail as ReturnType<typeof vi.fn>).mock.calls[0][0].to).toEqual(['fallback@herev.com']);
    expect(d.log.error).toHaveBeenCalledWith(expect.stringContaining('notificationRecipients is empty'));
  });

  test('Sanity unreachable → fallback address, deal still created', async () => {
    const d = deps({ loadRecipients: vi.fn(async () => Promise.reject(new Error('network'))) });
    const res = await handleLead(validBody, d);
    expect(res.status).toBe(200);
    expect(d.createDeal).toHaveBeenCalled();
    expect((d.sendMail as ReturnType<typeof vi.fn>).mock.calls[0][0].to).toEqual(['fallback@herev.com']);
  });

  test('mail failure alone still returns 200 (deal exists)', async () => {
    const d = deps({ sendMail: vi.fn(async () => Promise.reject(new Error('Resend 500'))) });
    const res = await handleLead(validBody, d);
    expect(res).toEqual({ status: 200, body: { ok: true } });
    expect(d.log.error).toHaveBeenCalledWith(expect.stringContaining('Resend failed'));
  });

  test('both channels down → 502 and the payload is logged', async () => {
    const d = deps({
      createDeal: vi.fn(async () => Promise.reject(new Error('crm'))),
      sendMail: vi.fn(async () => Promise.reject(new Error('mail'))),
    });
    const res = await handleLead(validBody, d);
    expect(res).toEqual({ status: 502, body: { ok: false, error: 'delivery' } });
    expect(d.log.error).toHaveBeenCalledWith(expect.stringMatching(/LOST.*jan@example\.com/));
  });

  test('double submit within the window creates one deal', async () => {
    const d = deps();
    await handleLead(validBody, d);
    const second = await handleLead({ ...validBody, email: 'JAN@example.com' }, d);
    expect(second).toEqual({ status: 200, body: { ok: true, duplicate: true } });
    expect(d.createDeal).toHaveBeenCalledTimes(1);
    expect(d.sendMail).toHaveBeenCalledTimes(1);
  });

  test('a lost lead is not remembered as sent — the retry goes through', async () => {
    const d = deps({
      createDeal: vi.fn(async () => Promise.reject(new Error('crm'))),
      sendMail: vi.fn(async () => Promise.reject(new Error('mail'))),
    });
    await handleLead(validBody, d);
    const retry = await handleLead(validBody, deps());
    expect(retry).toEqual({ status: 200, body: { ok: true } });
  });

  test('dedupe window expires', async () => {
    let t = 1_000_000;
    const d = deps({ now: () => t });
    await handleLead(validBody, d);
    t += 3 * 60_000;
    await handleLead(validBody, d);
    expect(d.createDeal).toHaveBeenCalledTimes(2);
  });

  test('compare variant: no dealer lookup, compared yachts in the mail', async () => {
    const d = deps();
    const res = await handleLead(
      { ...validBody, source: 'compare', brand: undefined, yachtKey: undefined, model: undefined, comparedKeys: ['galeon-500-fly', 'saxdor-400-gtc'] },
      d,
    );
    expect(res.status).toBe(200);
    expect(d.resolveDealer).not.toHaveBeenCalled();
    expect(d.createDeal).toHaveBeenCalledWith(expect.objectContaining({ comparedKeys: ['galeon-500-fly', 'saxdor-400-gtc'] }), undefined, expect.any(String));
    const mail = (d.sendMail as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(mail.subject).toContain('compare');
    expect(mail.text).toContain('manual routing');
  });

  test('phone-only contact from the compact form is accepted', async () => {
    const d = deps();
    const res = await handleLead({ ...validBody, email: undefined, phone: '+48 600 000 000' }, d);
    expect(res.status).toBe(200);
    expect((d.sendMail as ReturnType<typeof vi.fn>).mock.calls[0][0].replyTo).toBeUndefined();
  });
});

describe('formatLeadMail', () => {
  const lead: Lead = {
    lang: 'en',
    source: 'stock',
    name: 'Ann',
    email: 'ann@example.com',
    stockKey: 'galeon-440-fly-2024',
    model: 'Galeon 440 Fly (2024)',
    brand: 'galeon',
    financing: true,
    stockInterest: false,
    consent: true,
    consentText: 'I agree.',
    utm: { source: 'google', medium: 'cpc', campaign: 'spring' },
  };

  test('lists every field, the consent wording with timestamp and unmapped Pipedrive values', () => {
    const { subject, text } = formatLeadMail(lead, dealer, '2026-10-26T10:00:00.000Z', { dealId: 7, unmapped: [['Dealer', 'Herev Marine']] }, undefined);
    expect(subject).toBe('New enquiry: Galeon 440 Fly (2024) — Ann');
    expect(text).toContain('Stock unit: galeon-440-fly-2024');
    expect(text).toContain('Financing: yes');
    expect(text).toContain('UTM: google / cpc / spring');
    expect(text).toContain('Not mapped to deal fields: Dealer=Herev Marine');
    expect(text).toContain('Consent (2026-10-26T10:00:00.000Z): "I agree."');
    expect(text).toContain('(none)');
  });
});
