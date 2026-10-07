# CMS — plan migracji i tracker postępu

Cel: cała treść strony (teksty, zdjęcia, wideo, meta tagi) edytowalna
w Sanity przez osobę nietechniczną, z podglądem zmian przed publikacją
na produkcji.

**Jak korzystać z tego pliku (każda sesja):** zacznij od sekcji „Stan”.
Po pracy odhacz zadania, zaktualizuj „Stan” i dopisz wpis do „Dziennika”.
Jeden krok = jeden PR (zasady w `CLAUDE.md`).

## Stan

- **Bieżący krok:** 9.1 — kod gotowy (branch `cms/9.1-preview`, bez commita);
  czekają kroki ręczne i kryteria wyjścia
- **Następna akcja:** Tomasz: kroki ręczne 9.1 (runbook w
  `docs/sanity-setup.md` → „CMS i podgląd”); potem test w przeglądarce
  (Chrome + Safari) i PR
- **Blokery:** brak
- **Ostatnia aktualizacja:** 2026-10-07

## Decyzje

| # | Decyzja | Data | Uzasadnienie / uwagi |
|---|---|---|---|
| D1 | Zostajemy przy Sanity | 2026-10-07 | Presentation tool (klik w tekst na podglądzie), polski interfejs, hotspot/crop zdjęć; blog i Studio już działają. Odrzucone: Storyblok (od $99/mies. + przepisanie tego, co jest), TinaCMS/Keystatic (podgląd przez buildy, zdjęcia w repo), Payload (wymaga bazy danych) |
| D2 | Plan Free na czas developmentu, Growth przed przekazaniem klientowi | 2026-10-07 | Warunki przejścia — sekcja „Limity planu Free” |
| D3 | Studio po polsku | 2026-10-07 | `@sanity/locale-pl-pl` + polskie tytuły, opisy pól i komunikaty walidacji |
| D4 | `cms.herev.com` = Studio + podgląd w jednym miejscu | 2026-10-07 | `/admin` znika z produkcji (przekierowanie na `cms.herev.com/admin`). Jedna domena = brak problemów z cookies w iframe (Safari). Publiczne URL-e bloga (`/{lang}/blog/…`) bez zmian — zmienia się tylko adres panelu: `herev.com/admin` → `cms.herev.com/admin` |
| D5 | Bez Mux na razie — wideo jako linki Vimeo | 2026-10-07 | Filmy (np. strona jachtu): link do strony Vimeo/YouTube, odtwarzanie po kliknięciu (już działa). Wideo w tle (hero): link do **pliku** z Vimeo + poster wgrany w CMS. Mux można dodać później jako alternatywne źródło bez przebudowy modelu |
| D6 | Stałe sekcje stron, bez page-buildera | 2026-10-07 | Edytuje się treść i zdjęcia, nie układ. Wyjątek: treść posta — elastyczny rich text, ale w ramach szablonu bloga |
| D7 | Nowy typ „Strona tekstowa” | 2026-10-07 | Polityka prywatności, cookies itp.; linki w stopce (dziś „LEGAL · PRIVACY · COOKIES” to zwykły tekst) |
| D8 | Produkcja zostaje statyczna; publikacja = rebuild | 2026-10-07 | Webhook Sanity → Vercel Deploy Hook (~2–3 min). Strona nie zależy od Sanity w runtime |
| D9 | Podgląd = drugi projekt Vercel z tego repo | 2026-10-07 | Flaga env `SANITY_PREVIEW=true` przełącza `output` na `'server'`. Jedna baza kodu |
| D10 | Języki: pola wielojęzyczne dla stron, jachtów, marek i stocku; osobny dokument na język dla bloga, stron tekstowych i tekstów interfejsu | 2026-10-07 | Zdjęcia i dane techniczne wpisuje się raz. Teksty interfejsu per język: wygodniejsze dla tłumacza i nie mnożą atrybutów ×4 (limit Free) |
| D11 | Obrazy: na produkcji przez astro:assets (pobierane z Sanity przy buildzie), w podglądzie prosto z CDN Sanity | 2026-10-07 | Zasada DoD „images via astro:assets” zostaje; transfer obrazów idzie z Vercela, nie z limitu Sanity |
| D12 | Poza CMS: dealerzy (`src/content/dealers`) i `src/data/locations.json` | 2026-10-07 | To dane (Pipedrive, import CSV), nie treść. Teksty strony Network idą do CMS |
| D13 | Prywatność na Free: opublikowana treść jest publiczna w API (i tak jest na stronie); prywatne są wersje robocze i dokumenty z kropką w `_id` | 2026-10-07 | `notificationRecipients` → `private.notificationRecipients` (krok 9.2). Pliki (zdjęcia, PDF) są publiczne po URL-u na każdym planie (prywatne pliki = płatny Media Library) — do CMS nie trafia nic poufnego. Treść tajna do premiery = nieopublikowana wersja robocza (podgląd ją pokazuje) |

