# Backlog MVP — jeden krok = jeden PR

Kontekst stały: CLAUDE.md. Kontrakty: README-CONTENT.md,
docs/kontrakt-api-lead.md, docs/kontrakt-locations.md.
Cel MVP: demo do dyskusji z biznesem (scope / tech / wizual).
Bez ram czasowych — liczy się kompletność poniższych kroków.

## Krok 1 — szkielet

Astro + strict TS, deploy Vercel od pierwszego commita, i18n
(pl/en/de, lokalizowane slugi), content collections: yachts, brands,
dealers (semantyka pól jak niżej) + locations
(docs/kontrakt-locations.md), fixtures, helper obrazów (brak hero.jpg
opublikowanego jachtu = błąd builda), CI: build + typecheck na PR.

Blokujące TODO (pyta user): klucze 5 brandów, potwierdzenie locale
`de`, źródło danych lokalizacji.

Semantyka pól (zamrożona): jacht wymagane translationKey, name,
brand (enum), year, lengthM, cabins; opcjonalne beamM, draftM, berths,
maxSpeedKn, priceEur, muxPlaybackId, seo{title<=60, description<=160};
featured default false, draft DEFAULT TRUE. Brak priceEur = "cena na
zapytanie", filtr cenowy pomija. Brand: brandKey, name, tagline<=120,
website?, muxPlaybackId?, defaultDealer, order, seo. Dealer: dealerId,
name, email, phone?, brands[], pipedriveOptionLabel; niepubliczny.

## Krok 2 — strona główna jako poligon design systemu

Wejście: wybrany przez usera kierunek wizualny (referencje/prototyp)
w briefie. Implementacja landingu na fixtures i RÓWNOLEGLE ekstrakcja
design systemu: tokeny (typografia, paleta, spacing) + komponenty
bazowe (layout, header/footer, hero, karta, sekcja, przycisk, CTA).
Zero client JS. Premium = typografia + whitespace. Pipeline obrazów
wg budżetów od pierwszego zdjęcia. Mux: player na hero (poster jako
LCP). KRYTERIUM WYJŚCIA: podstronę brandu da się złożyć z istniejących
komponentów bez nowego CSS ad hoc.

## Krok 3 — pozostałe strony statyczne (składane, nie projektowane)

Template brandu (x5), karta jachtu z sekcją polecanych (liczone przy
buildzie: ten sam brand / zbliżona lengthM, zero JS), lista jachtów
(bez filtra). Wyłącznie z komponentów kroku 2 — potrzeba nowego
wzorca wizualnego = rozszerzenie systemu, nie one-off. Mux na hero
brandów tam, gdzie jest muxPlaybackId.

## Krok 4 — Sanity: blog + ustawienia

Blog: schemat posta (tytuł, slug, treść, obraz, seo, locale pl/en —
NIE rozbudowuj), Studio /admin, webhook -> deploy hook, template posta
i listingu. Ustawienia: dokument singleton "notificationRecipients"
(lista adresów e-mail) edytowalny w Studio — konsumowany przez
/api/lead w kroku 5. Scenariusz demo: user wpisuje w Studio 3 dowolne
adresy, zapisuje, formularz wysyła na wszystkie trzy bez rebuilda.

## Krok 5 — wyspy + endpoint

- Filtr jachtów: client:visible, dane jako props z builda, stan w URL
  query params. Pole tekstowe wyszukiwania: dopasowanie po
  name/brand (placeholder funkcjonalny, bez rozbudowy).
- Formularz leadowy: kontekst brand/jacht pre-filled, Turnstile,
  walidacja współdzielona z serwerem.
- /api/lead: docs/kontrakt-api-lead.md (w tym odbiorcy z Sanity
  i wariant leada z porównywarki).
- Porównywarka: do 3 jachtów, stan w URL (shareable), widok
  zestawienia + textarea zapytania -> ten sam endpoint z listą
  porównywanych jachtów.

## Krok 6 — our network (hybryda)

- Warstwa statyczna (fundament SEO): /network + podstrony
  /network/{kraj} — listy showroomów, schema.org LocalBusiness,
  liczniki per kraj. Inline SVG mapa świata z podświetlonymi krajami
  obecności (kraje = linki do podstron), zero JS.
- Warstwa GL (enhancement): wyspa Mapbox GL na /network,
  client:visible, clustering (setki pinów), publiczny token
  z restrykcją URL. Brak GL nie zabiera treści.
- Personalizacja: pasek "X lokalizacji w {kraj usera} — najbliższy:
  {miasto}" z geolokalizacji IP (kraj), fallback na wersję globalną.
  Bez browser geolocation API.

## Krok 7 — i18n treści + SEO

Sitemap per locale, canonicale, hreflang (po translationKey),
schema.org (Product/Offer, Organization, BreadcrumbList,
LocalBusiness), OG images, GA4 + baner zgód w 3 językach (Consent
Mode v2, zero beaconów przed zgodą).

## Krok 8 — hardening + seed demo

Edge case'y /api/lead, Lighthouse >= 95 mobile, test formularza
i porównywarki w 3 językach. Seed danych demo: jachty per brand,
lokalizacje świat (realne showroomy z publicznych stron brandów,
jeśli dane produkcyjne nie dotarły) — na preview deploy, nie prod.

## Poza MVP — nie implementuj, nie przygotowuj

Języki 4-6, konfigurator, newsletter, pełnotekstowa wyszukiwarka
z podpowiedziami, automatyczny routing regionalny leadów, blog w 3.
języku, preview mode Sanity, browser geolocation.
