# Specyfikacja dostarczania treści — strona jachtowa

Ten dokument opisuje, w jakim formacie dostarczasz treść. Pliki zgodne
z tym formatem wchodzą na stronę automatycznie. Pliki niezgodne —
zatrzymują publikację z komunikatem błędu, więc format ma znaczenie.

## Zasada ogólna

Jeden jacht = jeden plik tekstowy `.md` na każdy język + jeden folder
ze zdjęciami (zdjęcia są wspólne dla wszystkich języków, dostarczasz
je RAZ).

Nazwa pliku i folderu to tzw. klucz jachtu: małe litery, cyfry
i myślniki, bez polskich znaków i spacji. Przykład: `aurora-42`.
**Ten sam klucz we wszystkich językach** — po nim łączymy wersje
językowe.

## Struktura

```
yachts/
  en/aurora-42.md
  pl/aurora-42.md
  es/aurora-42.md
  it/aurora-42.md
  ru/aurora-42.md
zdjecia/
  aurora-42/
    hero.jpg
    gallery-01.jpg
    gallery-02.jpg
```

## Plik jachtu — wzór

Skopiuj załączony `aurora-42.md` i podmień wartości. Część nad `---`
to dane techniczne (identyczne w każdym języku), część pod — opis
w danym języku (dowolna długość, nagłówki przez `##`).

Pola obowiązkowe: klucz (`translationKey`), nazwa, brand, rok,
długość w metrach (`lengthM`), liczba kabin (`cabins`).

Pola opcjonalne: szerokość, zanurzenie, koje, prędkość maks., cena
w EUR (pole wyłącznie do użytku wewnętrznego — ceny nigdy nie
pojawiają się na stronie ani w treści opisów; na pytania cenowe
w copy odpowiada fraza „cena zależy od konfiguracji — zapytaj
o wycenę").

Pole `seo.description` — maks. 160 znaków, to tekst widoczny
w wynikach Google.

## Zdjęcia — twarde wymagania

- `hero.jpg` — obowiązkowe, poziome, min. 2400 px szerokości.
  Bez hero jacht NIE zostanie opublikowany.
- `gallery-01.jpg` … `gallery-12.jpg` — numeracja dwucyfrowa,
  kolejność numerów = kolejność na stronie, maks. 12 sztuk.
- Format JPG, bez logotypów/watermarków, min. 2000 px szerokości
  dla galerii.
- Nazwy plików dokładnie jak wyżej — `Hero.JPG`, `hero (1).jpg`
  itp. nie zadziałają.
- `layout-01.jpg`, `layout-02.jpg`… — plany pokładów, opcjonalne.
  Numeracja dwucyfrowa, ten sam folder co hero i galeria, poziome,
  min. 2000 px szerokości. Brak plików = sekcja nie pojawia się
  na stronie.

## Brandy

Analogicznie: `brands/pl/nazwa-brandu.md` (wzór w załączniku
`brand-a.md`) + folder zdjęć z `logo.svg` (lub `logo.png` na
przezroczystym tle) i `hero.jpg`.

## Jachty dostępne od ręki (`stock/`)

To JEDYNY wyjątek od zasady „ceny nie są publikowane". Dotyczy
konkretnych egzemplarzy (zwykle używanych lub demo), nie modeli
z katalogu. Cena jest widoczna na stronie.

Struktura identyczna jak dla jachtów:

```
stock/
  en/galeon-335-gto.md
  pl/galeon-335-gto.md
  es/galeon-335-gto.md
  it/galeon-335-gto.md
zdjecia-stock/
  galeon-335-gto/
    hero.jpg
    gallery-01.jpg
```

Pola obowiązkowe: `translationKey`, `name`, `brand`, `year`,
`lengthM`, `cabins`, `price` (liczba, bez separatorów), `currency`
(`EUR`, `GBP` lub `PLN`), `taxStatus` (`ex-tax` = cena netto /
bez VAT, `tax-paid` = VAT opłacony).

Pola opcjonalne: `modelKey` (klucz modelu z katalogu, jeśli istnieje),
`condition` (`used` domyślnie lub `new`), `engineHours` (motogodziny),
`location` (np. „Palma, ES"), szerokość, zanurzenie, koje, prędkość
maks., silniki, kategoria, `seo`.

Egzemplarz sprzedany: ustaw `sold: true` — znika ze strony, plik
zostaje. Zdjęcia — te same wymagania co dla jachtów (hero
obowiązkowe, galeria `gallery-01.jpg`…, bez planów pokładów).

## Terminy integracyjne

- Komplet treści PL + EN: **[DATA — uzupełnia dev, koniec kroku 3]**
- Tłumaczenia ES + IT + RU: **[DATA — ok. dnia 26]**

Jacht/brand bez wersji językowej po terminie = ta wersja językowa
startuje bez niego i dochodzi po premierze. Strona się przez to
nie zatrzyma.

## Jak dostarczasz

Paczka ZIP lub folder w chmurze o strukturze jak wyżej. Nie zmieniaj
struktury folderów — jest wczytywana automatycznie.