## Do potwierdzenia

- [ ] `README-CONTENT.md` przestaje obowiązywać po krokach 9.4–9.5 (zespół
      treści przechodzi z plików na CMS). Zmiana kontraktu — wymaga zgody
      i uprzedzenia klienta.
- [ ] Krok 5 backlogu: `output: 'static'` + adapter (endpointy z
      `prerender = false`) zamiast `output: 'server'` — strony zostają statyczne.
- [ ] Usunięcie pola `draft` z posta — dubluje natywne wersje robocze Sanity
      i myli edytora (krok 9.2).
- [ ] `public/700 SKY-20260725T204625Z-1-001/` (41 zdjęć + PDF klienta,
      nieużywane, a publicznie dostępne) — wgrać do CMS jako jacht czy usunąć?
- [ ] Klucze i18n, których nic nie wyświetla: `t.hero.eyebrow`, `t.fleet.*`,
      `t.nav.call`, `t.network.locations|brands|years`,
      `t.networkPage.directory.viewAll`, `t.lead.orCall`. Domyślnie nie
      migrujemy — chyba że mają wrócić na stronę.
- [ ] Usunąć z Sanity 2 testowe posty: `new-herev-cms-post` (EN)
      i `pierwszy-polski-post-as` (PL)?

## Architektura

- **Produkcja (`herev.com`):** `output: 'static'`, na razie bez adaptera
  (dojdzie z endpointami w kroku 5). Build czyta wyłącznie opublikowaną treść
  (`perspective: 'published'`, `useCdn: false`). Webhook Sanity → Deploy
  Hook → rebuild.
- **CMS (`cms.herev.com`):** drugi projekt Vercel na tym samym repo,
  `SANITY_PREVIEW=true` → adapter + strony z treścią CMS renderowane na
  żądanie (hook `astro:route:setup`), reszta prerenderowana. Studio pod
  `/admin` z Presentation tool. Tryb roboczy: handshake
  `@sanity/preview-url-secret` → cookie `herev-draft-mode` (HMAC z tokena)
  → strony renderują wersje robocze ze stega
  (klik w tekst otwiera pole). Bez cookie widać tylko opublikowaną treść;
  zawsze `noindex`.
- **Trasy tylko dla CMS** (Studio, `/api/draft-mode/enable|disable`)
  wstrzykiwane integracją wyłącznie przy `SANITY_PREVIEW=true` — w buildzie
  produkcyjnym nie istnieją. Kod podglądu nie trafia do bundla produkcji.
- **Warstwa danych:** `src/lib/server/cms/` — klient, zapytania GROQ, typy
  (Sanity TypeGen), memoizacja zapytań w buildzie. Strony ładują dane po
  `Astro.params`; `getStaticPaths` zwraca tylko params (w SSR jest
  ignorowane, więc `props` z niego nie działają).
- **Stega:** wartości używane w logice (slugi, enumy, URL-e, placeholdery
  `{name}`) czyszczone w warstwie danych (`stegaClean`).
- **Obrazy:** komponent `CmsImage` — produkcja: astro:assets ze źródłem
  z Sanity (crop przez URL, hotspot → `object-position`); podgląd: srcset
  z CDN Sanity.
- **Wideo:** link do strony Vimeo/YouTube → fasada „kliknij, aby odtworzyć”
  (`src/lib/video.ts`). Tło hero: link do pliku Vimeo
  (`player.vimeo.com/progressive_redirect/…` lub `player.vimeo.com/external/…`)
  w `<video autoplay muted loop playsinline>` + poster z CMS (LCP przez
  astro:assets, bez pobierania miniatury z oEmbed).
- **Walidacja:** w Studio (blokuje publikację, komunikaty po polsku) + twarde
  asercje w buildzie (błąd, nie cichy fallback).
