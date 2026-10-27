import { useEffect, useMemo, useRef, useState } from 'react';
import LeadForm, { type LeadFormStrings } from './LeadForm';
import {
  COMPARE_MAX,
  compareHref,
  parseCompareKeys,
  sharedBrand,
  specGroups,
  verdictSentences,
  type CompareYacht,
  type SpecGroupLabels,
  type SpecLabels,
  type VerdictTemplates,
} from '../lib/compare';
import type { Locale } from '../lib/i18n';

/**
 * Comparison tool (Step 5, PR 2). Up to three catalogue models, any
 * marques; the selection lives in the URL (`?y=a,b,c`) so a comparison
 * can be shared. Every yacht of the locale arrives as build-time props —
 * no client fetching. The enquiry at the bottom is the same LeadForm
 * island, in its compare variant (docs/kontrakt-api-lead.md).
 *
 * Layout follows the usability findings behind the brief: grouped rows,
 * an "only differences" switch that hides identical rows, and a header
 * with name + thumbnail that stays visible while scrolling.
 */
export interface CompareStrings {
  addLabel: string;
  addPlaceholder: string;
  slotHint: string;
  remove: string;
  emptyHeading: string;
  emptyBody: string;
  oneMore: string;
  onlyDifferences: string;
  copyLink: string;
  linkCopied: string;
  print: string;
  viewModel: string;
  verdict: VerdictTemplates & { eyebrow: string; heading: string; allClose: string };
  scale: { eyebrow: string; heading: string };
  specs: { eyebrow: string; heading: string };
  extras: { title: string; availableNow: string; viewUnit: string; brochure: string; download: string };
  deckPlans: { eyebrow: string; heading: string };
  lead: { eyebrow: string; heading: string; body: string; cta: string };
}

interface Props {
  lang: Locale;
  yachts: CompareYacht[];
  strings: CompareStrings;
  specLabels: SpecLabels;
  specGroupLabels: SpecGroupLabels;
  leadStrings: LeadFormStrings;
  turnstileSiteKey?: string;
  fallbackContact: string;
}

const eyebrowCls = 'font-mono font-bold text-label tracking-label uppercase text-brass';
const h2Cls = 'font-display text-h2 text-ink';
const h2Style = { fontWeight: 400 } as const;
const ghostBtn =
  'inline-flex items-center gap-2 px-4 py-2.5 font-mono text-[11px] tracking-mono uppercase text-ink border border-[var(--color-line-strong)] bg-white hover:border-teal hover:text-teal transition-colors cursor-pointer';

