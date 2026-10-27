import { describe, expect, test } from 'vitest';
import { renderConfirmationMail, renderNotificationMail } from './templates';
import type { Lead } from '../../lead';

const dealer = { dealerId: 'dealer-01', name: 'Herev Marine', email: 'info@herev.com', pipedriveOptionLabel: 'Herev Marine' };

const lead: Lead = {
  lang: 'en',
  source: 'stock',
  name: 'Ann Smith',
  email: 'ann@example.com',
  stockKey: 'galeon-440-fly-2024',
  yachtKey: undefined,
  pageUrl: undefined,
  model: 'Galeon 440 Fly (2024)',
  brand: 'galeon',
  message: 'Is she <available> in May?\nSecond line.',
  financing: true,
  stockInterest: false,
  consent: true,
  consentText: 'I agree.',
  utm: { source: 'google', medium: 'cpc', campaign: 'spring' },
};

describe('renderNotificationMail', () => {
  test('text lists every field, the consent wording with timestamp and unmapped Pipedrive values', () => {
    const { subject, text } = renderNotificationMail(lead, dealer, '2026-10-26T10:00:00.000Z', { dealId: 7, unmapped: [['Dealer', 'Herev Marine']] }, undefined);
    expect(subject).toBe('New enquiry: Galeon 440 Fly (2024) — Ann Smith');
    expect(text.startsWith('Pipedrive: deal #7 created')).toBe(true);
    expect(text).toContain('Stock unit: galeon-440-fly-2024');
    expect(text).toContain('Financing: yes');
    expect(text).toContain('UTM: google / cpc / spring');
    expect(text).toContain('Not mapped to deal fields: Dealer=Herev Marine');
    expect(text).toContain('Consent (2026-10-26T10:00:00.000Z): "I agree."');
    expect(renderNotificationMail({ ...lead, message: undefined }, dealer, 'now', undefined, 'boom').text).toContain('(none)');
  });

  test('html carries the same facts, escapes user input and flags a CRM failure', () => {
    const ok = renderNotificationMail(lead, dealer, 'now', { dealId: 7, unmapped: [] }, undefined).html;
    expect(ok).toContain('Pipedrive: deal #7 created');
    expect(ok).toContain('Is she &lt;available&gt; in May?<br>Second line.');
    expect(ok).toContain('Herev Marine (Herev Marine)');
    expect(ok).not.toContain('<available>');
    const failed = renderNotificationMail(lead, dealer, 'now', undefined, 'Pipedrive /deals 401').html;
    expect(failed).toContain('Pipedrive: FAILED');
    expect(failed).toContain('Pipedrive /deals 401');
  });

  test('compare variant: subject and manual routing note', () => {
    const { subject, text } = renderNotificationMail({ ...lead, model: undefined, comparedKeys: ['a', 'b'] }, undefined, 'now', undefined, 'x');
    expect(subject).toBe('New enquiry (compare): a vs b — Ann Smith');
    expect(text).toContain('Dealer: none — manual routing');
  });
});

describe('renderConfirmationMail', () => {
  test('speaks the lead language and names the model', () => {
    const en = renderConfirmationMail(lead);
    expect(en.subject).toBe('We have your enquiry — Galeon 440 Fly (2024)');
    expect(en.text).toContain('Dear Ann,');
    expect(en.text).toContain('within one working day');
    expect(en.html).toContain('Galeon 440 Fly (2024)');
    expect(en.html).toContain('Is she &lt;available&gt; in May?<br>Second line.');

    expect(renderConfirmationMail({ ...lead, lang: 'pl' }).subject).toBe('Mamy Twoje zapytanie — Galeon 440 Fly (2024)');
    expect(renderConfirmationMail({ ...lead, lang: 'es' }).text).toContain('Estimado/a Ann,');
    expect(renderConfirmationMail({ ...lead, lang: 'it' }).text).toContain('Gentile Ann,');
  });

  test('general enquiry without a model: neutral subject, no "about" line, no message block', () => {
    const { subject, text, html } = renderConfirmationMail({ ...lead, model: undefined, message: undefined });
    expect(subject).toBe('We have your enquiry');
    expect(text).not.toContain('interest in');
    expect(html).not.toContain('Your message');
  });

  test('compare variant lists the yachts and links back to the comparison', () => {
    const compare = { ...lead, model: undefined, comparedKeys: ['galeon-500-fly', 'saxdor-400-gtc'], pageUrl: 'https://herev.com/en/compare/?y=galeon-500-fly,saxdor-400-gtc' };
    const { subject, text, html } = renderConfirmationMail(compare);
    expect(subject).toBe('We have your enquiry — galeon-500-fly · saxdor-400-gtc');
    expect(text).toContain('Your comparison: https://herev.com/en/compare/?y=galeon-500-fly,saxdor-400-gtc');
    expect(html).toContain('<a href="https://herev.com/en/compare/?y=galeon-500-fly,saxdor-400-gtc"');
    // The form sends the model names — they win over the keys.
    expect(renderConfirmationMail({ ...compare, model: 'GALEON 500 FLY · SAXDOR 400 GTC' }).subject).toBe('We have your enquiry — GALEON 500 FLY · SAXDOR 400 GTC');
    // A page URL that is not http(s) is never linked.
    expect(renderConfirmationMail({ ...compare, pageUrl: 'javascript:alert(1)' }).html).not.toContain('javascript:');
  });

  test('never contains a hardcoded recipient address', () => {
    const { html, text } = renderConfirmationMail(lead);
    expect(html + text).not.toMatch(/@herev\.com/);
  });
});
