import { useState, useMemo, useEffect, useRef } from 'react';

export interface YachtCardData {
  translationKey: string;
  name: string;
  brand: string;
  brandDisplay: string;
  category?: string;
  categoryLabel?: string;
  loaM: number;
  cabins: number;
  imageSrc?: string | null;
  href: string;
}

export interface FilterStrings {
  refine: string;
  typeLabel: string;
  marqueLabel: string;
  lengthLabel: string;
  searchPlaceholder: string;
  yachts: string;
  cabins: string;
  sortLengthLong: string;
  sortLengthShort: string;
  viewLabel: string;
  noResults: string;
}

interface Props {
  yachts: YachtCardData[];
  filterT: FilterStrings;
}

const LENGTH_BUCKETS = [
  { key: '0-8',   label: '< 8 m',     min: 0,  max: 8   },
  { key: '8-11',  label: '8 – 11 m',  min: 8,  max: 11  },
  { key: '11-14', label: '11 – 14 m', min: 11, max: 14  },
  { key: '14-17', label: '14 – 17 m', min: 14, max: 17  },
  { key: '17+',   label: '17 m +',    min: 17, max: 999 },
];

function WaterlineBar({ loaM }: { loaM: number }) {
  const pct = Math.min(100, Math.max(0, ((loaM - 8) / (16 - 8)) * 100));
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="font-mono font-bold text-[10px] tracking-mono text-[var(--color-ink-55)] w-11 shrink-0">
        {loaM.toFixed(2)} M
      </span>
      <div className="flex-1 h-[3px] relative rounded-none" style={{ background: 'var(--color-line)' }}>
        <div
          className="absolute inset-y-0 left-0 bg-brass rounded-none"
          style={{ width: `${pct.toFixed(2)}%` }}
        />
      </div>
    </div>
  );
}

