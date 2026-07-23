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
  pl/aurora-42.md
  en/aurora-42.md
  de/aurora-42.md
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
w EUR. **Brak ceny = strona pokaże „cena na zapytanie"** — to
świadomy mechanizm, nie błąd.

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

## Brandy

Analogicznie: `brands/pl/nazwa-brandu.md` (wzór w załączniku
`brand-a.md`) + folder zdjęć z `logo.svg` (lub `logo.png` na
przezroczystym tle) i `hero.jpg`.

## Terminy integracyjne

- Komplet treści PL: **[DATA — uzupełnia dev, koniec kroku 3]**
- Tłumaczenia EN + trzeci język: **[DATA — ok. dnia 26]**

Jacht/brand bez wersji językowej po terminie = ta wersja językowa
startuje bez niego i dochodzi po premierze. Strona się przez to
nie zatrzyma.

## Jak dostarczasz

Paczka ZIP lub folder w chmurze o strukturze jak wyżej. Nie zmieniaj
struktury folderów — jest wczytywana automatycznie.
