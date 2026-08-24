# Backlog MVP — jeden krok = jeden PR

Kontekst stały: CLAUDE.md. Kontrakty: README-CONTENT.md,
docs/kontrakt-api-lead.md, docs/kontrakt-locations.md.
Cel MVP: demo do dyskusji z biznesem (scope / tech / wizual).
Bez ram czasowych — liczy się kompletność poniższych kroków.

## Krok 1 — szkielet ✅ DONE

Astro + strict TS, deploy Vercel via GitHub integration (adapter
lokalnie dodany w kroku 5), i18n (en/pl/es/it/ru, lokalizowane slugi),
content collections: yachts, brands, dealers (semantyka pól jak niżej)
+ locations (docs/kontrakt-locations.md), fixtures, helper obrazów
(brak hero.jpg opublikowanego jachtu = błąd builda),
CI: build + typecheck + test na PR.

Decyzje zrealizowane: brandy = galeon, parker, saxdor, de-antonio,
chris-craft; locale de zastąpiony przez es/it/ru; lokalizacje = 3
demo-showroomy w locations.json.

Semantyka pól (zamrożona): jacht wymagane translationKey, name,
brand (enum), year, lengthM, cabins; opcjonalne beamM, draftM, berths,
maxSpeedKn, priceEur, muxPlaybackId, category (enum: flybridge|hardtop|
open|weekender|day|grand-tourer|runabout — dodane w kroku 2, surowa
wartość w content, uppercase+separator+tłumaczenie w UI),
seo{title<=60, description<=160}; featured default false,
draft DEFAULT TRUE. priceEur: pole wyłącznie wewnętrzne, nigdy nie
renderowane. Brand: brandKey, name, tagline<=120, website?,
muxPlaybackId?, defaultDealer, order, seo. Dealer: dealerId, name,
email, phone?, brands[], pipedriveOptionLabel; niepubliczny.

## Krok 2 — strona główna jako poligon design systemu

Wejście: docs/design-handoff/ — tokeny, spec komponentów i mockupy
stron z Claude Design (referencja wizualna; przy konflikcie
generycznych instrukcji z bundle'a z CLAUDE.md wygrywa CLAUDE.md).

Zadanie 1: migracja tokenów z handoffu do @theme
w src/styles/global.css — od tego momentu @theme jest jedynym
źródłem prawdy stylów, handoff pozostaje read-only.

Zadanie 2: implementacja landingu wg mockupu, na fixtures,
i RÓWNOLEGLE ekstrakcja design systemu: komponenty bazowe (layout,
header/footer, hero, karta, sekcja, przycisk, CTA) stylowane
wyłącznie tokenami z @theme.

Zero client JS. Premium = typografia + whitespace. Pipeline obrazów
wg budżetów od pierwszego zdjęcia. Mux: player na hero (poster jako
LCP). KRYTERIUM WYJŚCIA: podstronę brandu da się złożyć z istniejących
komponentów bez nowego CSS ad hoc.

## Krok 3 — pozostałe strony statyczne (składane, nie projektowane)

CENY NIE SĄ PUBLIKOWANE nigdzie w serwisie. priceEur zostaje
w schemacie (dane wewnętrzne), nie jest renderowane.

Template brandu (x5), karta jachtu z sekcją polecanych (liczone przy
buildzie: ten sam brand / zbliżona lengthM, zero JS), lista jachtów
(bez filtra). Wyłącznie z komponentów kroku 2 — potrzeba nowego
wzorca wizualnego = rozszerzenie systemu, nie one-off. Mux na hero
brandów tam, gdzie jest muxPlaybackId.

## Krok 4 — Sanity: blog + ustawienia

Blog: schemat posta (tytuł, slug, treść, obraz, seo, locale —
NIE rozbudowuj), Studio /admin, webhook -> deploy hook, template posta
i listingu. Locale: en/pl/es/it (zgodnie z istniejącą treścią — pierwotny
plan "pl/en" zaktualizowany po odkryciu, że blog już miał 4 języki). Ustawienia: dokument singleton "notificationRecipients"
(lista adresów e-mail) edytowalny w Studio — konsumowany przez
/api/lead w kroku 5. Scenariusz demo: user wpisuje w Studio 3 dowolne
adresy, zapisuje, formularz wysyła na wszystkie trzy bez rebuilda.

## Krok 5 — wyspy + endpoint

- Przywrócić @astrojs/vercel adapter (usunięty w kroku 1 dla
  static-only buildu; wymagany dla endpointów SSR) + output: 'server'.
- Filtr jachtów: client:visible, dane jako props z builda, stan w URL
  query params; facety: brand / category / lengthM / cabins / year.
  Pole tekstowe wyszukiwania: dopasowanie po name/brand (placeholder
  funkcjonalny, bez rozbudowy).
- Formularz leadowy: kontekst brand/jacht pre-filled, Turnstile,
  walidacja współdzielona z serwerem.
- /api/lead: docs/kontrakt-api-lead.md (w tym odbiorcy z Sanity
  i wariant leada z porównywarki).
- Porównywarka: do 3 jachtów, stan w URL (shareable), widok
  zestawienia + textarea zapytania -> ten sam endpoint z listą
  porównywanych jachtów.
- Wdrożyć /api/geo (Vercel geo headers: x-vercel-ip-country) i podpiąć
  do paska personalizacji na /network + geo-IP country focus na mapie.

## Krok 6 — our network (hybryda)

- Warstwa statyczna (fundament SEO): /network + podstrony
  /network/{kraj} — listy showroomów, schema.org LocalBusiness,
  liczniki per kraj. Zero JS.
- Warstwa GL (enhancement): wyspa Mapbox GL na /network,
  client:visible, clustering (setki pinów), publiczny token
  z restrykcją URL. Brak GL nie zabiera treści.
- Personalizacja: pasek geo-IP (kraj z nagłówków Vercel) — pełna
  implementacja w kroku 5 (wire /api/geo into network strip).
  W tym kroku oba stany (neutral/resolved) renderowane statycznie;
  `data-geo-strip` atrybut gotowy do przełączania przez JS w kroku 5.
- Geolokalizacja przeglądarki (user-initiated only) w wyspie GL:
  przycisk "Use my location" → haversine nearest showroom → flyTo.
- Enquiry CTAs → #enquire → /${lang}/#lead jako placeholder do kroku 5.

## Krok 7 — i18n treści + SEO

Sitemap per locale, canonicale, hreflang (po translationKey),
schema.org (Product/Offer, Organization, BreadcrumbList,
LocalBusiness), OG images, GA4 + baner zgód w 5 językach (Consent
Mode v2, zero beaconów przed zgodą).

## Krok 8 — hardening + seed demo

Edge case'y /api/lead, Lighthouse >= 95 mobile, test formularza
i porównywarki w 5 językach. Seed danych demo: jachty per brand,
lokalizacje świat (realne showroomy z publicznych stron brandów,
jeśli dane produkcyjne nie dotarły) — na preview deploy, nie prod.

## Poza MVP — nie implementuj, nie przygotowuj

Konfigurator, newsletter, pełnotekstowa wyszukiwarka
z podpowiedziami, automatyczny routing regionalny leadów, blog w 3.
języku, preview mode Sanity.
