import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { useState, useEffect, useRef } from 'react';

export interface MapLocation {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  lat: number;
  lng: number;
  brandKeys: string[];
}

interface MapAria {
  containerLabel: string;
  closePanel: string;
  useLocation: string;
  locating: string;
  located: string; // "Located · {country}" — caller does .replace('{country}', ...)
  denied: string;
  tapToExplore: string;
  jumpToCountry: string;
  enquireAtShowroom: string;
  seaTrialsNote: string;
}

interface Props {
  locations: MapLocation[];
  accessToken: string;
  lang: string;
  mapAria: MapAria;
}

const BRAND_LABELS: Record<string, string> = {
  galeon: 'GALEON',
  parker: 'PARKER',
  saxdor: 'SAXDOR',
  'de-antonio': 'DE ANTONIO',
  'chris-craft': 'CHRIS-CRAFT',
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearest(lat: number, lng: number, locs: MapLocation[]): MapLocation {
  return locs.reduce((best, loc) => {
    return haversineKm(lat, lng, loc.lat, loc.lng) < haversineKm(lat, lng, best.lat, best.lng)
      ? loc
      : best;
  });
}

function buildGeoJSON(locs: MapLocation[]) {
  return {
    type: 'FeatureCollection' as const,
    features: locs.map((loc) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [loc.lng, loc.lat] as [number, number] },
      properties: { id: loc.id },
    })),
  };
}

type LocateState = 'idle' | 'loading' | 'located' | 'denied';

