# SEO Implementation Report — Herev Yachts

Data: 2026-08-13  
Build: 197 stron, 0 błędów, 0 ostrzeżeń TypeScript

---

## Co zostało wdrożone

### Fundament techniczny (Core §1–§6)

| Element | Status | Szczegóły |
|---------|--------|-----------|
| `<title>` | ✅ | Unikalny per strona, z i18n |
| `<meta description>` | ✅ | Per strona, z fallbackiem |
| `<link rel="canonical">` | ✅ | Absolutny URL z `Astro.url.href` |
| `<meta name="robots">` | ✅ | `index,follow` domyślnie; `noindex,nofollow` na 404 + globalny przełącznik |
| Open Graph | ✅ | `og:type`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image`, `og:locale`, `og:locale:alternate` |
| Twitter / X Cards | ✅ | `summary_large_image` |
| JSON-LD — Organization | ✅ | `@id: /#identity`, `knowsAbout` 5 marek, `sameAs` placeholder |
| JSON-LD — WebSite | ✅ | `@id: /#website`, `publisher → #identity` |
| JSON-LD — WebPage | ✅ | Per strona, `isPartOf → #website`, `about → #identity` |
| JSON-LD — BreadcrumbList | ✅ | Blog posts; strony katalogowe przez opcjonalny prop |
| Sitemap | ✅ | `sitemap-index.xml` + `sitemap-0.xml`; multilingual `xhtml:link`; filtruje /404 i /admin |
| `robots.txt` | ✅ | AI bots allowed (GPTBot, PerplexityBot, ClaudeBot, Google-Extended, OAI-SearchBot, ChatGPT-User) |
| `llms.txt` | ✅ | Markdown z opisem encji i kluczowymi URL |

### i18n / Multilingual (§MULTILINGUAL)

| Element | Status | Szczegóły |
|---------|--------|-----------|
| `hreflang` BCP47 | ✅ | en, pl, es, it — auto-generowane z URL |
| `hreflang x-default` | ✅ | Wskazuje na `/en/` wersję |
| `og:locale:alternate` | ✅ | Per locale, dynamicznie |
| Wzajemność hreflang | ✅ | Auto-alternates generuje wszystkie locale dla każdej strony |
| Blog posts — explicit alternates | ✅ | Buildowane z `translationKey` match; różne slugi per locale obsługiwane |

### Przełącznik indeksowania (zapobieganie indexowaniu w fazie dev)

Dodano `PUBLIC_INDEXING_ENABLED` env var. Domyślnie `false` — wszystkie strony mają `noindex,nofollow` do czasu launchu.

**Żeby włączyć indeksowanie przy launchu:** ustaw `PUBLIC_INDEXING_ENABLED=true` w Vercel Environment Variables (Settings → Environment Variables) dla środowiska Production.

---

## Pliki zmodyfikowane

| Plik | Co zmieniono |
|------|-------------|
| `astro.config.mjs` | `site: 'https://herev.com'` + `@astrojs/sitemap` integracja |
| `src/lib/i18n.ts` | Nowa funkcja `buildAlternates()` |
| `src/layouts/Layout.astro` | Canonical, OG, Twitter, JSON-LD, robots meta, auto-alternates, x-default |
| `src/pages/[lang]/404.astro` | `noindex={true}` + `alternates={[]}` |
| `src/pages/[lang]/brands/[brand].astro` | `alternates` prop dodany |
| `src/pages/[lang]/blog/[slug].astro` | `ogType="article"` + `breadcrumbs` |
| `public/robots.txt` | Nowy plik |
| `public/llms.txt` | Nowy plik |
| `package.json` | `@astrojs/sitemap 3.7.3` |

---

## Zadania manualne (wymagają działania człowieka)

### Priorytet KRYTYCZNY przed launchem

1. **`public/og.jpg`** — dodać zdjęcie 1200×630px jako domyślny OG image dla share'ów w social media. Bez tego wszystkie podglądy linków w social media będą broken. Zalecane: zdjęcie reprezentatywne dla marki, z logotypem.

2. **`PUBLIC_INDEXING_ENABLED=true`** — ustawić w Vercel env vars w momencie oficjalnego launchu.

3. **Rejestracja sitemapy** — po pierwszym deploy z domeną produkcyjną:
   - Google Search Console → Sitemaps → dodaj `https://herev.com/sitemap-index.xml`
   - Bing Webmaster Tools → Sitemaps → dodaj ten sam URL

### Priorytet WYSOKI (pierwsze tygodnie po launchu)

4. **`sameAs` w Organization JSON-LD** (`src/layouts/Layout.astro` linia ~68) — wypełnić tablicę profilem LinkedIn firmy, ewentualnym Wikidata, social media. To najskuteczniejszy sygnał dla AI citation (GEO).

5. **Google Search Console** — zweryfikować właściciela domeny, monitorować Coverage report po indeksowaniu.

6. **Bing Webmaster Tools + IndexNow** — weryfikacja + włączenie IndexNow dla szybszego pickup (~24h).

### Priorytet ŚREDNI (przed/po launchu)

7. **OG images per strona** — jachty i marki mogą mieć własne OG image zamiast domyślnego `/og.jpg`. Wymaga przekazania absolutnego URL hero image przez prop `image` w Layout. Techniczne — nie wymaga zmiany schematu.

8. **Zweryfikować JSON-LD** — po deploy użyć:
   - `validator.schema.org` — wkleić URL dowolnej strony
   - `search.google.com/test/rich-results` — zero błędów
   - `developers.facebook.com/tools/debug` — OG preview

---

## Rynki docelowe — otwarte pytanie

Obecne locale: **en / pl / es / it**. Klient sygnalizował zainteresowanie dodatkowymi rynkami. Decyzja o nowych językach wpłynie na:
- Liczbę stron (×N per nowy język)
- Zakres tłumaczeń w `src/lib/i18n-strings.ts`
- Hreflang konfigurację

**Do potwierdzenia z klientem przed implementacją.**

---

## Co NIE zostało wdrożone (zakres poza tym PR)

| Element | Kiedy |
|---------|-------|
| GA4 + Consent Mode v2 | Krok 7 (po decyzji o cookie consent) |
| vanilla-cookieconsent | Po potwierdzeniu z klientem |
| OG images per jacht/marka | Opcjonalne ulepszenie, nie bloker |
| `dateModified` w WebPage JSON-LD | Po wdrożeniu Sanity (daty z CMS) |
| BreadcrumbList na stronach brand/yacht/network | Możliwe rozszerzenie przez `breadcrumbs` prop |
| Monitoring AI citation (STEP 0 z SEO doc) | Manualne — test baseline przed launchem |
