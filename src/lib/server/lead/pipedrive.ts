import type { Lead } from '../../lead';

export interface Dealer {
  dealerId: string;
  name: string;
  email: string;
  /** Option label of the "Dealer" deal field in Pipedrive — matched character for character. */
  pipedriveOptionLabel: string;
}

/**
 * Custom deal fields the endpoint fills, looked up by NAME in the Pipedrive
 * account (custom field API keys are account-specific hashes). A field that
 * does not exist, or an option label that does not match, is not an error:
 * the value lands in the deal note instead, so nothing is lost.
 * The names are part of the Pipedrive setup — docs/kontrakt-api-lead.md.
 */
export const DEAL_FIELD_NAMES = {
  dealer: 'Dealer',
  brand: 'Brand',
  language: 'Language',
  utmSource: 'UTM Source',
  utmMedium: 'UTM Medium',
  utmCampaign: 'UTM Campaign',
  consentText: 'Consent',
  consentAt: 'Consent timestamp',
  stockUnit: 'Stock unit',
  stockInterest: 'Stock interest',
  financing: 'Financing',
  comparedYachts: 'Compared yachts',
  pageUrl: 'Source page',
} as const;

export interface DealField {
  key: string;
  name: string;
  field_type: string;
  options?: Array<{ id: number; label: string }>;
}

export type DealFieldValues = Record<string, string | undefined>;

/**
 * Maps `{ "Field name": value }` onto the account's deal fields.
 * Enum/set fields take the option id whose label equals the value exactly;
 * every other type takes the string. Unmapped values are returned so the
 * caller can put them in the note.
 */
export function buildDealFields(
  fields: DealField[],
  values: DealFieldValues,
): { custom: Record<string, string | number | number[]>; unmapped: Array<[string, string]> } {
  const custom: Record<string, string | number | number[]> = {};
  const unmapped: Array<[string, string]> = [];
  for (const [name, value] of Object.entries(values)) {
    if (value === undefined || value === '') continue;
    const field = fields.find((f) => f.name === name);
    if (!field) {
      unmapped.push([name, value]);
      continue;
    }
    if (field.field_type === 'enum' || field.field_type === 'set') {
      const option = field.options?.find((o) => o.label === value);
      if (!option) {
        unmapped.push([name, value]);
        continue;
      }
      custom[field.key] = field.field_type === 'set' ? [option.id] : option.id;
    } else {
      custom[field.key] = value;
    }
  }
  return { custom, unmapped };
}

/** Values for the custom fields of one lead. */
export function dealFieldValues(lead: Lead, dealer: Dealer | undefined, consentAt: string): DealFieldValues {
  const n = DEAL_FIELD_NAMES;
  return {
    [n.dealer]: dealer?.pipedriveOptionLabel,
    [n.brand]: lead.brand,
    [n.language]: lead.lang,
    [n.utmSource]: lead.utm?.source,
    [n.utmMedium]: lead.utm?.medium,
    [n.utmCampaign]: lead.utm?.campaign,
    [n.consentText]: lead.consentText,
    [n.consentAt]: consentAt,
    [n.stockUnit]: lead.stockKey,
    [n.stockInterest]: lead.stockInterest ? 'Yes' : undefined,
    [n.financing]: lead.financing ? 'Yes' : undefined,
    [n.comparedYachts]: lead.comparedKeys?.join(', '),
    [n.pageUrl]: lead.pageUrl,
  };
}

export function dealTitle(lead: Lead): string {
  const subject = lead.comparedKeys ? `Compare: ${lead.comparedKeys.join(' vs ')}` : lead.model;
  return subject ? `${subject} — ${lead.name}` : `Enquiry — ${lead.name}`;
}

export interface PipedriveConfig {
  apiToken: string;
  fetchFn?: typeof fetch;
}

const BASE = 'https://api.pipedrive.com/v1';

async function api<T>(config: PipedriveConfig, path: string, init?: RequestInit): Promise<T> {
  const fetchFn = config.fetchFn ?? fetch;
  const url = `${BASE}${path}${path.includes('?') ? '&' : '?'}api_token=${encodeURIComponent(config.apiToken)}`;
  const res = await fetchFn(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const endpoint = path.split('?')[0];
  if (!res.ok) throw new Error(`Pipedrive ${endpoint} ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as { success?: boolean; data?: T };
  if (json.success === false) throw new Error(`Pipedrive ${endpoint}: success=false`);
  return json.data as T;
}

let fieldsCache: { at: number; fields: DealField[] } | undefined;
const FIELDS_TTL_MS = 5 * 60_000;

async function getDealFields(config: PipedriveConfig): Promise<DealField[]> {
  if (fieldsCache && Date.now() - fieldsCache.at < FIELDS_TTL_MS) return fieldsCache.fields;
  const fields = (await api<DealField[] | null>(config, '/dealFields?limit=500')) ?? [];
  fieldsCache = { at: Date.now(), fields };
  return fields;
}

async function findOrCreatePerson(config: PipedriveConfig, lead: Lead): Promise<number> {
  if (lead.email) {
    const found = await api<{ items?: Array<{ item: { id: number } }> } | null>(
      config,
      `/persons/search?term=${encodeURIComponent(lead.email)}&fields=email&exact_match=true&limit=1`,
    );
    const id = found?.items?.[0]?.item?.id;
    if (id) return id;
  }
  const person = await api<{ id: number }>(config, '/persons', {
    method: 'POST',
    body: JSON.stringify({
      name: lead.name,
      ...(lead.email ? { email: [{ value: lead.email, primary: true }] } : {}),
      ...(lead.phone ? { phone: [{ value: lead.phone, primary: true }] } : {}),
    }),
  });
  return person.id;
}

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
const escapeHtml = (s: string) => s.replace(/[&<>]/g, (c) => HTML_ESCAPES[c] ?? c);

export function dealNote(lead: Lead, unmapped: Array<[string, string]>): string {
  const lines: string[] = [];
  if (lead.message) lines.push(`<b>Message:</b><br>${escapeHtml(lead.message).replace(/\n/g, '<br>')}`);
  if (lead.phone) lines.push(`<b>Phone:</b> ${escapeHtml(lead.phone)}`);
  if (lead.email) lines.push(`<b>E-mail:</b> ${escapeHtml(lead.email)}`);
  if (unmapped.length) {
    lines.push(
      '<b>Not mapped to deal fields (field or option missing in Pipedrive):</b><br>' +
        unmapped.map(([k, v]) => `${escapeHtml(k)}: ${escapeHtml(v)}`).join('<br>'),
    );
  }
  return lines.join('<br><br>') || 'Enquiry from herev.com';
}

export interface DealResult {
  dealId: number;
  unmapped: Array<[string, string]>;
}

/** Person (found by e-mail or created) + deal with custom fields + note with the message. */
export async function createDeal(
  lead: Lead,
  dealer: Dealer | undefined,
  consentAt: string,
  config: PipedriveConfig,
): Promise<DealResult> {
  const fields = await getDealFields(config);
  const { custom, unmapped } = buildDealFields(fields, dealFieldValues(lead, dealer, consentAt));
  const personId = await findOrCreatePerson(config, lead);
  const deal = await api<{ id: number }>(config, '/deals', {
    method: 'POST',
    body: JSON.stringify({ title: dealTitle(lead), person_id: personId, ...custom }),
  });
  await api(config, '/notes', {
    method: 'POST',
    body: JSON.stringify({ deal_id: deal.id, content: dealNote(lead, unmapped) }),
  });
  return { dealId: deal.id, unmapped };
}

/** Test hook. */
export function resetDealFieldsCache() {
  fieldsCache = undefined;
}
