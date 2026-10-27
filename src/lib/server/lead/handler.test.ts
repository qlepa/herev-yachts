import { beforeEach, describe, expect, test, vi } from 'vitest';
import { handleLead, resetDedupe, type LeadDeps } from './handler';

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
    expect(d.sendMail).toHaveBeenCalledTimes(2); // notification + confirmation, once
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

  test('compare variant across marques: no dealer, manual routing noted in the mail', async () => {
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

  test('compare variant within one marque: routed to that marque\'s default dealer', async () => {
    const d = deps();
    const res = await handleLead(
      { ...validBody, source: 'compare', brand: 'galeon', yachtKey: undefined, model: 'GALEON 500 FLY · GALEON 420 FLY', comparedKeys: ['galeon-500-fly', 'galeon-420-fly'] },
      d,
    );
    expect(res.status).toBe(200);
    expect(d.resolveDealer).toHaveBeenCalledWith('galeon');
    expect(d.createDeal).toHaveBeenCalledWith(expect.anything(), dealer, expect.any(String));
    const confirmation = (d.sendMail as ReturnType<typeof vi.fn>).mock.calls[1][0];
    expect(confirmation.replyTo).toBe('info@herev.com');
  });

  test('phone-only contact from the compact form is accepted — no confirmation possible', async () => {
    const d = deps();
    const res = await handleLead({ ...validBody, email: undefined, phone: '+48 600 000 000' }, d);
    expect(res.status).toBe(200);
    expect(d.sendMail).toHaveBeenCalledTimes(1);
    expect((d.sendMail as ReturnType<typeof vi.fn>).mock.calls[0][0].replyTo).toBeUndefined();
  });

  test('confirmation goes to the lead in their language, replies routed to the dealer', async () => {
    const d = deps();
    await handleLead(validBody, d);
    const confirmation = (d.sendMail as ReturnType<typeof vi.fn>).mock.calls[1][0];
    expect(confirmation.to).toEqual(['jan@example.com']);
    expect(confirmation.replyTo).toBe('info@herev.com');
    expect(confirmation.subject).toBe('Mamy Twoje zapytanie — Galeon 500 Fly');
    expect(confirmation.html).toContain('Dzień dobry, Jan,');
  });

  test('a failed confirmation is only a warning — the lead is already safe', async () => {
    let calls = 0;
    const d = deps({
      sendMail: vi.fn(async () => {
        if (++calls === 2) throw new Error('Resend 403: not allowed with onboarding@resend.dev');
      }),
    });
    const res = await handleLead(validBody, d);
    expect(res).toEqual({ status: 200, body: { ok: true } });
    expect(d.log.warn).toHaveBeenCalledWith(expect.stringContaining('confirmation to jan@example.com failed'));
    expect(d.log.error).not.toHaveBeenCalled();
  });

  test('two concurrent submits of the same contact create one deal (B1)', async () => {
    const d = deps();
    const [a, b] = await Promise.all([handleLead(validBody, d), handleLead(validBody, d)]);
    expect(d.createDeal).toHaveBeenCalledTimes(1);
    expect([a.body, b.body]).toContainEqual({ ok: true, duplicate: true });
    expect([a.body, b.body]).toContainEqual({ ok: true });
  });

  test('a failing dealer lookup is logged, the deal is still created without a dealer (B4)', async () => {
    const d = deps({ resolveDealer: vi.fn(async () => Promise.reject(new Error('collection unavailable'))) });
    const res = await handleLead(validBody, d);
    expect(res).toEqual({ status: 200, body: { ok: true } });
    expect(d.createDeal).toHaveBeenCalledWith(expect.anything(), undefined, expect.any(String));
    expect(d.log.error).toHaveBeenCalledWith(expect.stringContaining('dealer lookup failed for galeon'));
  });
});
