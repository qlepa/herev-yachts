# Strategia testów i uszczelnienia — Herev Yachts

Status: **zaakceptowana 2026-10-27** (decyzje §9 wg rekomendacji). Ten plik
jest trackerem: sekcja „Plan wdrożenia” ma odhaczane zadania, sekcja
„Macierz: co zmieniasz → co testujesz” obowiązuje każdego agenta (link
z `CLAUDE.md`), „Dziennik testów” zbiera nowe niezmienniki.

**Stan:** T1 zrobione (2026-10-27). Następny: T2 (kontrakt builda + CI).

## 1. Po co i przed czym

Projekt zmienia się skokowo: przebudowy do makiet klienta dotykały
100–170 plików na commit, migracja do CMS (9.3b → 9.5) przeniesie
w kolejnych PR-ach całą treść jachtów, marek i stocku z plików do Sanity,
a decyzje biznesowe (ceny tylko na stocku, brak fallbacku językowego,
„sprzedany” zostaje bez ceny i formularza, routing dealera) żyją
w dokumentach, nie w kodzie. Dzisiejsza siatka (106 testów, cała w logice
leada i loaderach CMS) nie łapie regresji w tym, co jest najdroższe:
w wyrenderowanym HTML, w SEO i w integracjach.

Co ma złapać strategia, w kolejności ważności:

1. **Reguły biznesowe jako testy** — niezmienniki z `CLAUDE.md`, backlogu
   i decyzji D1–D17, sprawdzane na gotowym `dist/`, nie w głowie agenta.
2. **Lead nigdy nie ginie** — ścieżki awarii endpointu, konfiguracja
   produkcyjna, wyścigi.
3. **Regresje przy przebudowach i migracjach** — każdy PR migracyjny ma
   twardy dowód „HTML przed = HTML po”.
4. **Integracje** — stan Sanity, Pipedrive, Resend, Turnstile, Mapbox
   widoczny bez wchodzenia na stronę; content Sanity kompletny.
5. **Leftovery** — martwy kod, nieużywane eksporty, dokumentacja
   rozjechana z kodem.

Czego **nie** robimy: snapshotów komponentów, testów renderowania
pojedynczych `.astro` przez Container API (eksperymentalne, łamie się
w wersjach minor), mutation testingu, 100 % pokrycia. Build + `astro
check` pozostają bramką dla stron; testy sprawdzają wynik builda.

## 2. Stan zastany (inwentaryzacja 2026-10-27)

**Jest:** 16 plików Vitest / 106 testów (4 s): `lead/*` (handler 15
scenariuszy, pipedrive, turnstile, templates), `cms/*` (home, settings,
blog-helpers, draftMode), `lib/*` (lead schema, images, video, format,
sanityImage, staticPaths), konwertery w `scripts/`. CI: install → build →
typecheck → test. `scripts/compare-dist.ts` (diff HTML dwóch buildów,
ręczny). Build produkcyjny: 361 stron, ~78 s lokalnie.

**Braki techniczne:**

- Brak `vitest.config.ts` — Vitest działa na gołych domyślnych ustawieniach:
  brak `getViteConfig`, więc nic, co importuje `astro:content`, nie jest
  testowalne (`src/lib/stock.ts`); brak projektów node/jsdom; brak `.env`.
- Bez testu: `resend.ts` (ma już wstrzykiwany `fetchFn`),
  `notificationRecipients.ts`, `uiStrings.ts` (`mergeDeep`,
  `fetchTranslations`, cache), loadery `blog.ts`, `i18n.ts`
  (`buildAlternates`), `regions.ts`, `stock.ts`, `lead-strings.ts`,
  `src/middleware.ts`, całe okablowanie `src/pages/api/lead.ts`
  (`resolveDealer`, 500 przy braku sekretu, 400 przy złym JSON), trasy
  `src/cms/routes/*` (ochrona przed open redirect).
- Zero sprawdzeń na `dist/`: hreflang, canonical, JSON-LD, sitemapa,
  noindex, ceny, wyciek kodu serwerowego do bundla.
