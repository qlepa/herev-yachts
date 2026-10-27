# Checklista przed startem produkcji

Jedno miejsce na wszystko, co trzeba zrobić przy przejściu z `*.vercel.app`
na domenę klienta i otwarciu strony dla wyszukiwarek. Szczegóły SEO:
`docs/seo_implementation.md`; CMS: `docs/cms-plan.md` (krok 9.6).
Nowe rzeczy „do zrobienia przed startem” dopisywać tutaj.

## 1. Domeny i Vercel

- [ ] `herev.com` → projekt `herev-yachts`; `www.herev.com` → przekierowanie
      na `herev.com`
- [ ] `cms.herev.com` → projekt `herev-cms`
- [ ] `herev-yachts.vercel.app` → przekierowanie na `herev.com` (Vercel →
      Domains), żeby nie było dwóch kopii strony
- [ ] `vercel.json`: usunąć tymczasową regułę `/admin` dla
      `herev-yachts.vercel.app` → `herev-cms.vercel.app`
- [ ] Domena zgodna z `site` w `astro.config.mjs` (`https://herev.com`) —
      od niej zależą canonicale, hreflang, sitemapa; sprawdzić też adresy
      wpisane na sztywno: `public/robots.txt`, `public/llms.txt`, strony
      `network`
- [ ] Vercel → Notifications: e-mail przy nieudanym deploymencie (oba
      projekty)

## 2. Indeksowanie

- [ ] `PUBLIC_INDEXING_ENABLED=true` — **tylko** projekt `herev-yachts`,
      środowisko Production. Nigdy w `herev-cms`
- [ ] Sprawdzić w źródle strony: produkcja `index,follow`, CMS
      `noindex,nofollow`, strona 404 `noindex`
- [ ] `public/og.jpg` (1200×630) — dziś brak, podglądy linków są puste
- [ ] `/favicon.ico` — dziś brak (jest tylko PNG)
- [ ] `sameAs` w JSON-LD Organization (LinkedIn, social media)
- [ ] Google Search Console + Bing Webmaster Tools: weryfikacja domeny,
      zgłoszenie `https://herev.com/sitemap-index.xml`; IndexNow w Bingu
- [ ] Walidacja: validator.schema.org, Rich Results Test, Facebook Sharing
      Debugger — zero błędów

## 3. Sanity

- [ ] CORS origins: zostaje tylko `https://cms.herev.com` (Allow
      credentials). Usunąć `http://localhost:4321`,
      `https://herev-cms.vercel.app` i wpisy z gwiazdką. Lokalny Studio
      wymaga wtedy tymczasowego dodania localhosta z powrotem
- [ ] Rotacja tokenów: nowy token Viewer osobno dla produkcji (Vercel
      `herev-yachts`), CMS (`herev-cms`, jako Sensitive — patrz 9.6
      w `docs/cms-plan.md`) i CI (GitHub → Secrets); stare tokeny usunąć,
      w tym te z integracji Sanity–Vercel. Token zapisu nie powinien istnieć
- [ ] Członkowie projektu: osoba od treści klienta z rolą Editor (wymaga
      Growth); usunąć zbędne konta
- [ ] Plan Growth (warunki: „Limity planu Free” w `docs/cms-plan.md`);
      po przejściu rozważyć dataset prywatny
- [ ] Nowy Deploy Hook w Vercelu (stary URL był wklejany w rozmowy) →
      podmienić URL w webhooku Sanity, stary hook usunąć
- [ ] Webhook → Deploy Hook: filtr obejmuje wszystkie typy treści z CMS
      (bez `notificationRecipients`); test publikacji end-to-end
- [ ] Studio → Ustawienia → Kontakt i SEO: obrazek do udostępnień
      (1200 × 630), profile social, telefon (jeśli ma być na stronie),
      właściwy e-mail kontaktowy
- [ ] Odbiorcy leadów: prawdziwe adresy wpisane (dokument jest pod
      `private.notificationRecipients` od kroku 9.2 — niewidoczny bez tokena)
- [ ] Usunięte treści testowe (posty testowe, przykładowe dokumenty)

## 4. Klucze i integracje

- [x] **Konta (stan 2026-10-26):** Turnstile, Resend i Pipedrive
      skonfigurowane na kontach dewelopera, zmienne na Vercelu
      (`herev-yachts`), testowy lead przeszedł end-to-end
- [ ] **Przeniesienie integracji na konta klienta przed startem:** widget
      Turnstile z domenami `herev.com`/`cms.herev.com`, Resend z domeną
      klienta, Pipedrive = konto klienta (płatne, decyzja klienta) z polami
      dealu wg `docs/kontrakt-api-lead.md`; po przeniesieniu nowe wartości
      zmiennych na Vercelu + Redeploy i ponowny test end-to-end