function YachtCard({
  yacht,
  viewLabel,
  cabinsLabel,
}: {
  yacht: YachtCardData;
  viewLabel: string;
  cabinsLabel: string;
}) {
  return (
    <article className="flex flex-col shadow-card bg-white w-full">
      <a href={yacht.href} className="block relative overflow-hidden" style={{ aspectRatio: '4/3.2' }}>
        {yacht.imageSrc ? (
          <img
            src={yacht.imageSrc}
            alt={yacht.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[800ms] hover:scale-105"
            style={{ transitionTimingFunction: 'var(--ease-herev)' }}
          />
        ) : (
          <div className="w-full h-full bg-ink" />
        )}
        <span
          className="absolute top-3 left-3 font-mono font-bold text-white uppercase"
          style={{ fontSize: '9.5px', letterSpacing: '.2em', textShadow: '0 1px 4px rgba(15,37,46,.6)' }}
        >
          {yacht.brandDisplay}
        </span>
      </a>

      <div className="flex flex-col flex-1 p-[18px]">
        <a href={yacht.href} className="block">
          <h3
            className="font-display text-title mb-1 hover:text-teal transition-colors"
            style={{ fontWeight: 450 }}
          >
            {yacht.name}
          </h3>
        </a>

        {yacht.categoryLabel && (
          <p className="font-mono text-[10.5px] tracking-mono text-teal mb-3 uppercase">
            {yacht.categoryLabel}
          </p>
        )}

        <WaterlineBar loaM={yacht.loaM} />

        <div
          className="flex items-center justify-between pt-3 mt-auto"
          style={{ borderTop: '1px solid var(--color-line)' }}
        >
          {yacht.cabins > 0 ? (
            <span className="font-mono text-[10px] tracking-mono text-[var(--color-ink-55)] uppercase">
              {yacht.cabins} {cabinsLabel}
            </span>
          ) : (
            <span />
          )}
          <a
            href={yacht.href}
            className="font-mono text-[11px] tracking-label text-teal hover:text-ink transition-colors uppercase"
          >
            {viewLabel}
          </a>
        </div>
      </div>
    </article>
  );
}

function toggle(set: Set<string>, key: string): Set<string> {
  const next = new Set(set);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

function FilterSections({
  categoryCounts,
  brandCounts,
  bucketCounts,
  cats,
  brands,
  lengthBucket,
  setCats,
  setBrands,
  setLengthBucket,
  filterT,
}: {
  categoryCounts: Map<string, { label: string; count: number }>;
  brandCounts: Map<string, { label: string; count: number }>;
  bucketCounts: Map<string, number>;
  cats: Set<string>;
  brands: Set<string>;
  lengthBucket: string | null;
  setCats: (fn: (prev: Set<string>) => Set<string>) => void;
  setBrands: (fn: (prev: Set<string>) => Set<string>) => void;
  setLengthBucket: (key: string | null) => void;
  filterT: FilterStrings;
}) {
  return (
    <>
      {categoryCounts.size > 0 && (
        <div className="mb-6">
          <p className="font-mono text-[9px] tracking-label text-[var(--color-ink-55)] uppercase mb-3">
            {filterT.typeLabel}
          </p>
          <ul className="space-y-2">
            {[...categoryCounts.entries()].map(([key, { label, count }]) => (
              <li key={key}>
                <label className="flex items-center justify-between gap-2 cursor-pointer group">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={cats.has(key)}
                      onChange={() => setCats((prev) => toggle(prev, key))}
                      className="w-3.5 h-3.5 cursor-pointer accent-[var(--color-teal)]"
                    />
                    <span className="font-mono text-[10px] tracking-mono text-ink group-hover:text-teal transition-colors">
                      {label.split(' · ')[0]}
                    </span>
                  </span>
                  <span className="font-mono text-[9px] text-[var(--color-ink-55)]">{count}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6">
        <p className="font-mono text-[9px] tracking-label text-[var(--color-ink-55)] uppercase mb-3">
          {filterT.marqueLabel}
        </p>
        <ul className="space-y-2">
          {[...brandCounts.entries()].map(([key, { label, count }]) => (
            <li key={key}>
              <label className="flex items-center justify-between gap-2 cursor-pointer group">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={brands.has(key)}
                    onChange={() => setBrands((prev) => toggle(prev, key))}
                    className="w-3.5 h-3.5 cursor-pointer accent-[var(--color-teal)]"
                  />
                  <span className="font-mono text-[10px] tracking-mono text-ink group-hover:text-teal transition-colors">
                    {label}
                  </span>
                </span>
                <span className="font-mono text-[9px] text-[var(--color-ink-55)]">{count}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {bucketCounts.size > 0 && (
        <div className="mb-6">
          <p className="font-mono text-[9px] tracking-label text-[var(--color-ink-55)] uppercase mb-3">
            {filterT.lengthLabel}
          </p>
          <ul className="space-y-2">
            {LENGTH_BUCKETS.filter((b) => bucketCounts.has(b.key)).map((b) => (
              <li key={b.key}>
                <label className="flex items-center justify-between gap-2 cursor-pointer group">
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="length"
                      checked={lengthBucket === b.key}
                      onChange={() => setLengthBucket(b.key)}
                      onClick={() => {
                        if (lengthBucket === b.key) setLengthBucket(null);
                      }}
                      className="w-3.5 h-3.5 cursor-pointer accent-[var(--color-teal)]"
                    />
                    <span className="font-mono text-[10px] tracking-mono text-ink group-hover:text-teal transition-colors">
                      {b.label}
                    </span>
                  </span>
                  <span className="font-mono text-[9px] text-[var(--color-ink-55)]">
                    {bucketCounts.get(b.key)}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default function YachtFilter({ yachts, filterT }: Props) {
  const [search, setSearch] = useState('');
  const [cats, setCats] = useState<Set<string>>(new Set());
  const [brands, setBrands] = useState<Set<string>>(new Set());
  const [lengthBucket, setLengthBucket] = useState<string | null>(null);
  const [sort, setSort] = useState<'longest' | 'shortest'>('longest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileLengthOpen, setMobileLengthOpen] = useState(false);

  const isFirstSync = useRef(true);

  // URL → state on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const brandParam = params.getAll('brand');
    if (brandParam.length > 0) setBrands(new Set(brandParam));
    const catParam = params.getAll('cat');
    if (catParam.length > 0) setCats(new Set(catParam));
    const lenParam = params.get('len');
    if (lenParam) setLengthBucket(lenParam);
    const qParam = params.get('q');
    if (qParam) setSearch(qParam);
    if (params.get('sort') === 'shortest') setSort('shortest');
  }, []);

  // state → URL on every change (skip first run before init commits)
  useEffect(() => {
    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }
    const params = new URLSearchParams();
    for (const b of brands) params.append('brand', b);
    for (const c of cats) params.append('cat', c);
    if (lengthBucket) params.set('len', lengthBucket);
    if (search) params.set('q', search);
    if (sort !== 'longest') params.set('sort', sort);
    const qs = params.toString();
    history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [brands, cats, lengthBucket, search, sort]);

  // Body scroll lock when any mobile drawer is open
  useEffect(() => {
    const locked = mobileFiltersOpen || mobileLengthOpen;
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileFiltersOpen, mobileLengthOpen]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>();
    for (const y of yachts) {
      if (y.category && y.categoryLabel) {
        const entry = map.get(y.category);
        if (entry) entry.count++;
        else map.set(y.category, { label: y.categoryLabel, count: 1 });
      }
    }
    return map;
  }, [yachts]);

  const brandCounts = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>();
    for (const y of yachts) {
      const entry = map.get(y.brand);
      if (entry) entry.count++;
      else map.set(y.brand, { label: y.brandDisplay, count: 1 });
    }
    return map;
  }, [yachts]);

  const bucketCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of LENGTH_BUCKETS) {
      const count = yachts.filter((y) => y.loaM >= b.min && y.loaM < b.max).length;
      if (count > 0) map.set(b.key, count);
    }
    return map;
  }, [yachts]);

  const filtered = useMemo(() => {
    const result = yachts.filter((y) => {
      if (search && !y.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (cats.size > 0 && (!y.category || !cats.has(y.category))) return false;
      if (brands.size > 0 && !brands.has(y.brand)) return false;
      if (lengthBucket) {
        const bucket = LENGTH_BUCKETS.find((b) => b.key === lengthBucket);
        if (bucket && (y.loaM < bucket.min || y.loaM >= bucket.max)) return false;
      }
      return true;
    });
    result.sort((a, b) => (sort === 'longest' ? b.loaM - a.loaM : a.loaM - b.loaM));
    return result;
  }, [yachts, search, cats, brands, lengthBucket, sort]);

  const activeFilterCount = cats.size + brands.size + (lengthBucket ? 1 : 0) + (search ? 1 : 0);
  const activeLengthLabel = lengthBucket
    ? LENGTH_BUCKETS.find((b) => b.key === lengthBucket)?.label
    : null;

  const chevronSvg =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%230F252E' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E";

  return (
    <>
      <div className="max-w-[1440px] mx-auto px-[var(--spacing-gutter)] py-section pb-28 md:pb-[var(--spacing-section)]">
        <div className="flex gap-10 items-start">

          {/* ─── Sidebar (desktop only) ─── */}
          <aside className="hidden md:block w-[200px] shrink-0 sticky top-24">
            <p className="font-mono font-bold text-[10px] tracking-wordmark text-ink mb-6">
              {filterT.refine}
            </p>
            <FilterSections
              categoryCounts={categoryCounts}
              brandCounts={brandCounts}
              bucketCounts={bucketCounts}
              cats={cats}
              brands={brands}
              lengthBucket={lengthBucket}
              setCats={setCats}
              setBrands={setBrands}
              setLengthBucket={setLengthBucket}
              filterT={filterT}
            />
          </aside>

          {/* ─── Main area ─── */}
          <div className="flex-1 min-w-0">

            {/* Top bar */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <span className="font-mono text-[11px] tracking-mono text-[var(--color-ink-55)] uppercase shrink-0">
                <span className="text-ink font-bold">{filtered.length}</span>{' '}
                {filterT.yachts}
              </span>

              <div className="flex-1 min-w-[180px] relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--color-ink-55)' }}
                  width="13"
                  height="13"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="9" cy="9" r="7" />
                  <line x1="15" y1="15" x2="19" y2="19" />
                </svg>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={filterT.searchPlaceholder}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border font-mono text-[11px] tracking-mono text-ink placeholder:text-[var(--color-ink-55)] focus:outline-none transition-colors"
                  style={{
                    borderColor: 'var(--color-line)',
                    // @ts-expect-error custom property
                    '--tw-ring-color': 'var(--color-teal)',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-teal)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-line)')}
                />
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as 'longest' | 'shortest')}
                className="bg-white border font-mono text-[11px] tracking-mono text-ink px-3 py-2.5 focus:outline-none cursor-pointer transition-colors appearance-none pr-8"
                style={{
                  borderColor: 'var(--color-line)',
                  backgroundImage: `url("${chevronSvg}")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-teal)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-line)')}
              >
                <option value="longest">{filterT.sortLengthLong}</option>
                <option value="shortest">{filterT.sortLengthShort}</option>
              </select>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <p className="font-mono text-[12px] tracking-mono text-[var(--color-ink-55)] py-16 text-center">
                {filterT.noResults}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((y) => (
                  <YachtCard
                    key={y.translationKey}
                    yacht={y}
                    viewLabel={filterT.viewLabel}
                    cabinsLabel={filterT.cabins}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ─── Mobile floating action buttons ─── */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-40 flex items-stretch">
        {/* Left: all filters */}
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex-1 flex items-center justify-center gap-2.5 py-4 font-mono text-[10px] tracking-label uppercase text-white transition-colors"
          style={{ background: 'var(--color-ink)' }}
          aria-label="Open filters"
        >
          <svg width="14" height="11" viewBox="0 0 14 11" fill="none" aria-hidden="true">
            <rect x="0" y="0" width="14" height="1.5" fill="currentColor" />
            <rect x="0" y="4.75" width="14" height="1.5" fill="currentColor" />
            <rect x="0" y="9.5" width="14" height="1.5" fill="currentColor" />
            <circle cx="3.5" cy="0.75" r="2" fill="var(--color-ink)" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="10" cy="5.5" r="2" fill="var(--color-ink)" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="5.5" cy="10.25" r="2" fill="var(--color-ink)" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          {filterT.refine}
          {activeFilterCount > 0 && (
            <span
              className="flex items-center justify-center w-4 h-4 rounded-full font-mono font-bold text-[9px] text-ink"
              style={{ background: 'var(--color-brass)' }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="w-px" style={{ background: 'rgba(255,255,255,0.15)' }} />

        {/* Right: length filter */}
        <button
          onClick={() => setMobileLengthOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-4 font-mono text-[10px] tracking-label uppercase transition-colors"
          style={{
            background: activeLengthLabel ? 'var(--color-teal)' : 'var(--color-ink)',
            color: 'white',
          }}
          aria-label="Filter by length"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
            <path d="M1 12L12 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M1 1h4M1 1v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 12H8M12 12V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {activeLengthLabel ?? filterT.lengthLabel}
        </button>
      </div>

      {/* ─── Mobile: all filters drawer ─── */}
      <div
        className="fixed inset-0 z-50 md:hidden transition-opacity duration-300"
        style={{ opacity: mobileFiltersOpen ? 1 : 0, pointerEvents: mobileFiltersOpen ? 'auto' : 'none' }}
        aria-modal="true"
        aria-label="Filters"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(15,37,46,0.55)' }}
          onClick={() => setMobileFiltersOpen(false)}
        />

        {/* Sheet */}
        <div
          className="absolute bottom-0 left-0 right-0 overflow-y-auto transition-transform duration-300"
          style={{
            background: 'var(--color-paper)',
            maxHeight: '82vh',
            transform: mobileFiltersOpen ? 'translateY(0)' : 'translateY(100%)',
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-line)' }} />
          </div>

          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--color-line)' }}
          >
            <p className="font-mono font-bold text-[10px] tracking-wordmark text-ink">
              {filterT.refine}
            </p>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="font-mono text-[18px] text-[var(--color-ink-55)] hover:text-ink leading-none transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Filter content */}
          <div className="px-5 pt-5 pb-8">
            <FilterSections
              categoryCounts={categoryCounts}
              brandCounts={brandCounts}
              bucketCounts={bucketCounts}
              cats={cats}
              brands={brands}
              lengthBucket={lengthBucket}
              setCats={setCats}
              setBrands={setBrands}
              setLengthBucket={setLengthBucket}
              filterT={filterT}
            />

            {/* Done button */}
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full mt-2 py-3.5 font-mono text-[10px] tracking-label uppercase text-white transition-colors"
              style={{ background: 'var(--color-ink)' }}
            >
              {filtered.length} {filterT.yachts}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Mobile: length drawer ─── */}
      <div
        className="fixed inset-0 z-50 md:hidden transition-opacity duration-300"
        style={{ opacity: mobileLengthOpen ? 1 : 0, pointerEvents: mobileLengthOpen ? 'auto' : 'none' }}
        aria-modal="true"
        aria-label="Filter by length"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(15,37,46,0.55)' }}
          onClick={() => setMobileLengthOpen(false)}
        />

        {/* Sheet */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-transform duration-300"
          style={{
            background: 'var(--color-paper)',
            transform: mobileLengthOpen ? 'translateY(0)' : 'translateY(100%)',
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-line)' }} />
          </div>

          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--color-line)' }}
          >
            <p className="font-mono font-bold text-[10px] tracking-wordmark text-ink">
              {filterT.lengthLabel}
            </p>
            <button
              onClick={() => setMobileLengthOpen(false)}
              className="font-mono text-[18px] text-[var(--color-ink-55)] hover:text-ink leading-none transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Length buckets as large tap targets */}
          <div className="px-5 pt-4 pb-8 space-y-2">
            {LENGTH_BUCKETS.filter((b) => bucketCounts.has(b.key)).map((b) => {
              const active = lengthBucket === b.key;
              return (
                <button
                  key={b.key}
                  onClick={() => {
                    setLengthBucket(active ? null : b.key);
                    setMobileLengthOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3.5 transition-colors"
                  style={{
                    background: active ? 'var(--color-teal)' : 'white',
                    border: `1px solid ${active ? 'var(--color-teal)' : 'var(--color-line)'}`,
                    color: active ? 'white' : 'var(--color-ink)',
                  }}
                >
                  <span className="font-mono text-[11px] tracking-mono uppercase">{b.label}</span>
                  <span
                    className="font-mono text-[9px]"
                    style={{ color: active ? 'rgba(255,255,255,0.7)' : 'var(--color-ink-55)' }}
                  >
                    {bucketCounts.get(b.key)}
                  </span>
                </button>
              );
            })}

          </div>
        </div>
      </div>
    </>
  );
}
