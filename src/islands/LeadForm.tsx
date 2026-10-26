import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  leadFieldErrors,
  leadSchema,
  splitContact,
  UTM_STORAGE_KEY,
  type LeadFieldError,
  type LeadInput,
  type LeadSource,
} from '../lib/lead';

/**
 * Enquiry form (Step 5). Replaces the visual-only <form> inside LeadModule
 * and YachtLeadModule; the surrounding section stays static. Validates with
 * the same Zod schema as /api/lead, gets a Turnstile token on first focus
 * (the widget only shows up when Cloudflare needs an interaction) and
 * attaches UTM parameters captured by the inline script in Layout.astro.
 */
export interface LeadFormStrings {
  name: string;
  /** Compact variant: one "e-mail or phone" field. */
  contact: string;
  email: string;
  phone: string;
  model: string;
  message: string;
  cta: string;
  sending: string;
  successHeading: string;
  successBody: string;
  error: string;
  privacy: string;
  financing: string;
  stockInterest: string;
  errors: Record<LeadFieldError, string>;
}

export interface LeadFormContext {
  lang: LeadInput['lang'];
  source: LeadSource;
  brand?: string;
  yachtKey?: string;
  stockKey?: string;
  /** Page's model/unit name — shown read-only in the yacht variant. */
  model?: string;
}

interface Props {
  variant: 'compact' | 'yacht';
  context: LeadFormContext;
  strings: LeadFormStrings;
  /** Compact variant: suggestions for the model field. */
  models?: string[];
  showFinancing?: boolean;
  showStockInterest?: boolean;
  turnstileSiteKey?: string;
  fallbackContact: string;
  /** Rendered on the right of the submit button (brochure link). */
  children?: React.ReactNode;
}

type Status = 'idle' | 'sending' | 'done' | 'error';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id: string) => void;
    };
  }
}

const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SRC}"]`);
    const script = existing ?? document.createElement('script');
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('turnstile script')), { once: true });
    if (!existing) {
      script.src = TURNSTILE_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

function readUtm(): LeadInput['utm'] {
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const pick = (k: string) => (typeof parsed[k] === 'string' ? (parsed[k] as string) : undefined);
    return { source: pick('source'), medium: pick('medium'), campaign: pick('campaign') };
  } catch {
    return undefined;
  }
}

const inputBase =
  'w-full bg-transparent border-b border-[rgba(236,239,238,.32)] text-white placeholder-white/40 py-3 px-0 text-[15px] font-body focus:outline-none focus:border-white/60 transition-colors';
const inputError = 'border-gilt';
const checkboxBase = 'w-[17px] h-[17px] accent-gilt shrink-0';
const btnGilt =
  'inline-flex items-center gap-3 px-[26px] py-[15px] font-body font-semibold text-sm rounded-soft transition-colors cursor-pointer bg-gilt text-ink hover:bg-[#b8923d] disabled:opacity-60 disabled:cursor-wait';