- **Nowe zależności** (uzasadnienie w PR-ach): `@sanity/visual-editing`,
  `@sanity/preview-url-secret`, `@sanity/locale-pl-pl`,
  `sanity-plugin-internationalized-array`, `@sanity/language-filter`.

## Mapa Studio (docelowo)

```
Strony            Strona główna · Usługi · Marki · Jachty · Dostępne od ręki ·
                  Sieć dealerska · Blog · 404 · Strony tekstowe
Jachty            pogrupowane wg marki
Marki             5 stałych (bez dodawania i usuwania)
Dostępne od ręki  egzemplarze z ceną
Blog              wg języka
Ustawienia        Nawigacja i stopka · Kontakt · SEO i udostępnianie ·
                  Teksty interfejsu (EN / PL / ES / IT) · Odbiorcy powiadomień
Podgląd           (Presentation tool)
```

W dokumencie: zakładki = sekcje strony w kolejności wyświetlania + „SEO”.

## Kroki

### Krok 9.1 — Fundament podglądu (blog jako poligon)

Kod:
- [x] `astro.config.mjs`: przy `SANITY_PREVIEW=true` adapter `@astrojs/vercel`
      + i18n `routing: 'manual'`; bez flagi konfiguracja jak dotąd (patrz
      Dziennik — odstępstwa od planu)
- [x] Integracja „tryb CMS” (`src/cms/integration.ts`): Studio
      (`/admin/[...path]`), `/api/draft-mode/enable|disable`, skrypt mostka,
      strony z listy `CMS_PAGES` renderowane na żądanie;
      `src/pages/admin.astro` → `src/cms/routes/studio.astro`
- [x] `src/lib/server/cms/`: `client.ts` (`loadQuery`, `useCdn: false`,
      `published` / `drafts` + stega), `draftMode.ts` (cookie HMAC),
      `blog.ts` (zapytania, `stegaClean` dla id/slug/locale/dat);
      `src/middleware.ts` ustawia `Astro.locals.draftMode`.
      Memoizacja przeniesiona do 9.2 (teraz każde zapytanie jest inne)
- [x] Blog (`[lang]/blog/index`, `[lang]/blog/[slug]`) na „dane po params”;
      na żądanie nieistniejący post / język → 404; w buildzie → błąd
- [x] Mostek Visual Editing (`src/cms/visual-editing.ts`): ładowany tylko
      na CMS i tylko przy `data-draft-mode`; każda zmiana → przeładowanie
- [x] `sanity.config.ts`: Presentation tool „Podgląd”
      (`src/sanity/presentation.ts`: lokalizacje `post`, `mainDocuments`)
- [x] `vercel.json`: `/admin/*` → `https://cms.herev.com/admin/*` tylko dla
      hosta `herev.com`; stary rewrite Studio usunięty (Studio obsługuje
      trasa `[...path]`)
- [x] Testy Vitest: cookie trybu roboczego, opcje zapytań, czyszczenie stega
- [x] `docs/sanity-setup.md`: runbook „CMS i podgląd (krok 9.1)”

Ręcznie (Tomasz):
- [ ] Vercel: nowy projekt `herev-cms` z tego repo; env: `SANITY_PREVIEW=true`,
      `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN`
- [ ] DNS: `cms.herev.com` → projekt `herev-cms` (czeka na domenę klienta;
      do tego czasu `herev-cms.vercel.app` + tymczasowa reguła w `vercel.json`)
- [ ] Sanity → API → CORS origins: `https://cms.herev.com` (Allow credentials)
      + `http://localhost:4321`
- [ ] Vercel (projekt produkcyjny): Deploy Hook dla brancha produkcyjnego
- [ ] Sanity → API → Webhooks: URL = Deploy Hook; filtr GROQ na typy treści
      (bez `notificationRecipients`)
- [ ] Vercel: powiadomienia o nieudanym buildzie na Twój e-mail

Kryteria wyjścia:
- [x] Edycja posta bez publikacji widoczna w zakładce Podgląd po kilku
      sekundach (lokalnie, 2026-10-07; powtórzyć na `cms.herev.com`)
- [ ] Klik w tekst na podglądzie otwiera właściwe pole (Chrome i Safari)
- [ ] „Opublikuj” → produkcja zaktualizowana automatycznie
- [ ] Bez cookie `cms.herev.com` pokazuje tylko opublikowaną treść; `noindex`
- [ ] Build produkcyjny bez Studio i kodu podglądu (sprawdzone w `.vercel/output`)
- [ ] `pnpm build`, `pnpm typecheck`, `pnpm test` zielone; Lighthouse mobile
      bez regresji