- Brak lintera, sprawdzania martwego kodu, hooków gita.
- `CLAUDE.md` opisuje `pnpm import:locations` i `scripts/import-locations`,
  których nie ma; „compare” figuruje jako wyspa, a jej nie ma.

**Znalezione przy okazji defekty** (każdy = najpierw test, potem fix,
w PR-ach poniżej):

| # | Gdzie | Co |
|---|---|---|
| B1 | `lead/handler.ts` L67 vs L126 | Dedupe sprawdzany na starcie, zapisywany po wszystkich `await` → dwa równoległe requesty tworzą dwa deale |
| B2 | `yachts/[brand]/[yacht].astro` L170, `available-now/[stock].astro` L79 | hreflang na wszystkie 4 języki bezwarunkowo — brakujący/draft locale = link do 404 (łamie „never render a language fallback”) |
| B3 | `brands/[brand].astro`, `yachts/[brand]/index.astro` | ścieżki dla każdej marki × locale niezależnie od treści: redirect zamiast 404 / pusta flota |
| B4 | `handler.ts` L73 | błąd `resolveDealer` połykany bez logu — lead bez dealera, nikt nie wie dlaczego |
| B5 | `NetworkDirectory.tsx` L289 | `reduce` bez wartości początkowej → wyjątek przy pustej liście |
| B6 | `content.config.ts` | brak walidacji referencji: `brands.defaultDealer` → dealer, `stock.modelKey` → jacht, `locations.brandKeys/dealerId` — zerwana referencja = cichy brak |
| B7 | `LeadForm.tsx` | 400 z listą `fields` z serwera ignorowane, zawsze komunikat ogólny |

## 3. Piramida — warstwy i co w nich sprawdzamy

Każda warstwa ma własny skrypt, własny czas i własne miejsce w CI.
Nazwy skryptów są docelowe.

| Warstwa | Narzędzie | Skrypt | Czas | Kiedy |
|---|---|---|---|---|
| L0 Bramki statyczne | `astro check`, `astro build`, testy architektury | `typecheck`, `build`, `test:unit` | 1–2 min | każdy commit |
| L1 Jednostkowe | Vitest (node) | `test:unit` | < 10 s | każdy commit, watch u agenta |
| L2 Endpoint | Vitest (node), fałszywy `fetch` | `test:unit` | < 10 s | każdy commit |
| L3 Kontrakt builda | Vitest (node) na `dist/client` | `test:dist` | < 30 s | po buildzie, każdy PR |
| L4 Smoke przeglądarkowy | Playwright (Chromium) na statycznym `dist` z zamockowanym `/api/lead` | `test:e2e` | 2–3 min | PR + nightly |
| L5 Wydajność / a11y | Lighthouse CI (3 szablony, mobile), axe w Playwright | `test:lighthouse` | 3–5 min | PR dotykający stron (ostrzeżenie), nightly (twardo) |
| L6 Zdrowie integracji | `/api/health` + GitHub Actions `schedule` (+ Checkly po starcie) | — | — | codziennie / co 10 min po starcie |

### L0 — bramki statyczne i testy architektury

Testy architektury to zwykłe pliki Vitest, które czytają źródła
(`node:fs`), bez nowych zależności:

- `src/lib/server/**` nie jest importowane z `src/components`,
  `src/islands`, `src/lib/!(server)`, ani z frontmattera `.astro`
  poza `src/pages`, `src/middleware.ts`, `src/cms`.
- `src/islands/**` to jedyne miejsce z `client:*` (grep po `.astro`).
- Brak hexów, `px`-ów i nazw fontów poza `global.css` (reguła tokenów) —
  najpierw ostrzeżenie, docelowo błąd.
- `pipedriveOptionLabel` w `dealers` = dokładnie ten sam string co opcja
  w kontrakcie (`docs/kontrakt-api-lead.md`), bez trim/normalizacji.
- `.env.example` zawiera każdą zmienną, którą kod czyta przez
  `import.meta.env` / `process.env`.

