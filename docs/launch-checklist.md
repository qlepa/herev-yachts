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
- [ ] Webhook → Deploy Hook: filtr obejmuje wszystkie typy treści z CMS
      (bez `notificationRecipients`); test publikacji end-to-end
- [ ] Prawdziwe adresy w odbiorcach leadów dopiero, gdy dokument jest pod
      `private.notificationRecipients` (krok 9.2)
- [ ] Usunięte treści testowe (posty testowe, przykładowe dokumenty)

## 4. Klucze i integracje

- [ ] Przegląd sekretów: wszystko, co było w `.env` na komputerach, w CI
      albo wklejone gdziekolwiek → nowe wartości w Vercelu / GitHubie, stare
      unieważnione (Sanity, Resend, Pipedrive, Turnstile — co istnieje
      w danym momencie)
- [ ] Skan historii gita na sekrety (np. `gitleaks detect`) — przed
      udostępnieniem repo komukolwiek
- [ ] Mapbox: token `pk.` z ograniczeniem URL tylko do `https://herev.com`
      i `https://cms.herev.com` (usunąć localhost i `*.vercel.app`)
- [ ] Turnstile: domeny produkcyjne w konfiguracji widgetu
- [ ] Resend: zweryfikowana domena nadawcy (SPF, DKIM, DMARC)
- [ ] GA4 + Consent Mode v2: zero żądań do Google przed zgodą (DevTools →
      Network)

## 5. Treść i jakość

- [ ] `public/700 SKY-…/` (zdjęcia + PDF klienta, publicznie dostępne) —
      usunięte albo przeniesione do CMS (decyzja w `docs/cms-plan.md`)
- [ ] Lighthouse mobile ≥ 95: strona główna, marka, jacht
- [ ] Formularz leada w 4 językach: dociera do Pipedrive i na e-maile;
      awaria integracji nie gubi leada
- [ ] Stare URL-e (przekierowania w `vercel.json`) działają na nowej
      domenie; brak martwych linków (np. `npx linkinator https://herev.com`)

## 6. Po starcie

- [ ] Search Console: raport indeksowania po kilku dniach
- [ ] Baseline cytowań AI (`docs/agency_handover.md`) — powtórka po 3 mies.
