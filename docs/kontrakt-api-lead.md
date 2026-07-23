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

Routing dealera: lead ze strony jachtu/brandu -> defaultDealer brandu;
lead z porównywarki (jachty mogą być z różnych brandów) -> bez
przypisania, obsługa ręczna w Pipedrive. Mapowanie dealerId ->
pipedriveOptionLabel wyłącznie po stronie serwera.

UTM: capture do sessionStorage inline skryptem w layoucie, dołączane
do submitu. Brak UTM = pola puste, nie błąd.

Zgoda (RODO): checkbox przekazania danych dealerowi — odrębny, nie
pre-checked, tekst per locale; do Pipedrive dosłowna treść + timestamp.
