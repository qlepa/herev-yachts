import type { Translations } from '../lib/i18n-strings';

/**
 * UI texts edited in Sanity: one `uiStrings` document per language.
 * The shape mirrors part of `Translations`, so pages keep using `t.nav.blog`
 * etc. Page content (headings and paragraphs of sections) stays in
 * `src/lib/i18n-strings.ts` until step 9.3.
 *
 * Plain data (no `sanity` import): read by the Studio schema, the data layer
 * and the migration script.
 */
export type UiStrings = {
  nav: Translations['nav'];
  footer: Translations['footer'];
  categories: Translations['categories'];
  fleet: Translations['fleet'];
  stock: Pick<Translations['stock'], 'viewAll' | 'enquire' | 'moreInfo' | 'exTax' | 'taxPaid'> & {
    page: Pick<
      Translations['stock']['page'],
      'backToList' | 'keyNumbers' | 'enquireHeadingPrefix' | 'brandLine' | 'overviewLabel'
    >;
  };
  lead: Pick<
    Translations['lead'],
    'cta' | 'namePlaceholder' | 'contactPlaceholder' | 'modelPlaceholder' | 'messagePlaceholder' | 'orCall'
  >;
  brandsPage: Pick<Translations['brandsPage'], 'viewLabel'>;
  brandPage: Translations['brandPage'];
  yachtsPage: Pick<Translations['yachtsPage'], 'filter'>;
  yachtPage: Translations['yachtPage'];
  blogPage: Pick<
    Translations['blogPage'],
    'readMore' | 'publishedLabel' | 'backToBlog' | 'comingSoon' | 'pagination'
  >;
  networkPage: Pick<Translations['networkPage'], 'stats' | 'regions' | 'explorer' | 'countryPage'>;
};

/** Fixed document ID per language. */
export const uiStringsId = (language: string) => `uiStrings-${language}`;

/** Placeholders the site replaces with real values. */
export const PLACEHOLDERS = {
  '{name}': 'nazwa modelu',
  '{brand}': 'nazwa marki',
  '{n}': 'liczba',
  '{b}': 'liczba marek',
  '{country}': 'nazwa kraju',
} as const;
export type Placeholder = keyof typeof PLACEHOLDERS;

export interface LeafSpec {
  title: string;
  description?: string;
  /** Multi-line input for longer texts. */
  rows?: number;
  placeholders?: Placeholder[];
}

export interface GroupSpec<T> {
  title: string;
  description?: string;
  fields: Spec<T>;
}

export type Spec<T> = {
  [K in keyof T]-?: T[K] extends string ? string | LeafSpec : GroupSpec<T[K]>;
};

/** Studio tabs of the document. */
export const UI_STRINGS_TABS = [
  { name: 'general', title: 'Menu i stopka' },
  { name: 'yachts', title: 'Jachty' },
  { name: 'stock', title: 'Dostępne od ręki' },
  { name: 'blog', title: 'Blog' },
  { name: 'network', title: 'Sieć dealerska' },
  { name: 'forms', title: 'Formularze' },
] as const;

