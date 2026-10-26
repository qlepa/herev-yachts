import { z } from 'astro/zod';

/**
 * Lead payload — one schema for the form island and `/api/lead`
 * (docs/kontrakt-api-lead.md). Isomorphic: no server imports here.
 */
export const LEAD_SOURCES = ['home', 'services', 'brand', 'yacht', 'stock', 'compare'] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const UTM_KEYS = ['source', 'medium', 'campaign'] as const;
/** sessionStorage key written by the inline script in `Layout.astro`. */
export const UTM_STORAGE_KEY = 'herev-utm';

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined);

export const leadSchema = z
  .object({
    lang: z.enum(['en', 'pl', 'es', 'it']),
    source: z.enum(LEAD_SOURCES),
    name: z.string().trim().min(2, 'name').max(120, 'name'),
    email: z.email('email').max(200, 'email').optional(),
    phone: z.string().trim().min(5, 'phone').max(40, 'phone').optional(),
    /** Model the visitor typed or the page's model/unit name. */
    model: optionalText(120),
    message: optionalText(2000),
    /** Brand key of the page (brand, yacht, stock) — routes the deal to the brand's default dealer. */
    brand: optionalText(40),
    /** translationKey of the catalogue model (yacht page). */
    yachtKey: optionalText(120),
    /** translationKey of the unit (available-now page). */
    stockKey: optionalText(120),
    /** Compare variant: translationKeys of the compared yachts. */
    comparedKeys: z.array(z.string().trim().min(1).max(120)).min(2).max(3).optional(),
    financing: z.boolean().default(false),
    stockInterest: z.boolean().default(false),
    /** GDPR: separate, never pre-checked; the exact wording shown travels with the lead. */
    consent: z.literal(true, 'consent'),
    consentText: z.string().trim().min(1).max(600),
    utm: z
      .object({
        source: optionalText(200),
        medium: optionalText(200),
        campaign: optionalText(200),
      })
      .optional(),
    pageUrl: optionalText(500),
    turnstileToken: z.string().max(4000).optional(),
  })
  .refine((d) => d.email || d.phone, { message: 'contact', path: ['contact'] });

export type LeadInput = z.input<typeof leadSchema>;
export type Lead = z.output<typeof leadSchema>;

/** Field-level error codes the form shows; anything else is a generic error. */
export type LeadFieldError = 'name' | 'contact' | 'email' | 'phone' | 'consent';

/** First issue per field, keyed by the form field. */
export function leadFieldErrors(issues: z.ZodError['issues']): Partial<Record<LeadFieldError, true>> {
  const out: Partial<Record<LeadFieldError, true>> = {};
  for (const issue of issues) {
    const field = String(issue.path[0] ?? '');
    const code = issue.message;
    if (field === 'name') out.name = true;
    else if (field === 'contact') out.contact = true;
    else if (field === 'email') out.email = true;
    else if (field === 'phone') out.phone = true;
    else if (field === 'consent' || code === 'consent') out.consent = true;
  }
  return out;
}

/** The compact form has one "e-mail or phone" field. */
export function splitContact(value: string): { email?: string; phone?: string } {
  const v = value.trim();
  if (!v) return {};
  return v.includes('@') ? { email: v } : { phone: v };
}
