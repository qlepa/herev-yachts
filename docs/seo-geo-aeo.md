# Master-instrukcja: SEO / AEO / GEO (reużywalna, generyczna)

Skopiuj do nowego projektu, wypełnij blok **KONTEKST**, zaznacz **moduły warunkowe**, które dotyczą projektu, i przekaż agentowi/wykonawcy. **Core** i **Reguły treści** stosuje się zawsze. Sekcja **Off-site** to praca człowieka — agent jej nie wykona, ale bez niej GEO jest niepełne.

---

## 0. Model mentalny — zanim zaczniesz

Widoczność w wyszukiwarkach i AI stoi na **trzech warstwach**. Ta instrukcja pokrywa je jawnie, bo mieszanie ich to najczęstszy błąd:

1. **Fundament techniczny** — czy crawler/bot w ogóle Cię widzi i renderuje. (Core §2–§6)
2. **Ekstraktowalność on-page** — czy da się Twoją treść zacytować w izolacji. (Reguły treści §7, Encja §8)
3. **Autorytet off-site** — czy AI *ufa* Twojej marce na tyle, by ją wymienić. (Off-site §10)

**Podział odpowiedzialności — nie oszukuj się co do zakresu:**

| Warstwa | Kto to robi |
|---|---|
| Techniczne + dane strukturalne | Agent/deweloper — automatyzowalne |
| Substancja treści (statystyki, cytaty, źródła) | Człowiek piszący — agent narzuca reguły, nie treść |
| Autorytet off-site (recenzje, wzmianki, PR) | Człowiek/marketing — **nieautomatyzowalne** |

> Odhaczenie całego Core NIE oznacza „mamy GEO". Oznacza „mamy poprawnie otagowaną stronę gotową, by dało się ją cytować". O tym, czy *będzie* cytowana, decyduje głównie warstwa 3.

---

## STEP 0 — Baseline widoczności w AI (zrób NAJPIERW i na końcu)

To jedyny prawdziwy KPI dla GEO. Reszta to środki do celu.

