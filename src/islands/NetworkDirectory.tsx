import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { useState, useEffect, useMemo, useRef } from 'react';
import type { DirectoryStrings } from '../lib/i18n-strings';

/**
 * Network page island: Mapbox GL map + filter panel + dealer list.
 * All three share one filter state, so they live in a single island.
 * Data arrives as build-time props (no client fetching). The list is
 * server-rendered, so the first page of dealers is in the static HTML.
 */

export interface NetworkLocation {
  id: string;
  name: string;
  city: string;
  country: string;
  /** Localised country name, resolved at build time */
  countryName: string;
  address: string;
  lat: number;
  lng: number;
  brandKeys: string[];
  region: string;
  /** Country page anchor for this showroom */
  href: string;
}


interface Props {
  locations: NetworkLocation[];
  brands: Array<{ key: string; label: string }>;
  regions: Array<{ key: string; label: string }>;
  accessToken: string;
  lang: string;
  t: DirectoryStrings;
}

const PAGE_SIZE = 10;
const INK = '#0F252E';
const GILT = '#C9A45E';

type SortKey = 'country' | 'name' | 'nearest';
type LocateState = 'idle' | 'loading' | 'located' | 'denied';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildGeoJSON(locs: NetworkLocation[]) {
  return {
    type: 'FeatureCollection' as const,
    features: locs.map((loc) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [loc.lng, loc.lat] as [number, number] },
      properties: { id: loc.id },
    })),
  };
}