### L1 — jednostkowe (uzupełnienie dziur)

Wzorzec istniejący: wstrzykiwanie zależności (`LeadDeps`, `fetchFn`),
`vi.mock('./client')` dla Sanity, fixture inline. Nowe testy trzymają się
tego; wspólne fixture (`STEGA`, builder dokumentów Sanity, `fakeFetch`)
trafiają do `src/test/` (jeden katalog helperów, bez abstrakcji ponad to).

Do dopisania: `resend.ts` (ok, błąd HTTP, mapowanie `reply_to`),
`notificationRecipients.ts` (puste, nie-tablica, trim, śmieci),
`uiStrings.ts` (merge, brak dokumentu = throw, puste teksty w draft = `''`,
cache per locale, odrzucona obietnica w cache), `blog.ts` loadery
(paginacja, 404 vs throw, `translations` bez stega), `i18n.ts`
(`buildAlternates`), `regions.ts`, `stock.ts` (sortowanie, draft/sold,
`getNewStockForModel`), `lead-strings.ts`, `pipedrive.ts` (TTL cache,
`success:false`), `draft-mode-disable` (open redirect), `middleware.ts`.

### L2 — endpoint jako całość

`POST` z `src/pages/api/lead.ts` wywołany bezpośrednio z `Request`,
`vi.stubEnv` dla sekretów, `globalThis.fetch` podmieniony routerem po
hostach (`challenges.cloudflare.com`, `api.pipedrive.com`,
`api.resend.com`) z nagranymi fixture odpowiedzi. Scenariusze: brak
`TURNSTILE_SECRET_KEY` na PROD = 500 i zero wywołań; zły JSON = 400;
ścieżka szczęśliwa przez prawdziwe moduły; Pipedrive 500 → mail z
`FAILED` i 200; dwa równoległe requesty = jeden deal (B1); brak dealera
dla marki = deal bez pola + log (B4). Bez msw: router na `fetch` wystarcza
i nie dodaje zależności.

### L3 — kontrakt builda (największy zwrot)

Osobny projekt Vitest `dist`, uruchamiany po `pnpm build` z
`SANITY_PREVIEW=false`, czyta `dist/client/**/*.html` (parser:
`node-html-parser`, jedna mała zależność) i sprawdza niezmienniki:

**Struktura i i18n**
- Każda strona `/{lang}/…` istnieje w dokładnie tych językach, dla których
  istnieje treść; brak języka = brak pliku, nie fallback.
- Każdy `hreflang` wskazuje plik istniejący na dysku; zbiór alternatów jest
  symetryczny; `x-default` → `/en/`; `html[lang]` zgodny ze ścieżką (B2, B3).
- Jeden `canonical` na stronę, równy ścieżce pliku; `og:url` = canonical.
- `sitemap-index.xml` + `sitemap-0.xml`: zbiór URL-i = zbiór stron minus
  404/admin; każdy URL ma `xhtml:link` na pozostałe języki.
- `robots` = `noindex,nofollow` gdy `PUBLIC_INDEXING_ENABLED` ≠ `true`;
  404 zawsze `noindex`; `robots.txt` wskazuje sitemapę.

**Reguły biznesowe**
- Żadna cena (regex na `€`, `EUR`, `PLN`, `GBP` + cyfry, `priceEur`) poza
  `/available-now/*`; na stronie sprzedanego egzemplarza brak ceny i
  formularza, jest etykieta i link do modelu (D14, D15).
- Każda strona jachtu/marki/stock ma formularz z właściwym kontekstem
  (`data-*` z `brand`, `yachtKey`/`stockKey`, `lang`).
- Strona modelu pokazuje sekcję „od ręki” wtedy i tylko wtedy, gdy istnieje
  nowy, niesprzedany egzemplarz z tym `modelKey`.
- Dealer i e-maile dealerów nie występują w HTML (kolekcja niepubliczna).
- Referencje między kolekcjami rozwiązują się (B6): `defaultDealer`,
  `modelKey`, `locations.brandKeys/dealerId`.