1. Wypisz **20–50 realnych zapytań klienta** (nie brandowych: „najlepszy [kategoria] w [miejsce]", „jak wybrać [produkt]", „[problem klienta]").
2. Wpuść je do: **ChatGPT (search), Perplexity, Gemini / Google AI Mode, Claude**.
3. Zapisz: które marki się pojawiają, jakie źródła są cytowane, czy jesteś w ogóle wymieniony.
4. To baseline. Po wdrożeniu powtórz i porównaj **citation share**. Monitoruj też wzrost **branded search** w Google Search Console — to najsilniejszy sygnał, że GEO działa.

---

## KONTEKST (wypełnij raz, używaj wszędzie)

```
- Nazwa marki / encji:      [NAZWA]
- Typ podmiotu:             [firma / osoba / produkt / organizacja / miejsce]
- Domena:                   [https://domena.tld]
- Języki:                   [np. PL / PL+EN]
- Główne encje/tematy:      [o czym jesteś autorytetem — 3–7 haseł]
- Autorzy treści:           [imię, nazwisko, kwalifikacje, profile — na potrzeby E-E-A-T]
- Węzły tożsamości (sameAs):[LinkedIn, Wikidata, Crunchbase, GitHub, profile branżowe, social]
- Kontakt:                  [email, telefon jeśli dotyczy]
- OG image:                 [URL zdjęcia 1200×630px]
- Moduły warunkowe:         [zaznacz w §9]
```

---

# CORE — stosuj zawsze

## 1. Meta tagi (każda podstrona osobno)

- `<title>` — unikalny, ~50–60 znaków, wzorzec: `[Główna fraza] – [Kontekst/wyróżnik] | [Marka]`. Nie hardcoduj w komponentach — trzymaj w warstwie treści/CMS.
- `<meta name="description">` — 120–155 znaków, naturalny język + CTA. Traktuj jako tekst reklamowy w SERP, nie jako czynnik rankingowy (nim nie jest).
- `<link rel="canonical">` — absolutny URL bieżącej strony.
- `<meta name="robots">` — `index, follow` dla publicznych; `noindex` dla podziękowań, wyników wyszukiwarki wewnętrznej, stron technicznych.

## 2. Open Graph + Twitter Cards (każda strona)

```
og:type · og:site_name · og:title · og:description · og:url (canonical) · og:image (absolutny, 1200×630)
og:locale (+ og:locale:alternate per język, dynamicznie)
twitter:card=summary_large_image · twitter:title · twitter:description · twitter:image
```

## 3. Structured Data — rdzeń (JSON-LD, `<script type="application/ld+json">`)

Wszystkie schematy w jednym wstrzykiwanym komponencie. Waliduj każdy build.

**WebSite** (raz):
```json
{ "@context":"https://schema.org","@type":"WebSite","@id":"[domena]/#website",
  "url":"[domena]","name":"[NAZWA]","inLanguage":"[lang]",
  "publisher":{"@id":"[domena]/#identity"} }
```

**WebPage** (każda strona):
```json
{ "@context":"https://schema.org","@type":"WebPage","@id":"[url]/#webpage",
  "url":"[url]","name":"[title]","description":"[desc]","inLanguage":"[lang]",
  "isPartOf":{"@id":"[domena]/#website"},"about":{"@id":"[domena]/#identity"},
  "dateModified":"[RRRR-MM-DD]" }
```

**BreadcrumbList** (każda strona poza home): `ListItem[]` z `position`, `name`, `item`.

> **Zasada nadrzędna dla całego structured data:** markup MUSI odzwierciedlać treść widoczną na stronie. AI i Google walidują w czasie rzeczywistym — rozjazd = ignorowanie lub kara. Waliduj: `validator.schema.org` + `search.google.com/test/rich-results` (zero błędów).

## 4. Sitemap

Generuj automatycznie; tylko kanoniczne, publiczne URL-e (+ wszystkie wersje językowe jeśli dotyczy); dynamiczny `lastmod`; zarejestruj w Google Search Console **i Bing Webmaster Tools**; wpis `Sitemap:` w robots.txt.

## 5. robots.txt

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /checkout/

# NIE blokuj globalnie /*?* — to zablokuje paginację, filtry i legit parametry.
# Blokuj tylko konkretne pułapki generujące duplikaty:
Disallow: /*?sort=
Disallow: /*?sessionid=

# Boty AI — zezwól, jeśli chcesz być cytowany (dla większości biznesów: TAK)
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: ClaudeBot
Allow: /

Sitemap: [domena]/sitemap-index.xml
```

**Krytyczne:** dla ChatGPT liczy się też indeks Bing — zweryfikuj w Bing Webmaster Tools i włącz **IndexNow** (najszybszy pickup, ~24h).

## 6. Serwer i wydajność

**Nagłówki:** gzip/brotli dla HTML/CSS/JS/JSON/SVG/XML/fontów · Cache-Control (`immutable` dla hashowanych assetów, `no-cache` dla HTML) · `X-Content-Type-Options: nosniff` · `Referrer-Policy: strict-origin-when-cross-origin` · `Strict-Transport-Security` · `Options -Indexes` · wymuszony HTTPS + spójny wybór www/bez-www (301).

**Rendering (krytyczne dla AI):** treść musi być w HTML serwowanym od razu. Boty AI słabo wykonują JS. SPA/JS-heavy → SSR / pre-render / ISR / Island Architecture. Kluczowe fakty (kontakt, ceny, godziny) **nigdy** za warstwą JS.

**Core Web Vitals — bramka na danych POLOWYCH (CrUX p75), nie tylko Lighthouse:**
- LCP < 2,5 s · INP < 200 ms · CLS < 0,1
- (FID nie istnieje od marca 2024 — nie mierz go.)
- Lighthouse/PageSpeed to lab; można mieć 95 w labie i czerwone CWV w realu. Bramka = zielony CrUX, nie wynik Lighthouse.
- Fonty: `preconnect` + `font-display: swap` (najlepiej self-host). LCP image: `preload` + `fetchpriority="high"`, nigdy lazy. Reszta: `loading="lazy" decoding="async"`.

## 7. Obrazy

`alt` na każdym `<img>` (opisowy dla treściowych, pusty dla dekoracyjnych; nie zaczynaj od „zdjęcie/obraz") · opisowe nazwy plików z myślnikami, bez znaków diakrytycznych · `width`+`height` (anty-CLS) · AVIF/WebP primary + JPEG fallback · `srcset`/`sizes`.

## 8. Linkowanie i dostępność

Ważne strony ≤3 kliknięcia od home · kontekstowy anchor (nie „kliknij tutaj") · breadcrumbs · semantyczny HTML (`header/main/nav/section/article/footer`) · jeden `<h1>`/stronę · nawigacja klawiaturą · `aria-label` dla przycisków bez tekstu · kontrast ≥4,5:1 · linki zewnętrzne `rel="noopener noreferrer"`.

## 9. llms.txt (higiena, nie strategia)

Plik `/llms.txt` (Markdown): jeden `#` H1 (nazwa), blockquote 1–2 zdania opisu encji, sekcje `##` z listami linków do najważniejszych stron. UTF-8, bez HTML. Tani porządek dla LLM — ale nie licz, że sam podniesie widoczność; priorytet niższy niż autorytet i jakość treści. Google oficjalnie go nie wspiera (stan 2026).

---

# REGUŁY TREŚCI — stosuj zawsze (to jest substancja GEO)

Struktura bez substancji się nie cytuje. To narzuć **każdemu, kto pisze** — agent egzekwuje reguły, nie generuje autorytetu.

**Ekstraktowalność:**
- **Front-load.** Pierwsze 1–2 zdania sekcji = bezpośrednia, kompletna odpowiedź (40–60 słów). ~44% cytowań LLM pochodzi z pierwszych 30% strony; ChatGPT waży pierwsze 200–500 słów.
- **Definicyjny opener:** „[Encja] to [kategoria], która [wyróżnik]" — wzorzec preferowany przez retrieval.
- **Nagłówki = realne pytania** (z People Also Ask / AlsoAsked / Reddit), nie hasła marketingowe.
- **Samodzielne akapity** — każdy ma sens bez sąsiednich (Perplexity podnosi pojedyncze passusy).
- **Tabele, listy, checklisty** — parsowane szybciej i dokładniej niż proza.
- **Prosty język, krótkie zdania** — sama optymalizacja płynności dała ~+28% widoczności w badaniu Princeton/KDD 2024.

**Autorytet treści (trzy najskuteczniejsze techniki wg Princeton/KDD 2024):**
- **Statystyki** (+41%): każdy materiał ma 5–7 konkretnych liczb; zamiast „wiele badań" → „meta-analiza 47 badań z 2022 wykazała…".
- **Cytowanie źródeł** (+115% dla treści z niższych pozycji): każde weryfikowalne twierdzenie ma przypisane źródło.
- **Cytaty od nazwanych ekspertów** (+28%): „Według [Imię, tytuł, organizacja], »…«".
- **Oryginalne dane/badania własne** są cytowane nieproporcjonalnie często — zawierają wszystkie trzy naraz.
- **Nie** rób keyword stuffingu (wypadł ~8–10% *poniżej* baseline). Gęstość fraz ~1–2%, naturalna.

**Świeżość jako pętla, nie jednorazówka:**
- Widoczna data „ostatnia aktualizacja" + realny `dateModified`.
- Kwartalny refresh top-stron (aktualizacja statystyk, rok w tytule gdzie pasuje, republikacja). ChatGPT ma najsilniejszą preferencję świeżości ze wszystkich silników — bez tego treść się dewaluuje.

---

# ENCJA & E-E-A-T — stosuj zawsze

AI musi wiedzieć, *jakim bytem* jesteś i czy Ci ufać.

**Węzeł tożsamości** (raz, `@id: [domena]/#identity`) — `Organization` **lub** `Person` **lub** typ specyficzny (patrz moduły):
```json
{ "@context":"https://schema.org","@type":"Organization","@id":"[domena]/#identity",
  "name":"[NAZWA]","url":"[domena]","logo":"[URL]",
  "knowsAbout":["[encja1]","[encja2]"],
  "sameAs":["[LinkedIn]","[Wikidata]","[Crunchbase]","[social...]"] }
```
- **`sameAs` to nie tylko social** — dodaj węzły tożsamości: Wikidata, LinkedIn, Crunchbase, profile branżowe. To one łączą Cię z grafem wiedzy.
- **Autorzy realni:** `author` (`Person`) z bio i kwalifikacjami przy artykułach; spójna tożsamość autora w sieci (top-5 korelat cytowania AI).
- **Spójne nazewnictwo encji** wszędzie (strona = schema = profile zewnętrzne).
- Dla YMYL (zdrowie/finanse/prawo) poprzeczka autorytetu najwyższa: transparentność, źródła, dane wydawcy.

---

# 9. MODUŁY WARUNKOWE — włącz te, które dotyczą

### [ ] LOCAL — biznes z fizyczną lokalizacją
- `LocalBusiness` (+ typ specyficzny) z: `address` (PostalAddress), `geo` (GeoCoordinates), `telephone`, `openingHoursSpecification`, `priceRange`, `sameAs` (w tym Google Maps).
- Niedziela `00:00`–`00:00` = zamknięte (Google rozumie).
- **NAP spójny** (Name-Address-Phone) w 100%: strona = schema = Google Business Profile = profile zewnętrzne. Rozjazd NAP to najczęstszy zabójca local SEO.
- **Google Business Profile** aktualny i zgodny — to silniejszy sygnał lokalny niż cokolwiek na stronie.
- Geografia w treści: miasto, dzielnica, okoliczne miejscowości, punkty orientacyjne.
- ⚠️ **Geo meta tagi** (`geo.region`, `geo.position`, `ICBM`) — Google ich **nie używa** (potwierdzone przez Google). Nieszkodliwe, ale to nie jest realny sygnał lokalny. Dodaj tylko jeśli masz powód; nie licz na efekt.

### [ ] MULTILINGUAL — więcej niż jeden język
- `hreflang` w `<head>` każdej strony, kody BCP 47 (`pl`, `en-GB`), + `x-default`.
- **Wzajemność obowiązkowa:** A→B i B→A. Canonical spójny z hreflang (wskazuje na wersję w bieżącym języku).
- Wszystkie wersje w sitemap. `og:locale` + `og:locale:alternate` dynamiczne.

### [ ] COMMERCE — produkty/usługi z ceną
- `Product` z `offers` (`Offer`: `price`, `priceCurrency`, `availability`).
- ⚠️ **`aggregateRating`/`review` markuj TYLKO jeśli recenzje są zbierane i wyświetlane NA TWOJEJ stronie.** Wklejanie ocen z Google/TripAdvisor do własnego schema = self-serving spam → ryzyko manual action i utraty rich results. Cudze oceny zostają w `sameAs`, niemarkowane jako Twoje.

### [ ] MEDIA — wideo na stronie
- `VideoObject`: `name`, `description`, `thumbnailUrl`, `uploadDate`, `contentUrl`, `duration` (ISO 8601, np. `PT1M30S`).

### [ ] FAQ / HOWTO — treść pytanie-odpowiedź / proces krok-po-kroku
- `FAQPage` / `HowTo` — nadal warto, **ale zmień oczekiwania:** Google zabrał rich results dla FAQ (2023, poza autorytatywnymi domenami) i wygasił HowTo. **Powód użycia dziś to maszynowa czytelność dla AI/LLM, nie snippety w Google.**
- Pytania = realne frazy użytkownika; min. 5–10/stronę; odpowiedzi kompletne (zakładaj dosłowne użycie przez AI).
- ⚠️ **`speakable`** — Google ogranicza je do treści newsowych i wybranych regionów. Dla większości biznesów to martwy kod; pomiń, chyba że jesteś wydawcą newsów.

---

# 10. OFF-SITE / WYMAGA CZŁOWIEKA — agent tego nie zrobi

**To tu wygrywa się cytowania AI.** ~85% wzmianek używanych przez AI pochodzi ze stron trzecich; korelacja wzmianek marki z AI Overviews (~0,66) > backlinków; branded search to najsilniejszy predyktor. Bez tej warstwy Core daje ograniczony efekt.

- **Platformy recenzji** (jeśli dotyczy branży): G2/Capterra/Trustpilot dla software, branżowe odpowiedniki gdzie indziej. ~3× wyższa szansa cytowania.
- **Wzmianki i earned media:** PR, publikacje gościnne eksperckie, obecność w „best of" listach, cytowani eksperci. Marki są ~6,5× częściej cytowane przez źródła trzecie niż przez własną domenę.
- **Graf wiedzy:** dąż do Wikidata/Wikipedia (jeśli notowalność pozwala) — obecność wiąże się z ~1,8× wyższym cytowaniem.
- **Obecność wieloplatformowa, autentyczna:** 4+ platformy (branżowe społeczności, YouTube, LinkedIn, Reddit/Quora tam, gdzie to naturalne). Buduj *szeroko* — moc pojedynczej platformy zanika po kontroli na ogólną obecność.
- **Branded search:** wszystko, co zwiększa liczbę osób szukających Twojej marki z nazwy.
- ⚠️ **Nie manufakturuj** fałszywych recenzji/wzmianek — coraz lepiej wykrywane, ryzyko reputacyjne > zysk.

---

# 11. ACCEPTANCE CRITERIA — „gotowe, gdy…"

**Techniczne:** unikalne title/description na każdej stronie · canonical wszędzie · robots.txt i sitemap dostępne + zarejestrowane w GSC i Bing · zero 404 w linkach wewn. · HTTPS wymuszony, brak mixed content · hreflang wzajemny (jeśli MULTILINGUAL).

**Structured data:** węzeł tożsamości + WebSite + WebPage + Breadcrumb · moduły warunkowe wg zaznaczenia · `validator.schema.org` i Rich Results Test = zero błędów · markup zgodny z widoczną treścią · brak self-serving aggregateRating.

**Treść/GEO:** każda kluczowa sekcja zaczyna się od bezpośredniej odpowiedzi · 5–7 statystyk/materiał · każde twierdzenie ze źródłem · nagłówki jako pytania · data „ostatnia aktualizacja" widoczna.

**Encja:** `#identity` z `sameAs` do węzłów tożsamości (nie tylko social) · autorzy z bio/schema · spójny NAP (jeśli LOCAL).

**Rendering/CWV:** kluczowe fakty w HTML bez JS · CrUX p75: LCP<2,5s, INP<200ms, CLS<0,1 · LCP image nie lazy.

**AI-visibility:** Step 0 wykonany przed i po; zmierzony citation share w 4 silnikach; monitoring branded search w GSC.

---

# 12. NARZĘDZIA (zweryfikowane)

Schema Validator `validator.schema.org` · Rich Results Test `search.google.com/test/rich-results` · Google Search Console · Bing Webmaster Tools (+ IndexNow) · PageSpeed / CrUX `pagespeed.web.dev` · OG debugger `developers.facebook.com/tools/debug` · hreflang checker (Ahrefs / dedykowane).
*(Uwaga: stary Twitter Card Validator `cards-dev.twitter.com/validator` jest wyłączony — użyj OG debuggera + podglądu na X.)*

---

# 13. ANTY-WZORCE — czego NIE robić

- Globalny `Disallow: /*?*` (blokuje paginację/filtry).
- Self-serving `aggregateRating` z cudzych recenzji (ryzyko kary).
- Traktowanie geo meta tagów / `speakable` / FAQ-rich-results jako aktywnych sygnałów Google — nie są.
- Keyword stuffing (poniżej baseline).
- Treść tylko w JS bez SSR/pre-render (niewidoczna dla AI).
- Poleganie na jednej platformie off-site.
- Schema traktowane jak magia bez dobrej treści.
- „Ustaw i zapomnij" bez pętli świeżości.
- Bramkowanie CWV wyłącznie wynikiem Lighthouse zamiast danych polowych.
- Mylenie „Core odhaczony" z „mamy GEO" — bez warstwy off-site to niepełne.

---

### Priorytet wdrożenia
**Faza 1 (przed publikacją):** Core §1–§6 + węzeł tożsamości + reguły treści na kluczowych stronach.
**Faza 2 (tydz. 1–2):** moduły warunkowe · Breadcrumb/WebPage wszędzie · obrazy · llms.txt.
**Faza 3 (miesiąc 1):** CWV na danych polowych · encja/`sameAs` do grafu wiedzy · **start warstwy off-site** · pierwszy pomiar AI-visibility vs baseline.

*Dane efektywności: Aggarwal et al. „GEO", ACM SIGKDD/KDD 2024 (arXiv:2311.09735) oraz analizy branżowe 2025–2026 (Ahrefs, Seer, AirOps, Semrush). Liczby z badań komercyjnych traktuj jako kierunek, nie prawo.*