/** Grid for one row: label column on desktop, then one cell per yacht. */
function columns(n: number) {
  return { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
}

/* ------------------------------------------------------------------ */
/* To-scale silhouettes                                                */
/* ------------------------------------------------------------------ */

function Silhouette({ yacht, maxLengthM }: { yacht: CompareYacht; maxLengthM: number }) {
  // Top view, stern at the left. 1000 units = the longest yacht of the set.
  const scale = 1000 / maxLengthM;
  const L = yacht.lengthM * scale;
  const B = (yacht.beamM ?? yacht.lengthM * 0.3) * scale;
  const H = B + 8;
  const y0 = 4;
  const y1 = y0 + B;
  const cy = y0 + B / 2;
  const bowStart = L * 0.62;
  const path = [
    `M 2 ${y0 + B * 0.08}`,
    `L ${bowStart} ${y0}`,
    `C ${L * 0.86} ${y0} ${L * 0.97} ${cy - B * 0.22} ${L} ${cy}`,
    `C ${L * 0.97} ${cy + B * 0.22} ${L * 0.86} ${y1} ${bowStart} ${y1}`,
    `L 2 ${y1 - B * 0.08}`,
    'Z',
  ].join(' ');
  const label = yacht.beamM !== undefined ? `${yacht.lengthM} m × ${yacht.beamM} m` : `${yacht.lengthM} m`;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono font-bold text-[11px] tracking-mono uppercase text-ink">{yacht.fullName}</span>
        <span className="font-mono text-[11px] tracking-mono text-[var(--color-ink-55)]">{label}</span>
      </div>
      <svg viewBox={`0 0 1000 ${H}`} className="w-full h-auto block" aria-hidden="true" preserveAspectRatio="xMinYMid meet">
        <path d={path} fill="var(--color-teal)" fillOpacity="0.18" stroke="var(--color-teal)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Island                                                              */
/* ------------------------------------------------------------------ */

export default function CompareTool({
  lang,
  yachts,
  strings: s,
  specLabels,
  specGroupLabels,
  leadStrings,
  turnstileSiteKey,
  fallbackContact,
}: Props) {
  const byKey = useMemo(() => new Map(yachts.map((y) => [y.translationKey, y])), [yachts]);
  const [keys, setKeys] = useState<string[]>([]);
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [copied, setCopied] = useState(false);
  const firstSync = useRef(true);

  // URL → state on mount; state → URL afterwards (replaceState keeps history clean).
  useEffect(() => {
    setKeys(parseCompareKeys(window.location.search, new Set(byKey.keys())));
  }, [byKey]);
  useEffect(() => {
    if (firstSync.current) {
      firstSync.current = false;
      return;
    }
    history.replaceState(null, '', compareHref(lang, keys));
  }, [keys, lang]);

  const selected = keys.map((k) => byKey.get(k)).filter((y): y is CompareYacht => y !== undefined);
  const n = selected.length;
  const ready = n >= 2;

  const add = (key: string) => setKeys((prev) => (prev.includes(key) || prev.length >= COMPARE_MAX ? prev : [...prev, key]));
  const remove = (key: string) => setKeys((prev) => prev.filter((k) => k !== key));

  const copyLink = () => {
    navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  // Picker options grouped by marque, in the order the yachts arrive (longest first).
  const groupsForPicker = useMemo(() => {
    const map = new Map<string, CompareYacht[]>();
    for (const y of yachts) {
      const list = map.get(y.brandDisplay) ?? [];
      list.push(y);
      map.set(y.brandDisplay, list);
    }
    return [...map.entries()];
  }, [yachts]);

  const sentences = ready ? verdictSentences(selected, s.verdict) : [];
  const groups = ready ? specGroups(selected, specLabels, specGroupLabels) : [];
  const visibleGroups = onlyDiff
    ? groups.map((g) => ({ ...g, rows: g.rows.filter((r) => !r.same) })).filter((g) => g.rows.length > 0)
    : groups;
  const maxLengthM = Math.max(...selected.map((y) => y.lengthM), 1);
  const anyLayouts = selected.some((y) => y.layouts.length > 0);
  const anyStock = selected.some((y) => y.stockHref);
  const anyBrochure = selected.some((y) => y.brochureHref);
  const brand = sharedBrand(selected);

  const picker = (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[9px] tracking-label uppercase text-[var(--color-ink-55)]">{s.addLabel}</span>
      <select
        value=""
        onChange={(e) => e.target.value && add(e.target.value)}
        disabled={n >= COMPARE_MAX}
        className="w-full bg-white border border-[var(--color-line)] font-mono text-[11px] tracking-mono text-ink px-3 py-2.5 focus:outline-none focus:border-teal cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">{s.addPlaceholder}</option>
        {groupsForPicker.map(([brandDisplay, list]) => (
          <optgroup key={brandDisplay} label={brandDisplay}>
            {list
              .filter((y) => !keys.includes(y.translationKey))
              .map((y) => (
                <option key={y.translationKey} value={y.translationKey}>
                  {y.name} · {y.lengthM} m
                </option>
              ))}
          </optgroup>
        ))}
      </select>
      <span className="font-mono text-[9px] tracking-mono text-[var(--color-ink-55)]">{s.slotHint}</span>
    </label>
  );

  return (
    <>
      {/* ─── Header: selected yachts (sticky) ─── */}
      <div className="sticky top-[72px] z-30 bg-paper border-b border-[var(--color-line)] print:static">
        <div className="max-w-[1440px] mx-auto px-gutter py-4">
          <div className="md:grid md:grid-cols-[200px_1fr] md:gap-8">
            <div className="hidden md:flex flex-col justify-end print:hidden">{n < COMPARE_MAX && picker}</div>
            <div className="grid gap-3 md:gap-6" style={columns(Math.max(n, 1))}>
              {selected.map((y) => (
                <div key={y.translationKey} className="flex items-center gap-3 min-w-0">
                  {y.imageSrc ? (
                    <img src={y.imageSrc} alt={y.fullName} loading="lazy" className="w-14 h-10 md:w-20 md:h-14 object-cover shrink-0 hidden sm:block" />
                  ) : (
                    <div className="w-14 h-10 md:w-20 md:h-14 bg-ink shrink-0 hidden sm:block" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[9px] tracking-label uppercase text-teal truncate">{y.brandDisplay}</p>
                    <p className="font-display text-[15px] md:text-title text-ink leading-tight truncate" style={{ fontWeight: 450 }}>
                      {y.name}
                    </p>
                    <a href={y.href} className="font-mono text-[9px] tracking-mono uppercase text-[var(--color-ink-55)] hover:text-teal transition-colors print:hidden">
                      {s.viewModel}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(y.translationKey)}
                    aria-label={`${s.remove}: ${y.fullName}`}
                    className="font-mono text-[18px] leading-none text-[var(--color-ink-55)] hover:text-ink transition-colors shrink-0 print:hidden"
                  >
                    ×
                  </button>
                </div>
              ))}
              {n === 0 && <div className="md:hidden" />}
            </div>
          </div>
          <div className="md:hidden mt-4 print:hidden">{n < COMPARE_MAX && picker}</div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-gutter">
        {/* ─── Controls ─── */}
        {ready && (
          <div className="flex flex-wrap items-center gap-3 py-6 print:hidden">
            <label className="inline-flex items-center gap-2.5 cursor-pointer mr-auto">
              <input type="checkbox" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} className="w-3.5 h-3.5 cursor-pointer accent-[var(--color-teal)]" />
              <span className="font-mono text-[11px] tracking-mono uppercase text-ink">{s.onlyDifferences}</span>
            </label>
            <button type="button" onClick={copyLink} className={ghostBtn}>
              {copied ? s.linkCopied : s.copyLink}
            </button>
            <button type="button" onClick={() => window.print()} className={`${ghostBtn} hidden md:inline-flex`}>
              {s.print}
            </button>
          </div>
        )}

        {/* ─── Empty states ─── */}
        {!ready && (
          <div className="py-20 max-w-[520px]">
            <h2 className="font-display text-h3 text-ink mb-3" style={h2Style}>
              {n === 0 ? s.emptyHeading : s.oneMore}
            </h2>
            {n === 0 && <p className="text-body text-[var(--color-ink-70)] leading-relaxed">{s.emptyBody}</p>}
          </div>
        )}

        {ready && (
          <>
            {/* ─── Verdict ─── */}
            <section className="py-12 border-b border-[var(--color-line)]">
              <p className={`${eyebrowCls} mb-3`}>{s.verdict.eyebrow}</p>
              <h2 className={`${h2Cls} mb-8`} style={h2Style}>
                {s.verdict.heading}
              </h2>
              {sentences.length > 0 ? (
                <ul className="flex flex-col gap-4 max-w-[860px]">
                  {sentences.map((line) => (
                    <li key={line} className="font-display text-lg md:text-h3 text-ink leading-snug pl-6 relative" style={{ fontWeight: 400 }}>
                      <span className="absolute left-0 top-[0.7em] w-3 h-px bg-brass" aria-hidden="true" />
                      {line}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-display text-lg md:text-h3 text-ink leading-snug max-w-[860px]" style={{ fontWeight: 400 }}>
                  {s.verdict.allClose}
                </p>
              )}
            </section>

            {/* ─── To scale ─── */}
            <section className="py-12 border-b border-[var(--color-line)]">
              <p className={`${eyebrowCls} mb-3`}>{s.scale.eyebrow}</p>
              <h2 className={`${h2Cls} mb-8`} style={h2Style}>
                {s.scale.heading}
              </h2>
              <div className="flex flex-col gap-6 max-w-[860px]">
                {selected.map((y) => (
                  <Silhouette key={y.translationKey} yacht={y} maxLengthM={maxLengthM} />
                ))}
              </div>
            </section>

            {/* ─── Specifications ─── */}
            <section className="py-12 border-b border-[var(--color-line)]">
              <p className={`${eyebrowCls} mb-3`}>{s.specs.eyebrow}</p>
              <h2 className={`${h2Cls} mb-8`} style={h2Style}>
                {s.specs.heading}
              </h2>
              {visibleGroups.map((g) => (
                <div key={g.title} className="mb-8 last:mb-0">
                  <p className="font-mono font-bold text-[10px] tracking-[.26em] uppercase text-teal border-b border-[var(--color-line-strong)] pb-3">
                    {g.title}
                  </p>
                  {g.rows.map((r) => (
                    <div key={r.label} className="md:grid md:grid-cols-[200px_1fr] md:gap-8 py-3.5 border-b border-[var(--color-line)]">
                      <span className="block font-mono text-[11px] tracking-[.08em] text-ink/55 mb-1.5 md:mb-0 md:self-center">{r.label}</span>
                      <div className="grid gap-3 md:gap-6" style={columns(n)}>
                        {r.values.map((v, i) => (
                          <span key={i} className={`font-mono text-[13px] md:text-[14px] ${r.same ? 'text-ink/70' : 'font-bold text-ink'}`}>
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {(anyStock || anyBrochure) && (
                <div className="mt-8">
                  <p className="font-mono font-bold text-[10px] tracking-[.26em] uppercase text-teal border-b border-[var(--color-line-strong)] pb-3">
                    {s.extras.title}
                  </p>
                  {anyStock && (
                    <div className="md:grid md:grid-cols-[200px_1fr] md:gap-8 py-3.5 border-b border-[var(--color-line)]">
                      <span className="block font-mono text-[11px] tracking-[.08em] text-ink/55 mb-1.5 md:mb-0 md:self-center">{s.extras.availableNow}</span>
                      <div className="grid gap-3 md:gap-6" style={columns(n)}>
                        {selected.map((y) => (
                          <span key={y.translationKey} className="font-mono text-[12px]">
                            {y.stockHref ? (
                              <a href={y.stockHref} className="font-semibold uppercase tracking-[.08em] text-teal hover:text-ink transition-colors">
                                {s.extras.viewUnit}
                              </a>
                            ) : (
                              <span className="text-ink/40">—</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {anyBrochure && (
                    <div className="md:grid md:grid-cols-[200px_1fr] md:gap-8 py-3.5 border-b border-[var(--color-line)]">
                      <span className="block font-mono text-[11px] tracking-[.08em] text-ink/55 mb-1.5 md:mb-0 md:self-center">{s.extras.brochure}</span>
                      <div className="grid gap-3 md:gap-6" style={columns(n)}>
                        {selected.map((y) => (
                          <span key={y.translationKey} className="font-mono text-[12px]">
                            {y.brochureHref ? (
                              <a href={y.brochureHref} target="_blank" rel="noopener" className="font-semibold uppercase tracking-[.08em] text-teal hover:text-ink transition-colors">
                                {s.extras.download}
                              </a>
                            ) : (
                              <span className="text-ink/40">—</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* ─── Deck plans ─── */}
            {anyLayouts && (
              <section className="py-12">
                <p className={`${eyebrowCls} mb-3`}>{s.deckPlans.eyebrow}</p>
                <h2 className={`${h2Cls} mb-8`} style={h2Style}>
                  {s.deckPlans.heading}
                </h2>
                {/* One column per yacht on desktop; stacked per yacht on mobile. */}
                <div
                  className="grid grid-cols-1 gap-10 md:gap-6 md:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
                  style={{ '--cols': n } as React.CSSProperties}
                >
                  {selected.map((y) => (
                    <div key={y.translationKey} className="flex flex-col gap-4">
                      <p className="font-mono font-bold text-[11px] tracking-mono uppercase text-ink md:hidden">{y.fullName}</p>
                      {y.layouts.length === 0 && <span className="font-mono text-[12px] text-ink/40">—</span>}
                      {y.layouts.map((l) => (
                        <figure key={l.src} className="bg-white">
                          <figcaption className="font-mono font-bold text-[10px] tracking-[.24em] uppercase text-ink text-center pt-4 pb-2">{l.title}</figcaption>
                          <a href={l.src} target="_blank" rel="noopener" className="block px-3 pb-3">
                            <img
                              src={l.src}
                              alt={`${y.fullName} — ${l.title}`}
                              loading="lazy"
                              className="w-full h-auto object-contain grayscale contrast-[1.05] opacity-[.82] mix-blend-multiply"
                            />
                          </a>
                        </figure>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* ─── Enquiry about the compared yachts ─── */}
      {ready && (
        <section id="lead" className="bg-ink text-white print:hidden">
          <div className="max-w-[1440px] mx-auto px-gutter py-14 md:py-20">
            <div className="max-w-[720px]">
              <p className="font-mono font-bold text-label tracking-label uppercase text-gilt mb-4">{s.lead.eyebrow}</p>
              <h2 className="font-display text-white mb-4" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-.01em' }}>
                {s.lead.heading}
              </h2>
              <p className="text-[var(--color-paper-72)] text-body leading-relaxed mb-8">{s.lead.body}</p>
              <LeadForm
                key={keys.join(',')}
                variant="yacht"
                context={{
                  lang,
                  source: 'compare',
                  brand,
                  comparedKeys: keys,
                  model: selected.map((y) => y.fullName).join(' · '),
                }}
                strings={{ ...leadStrings, cta: s.lead.cta }}
                showFinancing
                turnstileSiteKey={turnstileSiteKey}
                fallbackContact={fallbackContact}
              />
              <p className="text-[var(--color-paper-72)] text-micro font-mono tracking-mono mt-5 uppercase">
                <a href={`mailto:${fallbackContact}`} className="underline hover:text-gilt transition-colors">
                  {fallbackContact}
                </a>
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
