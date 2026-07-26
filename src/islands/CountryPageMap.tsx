import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { useState, useEffect, useRef } from 'react';

export interface MapLocation {
  id: string;
  lat: number;
  lng: number;
}

interface Props {
  locations: MapLocation[];
  accessToken: string;
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

export default function CountryPageMap({ locations, accessToken }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLocked, setMapLocked] = useState(true);

  useEffect(() => {
    if (!accessToken || !containerRef.current) return;
    if (!mapboxgl.supported()) return;

    mapboxgl.accessToken = accessToken;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [15, 48],
      zoom: 3,
    });
    mapRef.current = map;

    map.on('load', () => {
      if (locations.length === 1) {
        map.flyTo({ center: [locations[0].lng, locations[0].lat], zoom: 9 });
      } else {
        const bounds = new mapboxgl.LngLatBounds();
        locations.forEach((l) => bounds.extend([l.lng, l.lat]));
        map.fitBounds(bounds, { padding: 40, maxZoom: 10, duration: 0 });
      }

      map.addSource('dealers', {
        type: 'geojson',
        data: buildGeoJSON(locations),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'dealers',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#C9A45E',
          'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22],
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(255,255,255,0.5)',
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
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        },
        paint: { 'text-color': '#0F252E' },
      });

      map.addLayer({
        id: 'unclustered-halo',
        type: 'circle',
        source: 'dealers',
        filter: ['!', ['has', 'point_count']],
        paint: { 'circle-color': '#C9A45E', 'circle-radius': 14, 'circle-opacity': 0.3 },
      });

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
    });

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

    map.on('click', 'unclustered-point', (e) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const id = (e.features?.[0] as any)?.properties?.id as string | undefined;
      if (!id) return;
      window.dispatchEvent(new CustomEvent('herev:location-select', { detail: { id } }));
    });

    map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
    map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });

    return () => { map.remove(); mapRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!accessToken) return null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: mapLocked ? 'none' : 'auto',
        }}
      />
      {mapLocked && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setMapLocked(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setMapLocked(false);
            }
          }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15,37,46,0.42)',
            backdropFilter: 'blur(1px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            zIndex: 5,
          }}
        >
          <svg
            width="20"
            height="20"
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
              fontSize: '10px',
              letterSpacing: '0.1em',
              color: '#ffffff',
              textTransform: 'uppercase',
            }}
          >
            TAP TO EXPLORE
          </span>
        </div>
      )}
    </div>
  );
}