### Krok 9.2 — Klocki, Studio po polsku, Ustawienia, teksty interfejsu

Kod:
- [ ] Studio po polsku: `@sanity/locale-pl-pl`; polskie tytuły i opisy pól
      z przykładami
- [ ] Pola wielojęzyczne (`sanity-plugin-internationalized-array`) + filtr
      języka (`@sanity/language-filter`)
- [ ] Wspólne typy: zdjęcie (alt, hotspot, walidacja min. wymiarów
      z czytelnym komunikatem), `seo` (tytuł ≤ 60, opis ≤ 160, obrazek OG;
      liczniki znaków + podgląd wyniku Google), wideo (link Vimeo/YouTube;
      link do pliku Vimeo dla tła — walidacja rozpoznaje rodzaj linku
      i podpowiada, skąd go skopiować)
- [ ] Struktura menu Studio jak w „Mapie Studio”; singletony bez usuwania
      i duplikowania
- [ ] Ustawienia: nawigacja, stopka (+ linki do stron tekstowych), kontakt,
      sufiks tytułu (dziś mieszane „— Herev” i „| Herev”), domyślny opis
      i obrazek do udostępnień (dziś brak `/og.jpg`), profile social
      (`sameAs` w JSON-LD)
- [ ] Teksty interfejsu — dokument na język: przyciski, formularze, filtry,
      mapa, etykiety specyfikacji, kategorie, regiony, aria-labele; walidacja
      placeholderów (`{name}`, `{brand}`, `{n}`, `{b}`, `{country}`)
- [ ] `notificationRecipients` pod prywatnym ID
      `private.notificationRecipients` — niewidoczny bez tokena także na
      Free (dokument nie był jeszcze opublikowany, więc bez migracji danych)
- [ ] Dataset `development` (`sanity dataset create development
      --visibility public`); dane: `sanity dataset export` / `import`
- [ ] Migracja 4 artykułów bloga z historii gita
      (`git show eee6057^:src/content/blog/<locale>/<slug>.md`, EN/PL/ES/IT)
      skryptem: markdown → Portable Text, `translationOf` → wersja EN.
      Zastępuje ręczną „Fazę C” z kroku 4 (nigdy niewykonaną)
- [ ] Skrypt migracji `src/lib/i18n-strings.ts` → Sanity (idempotentny,
      stałe `_id`; najpierw `development`, potem `production`)
- [ ] Skrypt porównania tekstu HTML `dist/` przed i po migracji
- [ ] Strony czytają teksty interfejsu z CMS (kształt `Translations`
      zachowany → minimalne zmiany w stronach)
- [ ] Presentation: lokalizacje dla dokumentów ustawień („używane na
      wszystkich stronach”)

Podział `i18n-strings.ts` (do doprecyzowania przy implementacji):
- **Teksty interfejsu:** `nav`, `footer`, `categories`, etykiety `stock`,
  pola formularza z `lead`, etykiety `yachtPage`, `yachtsPage.filter`,
  etykiety `brandPage`/`blogPage`, `networkPage.explorer|regions|stats|countryPage`.
- **Treść stron (krok 9.3):** `meta`, `hero`, `intro`, `advisory`, `guide`,
  `shipyards`, `statement`, `network`, `servicesPage`, nagłówki
  `brandsPage`/`yachtsPage`/`stock.page`/`blogPage`,
  `networkPage.hero|directory|brandsStrip|cta`, `notFound`.

Kryteria wyjścia:
- [ ] Tekst HTML `dist/` przed i po: bez różnic (poza celowymi poprawkami
      tekstów, które były tylko po angielsku)
- [ ] Liczba atrybutów wpisana do tabeli w „Limitach planu Free”

### Krok 9.3 — Strony

Kod:
- [ ] Singletony: Strona główna, Usługi, Marki, Jachty, Dostępne od ręki,
      Sieć dealerska, Blog, 404 — sekcje w kolejności wyświetlania + SEO
- [ ] Strona główna: liczby (5 / 17 / 1, 30+ / 60+), zdjęcia sekcji (dziś
      `src/assets/site/*` i na sztywno hero `galeon-500-fly`
      i `saxdor-400-gtc`), alty
