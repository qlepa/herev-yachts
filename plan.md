# Plan: Step 6 — Our Network page

## Context

Step 6 of the backlog, executed before steps 4–5 by user decision. Implements the /network route
family: a fully static SEO backbone + Mapbox GL island. Expands locations.json to ~50 seed entries.
Enquiry CTAs → `#enquire` → `/${lang}/#lead` placeholder until step 5.

---

## File List

### New files
- `docs/design-handoff/pages/network/Our Network.dc.html`
- `src/pages/[lang]/network/index.astro`
- `src/pages/[lang]/network/[country].astro`
- `src/islands/NetworkMap.tsx`

### Modified files
- `docs/backlog-mvp.md` — 3 targeted edits
- `src/data/locations.json` — expand to ~50 entries
- `src/lib/i18n-strings.ts` — add `networkPage` to interface + all 5 locales
- `src/layouts/Layout.astro` — add `alternates` prop + named `head` slot
- `package.json` — add `mapbox-gl: ^3.11.0`

---

## Phases

### 0 · Docs
- `docs/backlog-mvp.md`: (a) Krok 6 — remove "Bez browser geolocation API", add note about both strip states + enquiry CTAs; (b) Krok 5 — add follow-up /api/geo task; (c) Poza MVP — remove "browser geolocation"
- Copy `docs/design-handoff/Our Network.dc.html` → `docs/design-handoff/pages/network/`

### 1 · package.json
```json
"mapbox-gl": "^3.11.0"
```
Run `pnpm install` immediately. v3 has bundled TS types.

### 2 · locations.json (~50 entries)
Keep 3 existing. Add ~47 new across 16 countries (PL 4, ES 6, FR 5, IT 6, HR 4, GR 4, DE 3, NL 3, GB 3, PT 2, SE 2, NO 2, TR 2, AE 1, US 2, AU 1). Schema frozen: `{ id, name, city, country, address, lat, lng, brandKeys[], dealerId? }`.

### 3 · i18n-strings.ts
Add `networkPage` to `Translations` interface and all 5 locale objects:
```typescript
networkPage: {
  hero: { eyebrow, heading, subtext };
  strip: { neutral, neutralCta };
  howItWorks: { eyebrow, heading, steps: [{no, title, body}] };
  directory: { eyebrow, heading, viewAll };
  cta: { eyebrow, heading, subtext, ctaLabel };
  countryPage: { breadcrumb, locationCount, enquireCta, enquireInCountry, brandsCarried, seaTrials, mapLabel, backToNetwork };
  mapAria: { containerLabel, closePanel, useLocation, locating, located, denied, tapToExplore, jumpToCountry, enquireAtShowroom, seaTrialsNote };
}
```
Reuse `t.network.locations/brands/countries` for hero stat labels (already translated).

### 4 · Layout.astro (2 additive changes)
- `alternates?: Array<{ lang: string; href: string }>` prop → `<link rel="alternate" hreflang>` in head
- `<slot name="head" />` just before `</head>` (for JSON-LD injection)

### 5 · src/islands/NetworkMap.tsx
React island, `client:visible`. Static import: `import 'mapbox-gl/dist/mapbox-gl.css'`.

Props: `{ locations: MapLocation[], accessToken: string, lang: string, mapAria: {...} }`

Map init in `useEffect([], ...)` via dynamic `import('mapbox-gl')`. Style: `dark-v11`.

Layers: clusters (gilt circles, DIN Offc Pro Medium count labels), unclustered pins (gilt + white stroke + halo ring).

State: `locateState: idle|loading|located|denied`, `panelLocation: MapLocation|null`, `mapLocked: true` (mobile), `mapSupported: true`.

Key behaviours:
- Cluster click → `getClusterExpansionZoom` → `easeTo`
- Pin click → `flyTo` + `setPanelLocation`
- "Use my location" → `navigator.geolocation.getCurrentPosition` (user-initiated only) → haversine nearest → flyTo + panel
- Mobile: `mapLocked=true` → map `pointerEvents:none`, overlay button on top → tap = `setMapLocked(false)`
- Detail panel: `role=dialog aria-modal`, Escape dismisses, focus returns to trigger pin (`lastFocusedRef`)
- `!mapSupported` → `return null` (graceful collapse, static content fully usable)

### 6 · src/pages/[lang]/network/index.astro
`getStaticPaths` = `getLocalePaths()`. Build-time: locationCount, countriesCount (unique ISO codes), byCountry array with `Intl.DisplayNames`. hreflang alternates.

Sections:
1. Hero (bg-ink): eyebrow + H1 + subtext + stats bar (locationCount / 5 / countriesCount)
2. Personalization strip: neutral visible, resolved `class="hidden" aria-hidden="true"` with `data-geo-*` hooks
3. Map (`<NetworkMap client:visible ... />`) + `<noscript>` fallback
4. "How the network works" (3-col grid, inline — mirrors AdvisoryGrid)
5. Country directory grid (`id="directory"`) — 4-col/2-col, links to `/[lang]/network/[code.toLowerCase()]/`
6. Closing CTA (`id="enquire"`) → `<Btn href="/${lang}/#lead">`

### 7 · src/pages/[lang]/network/[country].astro
`getStaticPaths`: all locales × unique country codes (lowercase for param, uppercase as prop).

- H1: `Intl.DisplayNames.of(countryCode)` in page lang
- Showroom cards: name, city, address, brand tags, enquiry CTA → `#enquire`
- Sidebar: static Mapbox image (`dark-v11/static/lng,lat,5/640x320?access_token=...`), graceful fallback if token absent
- JSON-LD per showroom via `<script slot="head" type="application/ld+json" set:html={JSON.stringify({...})} />`
- Closing CTA `id="enquire"` → `/${lang}/#lead`

---

## URL Structure
- `/[lang]/network/` — main page (English slug for all locales, consistent with SiteHeader)
- `/[lang]/network/[iso2]/` — country subpage (lowercase ISO alpha-2: `es`, `fr`, `pl`, ...)

---

## Environment Variable (new)
```
PUBLIC_MAPBOX_TOKEN=pk.eyJ1...   # URL-restricted to herev.com/*
```
Both island and static thumbnails degrade gracefully when absent.

---

## Verification
1. `pnpm install` → mapbox-gl resolves
2. `pnpm typecheck` → zero errors
3. `pnpm build` → 5 network index + n_countries×5 country pages generated
4. `/en/network/` with JS off → full static content; map collapses
5. `/en/network/es/` → showroom cards; JSON-LD in `<head>`; hreflang ×5
6. `/en/brands/galeon/` → zero mapbox chunks in `<script>` tags
7. Build without `PUBLIC_MAPBOX_TOKEN` → passes