export default function LeadForm({
  variant,
  context,
  strings,
  models,
  showFinancing,
  showStockInterest,
  turnstileSiteKey,
  fallbackContact,
  children,
}: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Partial<Record<LeadFieldError, true>>>({});
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const tokenRef = useRef<string | undefined>(undefined);
  const tokenWaiters = useRef<Array<(t: string | undefined) => void>>([]);
  const started = useRef(false);

  const setToken = (t: string | undefined) => {
    tokenRef.current = t;
    if (t) {
      tokenWaiters.current.forEach((w) => w(t));
      tokenWaiters.current = [];
    }
  };

  // Turnstile only once the visitor starts filling in the form.
  const startTurnstile = () => {
    if (started.current || !turnstileSiteKey) return;
    started.current = true;
    loadTurnstile()
      .then(() => {
        if (!widgetRef.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(widgetRef.current, {
          sitekey: turnstileSiteKey,
          appearance: 'interaction-only',
          language: context.lang,
          callback: (t: string) => setToken(t),
          'expired-callback': () => setToken(undefined),
          'error-callback': () => setToken(undefined),
        });
      })
      .catch(() => {
        started.current = false;
      });
  };

  useEffect(() => () => tokenWaiters.current.forEach((w) => w(undefined)), []);

  const waitForToken = (): Promise<string | undefined> => {
    if (!turnstileSiteKey) return Promise.resolve(undefined);
    if (tokenRef.current) return Promise.resolve(tokenRef.current);
    startTurnstile();
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(undefined), 15_000);
      tokenWaiters.current.push((t) => {
        clearTimeout(timer);
        resolve(t);
      });
    });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'sending') return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const text = (k: string) => String(data.get(k) ?? '').trim();

    const contact = variant === 'compact' ? splitContact(text('contact')) : { email: text('email') || undefined, phone: text('phone') || undefined };
    const input: LeadInput = {
      lang: context.lang,
      source: context.source,
      name: text('name'),
      ...contact,
      model: variant === 'compact' ? text('model') || undefined : context.model,
      message: text('message') || undefined,
      brand: context.brand,
      yachtKey: context.yachtKey,
      stockKey: context.stockKey,
      financing: data.get('financing') === 'on',
      stockInterest: data.get('stockInterest') === 'on',
      consent: (data.get('privacy') === 'on') as true,
      consentText: strings.privacy,
      utm: readUtm(),
      pageUrl: window.location.href,
    };

    const parsed = leadSchema.safeParse(input);
    if (!parsed.success) {
      setErrors(leadFieldErrors(parsed.error.issues));
      return;
    }
    setErrors({});
    setStatus('sending');

    try {
      const turnstileToken = await waitForToken();
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, turnstileToken }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('done');
    } catch {
      setStatus('error');
      if (widgetId.current && window.turnstile) {
        setToken(undefined);
        window.turnstile.reset(widgetId.current);
      }
    }
  };

  if (status === 'done') {
    return (
      <div role="status" className="max-w-[640px]">
        <p className="font-display text-white text-[1.5rem] leading-tight mb-3" style={{ fontWeight: 400 }}>
          {strings.successHeading}
        </p>
        <p className="text-[var(--color-paper-72)] text-body leading-relaxed">{strings.successBody}</p>
      </div>
    );
  }

  const fieldError = (key: LeadFieldError) =>
    errors[key] ? (
      <p className="text-gilt text-[12px] mt-1.5" role="alert">
        {strings.errors[key]}
      </p>
    ) : null;

  const compact = variant === 'compact';

  return (
    <form
      aria-label="Enquiry form"
      noValidate
      onSubmit={onSubmit}
      onFocusCapture={startTurnstile}
      className={compact ? undefined : 'max-w-[640px]'}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <input
            type="text"
            name="name"
            placeholder={strings.name}
            autoComplete="name"
            required
            aria-invalid={errors.name || undefined}
            className={`${inputBase} ${errors.name ? inputError : ''}`}
          />
          {fieldError('name')}
        </div>
        {compact ? (
          <div>
            <input
              type="text"
              name="contact"
              placeholder={strings.contact}
              autoComplete="email"
              required
              aria-invalid={errors.contact || errors.email || errors.phone || undefined}
              className={`${inputBase} ${errors.contact || errors.email || errors.phone ? inputError : ''}`}
            />
            {fieldError(errors.email ? 'email' : errors.phone ? 'phone' : 'contact')}
          </div>
        ) : (
          <div>
            <input
              type="email"
              name="email"
              placeholder={strings.email}
              autoComplete="email"
              required
              aria-invalid={errors.email || errors.contact || undefined}
              className={`${inputBase} ${errors.email || errors.contact ? inputError : ''}`}
            />
            {fieldError(errors.email ? 'email' : 'contact')}
          </div>
        )}
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${compact ? 'mb-8' : 'mb-4'}`}>
        {compact ? (
          <>
            <input
              type="text"
              name="model"
              placeholder={strings.model}
              autoComplete="off"
              list={models?.length ? 'model-list' : undefined}
              className={inputBase}
            />
            {models?.length ? (
              <datalist id="model-list">
                {models.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            ) : null}
            <input type="text" name="message" placeholder={strings.message} className={inputBase} />
          </>
        ) : (
          <>
            <div>
              <input
                type="tel"
                name="phone"
                placeholder={strings.phone}
                autoComplete="tel"
                aria-invalid={errors.phone || undefined}
                className={`${inputBase} ${errors.phone ? inputError : ''}`}
              />
              {fieldError('phone')}
            </div>
            <input
              type="text"
              name="model"
              value={context.model ?? ''}
              readOnly
              className="w-full bg-transparent border-b border-[rgba(236,239,238,.18)] text-[rgba(236,239,238,.6)] py-3 px-0 text-[14px] font-mono focus:outline-none"
            />
          </>
        )}
      </div>

      {!compact && (
        <div className="mb-6">
          <textarea name="message" placeholder={strings.message} rows={2} className={`${inputBase} resize-none w-full`} />
        </div>
      )}

      {showFinancing && (
        <label className="flex items-center gap-3 mb-3.5 cursor-pointer">
          <input type="checkbox" name="financing" className={checkboxBase} />
          <span className="text-[14px] text-[rgba(236,239,238,.85)]">{strings.financing}</span>
        </label>
      )}
      {showStockInterest && (
        <label className="flex items-center gap-3 mb-3.5 cursor-pointer">
          <input type="checkbox" name="stockInterest" className={checkboxBase} />
          <span className="text-[14px] text-[rgba(236,239,238,.85)]">{strings.stockInterest}</span>
        </label>
      )}
      <label className="flex items-start gap-3 mb-7 cursor-pointer">
        <input
          type="checkbox"
          name="privacy"
          required
          aria-invalid={errors.consent || undefined}
          className={`${checkboxBase} mt-0.5`}
        />
        <span className={`text-[13px] leading-[1.5] ${errors.consent ? 'text-gilt' : 'text-[rgba(236,239,238,.7)]'}`}>
          {strings.privacy}
        </span>
      </label>
      {fieldError('consent')}

      <div ref={widgetRef} className="mb-4 empty:hidden" />

      <div className={compact ? '' : 'flex flex-wrap gap-3'}>
        <button type="submit" disabled={status === 'sending'} className={`${btnGilt} ${compact ? 'w-full justify-center' : ''}`}>
          {status === 'sending' ? strings.sending : strings.cta}
        </button>
        {children}
      </div>

      {status === 'error' && (
        <p className="text-gilt text-[13px] mt-4" role="alert">
          {strings.error}{' '}
          <a href={`mailto:${fallbackContact}`} className="underline">
            {fallbackContact}
          </a>
        </p>
      )}
    </form>
  );
}
