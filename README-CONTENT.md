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
    gallery-exterior-01.jpg
    gallery-interior-01.jpg
    layout-01.jpg
    space-01.jpg
    brochure.pdf
```

## Plik jachtu — wzór

Skopiuj załączony `aurora-42.md` i podmień wartości. Część nad `---`
to dane techniczne (identyczne w każdym języku) oraz teksty sekcji
(tłumaczone w każdym języku). Część pod `---` to sekcja „Dlaczego
ten model": nagłówek przez `##`, pogrubiony lead, akapit i lista
korzyści przez `-` (renderuje się jako checklista).

Pola obowiązkowe: klucz (`translationKey`), nazwa, brand, rok,
długość w metrach (`lengthM`), liczba kabin (`cabins`).

Pola techniczne opcjonalne (takie same w każdym języku): `beamM`
(szerokość), `draftM` (zanurzenie), `berths` (miejsca noclegowe =
liczba gości), `maxSpeedKn`, `cruiseSpeedKn` (prędkość rejsowa),
`fuelL` i `waterL` (zbiorniki w litrach), `engines` (tekst),
`ceCategory` (np. `B`), cena w EUR (pole wyłącznie do użytku
wewnętrznego — ceny nigdy nie pojawiają się na stronie ani w treści
opisów; na pytania cenowe w copy odpowiada fraza „cena zależy od
konfiguracji — zapytaj o wycenę").

Pola tekstowe opcjonalne (tłumaczone w każdym pliku językowym) —
każde odpowiada jednej sekcji strony; brak pola = sekcja nie pojawia
się na stronie:

- `tagline` — jedno zdanie pod nazwą w hero (maks. 140 znaków).
- `features` — do 6 cech charakterystycznych: `title` (maks. 40 zn.)
  + `body` (maks. 160 zn.). Zdjęcia opcjonalne: `feature-01.jpg`…
  w folderze jachtu (numer = pozycja na liście).
- `lifestyle` — nagłówek (`heading`, opcjonalny) i 1–3 filary
  (`pillars`): `title`, `body`, opcjonalna ikona `icon` z listy:
  `sun`, `family`, `palm`, `anchor`, `wave`, `compass`.
- `spaces` — do 6 wnętrz pokazywanych jako zakładki: `title` (nazwa
  zakładki), `heading`, `body`, `highlights` (lista do 6 punktów).
  Zdjęcie: `space-01.jpg` dla pierwszego wnętrza, `space-02.jpg` dla
  drugiego itd.
- `video` — `url` to adres strony filmu na YouTube lub Vimeo (nie kod
  osadzenia) + opcjonalny `caption`. Film ładuje się dopiero po
  kliknięciu.
- `layouts` — nazwy pokładów w kolejności plików `layout-01.jpg`,
  `layout-02.jpg`… (np. „Pokład główny", „Pokład dolny").

Tabela „Porównaj gamę" i „Może cię zainteresować" liczą się
automatycznie z pozostałych jachtów — nie wymagają treści.

Pole `seo.description` — maks. 160 znaków, to tekst widoczny
w wynikach Google.

## Zdjęcia — twarde wymagania

- `hero.jpg` — obowiązkowe, poziome, min. 2400 px szerokości.
  Bez hero jacht NIE zostanie opublikowany.
- Galeria: `gallery-<kategoria>-01.jpg` … — numeracja dwucyfrowa,
  kolejność numerów = kolejność na stronie, maks. 12 sztuk łącznie.
  Kategoria to jedno ze słów: `exterior`, `interior`, `cockpit`,
  `cabins`, `lifestyle` — na stronie działa jako filtr galerii
  (przykład: `gallery-exterior-01.jpg`, `gallery-interior-01.jpg`).
  Inne słowo = błąd publikacji. Plik bez kategorii (`gallery-01.jpg`)
  jest dozwolony, ale pokazuje się tylko w widoku „Wszystkie".
- Format JPG, bez logotypów/watermarków, min. 2000 px szerokości
  dla galerii.
- Nazwy plików dokładnie jak wyżej — `Hero.JPG`, `hero (1).jpg`
  itp. nie zadziałają.
- `layout-01.jpg`, `layout-02.jpg`… — plany pokładów, opcjonalne.
  Numeracja dwucyfrowa, ten sam folder co hero i galeria, poziome,
  min. 2000 px szerokości. Brak plików = sekcja nie pojawia się
  na stronie. Nazwy pokładów podajesz w polu `layouts` w pliku .md.
- `space-01.jpg`, `space-02.jpg`… — zdjęcia wnętrz do zakładek
  z pola `spaces` (numer = pozycja na liście), poziome, min. 2000 px.
- `feature-01.jpg`… — opcjonalne zdjęcia do cech z pola `features`.
- `brochure.pdf` — broszura modelu, jeden plik wspólny dla wszystkich
  języków, w tym samym folderze co `hero.jpg`. Brak pliku = przycisk
  „Pobierz broszurę" nie pojawia się na stronie.

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