- [ ] Hero wideo: link do pliku Vimeo + poster z CMS (zastępuje podpisany
      URL w kodzie i pobieranie oEmbed)
- [ ] Strony tekstowe: dokument na język (jak blog: `locale` +
      `translationOf`), trasa, linki w stopce
- [ ] Komponent `CmsImage`
- [ ] Migracja treści stron + zdjęć `src/assets/site/*`
- [ ] Presentation: lokalizacje + `mainDocuments` dla wszystkich stron

Kryteria wyjścia:
- [ ] Tekst HTML przed i po bez różnic (poza URL-ami obrazów i celowymi
      poprawkami)
- [ ] Każda strona edytowalna z podglądu (klik w tekst i zdjęcie)
- [ ] Lighthouse mobile ≥ 95 bez regresji (strona główna)

### Krok 9.4 — Marki i jachty

Kod:
- [ ] Marka (5 stałych dokumentów): nazwa i nazwa wyświetlana (zastępuje
      7 kopii `brandDisplayMap`, listę w stopce i `knowsAbout` w `Layout`),
      logo, hero, opis (rich text), strona www, kolejność, wideo, SEO
- [ ] Jacht: dane techniczne raz; teksty wielojęzyczne (tagline; „Dlaczego”
      jako pola nagłówek / lead / akapit / checklista zamiast konwencji
      markdown; cechy; lifestyle z ikoną z listy; wnętrza; podpis wideo;
      tytuły planów pokładów); galeria (kategoria z listy, kolejność
      przeciąganiem), plany pokładów, zdjęcia wnętrz i cech, broszura PDF;
      „widoczny w językach”; slug z nazwy, zablokowany po publikacji
- [ ] Skrypt migracji: 16 jachtów × 4 języki, 5 marek × 4 języki, zdjęcia
      (konwencje nazw plików → pola), PDF-y
- [ ] Strony `/brands/*`, `/yachts/*`, kafelki marek na stronie głównej,
      wyspa filtra jachtów
- [ ] Pomiar czasu buildu (obrazy z Sanity); jeśli za wolno — galerie
      z CDN Sanity
- [ ] Presentation: lokalizacje marek i jachtów

Kryteria wyjścia:
- [ ] Tekst HTML przed i po bez różnic
- [ ] Osoba nietechniczna sama dodaje nowy jacht od zera
- [ ] Atrybuty < ~1 800 (albo przejście na Growth)

### Krok 9.5 — Dostępne od ręki

Kod:
- [ ] Egzemplarz: cena + waluta + status podatkowy, stan, motogodziny,
      lokalizacja, odnośnik do modelu z katalogu, „sprzedany”, zdjęcia,
      SEO, „widoczny w językach”
- [ ] Migracja 3 egzemplarzy × 4 języki + zdjęcia
- [ ] Strony `/available-now/*` + pasek na stronie głównej

Kryteria wyjścia:
- [ ] Tekst HTML przed i po bez różnic
- [ ] Cena renderuje się wyłącznie tu (reguła z backlogu)

### Krok 9.6 — Wykończenie i przekazanie

- [ ] Jeśli ktoś poza Tomaszem dostaje dostęp do Vercela: w `herev-cms`
      zastąpić `SANITY_API_READ_TOKEN` z integracji Sanity–Vercel własnym
      tokenem Viewer oznaczonym jako Sensitive (zmiennych integracji nie da
      się tak oznaczyć) i unieważnić token integracji
- [ ] Przejście na Growth (warunki niżej) → dataset prywatny, rola Editor
      dla osoby od treści
- [ ] Status publikacji w Studio („Aktualizuję stronę… → Gotowe”; endpoint
      na CMS pyta API Vercel, token tylko po stronie serwera)
- [ ] Panel „Jak to działa” na starcie Studio; udostępnianie podglądu
- [ ] Planowanie publikacji (Growth)
- [ ] Przewodnik `docs/cms-guide.md` (po polsku, ze zrzutami ekranu)
      + krótkie nagranie
- [ ] Sprzątanie: `src/content/{yachts,brands,stock}`,
      `src/assets/{yachts,brands,stock,site}`, nieużywane helpery
      w `src/lib/images.ts`, dane w `src/lib/i18n-strings.ts`;
      `README-CONTENT.md` → przewodnik (po zgodzie)
- [ ] Aktualizacja `CLAUDE.md`, `docs/backlog-mvp.md`,
      `docs/agency_handover.md`, `docs/integrations.md`,
      `docs/sanity-setup.md`
