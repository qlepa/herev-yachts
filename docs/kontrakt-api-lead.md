# Kontrakt: POST /api/lead

Astro endpoint, serverless na Vercelu. Obsługuje dwa warianty:
lead ze strony jachtu/brandu oraz lead z porównywarki.

Kolejność obowiązkowa:

1. Weryfikacja Turnstile server-side. Fail = 400, zero side effectów.
2. Walidacja payloadu — schemat współdzielony z walidacją client-side.
3. Pipedrive: persona + deal. Pola dealu: dealer, brand, język, UTM
   (source/medium/campaign), treść zgody + timestamp ISO. Wariant
   porównywarki: dodatkowo pole z listą porównywanych jachtów
   (translationKeys) i treść zapytania z textarea.
4. Resend: powiadomienie na WSZYSTKIE adresy z dokumentu ustawień
   w Sanity (notificationRecipients), czytane w momencie requestu.
   Pusta lista = fallback na adres z env + error log.
5. Idempotencja po e-mailu w krótkim oknie — double-submit nie tworzy
   dwóch dealów.
6. Awaria Pipedrive nie gubi leada: minimum mail Resend z pełnym
   payloadem + 200 dla klienta + error log.

Egzemplarz od ręki (decyzje Tomasza 2026-10-20):

- Lead ze strony egzemplarza (`available-now/[stock]`) niesie
  `translationKey` egzemplarza (nie tylko nazwę modelu) -> osobne pole
  dealu w Pipedrive. Routing: defaultDealer brandu (jak dla modelu);
  dealer trzymający łódź = poza MVP, wymagałby pola `dealer` w `stock`.
- Lead ze strony modelu: opcjonalny checkbox `stockInterest` (boolean,
  niezaznaczony domyślnie, renderowany tylko gdy istnieje nowy egzemplarz
  tego modelu) -> flaga w dealu. Brak pola = false, nie błąd.

Routing dealera: lead ze strony jachtu/brandu -> defaultDealer brandu;
lead z porównywarki (jachty mogą być z różnych brandów) -> bez
przypisania, obsługa ręczna w Pipedrive. Mapowanie dealerId ->
pipedriveOptionLabel wyłącznie po stronie serwera.

UTM: capture do sessionStorage inline skryptem w layoucie, dołączane
do submitu. Brak UTM = pola puste, nie błąd.

Zgoda (RODO): checkbox przekazania danych dealerowi — odrębny, nie
pre-checked, tekst per locale; do Pipedrive dosłowna treść + timestamp.

## Implementacja (krok 5, 2026-10-26)

- Kod: `src/pages/api/lead.ts` (wiring), `src/lib/server/lead/handler.ts`
  (kolejność z kontraktu, testy), `pipedrive.ts`, `resend.ts`,
  `turnstile.ts`, `src/lib/server/cms/notificationRecipients.ts`.
  Schemat współdzielony: `src/lib/lead.ts`; wyspa: `src/islands/LeadForm.tsx`.
- Produkcja zostaje `output: 'static'`; adapter Vercela obsługuje tylko trasy
  z `prerender = false` (`src/pages/api/*`).
- Env (patrz `.env.example`): `PUBLIC_TURNSTILE_SITE_KEY`,
  `TURNSTILE_SECRET_KEY`, `PIPEDRIVE_API_TOKEN`, `RESEND_API_KEY`,
  `LEAD_FROM_EMAIL` (zweryfikowany nadawca), `LEAD_FALLBACK_EMAIL` (gdy lista
  w Sanity pusta). Brak sekretu Turnstile: dev — weryfikacja pominięta
  z ostrzeżeniem; produkcja — 500, żaden lead nie przechodzi.
- Odpowiedzi: `200 {ok:true}` (także `duplicate:true` dla double-submitu),
  `400 {error:'turnstile'|'validation', fields}`, `502 {error:'delivery'}`
  gdy ani Pipedrive, ani e-mail nie przyjęły leada (formularz pokazuje
  adres e-mail z ustawień jako fallback).
- Idempotencja: ten sam e-mail/telefon w ciągu 2 min w ramach instancji
  funkcji → brak drugiego deala. Bez bazy danych to maksimum; łapie podwójny
  klik i niecierpliwe ponowienie.
- Formularz kompaktowy (strona główna, usługi, marka) ma jedno pole
  „e-mail lub telefon”: `@` → e-mail, inaczej telefon. Osoba w Pipedrive
  szukana po e-mailu (exact match), inaczej tworzona.

### Pola dealu w Pipedrive (konfiguracja po stronie CRM)

Endpoint szuka pól własnych dealu **po nazwie** (klucze API pól są losowe
per konto). Pole, którego nie ma, albo etykieta opcji, która nie pasuje
znak w znak, nie jest błędem — wartość trafia do notatki dealu, lead się
nie gubi. Do założenia w Pipedrive (Ustawienia → Pola danych → Deal):

| Nazwa pola | Typ | Wartość |
|---|---|---|
| `Dealer` | Pojedynczy wybór | opcje = `pipedriveOptionLabel` dealerów (znak w znak) |
| `Brand` | Tekst | klucz marki, np. `galeon` |
| `Language` | Tekst | `en` / `pl` / `es` / `it` |
| `UTM Source`, `UTM Medium`, `UTM Campaign` | Tekst | z URL wejścia |
| `Consent` | Tekst długi | dosłowna treść zgody pokazana użytkownikowi |
| `Consent timestamp` | Tekst | ISO 8601 |
| `Stock unit` | Tekst | `translationKey` egzemplarza |
| `Stock interest` | Tekst | `Yes` gdy zaznaczono checkbox na stronie modelu |
| `Financing` | Tekst | `Yes` gdy zaznaczono |
| `Compared yachts` | Tekst | `translationKey` porównywanych jachtów po przecinku |
| `Source page` | Tekst | URL strony z formularzem |

Treść wiadomości, telefon i e-mail zawsze idą do notatki dealu. Tytuł
dealu: `{model} — {imię}`; wariant porównywarki: `Compare: a vs b — {imię}`.
E-mail z powiadomieniem zawiera status Pipedrive (`deal #id` albo
`FAILED` z błędem) — awaria CRM jest widoczna dla ludzi.