- [ ] Przegląd sekretów: wszystko, co było w `.env` na komputerach, w CI
      albo wklejone gdziekolwiek → nowe wartości w Vercelu / GitHubie, stare
      unieważnione (Sanity, Resend, Pipedrive, Turnstile — co istnieje
      w danym momencie)
- [ ] CI (`.github/workflows/ci.yml`): `PUBLIC_SANITY_PROJECT_ID`
      i `PUBLIC_SANITY_DATASET` są wpisane na sztywno (tymczasowo, bo
      brakowało secretów) → przenieść do GitHub Secrets i wrócić do
      `${{ secrets.… }}`
- [ ] Skan historii gita na sekrety (np. `gitleaks detect`) — przed
      udostępnieniem repo komukolwiek
- [ ] Mapbox: token `pk.` z ograniczeniem URL tylko do `https://herev.com`
      i `https://cms.herev.com` (usunąć localhost i `*.vercel.app`)
- [ ] Turnstile: domeny produkcyjne w konfiguracji widgetu; na Vercelu
      `PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` (bez sekretu
      produkcja odrzuca każdy lead z 500)
- [ ] Pipedrive: `PIPEDRIVE_API_TOKEN` na Vercelu; pola własne dealu
      założone wg tabeli w `docs/kontrakt-api-lead.md` (nazwy znak w znak,
      opcje pola `Dealer` = `pipedriveOptionLabel` dealerów); testowy lead
      sprawdzony w CRM
- [ ] `LEAD_FROM_EMAIL` (zweryfikowany nadawca Resend) i `LEAD_FALLBACK_EMAIL`
      ustawione na Vercelu
- [ ] Resend: zweryfikowana domena nadawcy (SPF, DKIM, DMARC) — bez niej
      potwierdzenie do leada nie wychodzi (`onboarding@resend.dev` wysyła
      tylko na adres właściciela konta); po weryfikacji testowy lead z
      obcym adresem i sprawdzenie, że potwierdzenie dotarło w 4 językach
- [ ] GA4 + Consent Mode v2: zero żądań do Google przed zgodą (DevTools →
      Network)

## 5. Treść i jakość

- [ ] **Blog przeniesiony z yachts24.eu (137 postów) — decyzja przed
      `PUBLIC_INDEXING_ENABLED=true`.** Te same teksty są na yachts24.eu,
      więc po otwarciu indeksowania Google zobaczy duplikaty. Do wyboru:
      (a) yachts24.eu przekierowuje 301 `/post/<slug>` →
      `https://herev.com/en/blog/<slug>/` (slugi zachowane 1:1),
      (b) yachts24.eu dostaje `<link rel="canonical">` na nowe adresy,
      (c) teksty na Herev zostają przepisane / podmienione na nowe,
      (d) posty z yachts24 usunięte z Herev przed startem. Dotyczy też
      postów promujących usługi Yachts24 (rejestracja jachtów,
      „Why register your yacht with yachts24.eu”, życzenia świąteczne)
- [ ] Raport importu `docs/yachts24-import-report.md`: wideo i osadzenia,
      których nie dało się przenieść automatycznie — uzupełnione w Studio
      albo świadomie pominięte
- [ ] Linki w treści postów do yachts24.eu, które nie są postami (strony
      usług, formularze) — sprawdzone i podmienione na Herev albo usunięte

- [ ] `public/700 SKY-…/` (zdjęcia + PDF klienta, publicznie dostępne) —
      usunięte albo przeniesione do CMS (decyzja w `docs/cms-plan.md`)
- [ ] **Polityka prywatności i polityka cookies od klienta** (we wszystkich
      językach startu) — wpisane w Studio jako „Strona tekstowa”
      i opublikowane; link w stopce pojawia się dopiero po publikacji.
      Bez nich zgoda w formularzu leada odwołuje się do polityki, której
      nie ma na stronie (RODO)
- [ ] Lighthouse mobile ≥ 95: strona główna, marka, jacht
- [ ] Formularz leada w 4 językach: dociera do Pipedrive i na e-maile;
      awaria integracji nie gubi leada
- [ ] Porównywarka w 4 językach: link z `?y=` otwiera to samo zestawienie,
      zapytanie spod porównania niesie listę jachtów (pole „Compared
      yachts”), jedna marka → dealer marki, wiele marek → bez dealera
- [ ] Stare URL-e (przekierowania w `vercel.json`) działają na nowej
      domenie; brak martwych linków (np. `npx linkinator https://herev.com`)

## 6. Po starcie

- [ ] Search Console: raport indeksowania po kilku dniach
- [ ] Baseline cytowań AI (`docs/agency_handover.md`) — powtórka po 3 mies.
