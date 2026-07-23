# Kontrakt: dane lokalizacji (showroomy)

Setki rekordów -> jeden plik `src/data/locations.json` (nie pliki
per sztuka). Format rekordu:

- id (lowercase, cyfry, myślniki), name, city, country (ISO 3166-1
  alpha-2), address, lat, lng
- opcjonalne: phone, brandKeys[] (enum brandów), dealerId
- name/city/address bez tłumaczeń (nazwy własne); nazwy krajów
  tłumaczone w UI po kodzie ISO

Dostarczanie: CSV lub Excel od biznesu -> skrypt importu
(scripts/import-locations) waliduje, geokoduje brakujące lat/lng
(jednorazowo, przy imporcie — nie w runtime) i zapisuje JSON.
Rekord bez rozwiązywalnego adresu = raport błędu, nie cichy drop.

Ten format to zewnętrzne API (inwariant w CLAUDE.md) — zmiany
wymagają zgody usera.