export const UI_STRINGS_SPEC: { [K in keyof UiStrings]-?: GroupSpec<UiStrings[K]> & { tab: (typeof UI_STRINGS_TABS)[number]['name'] } } = {
  nav: {
    title: 'Menu',
    tab: 'general',
    fields: {
      yachts: 'Jachty',
      brands: 'Marki',
      services: 'Usługi',
      network: 'Sieć dealerska',
      blog: 'Blog',
      enquire: 'Przycisk zapytania (prawy górny róg)',
    },
  },
  footer: {
    title: 'Stopka',
    tab: 'general',
    fields: {
      legal: 'Linia z prawami autorskimi',
    },
  },
  categories: {
    title: 'Typy jachtów',
    description: 'Nazwy kategorii na kafelkach jachtów i w filtrze.',
    tab: 'yachts',
    fields: {
      flybridge: 'Flybridge',
      hardtop: 'Hardtop',
      open: 'Open',
      weekender: 'Weekender',
      day: 'Day boat',
      'grand-tourer': 'Grand tourer',
      runabout: 'Runabout',
    },
  },
  fleet: {
    title: 'Kafelek jachtu',
    tab: 'yachts',
    fields: {
      enquire: 'Link zapytania na kafelku',
    },
  },
  brandsPage: {
    title: 'Lista marek',
    tab: 'yachts',
    fields: {
      viewLabel: 'Link na kafelku marki',
    },
  },
  brandPage: {
    title: 'Strona marki i lista jachtów marki',
    tab: 'yachts',
    fields: {
      fleetHeading: 'Nagłówek listy modeli',
      fleetSubheading: { title: 'Podtytuł listy modeli', description: 'Także opis w Google strony z jachtami marki.' },
      enquireCta: 'Przycisk zapytania',
      viewAllLabel: 'Link do wszystkich modeli',
    },
  },
  yachtsPage: {
    title: 'Lista jachtów',
    tab: 'yachts',
    fields: {
      filter: {
        title: 'Filtr',
        fields: {
          refine: 'Nagłówek filtra',
          typeLabel: 'Etykieta: typ',
          marqueLabel: 'Etykieta: marka',
          lengthLabel: 'Etykieta: długość',
          searchPlaceholder: 'Podpowiedź w polu wyszukiwania',
          yachts: 'Słowo po liczbie wyników („12 yachts”)',
          cabins: 'Słowo po liczbie kabin',
          sortLengthLong: 'Sortowanie: najdłuższe najpierw',
          sortLengthShort: 'Sortowanie: najkrótsze najpierw',
          viewLabel: 'Link na kafelku',
          noResults: 'Komunikat: brak wyników',
        },
      },
    },
  },
  yachtPage: {
    title: 'Strona jachtu',
    tab: 'yachts',
    fields: {
      enquireCta: 'Przycisk: zapytanie o ofertę',
      bookViewingCta: 'Przycisk: umów oglądanie',
      brochureCta: 'Przycisk: pobierz broszurę',
      keyNumbers: {
        title: 'Najważniejsze liczby (pod zdjęciem)',
        fields: {
          length: 'Długość',
          cabins: 'Kabiny',
          guests: 'Goście',
          speed: 'Prędkość maks.',
        },
      },
      whyLabel: { title: 'Nagłówek sekcji „Dlaczego”', placeholders: ['{name}'] },
      features: {
        title: 'Sekcja: cechy',
        fields: { eyebrow: 'Nadtytuł', heading: 'Nagłówek' },
      },
      lifestyle: {
        title: 'Sekcja: styl życia',
        fields: { eyebrow: { title: 'Nadtytuł', placeholders: ['{name}'] }, heading: 'Nagłówek' },
      },
      spacesEyebrow: 'Nadtytuł sekcji wnętrz',
      video: {
        title: 'Sekcja: wideo',
        fields: {
          eyebrow: 'Nadtytuł',
          heading: { title: 'Nagłówek', placeholders: ['{name}'] },
          play: 'Opis przycisku odtwarzania (dla czytników ekranu)',
        },
      },
      galleryHeading: 'Galeria: nadtytuł',
      galleryTitle: 'Galeria: początek nagłówka (przed nazwą modelu)',
      galleryAll: 'Galeria: filtr „wszystkie”',
      galleryImages: 'Galeria: słowo po liczbie zdjęć',
      galleryCategories: {
        title: 'Galeria: kategorie zdjęć',
        fields: {
          exterior: 'Na zewnątrz',
          interior: 'Wnętrze',
          cockpit: 'Kokpit',
          cabins: 'Kabiny',
          lifestyle: 'Styl życia',
        },
      },
      deckPlansHeading: 'Plany pokładów: nadtytuł',
      deckPlansSubtitle: 'Plany pokładów: nagłówek',
      deckFallback: 'Plany pokładów: nazwa pokładu bez tytułu',
      viewFullSize: 'Link: pełny rozmiar',
      specsEyebrow: 'Dane techniczne: nadtytuł',
      specsSubtitle: 'Dane techniczne: nagłówek',
      specsGroups: {
        title: 'Dane techniczne: grupy',
        fields: {
          dimensions: 'Wymiary',
          accommodation: 'Zakwaterowanie',
          performance: 'Osiągi',
          capacities: 'Pojemności',
        },
      },
      specs: {
        title: 'Dane techniczne: nazwy parametrów',
        fields: {
          length: 'Długość',
          beam: 'Szerokość',
          draft: 'Zanurzenie',
          cabins: 'Kabiny',
          berths: 'Goście',
          engines: 'Silniki',
          speed: 'Prędkość maks.',
          cruiseSpeed: 'Prędkość przelotowa',
          fuel: 'Zbiornik paliwa',
          water: 'Zbiornik wody',
          ceCategory: 'Kategoria CE',
          year: 'Rok modelowy',
        },
      },
      compare: {
        title: 'Porównanie modeli marki',
        fields: {
          eyebrow: 'Nadtytuł',
          heading: { title: 'Nagłówek', placeholders: ['{brand}'] },
          model: 'Kolumna: model',
          length: 'Kolumna: długość',
          cabins: 'Kolumna: kabiny',
          guests: 'Kolumna: goście',
          speed: 'Kolumna: prędkość',
          current: 'Oznaczenie bieżącego modelu',
        },
      },
      recommendedEyebrow: 'Polecane: nadtytuł',
      recommendedHeading: 'Polecane: nagłówek',
      viewAllLabel: 'Link do wszystkich jachtów',
      financing: {
        title: 'Finansowanie',
        fields: {
          eyebrow: 'Nadtytuł',
          copy: { title: 'Tekst', rows: 3 },
          cta: 'Link',
        },
      },
      readyHeading: { title: 'Nagłówek formularza', placeholders: ['{name}'] },
      leadEyebrow: 'Nadtytuł formularza',
      mobileCta: {
        title: 'Przycisk przyklejony na telefonie',
        fields: { enquire: 'Tekst przycisku' },
      },
      financingCheckbox: 'Formularz: zgoda „interesuje mnie finansowanie”',
      privacyCheckbox: { title: 'Formularz: zgoda na kontakt i politykę prywatności', rows: 2 },
      emailPlaceholder: 'Formularz: podpowiedź w polu e-mail',
      phonePlaceholder: 'Formularz: podpowiedź w polu telefon',
      sendEnquiry: 'Formularz: przycisk wysyłania',
    },
  },
  stock: {
    title: 'Dostępne od ręki',
    tab: 'stock',
    fields: {
      viewAll: 'Link do wszystkich (strona główna)',
      enquire: 'Przycisk zapytania na kafelku',
      moreInfo: 'Link „więcej” na kafelku',
      exTax: 'Oznaczenie ceny netto',
      taxPaid: 'Oznaczenie ceny z podatkiem',
      page: {
        title: 'Strona egzemplarza',
        fields: {
          backToList: 'Link powrotu do listy',
          keyNumbers: {
            title: 'Najważniejsze liczby',
            fields: {
              price: 'Cena',
              year: 'Rocznik',
              length: 'Długość',
              hours: 'Motogodziny',
              location: 'Lokalizacja',
            },
          },
          enquireHeadingPrefix: 'Nagłówek formularza (przed nazwą jachtu)',
          brandLine: 'Nadtytuł nad nazwą jachtu',
          overviewLabel: 'Nadtytuł opisu egzemplarza',
        },
      },
    },
  },
  blogPage: {
    title: 'Blog',
    tab: 'blog',
    fields: {
      readMore: 'Link na kafelku wpisu',
      publishedLabel: 'Etykieta przy dacie publikacji',
      backToBlog: 'Link powrotu do listy',
      comingSoon: 'Komunikat, gdy w języku nie ma jeszcze wpisów',
      pagination: {
        title: 'Strony listy',
        fields: {
          label: 'Opis nawigacji stron (dla czytników ekranu)',
          newer: 'Link: nowsze',
          older: 'Link: starsze',
          page: 'Słowo „strona” (w tytule karty i dla czytników ekranu)',
        },
      },
    },
  },
  networkPage: {
    title: 'Sieć dealerska',
    tab: 'network',
    fields: {
      stats: {
        title: 'Liczby na górze strony',
        fields: {
          brands: 'Marki',
          dealers: 'Dealerzy',
          countries: 'Kraje',
          continents: 'Kontynenty',
        },
      },
      regions: {
        title: 'Regiony',
        fields: {
          europe: 'Europa',
          'north-america': 'Ameryka Północna',
          'south-america': 'Ameryka Południowa',
          asia: 'Azja i Bliski Wschód',
          africa: 'Afryka',
          oceania: 'Oceania',
          other: 'Inne',
        },
      },
      explorer: {
        title: 'Mapa i lista dealerów',
        fields: {
          filters: {
            title: 'Filtry',
            fields: {
              title: 'Nagłówek',
              reset: 'Przycisk: wyczyść',
              brands: 'Etykieta: marka',
              allBrands: 'Opcja: wszystkie marki',
              region: 'Etykieta: region',
              allRegions: 'Opcja: wszystkie regiony',
              viewList: { title: 'Przycisk: pokaż listę (telefon)', placeholders: ['{n}'] },
            },
          },
          list: {
            title: 'Lista',
            fields: {
              title: 'Nagłówek',
              found: { title: 'Liczba znalezionych', placeholders: ['{n}'] },
              sortBy: 'Etykieta: sortuj',
              sortCountry: 'Sortowanie: kraj',
              sortName: 'Sortowanie: nazwa',
              sortNearest: 'Sortowanie: najbliżej',
              authorised: 'Oznaczenie autoryzowanego dealera',
              viewDetails: 'Link: szczegóły',
              loadMore: 'Przycisk: pokaż więcej',
              noResults: 'Komunikat: brak wyników',
            },
          },
          map: {
            title: 'Mapa',
            fields: {
              containerLabel: 'Opis mapy (dla czytników ekranu)',
              useLocation: 'Przycisk: użyj mojej lokalizacji',
              locating: 'Komunikat: ustalanie lokalizacji',
              located: { title: 'Komunikat: lokalizacja ustalona', placeholders: ['{country}'] },
              denied: 'Komunikat: lokalizacja wyłączona',
              tapToExplore: 'Podpowiedź na telefonie: dotknij, aby przeglądać',
              zoomIn: 'Przycisk: przybliż',
              zoomOut: 'Przycisk: oddal',
            },
          },
        },
      },
      countryPage: {
        title: 'Strona kraju',
        fields: {
          breadcrumb: 'Ścieżka nad nagłówkiem',
          locationCount: { title: 'Liczba lokalizacji i marek', placeholders: ['{n}', '{b}'] },
          enquireCta: 'Przycisk zapytania',
          enquireInCountry: { title: 'Przycisk zapytania w kraju', placeholders: ['{country}'] },
          brandsCarried: 'Nagłówek: dostępne marki',
          seaTrials: 'Informacja o jazdach próbnych',
          mapLabel: 'Nadtytuł mapy',
          backToNetwork: 'Link powrotu',
        },
      },
    },
  },
  lead: {
    title: 'Formularz zapytania',
    description: 'Formularz na stronie głównej, stronach marek i usług.',
    tab: 'forms',
    fields: {
      cta: 'Przycisk wysyłania',
      namePlaceholder: 'Podpowiedź w polu: imię',
      contactPlaceholder: 'Podpowiedź w polu: e-mail lub telefon',
      modelPlaceholder: 'Podpowiedź w polu: model',
      messagePlaceholder: 'Podpowiedź w polu: wiadomość',
      orCall: 'Tekst przed numerem telefonu',
    },
  },
};

/** Sanity field names cannot contain "-" (`grand-tourer` → `grandTourer`). */
export function toFieldName(key: string): string {
  return key.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
}

export function isGroup(spec: string | LeafSpec | GroupSpec<unknown>): spec is GroupSpec<unknown> {
  return typeof spec === 'object' && 'fields' in spec;
}

export function leaf(spec: string | LeafSpec): LeafSpec {
  return typeof spec === 'string' ? { title: spec } : spec;
}
