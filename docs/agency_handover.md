# Agency Handover — Herev Yachts

Dokument dla agencji marketingowej. Zawiera opis projektu, stack techniczny, stan SEO, zakres treści i otwarte pytania przed audytem.

Data dokumentu: 2026-08-13  
Etap: **Faza developmentu** — strona nie jest jeszcze publicznie indeksowana.

---

## Czym jest Herev

Herev to portal lead-gen dla rynku jachtowego premium. Reprezentuje 5 europejskich i amerykańskich marek jachtów:

- **Galeon** — polski producent, yachty flybridge i hardtop
- **Parker** — duński producent, łodzie kabinowe i sportowe
- **Saxdor** — fiński producent, yachty open i GTC
- **De Antonio** — hiszpański producent, yachty open i cruiser
- **Chris-Craft** — amerykański producent, klasyczne runabouty i łodzie dzienne

**Model biznesowy:** Użytkownik wypełnia formularz → lead trafia do lokalnego dealera przez Pipedrive CRM → dealer kontaktuje się w ciągu 24h.

**Cel SEO:** Organiczny ruch z zapytań o konkretne modele i marki jachtów, widoczność na rynkach europejskich i anglojęzycznych.

---

## Stack techniczny

| Warstwa | Technologia | Uwagi |
|---------|-------------|-------|
| Framework | Astro 7 (static output) | Generuje czysty HTML — brak JS w domyślnym buildzie |
| Hosting | Vercel | CDN globalny, CI/CD z GitHub |
| Język | TypeScript strict | |
| Stylowanie | Tailwind v4 | Design system oparty na tokenach (`@theme`) |
| CMS | Sanity | Wdrożone: blog (en/pl/es/it) + `notificationRecipients` singleton. Studio pod `/admin` |
| Mapa | Mapbox GL v3 | Strona "Our Network" — sieć showroomów |
| Video | Mux | Planowany dla hero sections |
| Analityka | GA4 + Consent Mode v2 | Planowany |
| Cookie consent | vanilla-cookieconsent | Planowany |
| Antyspam | Cloudflare Turnstile | Planowany (formularze) |
| CRM | Pipedrive | Planowany (routing leadów) |
| Email | Resend | Planowany (potwierdzenia leadów) |
| Newsletter | Mailchimp | Planowany |

---

## Architektura stron

### Liczba stron (current build)

197 stron statycznych w 4 językach (en / pl / es / it).

### Struktura URL

```
/{lang}/                          — strona główna
/{lang}/brands/                   — listing marek (5 kart)
/{lang}/brands/{brand}/           — strona marki (Galeon, Parker, etc.)
/{lang}/yachts/                   — pełny listing jachtów z filtrem
/{lang}/yachts/{brand}/           — listing jachtów marki
/{lang}/yachts/{brand}/{model}/   — strona modelu jachtu
/{lang}/network/                  — mapa sieci showroomów
/{lang}/network/{country}/        — showrooomy w danym kraju (16 krajów)
/{lang}/services/                 — opis usług
/{lang}/blog/                     — listing bloga
/{lang}/blog/{slug}/              — artykuł
```

### Lokalizacje

- Język domyślny: **en** (angielski)
- Wszystkie URL z prefiksem locale: `/en/`, `/pl/`, `/es/`, `/it/`
- x-default hreflang wskazuje na `/en/`

---

## Stan SEO (po wdrożeniu 2026-08-13)

### Zaimplementowane

- ✅ Canonical URLs (absolutne, per strona)
- ✅ Meta title + description (per strona, z i18n)
- ✅ Open Graph (title, description, image, locale, locale:alternate)
- ✅ Twitter / X Cards (summary_large_image)
- ✅ hreflang BCP47 + x-default (auto-generowane z URL)
- ✅ JSON-LD: Organization + WebSite + WebPage (każda strona)
- ✅ JSON-LD: BreadcrumbList (blog posts)
- ✅ JSON-LD: LocalBusiness (każdy showroom w `/network/{country}/`)
- ✅ XML Sitemap z hreflang (`sitemap-index.xml`)
- ✅ `robots.txt` z AI bot allowances
- ✅ `llms.txt`
- ✅ Blokada indeksowania do launchu (`PUBLIC_INDEXING_ENABLED=false`)

### Niezaimplementowane (planowane)

- ⏳ GA4 + Consent Mode v2
- ⏳ Cookie consent banner (5 języków)
- ⏳ OG image per strona (jachty, marki) — aktualnie jeden domyślny `/og.jpg`
- ✅ `dateModified`/`datePublished` w WebPage JSON-LD (na stronach bloga, z dat Sanity)
- ⏳ Sitemap rejestracja w Google Search Console + Bing

### Do uzupełnienia manualnie

- **`public/og.jpg`** — brakujący domyślny OG image (1200×630px)
- **`sameAs` w Organization JSON-LD** — LinkedIn, social media, ewentualny Wikidata
- **Rejestracja sitemapy** w GSC i Bing po launchu

---

## Treści (content)

### Struktura treści

Blog jest zarządzany przez Sanity CMS (Studio pod `/admin`) — patrz `docs/sanity-setup.md`.
Pozostałe treści (jachty, marki, dealerzy) są w plikach Markdown w repozytorium
(`src/content/`) — to zamierzony, świadomy podział na teraz (patrz niżej), nie
przeoczenie.