- [ ] Scenariusz akceptacyjny z osobą od treści: zmiana tekstu, podmiana
      zdjęcia, nowy jacht, SEO, podgląd, publikacja, przywrócenie wersji

## Treść zaszyta w kodzie (inwentaryzacja 2026-10-07)

Odhaczać przy migracji. Lista z przeglądu komponentów, stron i wysp.

- [ ] Teksty po angielsku na wszystkich wersjach językowych: „FIVE
      ATELIERS” (`brands/index`), „THE FULL COLLECTION” (`yachts/index`),
      `AUTHORISED ${brand} REPRESENTATIVE` (strona jachtu), „MAP UNAVAILABLE”
      (`NetworkDirectory`, `network/[country]`), „TAP TO EXPLORE”
      (`CountryPageMap`)
- [ ] Angielski szablon meta description na `network/[country]`
- [ ] Wszystkie alty zdjęć na poziomie stron i wszystkie aria-labele
      (`SiteHeader`, `LeadModule`, `GuideCapture`, `YachtLeadModule`,
      `YachtFilter`, strony network)
- [ ] Liczby na stronie głównej: `5`, `17`, `1`, `30+`, `60+`
- [ ] Sufiksy tytułów „— Herev” / „| Herev” (niespójne) → jedno ustawienie
- [ ] Nazwy marek: `brandDisplayMap` w 7 plikach + lista w stopce
      + `knowsAbout` w `Layout` + `public/llms.txt`
- [ ] Podpisany URL Vimeo w hero strony głównej + pobieranie posterów
      przez oEmbed (strona główna, strona jachtu)
- [ ] Brak `/og.jpg` (domyślny obrazek do udostępnień)
- [ ] Stopka: „LEGAL · PRIVACY · COOKIES” jako zwykły tekst

Poza zakresem CMS, do odnotowania: brak `/favicon.ico`; domena
`https://herev.com` wpisana na sztywno w stronach network (alternates,
JSON-LD); komponenty nigdzie nieużywane: `TrustBand`, `StickyMobileCta`,
`AnchorNav`, `SpecTable`.

## Limity planu Free

| | Free (teraz) | Growth (~$15/miejsce/mies.) |
|---|---|---|
| Datasety | 2, tylko publiczne | 2, prywatne lub publiczne |
| Role | Administrator, Viewer | + Editor, Developer, Contributor |
| Historia wersji | 3 dni | 90 dni |
| Atrybuty (unikalne ścieżki pól) | 2 000 | 10 000 |
| Planowanie publikacji, komentarze, AI Assist | — | ✓ |
| Webhooki | 2 (potrzebny 1) | — |

Content Releases są tylko w Enterprise — niepotrzebne: wersje robocze
+ podgląd pokrywają ten przypadek.

Przejść na Growth, gdy zajdzie którykolwiek warunek:
- [ ] osoba od treści klienta dostaje dostęp (rola Editor zamiast
      Administratora, który może np. skasować dataset)
- [ ] do `notificationRecipients` mają trafić prawdziwe adresy, zanim
      zadanie „prywatne ID” z 9.2 jest zrobione (do tego czasu dokument
      byłby publiczny)
- [ ] liczba atrybutów przekracza ~1 800
- [ ] start produkcyjny

Sprawdzanie liczby atrybutów (`fields.count.value`):

```bash
curl -s -H "Authorization: Bearer $SANITY_API_READ_TOKEN" \
  https://9djarxf8.api.sanity.io/v2021-06-07/data/stats/production
```

| Data | Dataset | Atrybuty | Dokumenty |
|---|---|---|---|
| 2026-10-07 | production | 122 / 2 000 | 17 |

## Ryzyka

- **Stega** (niewidoczne znaczniki w tekstach podglądu) psuje porównania,
  URL-e i `.replace('{name}')` → czyszczenie w warstwie danych + testy.
- **Nieudany build po publikacji** = zmiana nie pojawia się, a edytor
  o tym nie wie → walidacja w Studio blokuje publikację, twarde asercje
  w buildzie, powiadomienia Vercela, status publikacji w Studio (9.6).
- **Czas buildu** rośnie przez obrazy pobierane z Sanity → pomiar w 9.4,
  w razie potrzeby galerie z CDN Sanity.