**SEO / dane strukturalne**
- Każdy `application/ld+json` parsuje się, ma `@context` i `@type`;
  `Organization`/`WebSite` na każdej stronie, `BreadcrumbList` na blogu,
  `LocalBusiness` per showroom na `/network/{kraj}` z poprawnym ISO.
- `<title>` i `meta description` niepuste, unikalne w obrębie języka,
  tytuł ≤ 60 + sufiks, opis ≤ 160.
- Każdy `<img>` ma `alt`, `width`, `height`; obrazy hero jako LCP mają
  `fetchpriority="high"` i nie `loading="lazy"`; brak `data:` PDF.

**Bezpieczeństwo bundla**
- W `dist/client/_astro/*.js` nie ma stringów z `src/lib/server`
  (sentynel-komentarz w każdym module serwerowym) ani nazw sekretów
  (`PIPEDRIVE_API_TOKEN`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`,
  `SANITY_API_READ_TOKEN`).
- `/admin` i trasy draft-mode nie istnieją w buildzie produkcyjnym.
- Linki wewnętrzne: `lychee --offline` (binarka w CI, bez npm) albo własny
  test: każdy `href` zaczynający się od `/` wskazuje istniejący plik
  lub przekierowanie z `vercel.json`.

**Golden HTML przy migracjach**: `scripts/compare-dist.ts` zostaje
narzędziem PR-ów migracyjnych (9.3b, 9.4, 9.5). Procedura w macierzy
niżej: build na `master` → build na gałęzi → diff = 0 poza listą
zamierzonych różnic wpisaną do opisu PR.

### L4 — smoke przeglądarkowy (Playwright)

Mały i deterministyczny: Chromium, `dist/client` serwowany statycznie,
`/api/lead` przechwycony przez `page.route` (200 / 400 z `fields` / 502).
Zewnętrzne hosty (Mapbox, Turnstile, Google) zablokowane przez `route`,
z wyjątkiem testu mapy. Scenariusze (≈ 12):

- Formularz leada: walidacja klient-side w 4 językach, sukces, błąd 502
  pokazuje e-mail z ustawień, 400 pokazuje błędy pól (B7), UTM z
  `sessionStorage` dołączone do payloadu, brak podwójnego wysłania.
- Filtr jachtów: stan w URL ↔ UI w obie strony, liczniki, sort.
- Sieć: filtry regionu/marki, „load more”, pusta lista nie wywala
  wyspy (B5); mapa z prawdziwym tokenem tylko w nightly.
- Przełącznik języka zachowuje stronę; 404 w każdym języku.
- Konsola bez błędów na każdym szablonie (landing, marka, jacht, stock,
  network, blog).
- axe (`@axe-core/playwright`, WCAG 2.2 AA) na jednym URL per szablon;
  najpierw ostrzeżenie, po oczyszczeniu bazowej listy — błąd.
- Consent Mode v2 (gdy dojdzie GA4): przed zgodą zero requestów do
  `google-analytics.com` / `googletagmanager.com` i brak ciasteczka `_ga`;
  po zgodzie `gcs=G111`.

Testy end-to-end na żywych integracjach (Turnstile klucze testowe
`1x…AA`, sandbox Pipedrive, `delivered@resend.dev`) tylko ręcznie /
nightly przeciw Vercel Preview, dopiero gdy konta istnieją (checklista
§4). Uwaga: `astro preview` nie obsługuje tras serwerless z adapterem
Vercela, więc lokalne e2e idą na mocku, nie na prawdziwym endpointcie.

### L5 — wydajność i dostępność

`@lhci/cli` (0.15, Lighthouse 12 — wyniki nie 1:1 z PageSpeed) na
`dist/client`, URL-e: `/en/`, `/en/brands/galeon/`,
`/en/yachts/galeon/galeon-500-fly/`, mobile, 3 przebiegi, mediana.
Progi: `performance ≥ 0.95` = ostrzeżenie, `≥ 0.90` = błąd;
`budget.json` (bajty/requesty per typ zasobu) = twardy błąd, bo
deterministyczny. Lighthouse na runnerach GitHub jest hałaśliwy; DoD „≥ 95
mobile” pozostaje weryfikowane PageSpeed Insights przed releasem, CI
pilnuje regresji.

### L6 — zdrowie integracji i treści

- **`/api/health`** (`prerender = false`, nagłówek `x-health-key`
  z env, bez niego 404): równoległe, tanie probe'y tylko-do-odczytu —
  Sanity (`siteSettings` istnieje, `private.notificationRecipients` ma
  ≥ 1 adres, `uiStrings-{lang}` × 4), Pipedrive `GET /users/me` + obecność
  pól dealu z tabeli kontraktu, Resend `GET /domains` (domena
  zweryfikowana), Turnstile `siteverify` z pustym tokenem (odpowiedź =
  sekret ważny), Mapbox `GET /tokens/v2`, obecność każdej zmiennej z
  `.env.example`. Odpowiedź `{ok, checks:{name:{ok, ms, detail}}}`,
  503 gdy cokolwiek krytyczne pada. Logika w
  `src/lib/server/health/` z testami jak `handler.ts`.
- **GitHub Actions `schedule` (codziennie)**: `curl /api/health` na
  produkcji i CMS; pełny `pnpm build` + `test:dist` na aktualnej treści
  Sanity (łapie publikację, która psuje build, niezależnie od Vercela);
  Playwright nightly z mapą; `lychee` na linki zewnętrzne. Awaria →
  issue w repo + e-mail (Actions domyślnie). Harmonogram GitHuba bywa
  opóźniony — wystarcza na „raz dziennie”, nie na uptime.
- **Content health** (Vitest, projekt `content`, tylko w schedule): każdy
  `uiStrings-{lang}` ma identyczny zbiór kluczy i zero pustych; każdy
  post z `translationOf` ma komplet lub jest świadomie jednojęzyczny;
  `homePage` kompletna w 4 językach; po 9.4/9.5 — każdy jacht/stock
  widoczny w języku ma komplet pól.
- **Po starcie**: Checkly Hobby (darmowy, 10 monitorów, check API co 10
  min z asercją na JSON `/api/health`) albo Better Stack; UptimeRobot
  odpada (free tylko niekomercyjnie). Vercel: powiadomienia o nieudanym
  buildzie (już w checkliście).
- **Lead nie ginie — nic nowego do budowania**: kolejność Pipedrive →
  Resend → log `LOST` + 502 jest już w handlerze; strategia dokłada test
  wyścigu (B1), test okablowania env (L2) i alert z `/api/health`, gdy
  lista odbiorców w Sanity jest pusta lub domena Resend niezweryfikowana.
  Dead-letter z bazą = poza zakresem (CLAUDE.md: brak bazy).

## 4. Narzędzia i zależności (do akceptacji)

| Dodajemy | Po co | Alternatywa odrzucona |
|---|---|---|
| `vitest.config.ts` z `getViteConfig` + `projects: unit / dist / content` | `astro:content` w testach, rozdzielenie warstw, `coverage.include` | — |
| `node-html-parser` (dev) | parsowanie `dist/*.html` w L3 | cheerio (cięższy), regex (kruchy) |
| `@playwright/test`, `@axe-core/playwright` (dev) | L4 | Vitest Browser Mode (za dużo konfiguracji na 4 wyspy) |
| `@lhci/cli` (dev) | L5 | unlighthouse (jeden próg, nightly-only) |
| `knip` (dev) | martwe eksporty, nieużywane pliki i zależności; Astro + Vitest wykrywane automatycznie | ts-prune (porzucony) |
| `lychee` (binarka w CI, nie npm) | linki w `dist/` | linkinator (wolniejszy, sieciowy) |
| `.githooks/` + `git config core.hooksPath` (bez zależności) | pre-commit: `vitest related` na zmienionych plikach; pre-push: `typecheck` + `build` + `test:dist` | lefthook/husky (zależność dla jednego dev) |
| `typescript` przypięty do `^6` | `@astrojs/check` nie wspiera TS 7 | — |

**Nie dodajemy teraz**: ESLint/Prettier (reguła granic importów jest w
teście architektury; formatowanie całego repo = szum w diffach — do
ponownej decyzji przy drugim deweloperze), msw, Stryker, Container API.

Coverage: `@vitest/coverage-v8` z progiem tylko na `src/lib/server/**`
i `scripts/**` (linie 80 %), raportowany w CI, bez progu globalnego.

## 5. CI — docelowy układ

`ci.yml` (PR + push master), jeden job, kolejność po czasie:

1. install → `typecheck` → `test:unit` (szybkie fail-fast, bez Sanity)
2. `build` (`SANITY_PREVIEW=false`) → `test:dist` → `lychee --offline dist`
3. `knip` (najpierw `continue-on-error`, po oczyszczeniu bramka)
4. `test:e2e` (Playwright, cache przeglądarek po wersji pakietu)
5. `test:lighthouse` (tylko gdy diff dotyka `src/**`; ostrzeżenie)
6. artefakty: raport Playwright, raport LHCI, `coverage/`

`nightly.yml` (schedule 05:00 UTC + ręczny `workflow_dispatch`): health
na prod i CMS, build na żywej treści, `content` project, Playwright
z mapą, `lychee` z siecią, Lighthouse twardo.

Sekrety: `SANITY_API_READ_TOKEN` (jest), `HEALTH_KEY` (nowy),
`PUBLIC_MAPBOX_TOKEN` (nightly). Zgodnie z checklistą §4: `PROJECT_ID`
i `DATASET` wracają do secrets. Vercel buduje tylko `astro build`, więc
ochrona gałęzi `master` wymagająca joba `ci` to jedyna prawdziwa bramka
przed deployem produkcji — do włączenia w ustawieniach repo.

## 6. Praca agenta lokalnie

- Agent zaczyna sesję od `pnpm test:unit` (4 s) i sprawdza, że baza jest
  zielona; pracuje z `pnpm test:unit --watch` przy logice.
- Przed każdym commitem: `pnpm typecheck && pnpm test:unit`; przed push:
  `pnpm verify` (= `typecheck` + `build` z `SANITY_PREVIEW=false` +
  `test:dist` + `test:unit`). Hooki to przypomnienie, CI to bramka.
- Lokalny `.env` ma `SANITY_PREVIEW=true` — `pnpm verify` wymusza `false`
  przez skrypt, nie polega na pamięci agenta.
- Bugfix = test odtwarzający defekt w tym samym commicie co fix (już w
  `CLAUDE.md`; macierz niżej mówi, w której warstwie).
- Agent kończy zadanie wpisem do „Dziennika testów” w tym pliku tylko
  wtedy, gdy dodał nowy niezmiennik do L3 lub nowy probe do L6 (żeby
  lista reguł biznesowych miała jedno miejsce).

## 7. Macierz: co zmieniasz → co testujesz (obowiązkowa dla agentów)

| Zmieniasz | Dopisujesz / uruchamiasz | Warstwa |
|---|---|---|
| Czystą funkcję w `src/lib`, `src/lib/server`, `scripts` | test jednostkowy obok pliku (`x.test.ts`), fixture inline lub z `src/test/` | L1 |
| Endpoint w `src/pages/api` | test handlera z wstrzykniętymi zależnościami + test okablowania przez `POST(Request)` w `src/test/api/` (nigdy `*.test.ts` w `src/pages`); każda ścieżka awarii dostaje test „lead nie ginie” | L1 + L2 |
| Loader Sanity / zapytanie GROQ | test mapowania dokument → model (`vi.mock('./client')`), przypadek „brak dokumentu” i „draft z pustymi polami”; nowy typ dokumentu → probe w `content` + webhook filter w `docs/cms-plan.md` | L1 + L6 |
| Nową stronę lub trasę | sprawdź, że L3 widzi ją automatycznie (glob); dopisz do L3 regułę specyficzną dla szablonu, jeśli ma własny niezmiennik (np. cena, formularz, JSON-LD) | L3 |
| `Layout.astro`, head, SEO, hreflang, sitemapę | uruchom `test:dist` lokalnie; każda nowa reguła SEO = asercja w L3 | L3 |
| Schemat kolekcji / content format / `locations.json` | zgoda usera (CLAUDE.md); dopisz asercję referencji w L3; build na pełnej treści | L0 + L3 |
| Wyspę w `src/islands` | logikę wyciągnij do czystej funkcji (test L1); interakcję = scenariusz Playwright z mockiem `/api/lead`; props z builda, bez fetcha | L1 + L4 |
| Reguły biznesowe (ceny, języki, dealer, zgoda, sprzedany) | asercja w L3 **przed** zmianą kodu (czerwona → zielona) + wpis w Dzienniku | L3 |
| Migrację treści do CMS (9.3b–9.5) | `compare-dist` master vs gałąź = 0 różnic poza listą w opisie PR; test loadera; probe `content`; `test:dist` zielony | L1 + L3 + L6 |
| Integrację zewnętrzną (nowa lub zmiana API) | fixture odpowiedzi w `src/test/fixtures/<usługa>/`, test klienta z `fetchFn`, probe w `/api/health`, zmienna w `.env.example` (test L0 to sprawdzi) | L1 + L0 + L6 |
| `global.css` `@theme`, tokeny | zgoda usera; Lighthouse lokalnie na 3 szablonach | L5 |
| `vercel.json` przekierowania | asercja w L3: każde `destination` istnieje w `dist` | L3 |
| Dokumentację kontraktów (`docs/kontrakt-*`) | jeśli kontrakt ma odpowiednik w kodzie (pola dealu, schemat leada), test porównuje tabelę z kodem | L0 |
| Usuwasz feature / plik | `knip` czysty; grep po `CLAUDE.md` i `docs/` za nazwą | L0 |

Definition of Done w `CLAUDE.md` dostaje jeden wiersz: „Testy wg macierzy
w `docs/testing-strategy.md` §7; `pnpm verify` zielone”.

## 8. Plan wdrożenia — jeden krok = jeden PR

**PR T1 — fundament + dziury jednostkowe** ✅ 2026-10-27 (zero nowych
zależności)
- [x] `vitest.config.ts` (`getViteConfig`, projekty `unit`/`dist`/`content`),
      skrypty `test:unit`, `test:watch`, `test:dist`, `test:content`, `verify`.
      `astro:content` w testach: `src/test/globalSetup.ts` robi `astro sync`
      i kopiuje data store do `.astro/` (Vite w trybie „serve” czyta stamtąd).
      Coverage → T2 (wymaga `@vitest/coverage-v8`)
- [x] `src/test/fakeFetch.ts` (router po hoście+ścieżce, rejestr wywołań);
      buildery dokumentów Sanity nie były potrzebne — `toDocumentFields`
      ze skryptu migracji daje kompletny `uiStrings`
- [x] testy architektury `src/test/architecture.test.ts`: granice importów
      (`lib/server` poza komponentami/wyspami/lib, `import type` dozwolony),
      `client:*` tylko dla `src/islands`, `src/cms` tylko z integracji,
      `pipedriveOptionLabel` bez normalizacji, każda zmienna env
      w `.env.example`, zero TODO/FIXME w `src/`
- [x] L1: `resend`, `notificationRecipients`, `uiStrings`, loadery `blog`,
      `i18n`, `regions`, `stock` (na prawdziwej kolekcji), `lead-strings`,
      `geo`, `pipedrive` (TTL, `success:false`), `draft-mode-disable`
      (open redirect). L2: `src/test/api/lead.test.ts` — 8 scenariuszy
      przez prawdziwe moduły i kolekcje, sieć przez `fakeFetch` (test nie
      może leżeć w `src/pages` — build robi z niego trasę).
      Pominięte świadomie: `middleware.ts` (3 linie delegacji),
      `draft-mode-enable` (cała logika w `@sanity/preview-url-secret`)
- [x] B1 (rezerwacja klucza dedupe przed pierwszym `await`, zwalniana przy
      502), B4 (błąd `resolveDealer` logowany), B5 (`nearestLocation`
      w `src/lib/geo.ts`, pusta lista = brak akcji). B2/B3/B6/B7 → T2/T4
- [x] `.githooks/pre-commit` (`vitest --changed HEAD`), `pre-push`
      (`pnpm verify`), `scripts/setup-hooks.ts` w `prepare`;
      `typescript` już `^6`
- [x] `CLAUDE.md`: Testing → macierz, DoD, komendy, `import:locations`
      oznaczone jako nienapisane, `src/test/` w strukturze
- [x] ten plik → tracker. Wynik: 28 plików / 171 testów (było 16 / 115)

**PR T2 — kontrakt builda + CI**
- [ ] `node-html-parser`; projekt `dist` z regułami §3 L3 (najpierw te,
      które dziś przechodzą; B2/B3/B6 jako testy czerwone → fix w tym PR)
- [ ] `ci.yml`: nowa kolejność, `test:dist`, `lychee --offline`, `knip`
      (continue-on-error), artefakty, secrets zamiast hardcode
- [ ] `scripts/compare-dist.ts`: test jednostkowy normalizacji + skrypt
      `pnpm compare:master` (build master do `tmp/`, build HEAD, diff)

**PR T3 — zdrowie integracji**
- [ ] `src/lib/server/health/` + `/api/health` + testy
- [ ] `nightly.yml`: health, build na żywej treści, projekt `content`,
      `lychee` z siecią
- [ ] `docs/launch-checklist.md`: Checkly / ochrona gałęzi / `HEALTH_KEY`
      na Vercelu

**PR T4 — przeglądarka i wydajność**
- [ ] Playwright + axe, ~12 scenariuszy z §3 L4, mock `/api/lead`; B7
      (test → fix w `LeadForm`)
- [ ] `@lhci/cli` + `budget.json`; krok w CI (warn) i nightly (error)
- [ ] cache przeglądarek w Actions

**Później (zależne od decyzji / kont):** e2e na żywych integracjach
przeciw Vercel Preview; testy Consent Mode po GA4; Checkly po starcie;
ESLint/Prettier przy drugim deweloperze.

## 9. Decyzje do podjęcia przed PR T1

| # | Pytanie | Rekomendacja |
|---|---|---|
| Q1 | Playwright i Lighthouse CI w ogóle (2 zależności dev, +5 min CI)? | tak, w T4; e2e ≤ 12 scenariuszy, Lighthouse jako ostrzeżenie |
| Q2 | Progi Lighthouse w CI | warn 0.95 / error 0.90 / budżety twardo |
| Q3 | Monitoring: tylko GitHub schedule do startu, Checkly po starcie? | tak |
| Q4 | Hooki gita natywne (`.githooks`) zamiast lefthook/husky | tak |
| Q5 | `knip` blokujący od razu czy po oczyszczeniu? | ostrzeżenie w T2, bramka w T3 |
| Q6 | B2/B3: brakujący locale jachtu/marki = brak strony i brak hreflang (404), a nie redirect | tak — to literalnie reguła z `CLAUDE.md` |
| Q7 | B6: walidacja referencji w L3 (test) zamiast `reference()` w schemacie | tak — bez zmiany formatu treści |
| Q8 | `CLAUDE.md`: usunąć `import:locations` i „compare” z opisu, czy to wraca? | usunąć `import:locations` (skrypt nie istnieje); „compare” zostaje, bo PR 2 kroku 5 go dowiezie |

## 10. Dziennik testów

| Data | Co doszło | PR |
|---|---|---|
| 2026-10-27 | Strategia spisana; baza: 16 plików / 106 testów | — |
