/**
 * Comparison tool logic (Step 5, PR 2) — isomorphic: the island and the
 * page share it, the Vitest suite covers the verdict and the URL state.
 */

export const COMPARE_MAX = 3;
/** Query parameter carrying the compared yachts: `?y=a,b,c` (shareable URL). */
export const COMPARE_PARAM = 'y';

/** Everything the island needs about one yacht, computed at build time. */
export interface CompareYacht {
  translationKey: string;
  name: string;
  brand: string;
  brandDisplay: string;
  /** "GALEON 500 FLY" — used in the verdict and the enquiry. */
  fullName: string;
  categoryLabel?: string;
  href: string;
  imageSrc: string | null;
  year: number;
  lengthM: number;
  beamM?: number;
  draftM?: number;
  cabins: number;
  berths?: number;
  engines?: string;
  maxSpeedKn?: number;
  cruiseSpeedKn?: number;
  fuelL?: number;
  waterL?: number;
  ceCategory?: string;
  layouts: Array<{ src: string; title: string }>;
  brochureHref?: string;
  /** First factory-new unit of this model available now, when there is one. */
  stockHref?: string;
}

export function compareHref(lang: string, keys: readonly string[]): string {
  const base = `/${lang}/compare/`;
  return keys.length ? `${base}?${COMPARE_PARAM}=${keys.map(encodeURIComponent).join(',')}` : base;
}

/** Known, unique keys from the query string, in order, capped at COMPARE_MAX. */
export function parseCompareKeys(search: string, known: ReadonlySet<string>): string[] {
  const raw = new URLSearchParams(search).get(COMPARE_PARAM) ?? '';
  const out: string[] = [];
  for (const key of raw.split(',')) {
    const k = key.trim();
    if (k && known.has(k) && !out.includes(k)) out.push(k);
    if (out.length === COMPARE_MAX) break;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Verdict — plain-language sentences from the numbers                  */
/* ------------------------------------------------------------------ */

/**
 * Sentence templates per locale. `{a}` = the yacht with the highest value,
 * `{b}` = the lowest, `{n}` / `{m}` their values. Phrased so no language
 * needs plural forms or declension.
 */
export interface VerdictTemplates {
  longer: string;
  moreCabins: string;
  moreGuests: string;
  faster: string;
  moreFuel: string;
}

type Metric = keyof VerdictTemplates;
const METRICS: Array<{ key: Metric; value: (y: CompareYacht) => number | undefined }> = [
  { key: 'longer', value: (y) => y.lengthM },
  { key: 'moreCabins', value: (y) => y.cabins },
  { key: 'moreGuests', value: (y) => y.berths },
  { key: 'faster', value: (y) => y.maxSpeedKn },
  { key: 'moreFuel', value: (y) => y.fuelL },
];

/**
 * One sentence per metric on which the yachts differ: the highest against
 * the lowest. Metrics any yacht lacks are skipped — a missing number is
 * never a loss.
 */
export function verdictSentences(yachts: readonly CompareYacht[], t: VerdictTemplates): string[] {
  if (yachts.length < 2) return [];
  const out: string[] = [];
  for (const metric of METRICS) {
    const values = yachts.map((y) => metric.value(y));
    if (values.some((v) => v === undefined)) continue;
    const nums = values as number[];
    let hi = 0;
    let lo = 0;
    nums.forEach((v, i) => {
      if (v > nums[hi]) hi = i;
      if (v < nums[lo]) lo = i;
    });
    if (nums[hi] === nums[lo]) continue;
    out.push(
      t[metric.key]
        .replace('{a}', yachts[hi].fullName)
        .replace('{b}', yachts[lo].fullName)
        .replace('{n}', String(nums[hi]))
        .replace('{m}', String(nums[lo])),
    );
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Specification rows                                                  */
/* ------------------------------------------------------------------ */

export interface SpecLabels {
  length: string;
  beam: string;
  draft: string;
  cabins: string;
  berths: string;
  engines: string;
  speed: string;
  cruiseSpeed: string;
  fuel: string;
  water: string;
  ceCategory: string;
  year: string;
}
export interface SpecGroupLabels {
  dimensions: string;
  accommodation: string;
  performance: string;
  capacities: string;
}

export interface SpecRow {
  label: string;
  /** One cell per yacht; '—' when the yacht has no value. */
  values: string[];
  /** Every yacht shows the same value — hidden in "only differences" mode. */
  same: boolean;
}
export interface SpecGroup {
  title: string;
  rows: SpecRow[];
}

const DASH = '—';

function row(label: string, values: Array<string | number | undefined>, unit = ''): SpecRow | null {
  if (values.every((v) => v === undefined || v === '')) return null;
  const cells = values.map((v) => (v === undefined || v === '' ? DASH : `${v}${unit}`));
  return { label, values: cells, same: cells.every((c) => c === cells[0]) };
}

/** Grouped rows in the order of the model page; rows nobody fills are dropped. */
export function specGroups(
  yachts: readonly CompareYacht[],
  labels: SpecLabels,
  groups: SpecGroupLabels,
): SpecGroup[] {
  const of = <T,>(pick: (y: CompareYacht) => T) => yachts.map(pick);
  const defs: Array<[string, Array<SpecRow | null>]> = [
    [
      groups.dimensions,
      [
        row(labels.length, of((y) => y.lengthM), ' m'),
        row(labels.beam, of((y) => y.beamM), ' m'),
        row(labels.draft, of((y) => y.draftM), ' m'),
      ],
    ],
    [
      groups.accommodation,
      [
        row(labels.cabins, of((y) => y.cabins)),
        row(labels.berths, of((y) => y.berths)),
        row(labels.year, of((y) => y.year)),
      ],
    ],
    [
      groups.performance,
      [
        row(labels.engines, of((y) => y.engines)),
        row(labels.speed, of((y) => y.maxSpeedKn), ' kn'),
        row(labels.cruiseSpeed, of((y) => y.cruiseSpeedKn), ' kn'),
      ],
    ],
    [
      groups.capacities,
      [
        row(labels.fuel, of((y) => y.fuelL), ' l'),
        row(labels.water, of((y) => y.waterL), ' l'),
        row(labels.ceCategory, of((y) => y.ceCategory)),
      ],
    ],
  ];
  return defs
    .map(([title, rows]) => ({ title, rows: rows.filter((r): r is SpecRow => r !== null) }))
    .filter((g) => g.rows.length > 0);
}

/** The brand shared by every compared yacht, or undefined when they span brands. */
export function sharedBrand(yachts: readonly CompareYacht[]): string | undefined {
  const first = yachts[0]?.brand;
  return first && yachts.every((y) => y.brand === first) ? first : undefined;
}