export default function NetworkMap({ locations, accessToken, lang, mapAria }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [mapSupported, setMapSupported] = useState(true);
  const [mapLocked, setMapLocked] = useState(true);
  const [panelLoc, setPanelLoc] = useState<MapLocation | null>(null);
  const [locateState, setLocateState] = useState<LocateState>('idle');
  const [locatedCountry, setLocatedCountry] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  // Map init
  useEffect(() => {
    if (!accessToken || !containerRef.current) return;
    if (!mapboxgl.supported()) {
      setMapSupported(false);
      return;
    }

    mapboxgl.accessToken = accessToken;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [15, 48],
      zoom: 3.5,
      cooperativeGestures: false,
    });
    mapRef.current = map;

    map.on('load', () => {
      map.addSource('dealers', {
        type: 'geojson',
        data: buildGeoJSON(locations),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Cluster circles
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'dealers',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#C9A45E',
          'circle-radius': ['step', ['get', 'point_count'], 20, 10, 28, 30, 34],
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(255,255,255,0.5)',
        },
      });

      // Cluster count labels
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'dealers',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 13,
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        },
        paint: { 'text-color': '#0F252E' },
      });

      // Unclustered pin halo (outer ring)
      map.addLayer({
        id: 'unclustered-halo',
        type: 'circle',
        source: 'dealers',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#C9A45E',
          'circle-radius': 14,
          'circle-opacity': 0.3,
        },
      });

      // Unclustered pin (inner)
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'dealers',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#C9A45E',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      setMapReady(true);
    });

    // Cluster click → zoom in
    map.on('click', 'clusters', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      if (!features[0]) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const feat = features[0] as any;
      const clusterId = feat.properties?.cluster_id as number;
      (map.getSource('dealers') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err || zoom == null) return;
          const coords = feat.geometry?.coordinates as [number, number] | undefined;
          if (!coords) return;
          map.easeTo({ center: coords, zoom });
        },
      );
    });

    // Pin click → show panel
    map.on('click', 'unclustered-point', (e) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const id = (e.features?.[0] as any)?.properties?.id as string | undefined;
      if (!id) return;
      const loc = locations.find((l) => l.id === id);
      if (!loc) return;
      map.flyTo({ center: [loc.lng, loc.lat], zoom: 9, speed: 1.2 });
      lastFocusRef.current = e.originalEvent?.target as HTMLElement | null;
      setPanelLoc(loc);
    });

    map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
    map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });

    return () => { map.remove(); mapRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape key handler
  useEffect(() => {
    if (!panelLoc) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [panelLoc]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus close button when panel opens
  useEffect(() => {
    if (panelLoc && closeBtnRef.current) {
      closeBtnRef.current.focus();
    }
  }, [panelLoc]);

  function closePanel() {
    setPanelLoc(null);
    lastFocusRef.current?.focus();
  }

  function handleLocate() {
    if (locateState !== 'idle') return;
    setLocateState('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const nearest = findNearest(latitude, longitude, locations);
        mapRef.current?.flyTo({ center: [nearest.lng, nearest.lat], zoom: 9, speed: 1.4 });
        setPanelLoc(nearest);
        let country = nearest.country;
        try {
          country = new Intl.DisplayNames([lang], { type: 'region' }).of(nearest.country) ?? country;
        } catch {
          // fallback to country code
        }
        setLocatedCountry(country);
        setLocateState('located');
      },
      () => setLocateState('denied'),
      { timeout: 8000 },
    );
  }

  function handleCountryJump(code: string) {
    if (!code || !mapRef.current) return;
    setSelectedCountry(code);
    const locs = locations.filter((l) => l.country === code);
    if (!locs.length) return;
    const bounds = new mapboxgl.LngLatBounds();
    locs.forEach((l) => bounds.extend([l.lng, l.lat]));
    mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 10, duration: 1000 });
  }

  const countryCodes = [...new Set(locations.map((l) => l.country))].sort();

  const locateLabel =
    locateState === 'loading'
      ? mapAria.locating
      : locateState === 'located'
        ? mapAria.located.replace('{country}', locatedCountry)
        : locateState === 'denied'
          ? mapAria.denied
          : mapAria.useLocation;

  if (!mapSupported) return null;

  return (
    <section
      aria-label={mapAria.containerLabel}
      style={{
        position: 'relative',
        height: 'clamp(300px, 50vh, 580px)',
        background: '#12222a',
      }}
    >
      {/* Map canvas */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: mapLocked && !panelLoc ? 'none' : 'auto',
        }}
      />

      {/* Tap-to-explore overlay */}
      {mapLocked && !panelLoc && (
        <div
          role="button"
          tabIndex={0}
          aria-label={mapAria.tapToExplore}
          onClick={() => setMapLocked(false)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMapLocked(false); } }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15,37,46,0.42)',
            backdropFilter: 'blur(1px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            zIndex: 5,
          }}
        >
          {/* Lock icon */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.1em',
              color: '#ffffff',
              textTransform: 'uppercase',
            }}
          >
            TAP TO EXPLORE THE MAP
          </span>
        </div>
      )}

      {/* Detail panel */}
      {panelLoc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={panelLoc.name}
          tabIndex={-1}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 'min(378px, 100%)',
            background: '#ECEFEE',
            boxShadow: '-24px 0 60px -30px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10,
            overflowY: 'auto',
          }}
        >
          {/* Close button */}
          <button
            ref={closeBtnRef}
            onClick={closePanel}
            aria-label={mapAria.closePanel}
            style={{
              position: 'absolute',
              top: '12px',
              right: '14px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              color: '#0F252E',
              fontSize: '20px',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
            }}
          >
            ✕
          </button>

          {/* Panel content */}
          <div
            style={{
              padding: '32px 24px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              flex: 1,
            }}
          >
            {/* Name */}
            <div>
              <h2
                style={{
                  fontFamily: "'Fraunces Variable', serif",
                  fontSize: '26px',
                  fontWeight: 450,
                  color: '#0F252E',
                  margin: 0,
                  paddingRight: '32px',
                  lineHeight: 1.2,
                }}
              >
                {panelLoc.name}
              </h2>
              {/* City */}
              <p
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#2C6E77',
                  margin: '6px 0 0',
                }}
              >
                {panelLoc.city}
              </p>
            </div>

            {/* Address */}
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '12px',
                color: 'rgba(15,37,46,0.70)',
                margin: 0,
                lineHeight: 1.5,
                borderTop: '1px solid rgba(15,37,46,0.14)',
                paddingTop: '16px',
              }}
            >
              {panelLoc.address}
            </p>

            {/* Brands section */}
            {panelLoc.brandKeys.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(15,37,46,0.14)', paddingTop: '16px' }}>
                <p
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#94702F',
                    margin: '0 0 10px',
                  }}
                >
                  BRANDS CARRIED
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {panelLoc.brandKeys.map((key) => (
                    <span
                      key={key}
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '10px',
                        letterSpacing: '0.08em',
                        color: '#0F252E',
                        border: '1px solid rgba(15,37,46,0.28)',
                        borderRadius: '2px',
                        padding: '3px 8px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {BRAND_LABELS[key] ?? key.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Enquire CTA */}
            <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
              <a
                href="#enquire"
                style={{
                  display: 'block',
                  background: '#0F252E',
                  color: '#FFFFFF',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  textDecoration: 'none',
                  padding: '14px 20px',
                  borderRadius: '2px',
                }}
              >
                {mapAria.enquireAtShowroom}
              </a>

              {/* Sea trials note */}
              <p
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  color: 'rgba(15,37,46,0.55)',
                  textAlign: 'center',
                  margin: '10px 0 0',
                  lineHeight: 1.5,
                }}
              >
                {mapAria.seaTrialsNote}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Controls row — bottom-left */}
      {mapReady && !mapLocked && (
        <div
          style={{
            position: 'absolute',
            left: '22px',
            bottom: '22px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            zIndex: 5,
          }}
        >
          {/* Use my location button */}
          <button
            onClick={handleLocate}
            disabled={locateState === 'loading'}
            title={locateLabel}
            aria-label={locateLabel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 14px',
              border: locateState === 'located' ? 'none' : '1px solid rgba(15,37,46,0.28)',
              borderRadius: '2px',
              cursor: locateState === 'loading' ? 'default' : 'pointer',
              background: locateState === 'located' ? '#0F252E' : '#FFFFFF',
              color: locateState === 'located' ? '#FFFFFF' : '#0F252E',
              opacity: locateState === 'loading' ? 0.65 : 1,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
              maxWidth: '220px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
            }}
          >
            {locateState === 'loading' ? (
              /* Spinner */
              <span
                style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(15,37,46,0.3)',
                  borderTopColor: '#0F252E',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                  flexShrink: 0,
                }}
              />
            ) : locateState === 'located' ? (
              /* Pin icon */
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ flexShrink: 0 }}
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            ) : (
              /* Crosshair icon */
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ flexShrink: 0 }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="22" y1="12" x2="18" y2="12" />
                <line x1="6" y1="12" x2="2" y2="12" />
                <line x1="12" y1="6" x2="12" y2="2" />
                <line x1="12" y1="22" x2="12" y2="18" />
              </svg>
            )}
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {locateLabel}
            </span>
          </button>

          {/* Jump-to-country select */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            {/* Jump icon */}
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke={selectedCountry ? '#0F252E' : 'rgba(15,37,46,0.55)'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '10px',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <select
              value={selectedCountry}
              onChange={(e) => handleCountryJump(e.target.value)}
              aria-label={mapAria.jumpToCountry}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                background: '#FFFFFF',
                border: '1px solid rgba(15,37,46,0.28)',
                borderRadius: '2px',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.06em',
                color: '#0F252E',
                padding: '8px 28px 8px 30px',
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                minWidth: '170px',
              }}
            >
              <option value="">JUMP TO COUNTRY</option>
              {countryCodes.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            {/* Chevron */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(15,37,46,0.55)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{
                position: 'absolute',
                right: '9px',
                pointerEvents: 'none',
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      )}

      {/* Zoom controls — bottom-right */}
      {mapReady && !mapLocked && (
        <div
          style={{
            position: 'absolute',
            right: panelLoc ? 'calc(min(378px, 100%) + 12px)' : '12px',
            bottom: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            zIndex: 5,
            transition: 'right 0.3s ease',
          }}
        >
          <button
            onClick={() => mapRef.current?.zoomIn()}
            aria-label="Zoom in"
            style={{
              width: '32px',
              height: '32px',
              background: '#FFFFFF',
              border: '1px solid rgba(15,37,46,0.28)',
              borderRadius: '2px 2px 0 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'monospace',
              fontSize: '18px',
              fontWeight: 300,
              color: '#0F252E',
              boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
              lineHeight: 1,
            }}
          >
            +
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            aria-label="Zoom out"
            style={{
              width: '32px',
              height: '32px',
              background: '#FFFFFF',
              border: '1px solid rgba(15,37,46,0.28)',
              borderTop: 'none',
              borderRadius: '0 0 2px 2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'monospace',
              fontSize: '22px',
              fontWeight: 300,
              color: '#0F252E',
              boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
              lineHeight: 1,
            }}
          >
            −
          </button>
        </div>
      )}

      {/* Spinner keyframe — injected once */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}