- **Limit atrybutów na Free** → monitoring po każdej migracji (tabela wyżej).
- **Zmiana sluga po publikacji** = martwe URL-e → slug blokowany;
  przekierowania robi dev.
- **Linki do plików Vimeo** wymagają płatnego planu Vimeo (Standard
  lub wyższy). Klient go ma — obecny hero to taki link. Linki nie
  wygasają, ale jeśli plan Vimeo wygaśnie, hero pokaże sam poster.
- **Awaria Sanity** → produkcja działa dalej (statyczna, obrazy na Vercelu);
  niedostępne są tylko CMS i podgląd.

## Konwencje pracy

- Jeden krok = jeden PR, branch `cms/9.x-<nazwa>`. Przed commitem:
  `pnpm build`, `pnpm typecheck`, `pnpm test`.
- Migracje: skrypty idempotentne (stałe `_id`), najpierw dataset
  `development`, potem `production`; weryfikacja diffem tekstu HTML `dist/`.
- Po każdej migracji: zapisać liczbę atrybutów w tabeli wyżej.
- Na koniec sesji: zaktualizować „Stan”, odhaczyć zadania, dopisać wpis
  do „Dziennika”.

## Dziennik

- **2026-10-07** — Plan uzgodniony (decyzje D1–D12), tracker założony.
  Dataset `production` jest **publiczny** (trial Growth wygasł; Sanity
  przy downgradzie zdejmuje prywatność). `notificationRecipients` nie jest
  opublikowany, więc nic nie wycieka. Do czasu Growth nie wpisywać tam
  prawdziwych adresów. Atrybuty: 122 / 2 000.
- **2026-10-07** — Prywatność na Free (D13): sprawdzone zapytaniem — bez
  tokena API widzi 5 z 17 dokumentów (ukryte są dokumenty z kropką w ID,
  wersji roboczych obecnie brak). Sekrety pod `private.*` zamiast Growth.
  Blog: w Sanity są tylko 2 testowe posty; 4 prawdziwe artykuły (EN/PL/ES/IT)
  nigdy nie zostały przepisane — migracja skryptem dopisana do 9.2.
- **2026-10-07** — Krok 9.1, kod (branch `cms/9.1-preview`). Odstępstwa od
  planu: (1) produkcja bez adaptera i bez zmian — adapter tylko w trybie
  CMS; zamiast przełączać `output` na `'server'`, integracja oznacza strony
  CMS jako renderowane na żądanie (reszta prerenderowana, więc stare strony
  z `props` w `getStaticPaths` działają dalej na CMS); (2) w trybie CMS
  i18n `routing: 'manual'` — wbudowany router Astro zwracał 404 dla każdej
  strony na żądanie bez prefiksu języka (`/admin`); tryb manual wymaga
  `src/middleware.ts`, więc tam trafił middleware trybu roboczego (w buildzie
  produkcyjnym działa tylko przy prerenderze → zawsze `draftMode = false`);
  (3) własne cookie HMAC zamiast `perspectiveCookieName` — nie do podrobienia
  bez tokena; (4) memoizacja zapytań → 9.2. Sprawdzone: HTML produkcji
  identyczny z `master` (poza hashami assetów), brak `/admin` i kodu podglądu
  w `dist/`; na `SANITY_PREVIEW=true pnpm dev`: Studio i głębokie linki 200,
  zły język / post 404, sfałszowane cookie ignorowane, prawidłowe → wersje
  robocze ze stega, zły sekret → 401. Nowe zależności:
  `@sanity/visual-editing`, `@sanity/preview-url-secret`. Pełny handshake
  Presentation niesprawdzony — wymaga zalogowanego Studio (test ręczny).
- **2026-10-07** — Poprawki po pierwszym teście w przeglądarce: flaga
  `SANITY_PREVIEW` czytana też z `.env` (wcześniej tylko z env procesu);
  w dev mostek Visual Editing dostaje zaślepki React Refresh (strony bez
  wysp nie mają preambuły) i jest pre-bundlowany (`optimizeDeps`). Podbite
  `sanity` + `@sanity/vision` 6.10.1 → 6.17.0 (Studio ostrzegało o utracie
  edycji rich textu), `@sanity/client` 8.2.0 → 8.9.0. Nie 6.18.0: była młodsza niż `minimumReleaseAge`
  pnpm i wymagała wyjątków w `pnpm-workspace.yaml` — nie obchodzimy tej ochrony.
