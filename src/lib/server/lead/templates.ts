import type { Lead } from '../../lead';
import type { Dealer, DealResult } from './pipedrive';

/**
 * E-mail templates for `/api/lead`: the internal notification and the
 * confirmation sent back to the person who enquired. Every mail ships as
 * text + HTML. E-mail clients cannot read CSS variables, so the palette is
 * inlined — the hex values mirror `@theme` in `src/styles/global.css`
 * (ink, paper, white, teal, gilt, mist) and must be kept in sync by hand.
 */
const PALETTE = {
  ink: '#0F252E',
  paper: '#ECEFEE',
  white: '#FFFFFF',
  teal: '#2C6E77',
  gilt: '#C9A45E',
  mist: '#C6CDCC',
  ink70: '#4C5E65',
  ink55: '#6E7C82',
} as const;

const FONT = "'Inter', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const FONT_DISPLAY = "Georgia, 'Times New Roman', serif";

export interface RenderedMail {
  subject: string;
  text: string;
  html: string;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const nl2br = (value: string) => escapeHtml(value).replace(/\r?\n/g, '<br>');

/* ------------------------------------------------------------------ */
/* Shared shell                                                        */
/* ------------------------------------------------------------------ */

function shell(opts: { preheader: string; body: string; footer: string }): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>Herev</title>
</head>
<body style="margin:0;padding:0;background:${PALETTE.paper};font-family:${FONT};color:${PALETTE.ink};-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PALETTE.paper};">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;">
<tr><td style="padding:0 8px 22px 8px;">
<span style="font-family:${FONT};font-size:14px;letter-spacing:0.24em;font-weight:600;color:${PALETTE.ink};">HEREV</span>
<span style="display:inline-block;width:36px;height:1px;background:${PALETTE.gilt};vertical-align:middle;margin-left:14px;"></span>
</td></tr>
<tr><td style="background:${PALETTE.white};border:1px solid ${PALETTE.mist};border-top:3px solid ${PALETTE.teal};border-radius:6px;padding:40px 40px 36px 40px;">
${opts.body}
</td></tr>
<tr><td style="padding:24px 8px 0 8px;font-size:11px;line-height:1.6;letter-spacing:0.02em;color:${PALETTE.ink55};">
${opts.footer}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

const eyebrow = (text: string) =>
  `<p style="margin:0 0 14px 0;font-size:11px;letter-spacing:0.30em;text-transform:uppercase;color:${PALETTE.teal};font-weight:600;">${escapeHtml(text)}</p>`;

const heading = (text: string) =>
  `<h1 style="margin:0 0 18px 0;font-family:${FONT_DISPLAY};font-weight:400;font-size:28px;line-height:1.2;letter-spacing:-0.01em;color:${PALETTE.ink};">${escapeHtml(text)}</h1>`;

const paragraph = (html: string) =>
  `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.65;color:${PALETTE.ink};">${html}</p>`;

const rule = () => `<hr style="border:0;border-top:1px solid ${PALETTE.mist};margin:26px 0;">`;

/** Two-column label/value table; rows with an empty value are dropped. */
function detailTable(rows: Array<[string, string | undefined]>): string {
  const cells = rows
    .filter((r): r is [string, string] => Boolean(r[1]))
    .map(
      ([label, value]) => `<tr>
<td valign="top" style="padding:9px 16px 9px 0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${PALETTE.ink55};white-space:nowrap;border-bottom:1px solid ${PALETTE.paper};">${escapeHtml(label)}</td>
<td valign="top" style="padding:9px 0;font-size:15px;line-height:1.5;color:${PALETTE.ink};border-bottom:1px solid ${PALETTE.paper};">${nl2br(value)}</td>
</tr>`,
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${cells}</table>`;
}

/** Quoted block for the free-text message. */
const quote = (text: string) =>
  `<blockquote style="margin:0;padding:14px 20px;border-left:3px solid ${PALETTE.gilt};background:${PALETTE.paper};font-size:15px;line-height:1.65;color:${PALETTE.ink};">${nl2br(text)}</blockquote>`;

/* ------------------------------------------------------------------ */
/* Internal notification                                               */
/* ------------------------------------------------------------------ */

function enquirySubjectLine(lead: Lead): string {
  return lead.comparedKeys ? lead.comparedKeys.join(' vs ') : (lead.model ?? 'general');
}

export function renderNotificationMail(
  lead: Lead,
  dealer: Dealer | undefined,
  consentAt: string,
  deal: DealResult | undefined,
  dealError: string | undefined,
): RenderedMail {
  const subject = lead.comparedKeys
    ? `New enquiry (compare): ${enquirySubjectLine(lead)} — ${lead.name}`
    : `New enquiry: ${enquirySubjectLine(lead)} — ${lead.name}`;
  const utm = [lead.utm?.source, lead.utm?.medium, lead.utm?.campaign].filter(Boolean).join(' / ');
  const dealerLine = dealer
    ? `${dealer.name} (${dealer.pipedriveOptionLabel})`
    : lead.comparedKeys
      ? 'none — manual routing'
      : undefined;
  const crmLine = deal
    ? `Pipedrive: deal #${deal.dealId} created`
    : `Pipedrive: FAILED — the lead is NOT in the CRM, enter it manually. (${dealError ?? 'unknown error'})`;
  const unmappedLine = deal?.unmapped.length
    ? `Not mapped to deal fields: ${deal.unmapped.map(([k, v]) => `${k}=${v}`).join('; ')}`
    : undefined;

  const rows: Array<[string, string | undefined]> = [
    ['Name', lead.name],
    ['E-mail', lead.email],
    ['Phone', lead.phone],
    ['Model', lead.model],
    ['Compared yachts', lead.comparedKeys?.join(', ')],
    ['Brand', lead.brand],
    ['Dealer', dealerLine],
    ['Catalogue model', lead.yachtKey],
    ['Stock unit', lead.stockKey],
    ['Interested in the unit in stock', lead.stockInterest ? 'yes' : undefined],
    ['Financing', lead.financing ? 'yes' : undefined],
    ['Language', lead.lang],
    ['Page', lead.pageUrl],
    ['UTM', utm || undefined],
  ];

  const text = [
    crmLine,
    unmappedLine,
    '',
    ...rows.map(([label, value]) => (value ? `${label}: ${value}` : undefined)),
    '',
    'Message:',
    lead.message ?? '(none)',
    '',
    `Consent (${consentAt}): "${lead.consentText}"`,
  ]
    .filter((l) => l !== undefined)
    .join('\n');

  const statusColor = deal ? PALETTE.teal : '#8A2E2E';
  const statusHtml = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px 0;"><tr>
<td style="padding:8px 14px;border-radius:2px;background:${statusColor};color:${PALETTE.white};font-size:12px;letter-spacing:0.08em;font-weight:600;">${escapeHtml(crmLine)}</td>
</tr></table>${unmappedLine ? `<p style="margin:-10px 0 22px 0;font-size:12px;line-height:1.5;color:${PALETTE.ink55};">${escapeHtml(unmappedLine)}</p>` : ''}`;

  const body = [
    eyebrow(lead.comparedKeys ? 'New enquiry · compare' : 'New enquiry'),
    heading(`${enquirySubjectLine(lead)} — ${lead.name}`),
    statusHtml,
    detailTable(rows),
    rule(),
    `<p style="margin:0 0 10px 0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${PALETTE.ink55};">Message</p>`,
    lead.message ? quote(lead.message) : `<p style="margin:0;font-size:15px;color:${PALETTE.ink55};">(none)</p>`,
    rule(),
    `<p style="margin:0;font-size:12px;line-height:1.6;color:${PALETTE.ink55};">Consent ${escapeHtml(consentAt)}: &ldquo;${escapeHtml(lead.consentText)}&rdquo;</p>`,
  ].join('\n');

  const html = shell({
    preheader: crmLine,
    body,
    footer: `Reply to this e-mail to answer ${escapeHtml(lead.name)} directly${lead.email ? ` (${escapeHtml(lead.email)})` : ''}.`,
  });
  return { subject, text, html };
}

/* ------------------------------------------------------------------ */
/* Confirmation to the person who enquired                             */
/* ------------------------------------------------------------------ */

interface ConfirmationCopy {
  subject: (what: string | undefined) => string;
  eyebrow: string;
  heading: string;
  /** `{name}` is replaced with the first name. */
  intro: string;
  /** Shown when the enquiry names a model or compared yachts. */
  about: string;
  promise: string;
  yourMessage: string;
  closing: string;
  signature: string;
  footer: string;
}

const COPY: Record<Lead['lang'], ConfirmationCopy> = {
  en: {
    subject: (what) => (what ? `We have your enquiry — ${what}` : 'We have your enquiry'),
    eyebrow: 'Enquiry received',
    heading: 'Thank you — we have your enquiry.',
    intro: 'Dear {name},',
    about: 'Thank you for your interest in',
    promise: 'An advisor will come back to you within one working day to arrange the next step.',
    yourMessage: 'Your message',
    closing: 'Kind regards,',
    signature: 'The Herev team',
    footer: 'You are receiving this e-mail because you sent an enquiry through our website. Simply reply if you would like to add anything.',
  },
  pl: {
    subject: (what) => (what ? `Mamy Twoje zapytanie — ${what}` : 'Mamy Twoje zapytanie'),
    eyebrow: 'Zapytanie przyjęte',
    heading: 'Dziękujemy — mamy Twoje zapytanie.',
    intro: 'Dzień dobry, {name},',
    about: 'Dziękujemy za zainteresowanie:',
    promise: 'Doradca odezwie się w ciągu jednego dnia roboczego, aby ustalić kolejny krok.',
    yourMessage: 'Twoja wiadomość',
    closing: 'Z wyrazami szacunku,',
    signature: 'Zespół Herev',
    footer: 'Otrzymujesz tę wiadomość, ponieważ z tego adresu wysłano zapytanie przez naszą stronę. Jeśli chcesz coś dodać, po prostu odpowiedz na ten e-mail.',
  },
  es: {
    subject: (what) => (what ? `Hemos recibido su consulta — ${what}` : 'Hemos recibido su consulta'),
    eyebrow: 'Consulta recibida',
    heading: 'Gracias — hemos recibido su consulta.',
    intro: 'Estimado/a {name},',
    about: 'Gracias por su interés en',
    promise: 'Un asesor se pondrá en contacto con usted en el plazo de un día laborable para acordar el siguiente paso.',
    yourMessage: 'Su mensaje',
    closing: 'Atentamente,',
    signature: 'El equipo de Herev',
    footer: 'Recibe este correo porque ha enviado una consulta a través de nuestra web. Si desea añadir algo, basta con responder a este mensaje.',
  },
  it: {
    subject: (what) => (what ? `Abbiamo ricevuto la sua richiesta — ${what}` : 'Abbiamo ricevuto la sua richiesta'),
    eyebrow: 'Richiesta ricevuta',
    heading: 'Grazie — abbiamo ricevuto la sua richiesta.',
    intro: 'Gentile {name},',
    about: 'Grazie per il suo interesse per',
    promise: 'Un consulente la ricontatterà entro un giorno lavorativo per concordare il passo successivo.',
    yourMessage: 'Il suo messaggio',
    closing: 'Cordiali saluti,',
    signature: 'Il team Herev',
    footer: 'Riceve questa e-mail perché ha inviato una richiesta tramite il nostro sito. Se desidera aggiungere qualcosa, risponda semplicemente a questo messaggio.',
  },
};

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function renderConfirmationMail(lead: Lead): RenderedMail {
  const copy = COPY[lead.lang];
  const what = lead.comparedKeys ? lead.comparedKeys.join(' · ') : lead.model;
  const intro = copy.intro.replace('{name}', firstName(lead.name));

  const text = [
    intro,
    '',
    copy.heading,
    what ? `${copy.about} ${what}.` : undefined,
    copy.promise,
    lead.message ? `\n${copy.yourMessage}:\n${lead.message}` : undefined,
    '',
    copy.closing,
    copy.signature,
    '',
    copy.footer,
  ]
    .filter((l) => l !== undefined)
    .join('\n');

  const body = [
    eyebrow(copy.eyebrow),
    heading(copy.heading),
    paragraph(escapeHtml(intro)),
    what
      ? paragraph(`${escapeHtml(copy.about)} <strong style="font-weight:600;color:${PALETTE.teal};">${escapeHtml(what)}</strong>.`)
      : '',
    paragraph(escapeHtml(copy.promise)),
    lead.message
      ? `${rule()}<p style="margin:0 0 10px 0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${PALETTE.ink55};">${escapeHtml(copy.yourMessage)}</p>${quote(lead.message)}`
      : '',
    rule(),
    `<p style="margin:0;font-size:15px;line-height:1.65;color:${PALETTE.ink};">${escapeHtml(copy.closing)}<br><span style="font-family:${FONT_DISPLAY};font-size:17px;">${escapeHtml(copy.signature)}</span></p>`,
  ].join('\n');

  return {
    subject: copy.subject(what),
    text,
    html: shell({ preheader: copy.promise, body, footer: escapeHtml(copy.footer) }),
  };
}
