import { leadSchema, type Lead } from '../../lead';
import type { Dealer, DealResult } from './pipedrive';

/**
 * `/api/lead` orchestration (docs/kontrakt-api-lead.md), free of I/O so
 * the failure paths are unit-tested. The endpoint wires the real services.
 */
export interface LeadDeps {
  verifyTurnstile: (token: string | undefined) => Promise<boolean>;
  resolveDealer: (brand: string) => Promise<Dealer | undefined>;
  createDeal: (lead: Lead, dealer: Dealer | undefined, consentAt: string) => Promise<DealResult>;
  loadRecipients: () => Promise<string[]>;
  sendMail: (message: { to: string[]; subject: string; text: string; replyTo?: string }) => Promise<void>;
  /** Used when Sanity has no recipients. */
  fallbackEmail: string | undefined;
  log: Pick<Console, 'error' | 'warn'>;
  now?: () => number;
}

export type LeadResponse =
  | { status: 200; body: { ok: true; duplicate?: true } }
  | { status: 400; body: { ok: false; error: 'turnstile' | 'validation'; fields?: string[] } }
  | { status: 502; body: { ok: false; error: 'delivery' } };

/**
 * Double-submit guard: same contact within the window → no second deal.
 * Per serverless instance (no database) — covers the double click and the
 * impatient retry, which is what the contract asks for.
 */
const DEDUPE_WINDOW_MS = 2 * 60_000;
const recent = new Map<string, number>();

function dedupeKey(lead: Lead): string {
  return (lead.email ?? lead.phone ?? '').toLowerCase().replace(/\s+/g, '');
}

/** Test hook. */
export function resetDedupe() {
  recent.clear();
}

export async function handleLead(rawBody: unknown, deps: LeadDeps): Promise<LeadResponse> {
  const now = deps.now ?? Date.now;
  const token =
    rawBody && typeof rawBody === 'object' && typeof (rawBody as { turnstileToken?: unknown }).turnstileToken === 'string'
      ? (rawBody as { turnstileToken: string }).turnstileToken
      : undefined;

  // 1. Antispam first — nothing below runs for an unverified request.
  if (!(await deps.verifyTurnstile(token))) {
    return { status: 400, body: { ok: false, error: 'turnstile' } };
  }

  // 2. Shared schema.
  const parsed = leadSchema.safeParse(rawBody);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((i) => String(i.path[0] ?? i.message)))];
    return { status: 400, body: { ok: false, error: 'validation', fields } };
  }
  const lead = parsed.data;
  const consentAt = new Date(now()).toISOString();

  // 5. Idempotency.
  const key = dedupeKey(lead);
  for (const [k, at] of recent) if (now() - at > DEDUPE_WINDOW_MS) recent.delete(k);
  if (recent.has(key)) {
    deps.log.warn(`lead: duplicate submit ignored for ${key}`);
    return { status: 200, body: { ok: true, duplicate: true } };
  }

  // 3. CRM. The compare variant has no dealer (yachts may span brands).
  const dealer =
    lead.brand && !lead.comparedKeys ? await deps.resolveDealer(lead.brand).catch(() => undefined) : undefined;
  let deal: DealResult | undefined;
  let dealError: string | undefined;
  try {
    deal = await deps.createDeal(lead, dealer, consentAt);
  } catch (err) {
    dealError = err instanceof Error ? err.message : String(err);
    deps.log.error(`lead: Pipedrive failed — ${dealError}`);
  }

  // 4. Notification to every recipient from Sanity; empty list = fallback + error log.
  let recipients: string[] = [];
  try {
    recipients = await deps.loadRecipients();
  } catch (err) {
    deps.log.error(`lead: could not read notificationRecipients — ${err instanceof Error ? err.message : err}`);
  }
  if (recipients.length === 0) {
    deps.log.error('lead: notificationRecipients is empty — using the fallback address');
    if (deps.fallbackEmail) recipients = [deps.fallbackEmail];
  }
  let mailed = false;
  if (recipients.length === 0) {
    deps.log.error('lead: no fallback address configured (LEAD_FALLBACK_EMAIL)');
  } else {
    try {
      await deps.sendMail({
        ...formatLeadMail(lead, dealer, consentAt, deal, dealError),
        to: recipients,
        replyTo: lead.email,
      });
      mailed = true;
    } catch (err) {
      deps.log.error(`lead: Resend failed — ${err instanceof Error ? err.message : err}`);
    }
  }

  // 6. The lead is safe if it reached at least one place.
  if (!deal && !mailed) {
    deps.log.error(`lead: LOST — neither Pipedrive nor e-mail accepted it. Payload: ${JSON.stringify(lead)}`);
    return { status: 502, body: { ok: false, error: 'delivery' } };
  }
  recent.set(key, now());
  return { status: 200, body: { ok: true } };
}

export function formatLeadMail(
  lead: Lead,
  dealer: Dealer | undefined,
  consentAt: string,
  deal: DealResult | undefined,
  dealError: string | undefined,
): { subject: string; text: string } {
  const subject = lead.comparedKeys
    ? `New enquiry (compare): ${lead.comparedKeys.join(' vs ')} — ${lead.name}`
    : `New enquiry: ${lead.model ?? 'general'} — ${lead.name}`;
  const row = (label: string, value: string | undefined) => (value ? `${label}: ${value}` : undefined);
  const utm = [lead.utm?.source, lead.utm?.medium, lead.utm?.campaign].filter(Boolean).join(' / ');
  const lines = [
    deal
      ? `Pipedrive: deal #${deal.dealId} created`
      : `Pipedrive: FAILED — the lead is NOT in the CRM, enter it manually. (${dealError ?? 'unknown error'})`,
    deal?.unmapped.length
      ? `Not mapped to deal fields: ${deal.unmapped.map(([k, v]) => `${k}=${v}`).join('; ')}`
      : undefined,
    '',
    row('Name', lead.name),
    row('E-mail', lead.email),
    row('Phone', lead.phone),
    row('Model', lead.model),
    row('Compared yachts', lead.comparedKeys?.join(', ')),
    row('Brand', lead.brand),
    row(
      'Dealer',
      dealer ? `${dealer.name} (${dealer.pipedriveOptionLabel})` : lead.comparedKeys ? 'none — manual routing' : undefined,
    ),
    row('Catalogue model', lead.yachtKey),
    row('Stock unit', lead.stockKey),
    row('Interested in the unit in stock', lead.stockInterest ? 'yes' : undefined),
    row('Financing', lead.financing ? 'yes' : undefined),
    row('Language', lead.lang),
    row('Page', lead.pageUrl),
    row('UTM', utm || undefined),
    '',
    'Message:',
    lead.message ?? '(none)',
    '',
    `Consent (${consentAt}): "${lead.consentText}"`,
  ];
  return { subject, text: lines.filter((l) => l !== undefined).join('\n') };
}