### Co można edytować przez CMS (dziś)

- Wpisy blogowe (tytuł, treść, obraz okładki, meta tagi SEO, pl/en)
- Adresy e-mail odbiorców powiadomień o leadach (`notificationRecipients`)

### Poza CMS (nadal pliki w repo — wymaga PR-a do zmiany)

- Teksty opisowe jachtów i marek
- Zdjęcia jachtów/marek
- Meta tagi jachtów/marek

Migracja tych treści do Sanity to osobny, jeszcze nie zaplanowany krok —
celowo odłożony, dopóki zakres jachtów/marek nie jest ustabilizowany z klientem.

### Modele jachtów (obecne fixture data)

15 modeli × 4 locale = 60 plików treści:

| Marka | Modele |
|-------|--------|
| Galeon | 380 Hardtop, 420 Fly, 500 Fly |
| Parker | 750 Pilothouse, 920 Max, 1050 Sport |
| Saxdor | 270 Open, 320 GTC, 400 GTC |
| De Antonio | D28 Open, D38 Cruiser, D50 |
| Chris-Craft | Corsair 25, Launch 25, Launch 28 |

**Uwaga:** Ceny nie są publikowane na stronie (wyłączone decyzją biznesową).

### Blog

Zarządzany przez Sanity CMS (`/admin`), 4 języki (en/pl/es/it). Schemat: tytuł, slug, treść (Portable Text),
obraz okładki, kategoria, data publikacji, SEO. Konfiguracja i instrukcja
edytorska: `docs/sanity-setup.md`.

### Sieć showroomów

50 lokalizacji w 16 krajach (dane w `src/data/locations.json`):

Polska, Hiszpania, Francja, Włochy, Chorwacja, Grecja, Niemcy, Holandia, Wielka Brytania, Portugalia, Szwecja, Norwegia, Turcja, Emiraty Arabskie, USA, Australia.

---

## Wydajność i Core Web Vitals

**Architektura:** Zero JavaScript w domyślnym HTML. React wyspy (`islands`) tylko tam gdzie niezbędna interaktywność (mapa, filtr jachtów).

**Obrazy:** Astro Image (Sharp) — automatyczna konwersja do WebP, `srcset`, `loading="lazy"`, `width`/`height` zapobiegające CLS.

**Fonty:** Self-hosted (Fraunces, Inter) — preload w `<head>`, bez opóźnień z zewnętrznych CDN.

**Target Lighthouse mobile:** ≥ 95 (definicja done dla każdej strony).

> Lighthouse to dane laboratoryjne. Bramka produkcyjna = CrUX p75: LCP < 2,5s, INP < 200ms, CLS < 0,1.

---

## Otwarte pytania dla agencji

Poniższe decyzje wpłyną na zakres pracy agencji:

1. **Rynki docelowe** — jakie języki poza en/pl/es/it? (de, fr, no/sv, ar?) Każdy nowy język to nowe wersje wszystkich stron.

2. **Strategia bloga** — jak często planowane publikacje? Jakie główne tematy/słowa kluczowe? Blog jest SEO machine — bez regularnych publikacji nie dostarczy wartości.

3. **Baseline AI citation** — przed launchem zalecamy test: wpuścić 20–30 realnych zapytań klienta do ChatGPT, Perplexity, Gemini. Zapisać które marki się pojawiają. Po 3 miesiącach od launchu powtórzyć i mierzyć zmianę.

4. **Profil Google Business** — czy showrooomy mają profile? NAP (Name-Address-Phone) musi być spójny: strona = schema = Google Business Profile.

5. **Social media / autorzy bloga** — dla E-E-A-T i `sameAs` w Organization JSON-LD potrzebujemy profili: LinkedIn, ewentualny Wikidata/Crunchbase, imiona i kwalifikacje autorów artykułów.

6. **Wzmianki i earned media** — ~85% cytowań AI pochodzi ze stron trzecich. Bez PR, publikacji gościnnych i wzmianek w branżowych mediach efekt GEO będzie ograniczony niezależnie od technicznej jakości strony.

---

## Dostęp i zasoby

| Zasób | Uwagi |
|-------|-------|
| Repozytorium | GitHub (przez właściciela projektu) |
| Hosting | Vercel — właściciel projektu |
| Domena | `herev.com` |
| Google Search Console | Do skonfigurowania po launchu |
| Bing Webmaster Tools | Do skonfigurowania po launchu |
| Sitemap URL | `https://herev.com/sitemap-index.xml` |
| robots.txt | `https://herev.com/robots.txt` |
| llms.txt | `https://herev.com/llms.txt` |

---

## Czego agencja NIE musi robić (już zaimplementowane)

- Sitemap XML — gotowy, generuje się automatycznie przy każdym buildzie
- Hreflang — zautomatyzowany w Layout
- Canonical — zautomatyzowany w Layout
- Structured data (Organization, WebSite, WebPage, LocalBusiness, BreadcrumbList) — gotowe
- robots.txt z AI bot rules — gotowy
- Blokada indeksowania w dev — aktywna

---

## Kontakt techniczny

Projekt: Tomasz Klepacki  
Email: t.klepacki@gmail.com