function toggle(set: Set<string>, key: string): Set<string> {
  const next = new Set(set);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

const LABEL = 'font-mono text-[9px] tracking-label text-[var(--color-ink-55)] uppercase';
const CHECK = 'w-3.5 h-3.5 cursor-pointer accent-[var(--color-ink)]';
const SELECT =
  'w-full appearance-none bg-white border border-[var(--color-line-strong)] rounded-cta font-mono text-[11px] tracking-mono text-ink px-3 py-2 pr-8 cursor-pointer';
const CHEVRON = (
  <svg
    width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true"
    className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-ink-55)]"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function NetworkDirectory({ locations, brands, regions, accessToken, lang, t }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const locationsRef = useRef(locations);

  const [mapReady, setMapReady] = useState(false);
  const [mapSupported, setMapSupported] = useState(true);
  const [mapLocked, setMapLocked] = useState(false);

  const [brandSet, setBrandSet] = useState<Set<string>>(new Set());
  const [region, setRegion] = useState('');
  const [sort, setSort] = useState<SortKey>('country');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const [locateState, setLocateState] = useState<LocateState>('idle');
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locatedCountry, setLocatedCountry] = useState('');

  // ---------- derived data ----------
  const filtered = useMemo(() => {
    return locations.filter((l) => {
      if (region && l.region !== region) return false;
      if (brandSet.size && !l.brandKeys.some((b) => brandSet.has(b))) return false;
      return true;
    });
  }, [locations, brandSet, region]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sort === 'nearest' && userPos) {
      list.sort(
        (a, b) =>
          haversineKm(userPos.lat, userPos.lng, a.lat, a.lng) -
          haversineKm(userPos.lat, userPos.lng, b.lat, b.lng),
      );
    } else if (sort === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name, lang));
    } else {
      list.sort(
        (a, b) =>
          a.countryName.localeCompare(b.countryName, lang) || a.name.localeCompare(b.name, lang),
      );
    }
    return list;
  }, [filtered, sort, userPos, lang]);

  const shown = sorted.slice(0, visible);
  const brandCounts = useMemo(() => {
    const m: Record<string, number> = {};
    locations.forEach((l) => l.brandKeys.forEach((b) => { m[b] = (m[b] ?? 0) + 1; }));
    return m;
  }, [locations]);
  const regionsPresent = useMemo(
    () => regions.filter((r) => locations.some((l) => l.region === r.key)),
    [regions, locations],
  );
  const kmFmt = useMemo(() => new Intl.NumberFormat(lang, { maximumFractionDigits: 0 }), [lang]);

  // ---------- map init ----------
  useEffect(() => {
    if (!accessToken || !containerRef.current) return;
    if (!mapboxgl.supported()) {
      setMapSupported(false);
      return;
    }
    // Scroll-hijack guard only where it matters (touch devices)
    setMapLocked(window.matchMedia('(pointer: coarse)').matches);

    mapboxgl.accessToken = accessToken;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      projection: 'mercator',
      center: [10, 30],
      zoom: 1.4,
      cooperativeGestures: false,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
    mapRef.current = map;

    map.on('load', () => {
      map.addSource('dealers', {
        type: 'geojson',
        data: buildGeoJSON(locationsRef.current),
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 48,
      });
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'dealers',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': INK,
          'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 30, 28],
          'circle-stroke-width': 4,
          'circle-stroke-color': 'rgba(15,37,46,0.18)',
        },
      });
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'dealers',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 12,
          'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
        },
        paint: { 'text-color': '#ffffff' },
      });
      map.addLayer({
        id: 'unclustered-halo',
        type: 'circle',
        source: 'dealers',
        filter: ['!', ['has', 'point_count']],
        paint: { 'circle-color': INK, 'circle-radius': 13, 'circle-opacity': 0.18 },
      });
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'dealers',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': INK,
          'circle-radius': 7,
          'circle-stroke-width': 2,
          'circle-stroke-color': GILT,
        },
      });
      setMapReady(true);
    });

    map.on('click', 'clusters', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const feat = features[0] as any;
      if (!feat) return;
      (map.getSource('dealers') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
        feat.properties?.cluster_id as number,
        (err, zoom) => {
          if (err || zoom == null) return;
          map.easeTo({ center: feat.geometry?.coordinates as [number, number], zoom });
        },
      );
    });

    map.on('click', 'unclustered-point', (e) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const id = (e.features?.[0] as any)?.properties?.id as string | undefined;
      if (id) setHighlightId(id);
    });

    for (const layer of ['clusters', 'unclustered-point']) {
      map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
    }

    return () => { map.remove(); mapRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter → update map source + fit bounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    (map.getSource('dealers') as mapboxgl.GeoJSONSource | undefined)?.setData(buildGeoJSON(filtered));
    if (filtered.length === 0) return;
    const bounds = new mapboxgl.LngLatBounds();
    filtered.forEach((l) => bounds.extend([l.lng, l.lat]));
    map.fitBounds(bounds, { padding: { top: 60, bottom: 60, left: 320, right: 60 }, maxZoom: 6, duration: 800 });
  }, [filtered, mapReady]);

  // Reset paging when filter changes
  useEffect(() => { setVisible(PAGE_SIZE); }, [brandSet, region, sort]);

  // Pin click → reveal + scroll + highlight the matching row
  useEffect(() => {
    if (!highlightId) return;
    const idx = sorted.findIndex((l) => l.id === highlightId);
    if (idx < 0) { setHighlightId(null); return; }
    if (idx >= visible) { setVisible(idx + 1); return; }
    const row = document.getElementById('net-' + highlightId);
    row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const timer = setTimeout(() => setHighlightId(null), 2500);
    return () => clearTimeout(timer);
  }, [highlightId, sorted, visible]);

  // ---------- handlers ----------
  function handleLocate() {
    if (locateState === 'loading' || locateState === 'located') return;
    setLocateState('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPos({ lat: latitude, lng: longitude });
        setSort('nearest');
        const nearest = locations.reduce((best, l) =>
          haversineKm(latitude, longitude, l.lat, l.lng) < haversineKm(latitude, longitude, best.lat, best.lng) ? l : best,
        );
        setLocatedCountry(nearest.countryName);
        setLocateState('located');
        mapRef.current?.flyTo({ center: [nearest.lng, nearest.lat], zoom: 6, speed: 1.2 });
      },
      () => setLocateState('denied'),
      { timeout: 8000 },
    );
  }

  function handleSort(value: SortKey) {
    if (value === 'nearest' && !userPos) {
      handleLocate();
      return;
    }
    setSort(value);
  }

  function resetFilters() {
    setBrandSet(new Set());
    setRegion('');
  }

  const locateLabel =
    locateState === 'loading' ? t.map.locating
    : locateState === 'located' ? t.map.located.replace('{country}', locatedCountry)
    : locateState === 'denied' ? t.map.denied
    : t.map.useLocation;

  const showMap = accessToken && mapSupported;

  // ---------- render ----------
  return (
    <div>
      {/* ===== MAP + FILTERS ===== */}
      <section
        aria-label={t.map.containerLabel}
        className="relative bg-white border border-[var(--color-line)] rounded-soft overflow-hidden flex flex-col lg:block"
      >
        {/* Filter panel: stacked on mobile, floating card on desktop */}
        <aside className="relative z-10 bg-white p-5 border-b border-[var(--color-line)] lg:absolute lg:left-5 lg:top-5 lg:bottom-5 lg:w-[220px] lg:border lg:rounded-soft lg:shadow-[var(--shadow-card)] lg:overflow-y-auto">
          <div className="flex items-baseline justify-between mb-5">
            <p className="font-mono font-semibold text-[11px] tracking-mono text-ink uppercase">{t.filters.title}</p>
            <button
              type="button"
              onClick={resetFilters}
              className="font-mono text-[10px] text-[var(--color-ink-55)] hover:text-teal transition-colors"
            >
              {t.filters.reset}
            </button>
          </div>

          <p className={`${LABEL} mb-3`}>{t.filters.brands}</p>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-2 lg:grid-cols-1 mb-6 m-0 p-0 list-none">
            <li>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={brandSet.size === 0}
                  onChange={() => setBrandSet(new Set())}
                  className={CHECK}
                />
                <span className="font-mono text-[10px] tracking-mono text-ink group-hover:text-teal transition-colors whitespace-nowrap">
                  {t.filters.allBrands}
                </span>
              </label>
            </li>
            {brands.map((b) => (
              <li key={b.key}>
                <label className="flex items-center justify-between gap-2 cursor-pointer group">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={brandSet.has(b.key)}
                      onChange={() => setBrandSet((prev) => toggle(prev, b.key))}
                      className={CHECK}
                    />
                    <span className="font-mono text-[10px] tracking-mono text-ink group-hover:text-teal transition-colors whitespace-nowrap">
                      {b.label}
                    </span>
                  </span>
                  <span className="font-mono text-[9px] text-[var(--color-ink-55)]">{brandCounts[b.key] ?? 0}</span>
                </label>
              </li>
            ))}
          </ul>

          <p className={`${LABEL} mb-3`}>{t.filters.region}</p>
          <div className="relative mb-6">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              aria-label={t.filters.region}
              className={SELECT}
            >
              <option value="">{t.filters.allRegions}</option>
              {regionsPresent.map((r) => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </select>
            {CHEVRON}
          </div>

          <button
            type="button"
            onClick={() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="w-full bg-ink text-white font-mono font-semibold text-[11px] tracking-mono uppercase py-3 rounded-cta hover:bg-[#1a3a47] transition-colors"
          >
            {t.filters.viewList.replace('{n}', String(filtered.length))}
          </button>
        </aside>

        {/* Map canvas */}
        <div className="relative bg-paper" style={{ height: 'clamp(320px, 55vh, 600px)' }}>
          {showMap ? (
            <div
              ref={containerRef}
              className="w-full h-full"
              style={{ pointerEvents: mapLocked ? 'none' : 'auto' }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-micro tracking-mono text-[var(--color-ink-55)]">MAP UNAVAILABLE</span>
            </div>
          )}

          {mapLocked && (
            <div
              role="button"
              tabIndex={0}
              aria-label={t.map.tapToExplore}
              onClick={() => setMapLocked(false)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMapLocked(false); } }}
              className="absolute inset-0 z-[5] flex items-center justify-center cursor-pointer"
              style={{ background: 'rgba(15,37,46,0.28)' }}
            >
              <span className="bg-white text-ink font-mono text-[11px] tracking-mono uppercase px-4 py-2 rounded-cta shadow-[var(--shadow-card)]">
                {t.map.tapToExplore}
              </span>
            </div>
          )}

          {/* Zoom + locate controls */}
          {mapReady && (
            <div className="absolute right-4 top-4 z-[5] flex flex-col gap-1">
              <button
                type="button"
                onClick={() => mapRef.current?.zoomIn()}
                aria-label={t.map.zoomIn}
                className="w-9 h-9 bg-white border border-[var(--color-line-strong)] rounded-cta text-ink text-lg leading-none shadow-[var(--shadow-card)] hover:bg-paper"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => mapRef.current?.zoomOut()}
                aria-label={t.map.zoomOut}
                className="w-9 h-9 bg-white border border-[var(--color-line-strong)] rounded-cta text-ink text-lg leading-none shadow-[var(--shadow-card)] hover:bg-paper"
              >
                −
              </button>
              <button
                type="button"
                onClick={handleLocate}
                disabled={locateState === 'loading'}
                aria-label={locateLabel}
                title={locateLabel}
                className={`w-9 h-9 border rounded-cta shadow-[var(--shadow-card)] flex items-center justify-center mt-2 ${
                  locateState === 'located'
                    ? 'bg-ink border-ink text-white'
                    : 'bg-white border-[var(--color-line-strong)] text-ink hover:bg-paper'
                }`}
              >
                <svg
                  width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="8" />
                  <line x1="22" y1="12" x2="18" y2="12" /><line x1="6" y1="12" x2="2" y2="12" />
                  <line x1="12" y1="6" x2="12" y2="2" /><line x1="12" y1="22" x2="12" y2="18" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===== DEALER LIST ===== */}
      <section
        ref={listRef}
        className="mt-6 bg-white border border-[var(--color-line)] rounded-soft p-5 md:p-7 scroll-mt-24"
      >
        <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
          <div>
            <h2 className="font-mono font-semibold text-[13px] tracking-mono text-ink uppercase m-0">{t.list.title}</h2>
            <p className="font-mono text-[11px] text-[var(--color-ink-55)] mt-1 m-0">
              {t.list.found.replace('{n}', String(sorted.length))}
            </p>
          </div>
          <label className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-mono text-[var(--color-ink-55)] uppercase">{t.list.sortBy}</span>
            <span className="relative">
              <select
                value={sort}
                onChange={(e) => handleSort(e.target.value as SortKey)}
                className={`${SELECT} min-w-[150px]`}
              >
                <option value="country">{t.list.sortCountry}</option>
                <option value="name">{t.list.sortName}</option>
                <option value="nearest">{t.list.sortNearest}</option>
              </select>
              {CHEVRON}
            </span>
          </label>
        </div>

        {sorted.length === 0 ? (
          <p className="font-mono text-sm text-[var(--color-ink-55)] py-12 text-center">{t.list.noResults}</p>
        ) : (
          <ul className="flex flex-col gap-3 m-0 p-0 list-none">
            {shown.map((loc) => {
              const dist = userPos ? haversineKm(userPos.lat, userPos.lng, loc.lat, loc.lng) : null;
              const hi = highlightId === loc.id;
              return (
                <li
                  id={'net-' + loc.id}
                  key={loc.id}
                  className="grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] gap-4 md:gap-6 items-center border p-5 rounded-soft transition-[border-color,box-shadow] duration-300"
                  style={hi ? { borderColor: GILT, boxShadow: `0 0 0 1px ${GILT}` } : { borderColor: 'var(--color-line)' }}
                >
                  {/* Name / place */}
                  <div className="min-w-0">
                    <h3 className="font-display text-ink leading-tight m-0" style={{ fontSize: '1.25rem', fontWeight: 450 }}>
                      {loc.name}
                    </h3>
                    <p className="font-mono text-[11px] tracking-mono text-teal uppercase mt-1 m-0">
                      {loc.city} · {loc.countryName}
                    </p>
                    <p className="font-mono text-[10px] text-brass mt-2 m-0" style={{ letterSpacing: '.2em' }}>
                      {t.list.authorised}
                    </p>
                  </div>

                  {/* Brands */}
                  <div className="flex flex-wrap gap-1.5 md:border-l md:border-[var(--color-line)] md:pl-6">
                    {loc.brandKeys.map((k) => (
                      <span
                        key={k}
                        className="font-display text-ink border border-[var(--color-line)] px-2.5 py-1"
                        style={{ fontSize: '12px', letterSpacing: '.12em' }}
                      >
                        {(brands.find((b) => b.key === k)?.label ?? k).toUpperCase()}
                      </span>
                    ))}
                  </div>

                  {/* Action */}
                  <div className="flex md:flex-col items-center gap-2 md:min-w-[150px]">
                    <a
                      href={loc.href}
                      className="inline-flex justify-center w-full font-mono font-semibold text-[11px] tracking-mono uppercase text-ink border border-[var(--color-line-strong)] rounded-cta px-4 py-2.5 hover:bg-paper transition-colors"
                    >
                      {t.list.viewDetails}
                    </a>
                    {dist != null && (
                      <span className="font-mono text-[10px] text-[var(--color-ink-55)] whitespace-nowrap">
                        {kmFmt.format(dist)} km
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {visible < sorted.length && (
          <div className="text-center mt-8">
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="font-mono font-semibold text-[11px] tracking-mono uppercase text-ink border border-[var(--color-line-strong)] rounded-cta px-6 py-3 hover:bg-paper transition-colors"
            >
              {t.list.loadMore}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
