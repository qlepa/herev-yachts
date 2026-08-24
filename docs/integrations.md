# Integracje — Herev Yachts

Status: **✅ Zainstalowane** | **⏳ Do potwierdzenia z klientem**

---

## HOSTING

| Narzędzie | Status | Plusy | Minusy |
|-----------|--------|-------|--------|
| **Vercel** | ✅ Zainstalowane | Zero-config dla Astro, serverless endpoints, geo-IP headers wbudowane, CI/CD z GitHub | Vendor lock-in na serverless |
| Netlify | Alternatywa | Podobne możliwości, dłuższy staż | Brak geo-IP headers natywnie |
| Cloudflare Pages | Alternatywa | Najtańszy, globalne edge, Workers | Słabsza integracja z Astro |

---

## CMS (zarządzanie treścią)

| Narzędzie | Status | Plusy | Minusy |
|-----------|--------|-------|--------|
| **Sanity** | ✅ Wdrożone (blog en/pl/es/it + `notificationRecipients`) | SaaS (zero infra), najlepszy UI dla nietech. użytkownika, wbudowany CDN na zdjęcia z cropperem, dobra integracja z Astro, free tier 3 userów. Studio pod `/admin`, dataset prywatny (read token po stronie serwera). Reszta treści (jachty/marki/dealerzy) wciąż w plikach `src/content/` — migracja do Sanity to osobny, nieplanowany jeszcze krok | GROQ (własny język zapytań) |
| Payload CMS | Alternatywa | TypeScript-native, pełna kontrola, własna baza | Wymaga bazy danych (Postgres) + serwera, więcej infrastruktury |
| Contentful | Alternatywa | Bardzo dojrzały, duże community | Droższy, mniej developer-friendly |
| Directus | Alternatywa | Open source, self-hosted lub cloud | Mniej popularne, mniejsze community |

---

## NEWSLETTER

| Narzędzie | Status | Plusy | Minusy |
|-----------|--------|-------|--------|
| **Mailchimp** | ⏳ Do potwierdzenia | Standard rynkowy, double opt-in natywnie, automatyzacje, free do 500 subskrybentów | UI przestarzały, drożeje przy skalowaniu |
| Brevo | Alternatywa | EU-based (GDPR), tańszy, dobry free tier | Mniejsze community, słabsze automatyzacje |
| Beehiiv | Alternatywa | Dedykowany SEO newsletter, wbudowana analityka wzrostu | Płatny od startu, bardziej dla publisherów |
| Kit (ConvertKit) | Alternatywa | Dobry dla creator economy | Droższy, overkill dla tego use case |

---

## CRM / ROUTING LEADÓW

| Narzędzie | Status | Plusy | Minusy |
|-----------|--------|-------|--------|
| **Pipedrive** | ⏳ Do potwierdzenia | Popularny w sprzedaży B2C premium, dobry API, prosty pipeline | Płatny (od ~15€/user/mies.) |
| HubSpot | Alternatywa | Bezpłatny CRM, świetne narzędzia marketingowe | Agresywny upselling, cięższy |
| Webhook własny | Alternatywa | Zero kosztu, pełna kontrola | Wymaga budowy logiki po stronie klienta |

---

## EMAIL TRANSAKCYJNY (potwierdzenia leadów)

| Narzędzie | Status | Plusy | Minusy |
|-----------|--------|-------|--------|
| **Resend** | ⏳ Do potwierdzenia | Nowoczesny, developer-friendly, React Email templates, free 3k/mies. | Nowa firma (mniejszy staż) |
| SendGrid | Alternatywa | Sprawdzony latami, duży free tier | Bardziej korporacyjny UI |
| Postmark | Alternatywa | Najlepsza dostarczalność, dobry dla transakcyjnych | Droższy, płatny od startu |

---

## ANTISPAM (formularze)

| Narzędzie | Status | Plusy | Minusy |
|-----------|--------|-------|--------|
| **Cloudflare Turnstile** | ⏳ Do potwierdzenia | Bezpłatny, privacy-friendly, bez puzzli dla użytkownika | Wymaga JS |
| hCaptcha | Alternatywa | Privacy-first, free tier | Irytujące puzzle dla użytkownika |
| reCAPTCHA v3 | Alternatywa | Najpopularniejszy | Problemy z GDPR, Google tracking |

---

## VIDEO

| Narzędzie | Status | Plusy | Minusy |
|-----------|--------|-------|--------|
| **Mux** | ⏳ Do potwierdzenia | Najwyższa jakość, adaptive streaming, dobre Astro API | Płatny (storage + bandwidth) |
| Cloudflare Stream | Alternatywa | Tańszy, dobra jakość | Mniejsze możliwości API |
| Vimeo Pro | Alternatywa | Znajomy UI, dobra jakość | Droższy przy dużym ruchu, mniej kontroli |

---

## MAPY (sieć showroomów)

| Narzędzie | Status | Plusy | Minusy |
|-----------|--------|-------|--------|
| **Mapbox GL v3** | ✅ Zainstalowane | Premium wygląd, clustering, customowe style, używane przez Airbnb/Uber | Płatny po 50k tile requests/mies. |
| Google Maps | Alternatywa | Najpopularniejszy, dobre geocoding | Droższy przy skali, mniej estetyczny |
| Leaflet + OpenStreetMap | Alternatywa | Bezpłatny | Gorszy wygląd, brak premium stylów |

---

## ANALITYKA

| Narzędzie | Status | Plusy | Minusy |
|-----------|--------|-------|--------|
| **GA4** | ⏳ Do potwierdzenia | Standard, bezpłatny, integracja z Google Ads | Wymaga Consent Mode v2, GDPR skomplikowany |
| Plausible | Alternatywa | Privacy-first, cookieless, EU-hosted, prosty | Płatny (~9€/mies.), mniej danych |
| Umami | Alternatywa | Open source, self-hosted | Wymaga serwera |

---

## COOKIE CONSENT

| Narzędzie | Status | Plusy | Minusy |
|-----------|--------|-------|--------|
| **vanilla-cookieconsent** | ⏳ Do potwierdzenia | Open source, 6KB, pełna kontrola nad designem, Consent Mode v2, 5 języków | Konfiguracja ręczna |
| Cookiebot | Alternatywa | Automatyczna klasyfikacja cookies, zero kodu | 5–15€/mies., obcy skrypt, ograniczony design |
| CookieYes | Alternatywa | Podobny do Cookiebot, tańszy | Jak wyżej |
