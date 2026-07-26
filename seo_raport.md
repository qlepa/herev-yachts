# SEO Raport — herev-yachts

Data audytu: 2026-07-26

---

## Co jest dobrze zrobione

### Meta tagi
Dynamiczne tytuły i opisy na wszystkich kluczowych podstronach, z walidacją długości (60/160 znaków) w schemacie Zod. Frazy SEO są w pełni zlokalizowane (`src/lib/i18n-strings.ts`).

Wzorzec tytułów:
- Homepage: `Herev — Premium Yacht Representation`
- Jachty: `{Brand} {Model} — Herev`
- Marki: `{Brand Name} — Herev`
- Sieć: `Official Herev dealer network in {Country}. {n} authorised location(s).`

### Hreflang / i18n
Infrastruktura w `Layout.astro` jest gotowa (prop `alternates`, render `<link rel="alternate" hreflang>`). Wdrożone na:
- stronach bloga (`src/pages/[lang]/blog/[slug].astro`)
- stronach sieci dealerów (`src/pages/[lang]/network/index.astro`, `[country].astro`)

### Obrazki
- `astro:assets` z formaty AVIF/WebP
- Responsive `widths` (np. hero: `[800, 1200, 1920]`, karty: `[300, 600]`)
- `loading="lazy"` wszędzie poza hero (`loading="eager" fetchpriority="high"`)
- Opisowe `alt` na wszystkich obrazkach
- Atrybut `sizes` z uwzględnieniem breakpointów

### Wydajność
- Pełny static output (`astro build`)
- React tylko dla wymaganych wysp: `YachtFilter`, `NetworkMap`, `CountryPageMap`
- Tailwind v4 — brak zbędnego CSS
- Fonty przez `@fontsource` (variable fonts)

### JSON-LD
`LocalBusiness` z pełnym adresem (`PostalAddress`) i `GeoCoordinates` dla każdej lokalizacji dealerskiej — w `src/pages/[lang]/network/[country].astro`.

### Techniczne
- Przekierowanie `/ → /en/` jako 301 w `vercel.json`
- Czysta hierarchia URL: `/{lang}/{section}/{detail}/`
- Semantyczny HTML: `<main>`, `<article>`, `<section>`, `<nav>`, właściwa kolejność nagłówków h1→h2→h3
- `seoSchema` w kolekcjach (yachts, brands, blog) z opcjonalnym `seoTitle` i `seoDescription`

---

## Braki — do zrobienia

| Priorytet | Co brakuje | Gdzie dodać |
|-----------|------------|-------------|
| Krytyczne | `sitemap.xml` — brak integracji `astro-sitemap` | `astro.config.*`, `package.json` |
| Krytyczne | `robots.txt` — brak pliku | `public/robots.txt` |
| Krytyczne | Hreflang na stronach jachtów, marek, homepage, services | każda z tych stron musi przekazać prop `alternates` do `Layout.astro` |
| Wysokie | GA4 + Consent Mode v2 — brak jakiejkolwiek analityki | nowy island lub layout snippet |
| Wysokie | JSON-LD `Organization` — brak na homepage | `src/pages/[lang]/index.astro` |
| Wysokie | JSON-LD `Product` — brak na stronach jachtów | `src/pages/[lang]/yachts/[yacht].astro` |
| Wysokie | JSON-LD `Article`/`BlogPosting` — brak na blogu | `src/pages/[lang]/blog/[slug].astro` |
| Średnie | Explicit `<link rel="canonical">` — teraz tylko implicit | `Layout.astro` |
| Średnie | `BreadcrumbList` schema — HTML breadcrumby są, schema nie | strony z breadcrumbami |

---

## Stan pokrycia

| Kategoria | Stan | Pokrycie |
|-----------|------|----------|
| Meta tytuły/opisy | ✓ | 100% |
| Hreflang | ⚠ Częściowe | ~40% stron |
| Sitemap | ✗ Brak | 0% |
| Robots.txt | ✗ Brak | 0% |
| Canonical URL | ⚠ Implicit | — |
| JSON-LD | ⚠ Częściowe | LocalBusiness tylko |
| Optymalizacja obrazków | ✓ | 100% |
| Wydajność / static | ✓ | 100% |
| Analityka / Consent | ✗ Brak | 0% |
