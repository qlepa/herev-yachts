import type { Locale } from './i18n';
import type { CategoryKey } from '../content.config';

export interface NavStrings {
  yachts: string;
  brands: string;
  services: string;
  network: string;
  blog: string;
  enquire: string;
  call: string;
}

export interface Translations {
  meta: { title: string; description: string };
  nav: NavStrings;
  hero: {
    eyebrow: string;
    heading: string;
    subtext: string;
    cta1: string;
    cta2: string;
  };
  intro: {
    eyebrow: string;
    heading: string;
    body: string;
    statLabels: { ateliers: string; years: string; relationship: string };
  };
  fleet: {
    eyebrow: string;
    heading: string;
    subheading: string;
    viewAll: string;
    enquire: string;
  };
  categories: Record<CategoryKey, string>;
  advisory: {
    eyebrow: string;
    heading: string;
    steps: Array<{ number: string; title: string; body: string }>;
  };
  lead: {
    eyebrow: string;
    heading: string;
    subtext: string;
    cta: string;
    namePlaceholder: string;
    contactPlaceholder: string;
    modelPlaceholder: string;
    messagePlaceholder: string;
    orCall: string;
    fallbackContact: string;
  };
  network: {
    eyebrow: string;
    heading: string;
    body: string;
    locations: string;
    brands: string;
    countries: string;
    berths: string;
    years: string;
    linkLabel: string;
    imageCaption: string;
  };
  footer: {
    legal: string;
  };
  brandsPage: {
    heading: string;
    subheading: string;
    viewLabel: string;
  };
  brandPage: {
    fleetHeading: string;
    fleetSubheading: string;
    enquireCta: string;
    viewAllLabel: string;
  };
  yachtsPage: {
    heading: string;
    subheading: string;
    filter: {
      refine: string;
      typeLabel: string;
      marqueLabel: string;
      lengthLabel: string;
      searchPlaceholder: string;
      yachts: string;
      cabins: string;
      sortLengthLong: string;
      sortLengthShort: string;
      viewLabel: string;
      noResults: string;
    };
  };
  yachtPage: {
    enquireCta: string;
    bookViewingCta: string;
    keyNumbers: { length: string; cabins: string; speed: string; engines: string };
    anchorNav: { overview: string; gallery: string; deckPlans: string; specs: string; financing: string };
    overviewLabel: string;
    galleryHeading: string;
    galleryTitle: string;
    deckPlansHeading: string;
    deckPlansSubtitle: string;
    specsSubtitle: string;
    recommendedHeading: string;
    financing: { eyebrow: string; copy: string; cta: string };
    enquireHeadingPrefix: string;
    mobileCta: { enquire: string };
    recommendedEyebrow: string;
    viewAllLabel: string;
    leadEyebrow: string;
    financingCheckbox: string;
    privacyCheckbox: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
    sendEnquiry: string;
    specsGroups: { dimensions: string; accommodation: string; performance: string };
    specs: {
      length: string;
      beam: string;
      draft: string;
      cabins: string;
      berths: string;
      speed: string;
      year: string;
      brand: string;
      category: string;
      engines: string;
    };
  };
  servicesPage: {
    hero: { eyebrow: string; heading: string; subtext: string };
    advisory: { eyebrow: string; heading: string };
    steps: Array<{ number: string; title: string; body: string }>;
    cta: { heading: string };
  };
  notFound: {
    heading: string;
    subtext: string;
    backToHome: string;
  };
  blogPage: {
    eyebrow: string;
    heading: string;
    subheading: string;
    readMore: string;
    publishedLabel: string;
    backToBlog: string;
    comingSoon: string;
  };
  networkPage: {
    hero: { eyebrow: string; heading: string; subtext: string };
    strip: { neutral: string; neutralCta: string };
    howItWorks: {
      eyebrow: string;
      heading: string;
      steps: Array<{ no: string; title: string; body: string }>;
    };
    directory: { eyebrow: string; heading: string; viewAll: string };
    cta: { eyebrow: string; heading: string; subtext: string; ctaLabel: string };
    countryPage: {
      breadcrumb: string;
      locationCount: string;
      enquireCta: string;
      enquireInCountry: string;
      brandsCarried: string;
      seaTrials: string;
      mapLabel: string;
      backToNetwork: string;
    };
    mapAria: {
      containerLabel: string;
      closePanel: string;
      useLocation: string;
      locating: string;
      located: string;
      denied: string;
      tapToExplore: string;
      jumpToCountry: string;
      enquireAtShowroom: string;
      seaTrialsNote: string;
    };
  };
}

const en: Translations = {
  meta: {
    title: 'Herev — Premium Yacht Representation',
    description:
      'Authorised representation for Galeon, Parker, Saxdor, De Antonio and Chris-Craft. Find your yacht across our network of showrooms.',
  },
  nav: {
    yachts: 'Yachts',
    brands: 'Brands',
    services: 'Services',
    network: 'Our Network',
    blog: 'Blog',
    enquire: 'Enquire',
    call: 'Call',
  },
  hero: {
    eyebrow: 'AUTHORISED REPRESENTATION · FIVE ATELIERS',
    heading: 'The sea, on your terms.',
    subtext:
      "We represent five of the world's most considered yacht builders — each chosen for a different reason, all sharing an uncommon standard of finish.",
    cta1: 'Explore by brand',
    cta2: 'Find by length',
  },
  intro: {
    eyebrow: 'ABOUT HEREV',
    heading: 'Five ateliers. One exacting standard.',
    body: "We represent five of the world's most considered motor-yacht ateliers — each chosen for a different reason, all held to one standard of build. No marketplace noise; a single, trusted introduction to the boat that is yours.",
    statLabels: { ateliers: 'ATELIERS', years: 'YEARS', relationship: 'RELATIONSHIP' },
  },
  fleet: {
    eyebrow: 'FEATURED FLEET · MMXXVI',
    heading: 'A short, deliberate selection.',
    subheading:
      'Five builders. One standard. Every vessel chosen because nothing else performs its role as well.',
    viewAll: 'VIEW ALL MODELS →',
    enquire: 'Enquire →',
  },
  categories: {
    flybridge: 'FLYBRIDGE CRUISER',
    hardtop: 'HARDTOP CRUISER',
    open: 'OPEN DECK',
    weekender: 'WEEKENDER · OUTBOARD',
    day: 'DAY BOAT',
    'grand-tourer': 'GRAND TOURER',
    runabout: 'CLASSIC RUNABOUT',
  },
  advisory: {
    eyebrow: 'HOW HEREV HELPS YOU BUY',
    heading: 'Not a marketplace. A considered introduction.',
    steps: [
      {
        number: '01',
        title: 'A brief conversation',
        body: 'We listen first: your habits on the water, the kind of anchorage you seek, the people you take. Everything else follows from that.',
      },
      {
        number: '02',
        title: 'A curated proposal',
        body: 'From five ateliers — Galeon, Parker, Saxdor, De Antonio, Chris-Craft — we propose the two or three models that genuinely fit. No catalogue, no noise.',
      },
      {
        number: '03',
        title: 'A personal introduction',
        body: 'We arrange a sea trial with the right marque, in the right port. You meet the builder; we stay beside you until the keys are in your hand.',
      },
    ],
  },
  lead: {
    eyebrow: 'A WARM INTRODUCTION · NO OBLIGATION',
    heading: 'Speak with an advisor.',
    subtext:
      'Tell us a little about what you have in mind. We will come back within one working day — no sales calls, no pressure.',
    cta: 'Send enquiry →',
    namePlaceholder: 'Your name',
    contactPlaceholder: 'Email or phone',
    modelPlaceholder: 'Model of interest (optional)',
    messagePlaceholder: 'A few words about your plans on the water…',
    orCall: 'or call us directly',
    fallbackContact: 'info@herev.com',
  },
  network: {
    eyebrow: 'OUR NETWORK',
    heading: 'Authorised presence across key sailing waters.',
    body: 'Our showrooms are positioned where yachts are used, not just sold. Each location is an authorised point of service for the marques it carries.',
    locations: 'LOCATIONS',
    brands: 'BRANDS',
    countries: 'COUNTRIES',
    berths: 'BERTHS',
    years: 'YEARS',
    linkLabel: 'VIEW FULL NETWORK →',
    imageCaption: 'WARSAW · GDYNIA · PALMA',
  },
  footer: {
    legal: '© MMXXVI HEREV · LEGAL · PRIVACY · COOKIES',
  },
  brandsPage: {
    heading: 'Five ateliers. One standard.',
    subheading:
      'Each brand chosen for a distinct reason — together they cover every serious category of modern yacht ownership.',
    viewLabel: 'View collection →',
  },
  brandPage: {
    fleetHeading: 'The range.',
    fleetSubheading: 'Every model in our current selection.',
    enquireCta: 'Enquire',
    viewAllLabel: 'VIEW ALL MODELS →',
  },
  yachtsPage: {
    heading: 'The full collection.',
    subheading:
      'Every vessel we represent — five builders, one considered standard.',
    filter: {
      refine: 'REFINE',
      typeLabel: 'TYPE',
      marqueLabel: 'MARQUE',
      lengthLabel: 'LENGTH OVERALL',
      searchPlaceholder: 'Search a model — e.g. 500 FLY',
      yachts: 'yachts',
      cabins: 'cabins',
      sortLengthLong: 'Length · longest first',
      sortLengthShort: 'Length · shortest first',
      viewLabel: 'View →',
      noResults: 'No yachts match your filters.',
    },
  },
  yachtPage: {
    enquireCta: 'Enquire about this yacht →',
    bookViewingCta: 'Book a private viewing',
    keyNumbers: {
      length: 'LENGTH OVERALL',
      cabins: 'CABINS',
      speed: 'MAX SPEED',
      engines: 'ENGINES',
    },
    anchorNav: {
      overview: 'Overview',
      gallery: 'Gallery',
      deckPlans: 'Deck Plans',
      specs: 'Specification',
      financing: 'Financing',
    },
    overviewLabel: 'WHO IT\'S FOR',
    galleryHeading: 'GALLERY',
    galleryTitle: 'Aboard the',
    deckPlansHeading: 'DECK PLANS',
    deckPlansSubtitle: 'Three decks, arranged for real life',
    specsSubtitle: 'The full measure',
    recommendedHeading: 'You might also consider',
    financing: {
      eyebrow: 'LEASING · CREDIT · CHARTER INVESTMENT',
      copy: 'There are several sensible ways to own this yacht — from marine leasing to charter-management that puts her to work when you\'re ashore. We\'ll walk you through the options that fit.',
      cta: 'Ask about financing →',
    },
    enquireHeadingPrefix: 'Enquire about the',
    mobileCta: { enquire: 'Enquire' },
    recommendedEyebrow: 'YOU MIGHT ALSO CONSIDER',
    viewAllLabel: 'VIEW ALL YACHTS →',
    leadEyebrow: 'NO OBLIGATION',
    financingCheckbox: 'I\'m interested in financing options',
    privacyCheckbox: 'I agree to be contacted by Herev regarding this enquiry and accept the privacy policy.',
    emailPlaceholder: 'Email',
    phonePlaceholder: 'Phone',
    sendEnquiry: 'Send enquiry →',
    specsGroups: {
      dimensions: 'DIMENSIONS',
      accommodation: 'ACCOMMODATION',
      performance: 'PERFORMANCE',
    },
    specs: {
      length: 'Length',
      beam: 'Beam',
      draft: 'Draft',
      cabins: 'Cabins',
      berths: 'Berths',
      speed: 'Max speed',
      year: 'Model year',
      brand: 'Brand',
      category: 'Category',
      engines: 'Engines',
    },
  },
  servicesPage: {
    hero: {
      eyebrow: 'PRIVATE YACHT REPRESENTATION',
      heading: 'From first enquiry to sea trial.',
      subtext:
        'We act as a single point of contact for five of the most considered yacht builders in the world — translating complex decisions into clear choices.',
    },
    advisory: {
      eyebrow: 'WHAT WE DO',
      heading: 'A complete introduction to ownership.',
    },
    steps: [
      {
        number: '01',
        title: 'Brand introductions',
        body: 'We introduce you to each atelier on their own terms — the history, the engineering philosophy, and the models that define them. No sales pressure; just context.',
      },
      {
        number: '02',
        title: 'Private viewings',
        body: 'We arrange access to vessels at our showrooms in Warsaw, Gdynia, and Palma. Sea trials are coordinated directly with the builder\'s delivery team.',
      },
      {
        number: '03',
        title: 'Acquisition support',
        body: 'From specification review to delivery logistics, we stay involved until the vessel is in your hands. After-sales introductions included with every purchase.',
      },
      {
        number: '04',
        title: 'After-sales care',
        body: 'We maintain the relationship after the handover — connecting you with the builder\'s service network and flagging relevant model updates or upgrades as they become available.',
      },
    ],
    cta: {
      heading: 'Begin the conversation.',
    },
  },
  notFound: {
    heading: 'Page not found.',
    subtext: 'The page you are looking for does not exist or has been moved.',
    backToHome: 'Return home',
  },
  blogPage: {
    eyebrow: 'HEREV JOURNAL',
    heading: 'The Journal.',
    subheading: 'Considered writing on yacht ownership, sea life, and the builders we represent.',
    readMore: 'Read →',
    publishedLabel: 'PUBLISHED',
    backToBlog: '← Back to journal',
    comingSoon: 'New articles coming soon.',
  },
  networkPage: {
    hero: {
      eyebrow: 'AUTHORISED REPRESENTATION · WORLDWIDE',
      heading: 'Our Network',
      subtext: 'Wherever you berth, an official dealer is already close. One relationship, five marques, a presence that spans the map.',
    },
    strip: {
      neutral: 'A global network of official dealers',
      neutralCta: 'Browse directory →',
    },
    howItWorks: {
      eyebrow: 'HOW THE NETWORK WORKS',
      heading: 'One enquiry. The right official dealer. A reply within the day.',
      steps: [
        { no: '01', title: 'Enquire online', body: 'Send one enquiry through Herev — about a model, or simply to find who is nearest to your berth.' },
        { no: '02', title: 'We route you to the official dealer', body: 'Your enquiry goes to the authorised dealer for your country and marque — never a call centre, never resold.' },
        { no: '03', title: 'Contact within 24 hours', body: 'A named specialist replies personally, usually the same day, to arrange a viewing or sea trial.' },
      ],
    },
    directory: {
      eyebrow: 'DIRECTORY',
      heading: 'Find the network by country',
      viewAll: 'VIEW ALL COUNTRIES →',
    },
    cta: {
      eyebrow: 'NO SHOWROOM NEARBY?',
      heading: "Can't find a showroom near you?",
      subtext: "Tell us where you berth. We'll connect you with the nearest official dealer — and travel to you when it matters.",
      ctaLabel: 'Speak with an advisor →',
    },
    countryPage: {
      breadcrumb: 'OUR NETWORK',
      locationCount: '{n} OFFICIAL LOCATIONS · {b} BRANDS',
      enquireCta: 'Enquire →',
      enquireInCountry: 'Enquire in {country} →',
      brandsCarried: 'BRANDS CARRIED',
      seaTrials: 'SEA TRIALS ARRANGED ON REQUEST',
      mapLabel: 'COVERAGE MAP',
      backToNetwork: '← Back to network',
    },
    mapAria: {
      containerLabel: 'Dealer network map',
      closePanel: 'Close showroom panel',
      useLocation: 'Use my location',
      locating: 'Locating…',
      located: 'Located · {country}',
      denied: 'Location off',
      tapToExplore: 'TAP TO EXPLORE THE MAP',
      jumpToCountry: 'JUMP TO COUNTRY',
      enquireAtShowroom: 'Enquire at this showroom →',
      seaTrialsNote: 'SEA TRIALS ARRANGED ON REQUEST',
    },
  },
};

const pl: Translations = {
  meta: {
    title: 'Herev — Reprezentacja Premium Jachtów',
    description:
      'Autoryzowana reprezentacja Galeon, Parker, Saxdor, De Antonio i Chris-Craft. Znajdź swój jacht w naszej sieci salonów.',
  },
  nav: {
    yachts: 'Jachty',
    brands: 'Marki',
    services: 'Usługi',
    network: 'Nasza Sieć',
    blog: 'Blog',
    enquire: 'Zapytaj',
    call: 'Zadzwoń',
  },
  hero: {
    eyebrow: 'AUTORYZOWANA REPREZENTACJA · PIĘĆ ATELIER',
    heading: 'Morze, na Twoich zasadach.',
    subtext:
      'Reprezentujemy pięciu najbardziej przemyślanych producentów jachtów na świecie — każdego z innego powodu, wszystkich łączy wyjątkowy standard wykończenia.',
    cta1: 'Odkryj według marki',
    cta2: 'Szukaj według długości',
  },
  intro: {
    eyebrow: 'O HEREV',
    heading: 'Pięć atelier. Jeden wymagający standard.',
    body: 'Reprezentujemy pięć najbardziej przemyślanych atelier jachtów motorowych na świecie — każde wybrane z innego powodu, wszystkie spełniające jeden standard wykonania. Żadnego rynkowego szumu; jedno, zaufane wprowadzenie do jachtu, który jest Twój.',
    statLabels: { ateliers: 'ATELIER', years: 'LAT', relationship: 'RELACJA' },
  },
  fleet: {
    eyebrow: 'WYBRANA FLOTA · MMXXVI',
    heading: 'Krótka, przemyślana selekcja.',
    subheading:
      'Pięciu producentów. Jeden standard. Każda jednostka wybrana dlatego, że nic innego nie spełnia swojej roli równie dobrze.',
    viewAll: 'WSZYSTKIE MODELE →',
    enquire: 'Zapytaj →',
  },
  categories: {
    flybridge: 'KRĄŻOWNIK FLYBRIDGE',
    hardtop: 'KRĄŻOWNIK HARDTOP',
    open: 'OTWARTY POKŁAD',
    weekender: 'WEEKENDER · ZABURTOWY',
    day: 'ŁÓDŹ DZIENNA',
    'grand-tourer': 'GRAND TOURER',
    runabout: 'KLASYCZNY RUNABOUT',
  },
  advisory: {
    eyebrow: 'JAK HEREV POMAGA KUPIĆ',
    heading: 'Nie marketplace. Przemyślana rekomendacja.',
    steps: [
      {
        number: '01',
        title: 'Krótka rozmowa',
        body: 'Najpierw słuchamy: Twoje nawyki na wodzie, rodzaj kotwicowiska, które szukasz, ludzie, których zabierasz. Reszta z tego wynika.',
      },
      {
        number: '02',
        title: 'Dopasowana propozycja',
        body: 'Spośród pięciu atelier — Galeon, Parker, Saxdor, De Antonio, Chris-Craft — proponujemy dwa lub trzy modele, które naprawdę pasują. Bez katalogu, bez szumu.',
      },
      {
        number: '03',
        title: 'Osobiste wprowadzenie',
        body: 'Organizujemy rejsy próbne z odpowiednią marką, w odpowiednim porcie. Poznajesz producenta; pozostajemy przy Tobie aż klucze znajdą się w Twoich rękach.',
      },
    ],
  },
  lead: {
    eyebrow: 'CIEPŁE WPROWADZENIE · BEZ ZOBOWIĄZAŃ',
    heading: 'Porozmawiaj z doradcą.',
    subtext:
      'Powiedz nam trochę o tym, co masz na myśli. Odezwiemy się w ciągu jednego dnia roboczego — bez telefonów sprzedażowych, bez presji.',
    cta: 'Wyślij zapytanie →',
    namePlaceholder: 'Twoje imię i nazwisko',
    contactPlaceholder: 'Email lub telefon',
    modelPlaceholder: 'Model, który Cię interesuje (opcjonalnie)',
    messagePlaceholder: 'Kilka słów o Twoich planach na wodzie…',
    orCall: 'lub zadzwoń do nas bezpośrednio',
    fallbackContact: 'info@herev.com',
  },
  network: {
    eyebrow: 'NASZA SIEĆ',
    heading: 'Autoryzowana obecność na kluczowych akwenach.',
    body: 'Nasze salony są tam, gdzie jachty są użytkowane, nie tylko sprzedawane. Każda lokalizacja to autoryzowany punkt serwisowy dla marek, które reprezentuje.',
    locations: 'SALONY',
    brands: 'MARKI',
    countries: 'KRAJE',
    berths: 'MIEJSCA CUMOWANIA',
    years: 'LAT',
    linkLabel: 'PEŁNA SIEĆ →',
    imageCaption: 'WARSZAWA · GDYNIA · PALMA',
  },
  footer: {
    legal: '© MMXXVI HEREV · INFORMACJE PRAWNE · PRYWATNOŚĆ · COOKIES',
  },
  brandsPage: {
    heading: 'Pięć atelier. Jeden standard.',
    subheading:
      'Każda marka wybrana z osobnego powodu — razem obejmują każdą poważną kategorię współczesnej własności jachtu.',
    viewLabel: 'Zobacz kolekcję →',
  },
  brandPage: {
    fleetHeading: 'Zakres modeli.',
    fleetSubheading: 'Każdy model z naszej aktualnej selekcji.',
    enquireCta: 'Zapytaj',
    viewAllLabel: 'WSZYSTKIE MODELE →',
  },
  yachtsPage: {
    heading: 'Pełna kolekcja.',
    subheading:
      'Każda jednostka, którą reprezentujemy — pięciu producentów, jeden przemyślany standard.',
    filter: {
      refine: 'FILTRUJ',
      typeLabel: 'TYP',
      marqueLabel: 'MARKA',
      lengthLabel: 'DŁUGOŚĆ',
      searchPlaceholder: 'Szukaj modelu — np. 500 FLY',
      yachts: 'jachtów',
      cabins: 'kabin',
      sortLengthLong: 'Długość · najdłuższe pierwsze',
      sortLengthShort: 'Długość · najkrótsze pierwsze',
      viewLabel: 'Zobacz →',
      noResults: 'Brak jachtów spełniających kryteria.',
    },
  },
  yachtPage: {
    enquireCta: 'Zapytaj o ten jacht →',
    bookViewingCta: 'Umów prywatne oglądanie',
    keyNumbers: {
      length: 'DŁUGOŚĆ CAŁKOWITA',
      cabins: 'KABINY',
      speed: 'MAKS. PRĘDKOŚĆ',
      engines: 'SILNIKI',
    },
    anchorNav: {
      overview: 'Przegląd',
      gallery: 'Galeria',
      deckPlans: 'Plany pokładu',
      specs: 'Specyfikacja',
      financing: 'Finansowanie',
    },
    overviewLabel: 'DLA KOGO',
    galleryHeading: 'GALERIA',
    galleryTitle: 'Na pokładzie',
    deckPlansHeading: 'PLANY POKŁADU',
    deckPlansSubtitle: 'Trzy pokłady, zaplanowane na życie',
    specsSubtitle: 'Pełny wymiar',
    recommendedHeading: 'Możesz również rozważyć',
    financing: {
      eyebrow: 'LEASING · KREDYT · INWESTYCJA CZARTEROWA',
      copy: 'Jest kilka rozsądnych sposobów na posiadanie tego jachtu — od leasingu morskiego po zarządzanie czarterowe, które sprawia, że pracuje, gdy ty jesteś na lądzie. Przeprowadzimy cię przez opcje, które pasują.',
      cta: 'Zapytaj o finansowanie →',
    },
    enquireHeadingPrefix: 'Zapytaj o',
    mobileCta: { enquire: 'Zapytaj' },
    recommendedEyebrow: 'MOŻE CIĘ ZAINTERESOWAĆ',
    viewAllLabel: 'WSZYSTKIE JACHTY →',
    leadEyebrow: 'BEZ ZOBOWIĄZAŃ',
    financingCheckbox: 'Interesuje mnie finansowanie',
    privacyCheckbox: 'Wyrażam zgodę na kontakt ze strony Herev w sprawie tego zapytania i akceptuję politykę prywatności.',
    emailPlaceholder: 'Email',
    phonePlaceholder: 'Telefon',
    sendEnquiry: 'Wyślij zapytanie →',
    specsGroups: {
      dimensions: 'WYMIARY',
      accommodation: 'ZAKWATEROWANIE',
      performance: 'OSIĄGI',
    },
    specs: {
      length: 'Długość',
      beam: 'Szerokość',
      draft: 'Zanurzenie',
      cabins: 'Kabiny',
      berths: 'Miejsca noclegowe',
      speed: 'Maks. prędkość',
      year: 'Rok modelowy',
      brand: 'Marka',
      category: 'Kategoria',
      engines: 'Silniki',
    },
  },
  servicesPage: {
    hero: {
      eyebrow: 'PRYWATNA REPREZENTACJA JACHTÓW',
      heading: 'Od pierwszego zapytania do rejsu próbnego.',
      subtext:
        'Jesteśmy jednym punktem kontaktu dla pięciu najbardziej przemyślanych producentów jachtów na świecie — przekształcamy złożone decyzje w jasne wybory.',
    },
    advisory: {
      eyebrow: 'CO ROBIMY',
      heading: 'Pełne wprowadzenie do własności jachtu.',
    },
    steps: [
      {
        number: '01',
        title: 'Prezentacja marek',
        body: 'Przedstawiamy Ci każde atelier na jego własnych warunkach — historię, filozofię inżynieryjną i modele, które je definiują. Bez presji sprzedażowej; tylko kontekst.',
      },
      {
        number: '02',
        title: 'Prywatne oglądanie',
        body: 'Organizujemy dostęp do jednostek w naszych salonach w Warszawie, Gdyni i Palmie. Rejsy próbne są koordynowane bezpośrednio z zespołem dostawczym producenta.',
      },
      {
        number: '03',
        title: 'Wsparcie przy zakupie',
        body: 'Od przeglądu specyfikacji po logistykę dostawy — pozostajemy zaangażowani, aż jednostka znajdzie się w Twoich rękach. Wprowadzenie do serwisu po sprzedaży przy każdym zakupie.',
      },
      {
        number: '04',
        title: 'Opieka posprzedażna',
        body: 'Utrzymujemy relację po przekazaniu jachtu — łącząc Cię z siecią serwisową producenta i informując o odpowiednich aktualizacjach lub ulepszeniach modeli.',
      },
    ],
    cta: {
      heading: 'Rozpocznij rozmowę.',
    },
  },
  notFound: {
    heading: 'Strona nie znaleziona.',
    subtext: 'Strona, której szukasz, nie istnieje lub została przeniesiona.',
    backToHome: 'Wróć do strony głównej',
  },
  blogPage: {
    eyebrow: 'DZIENNIK HEREV',
    heading: 'Dziennik.',
    subheading: 'Przemyślane teksty o własności jachtu, życiu na morzu i producentach, których reprezentujemy.',
    readMore: 'Czytaj →',
    publishedLabel: 'OPUBLIKOWANO',
    backToBlog: '← Wróć do dziennika',
    comingSoon: 'Nowe artykuły wkrótce.',
  },
  networkPage: {
    hero: {
      eyebrow: 'AUTORYZOWANA REPREZENTACJA · ŚWIAT',
      heading: 'Nasza Sieć',
      subtext: 'Gdziekolwiek cumujeszku, oficjalny dealer jest już w pobliżu. Jedna relacja, pięć marek, obecność na całym świecie.',
    },
    strip: {
      neutral: 'Globalna sieć oficjalnych dealerów',
      neutralCta: 'Przeglądaj katalog →',
    },
    howItWorks: {
      eyebrow: 'JAK DZIAŁA SIEĆ',
      heading: 'Jedno zapytanie. Właściwy oficjalny dealer. Odpowiedź w ciągu dnia.',
      steps: [
        { no: '01', title: 'Wyślij zapytanie', body: 'Wyślij jedno zapytanie przez Herev — o konkretny model lub po prostu, żeby znaleźć najbliższe stoisko.' },
        { no: '02', title: 'Kierujemy cię do oficjalnego dealera', body: 'Twoje zapytanie trafia do autoryzowanego dealera dla twojego kraju i marki — nigdy do call center, nigdy dalej.' },
        { no: '03', title: 'Kontakt w ciągu 24 godzin', body: 'Nazwany specjalista odpowiada osobiście, zazwyczaj tego samego dnia, aby umówić oglądanie lub rejs próbny.' },
      ],
    },
    directory: {
      eyebrow: 'KATALOG',
      heading: 'Znajdź sieć według kraju',
      viewAll: 'WSZYSTKIE KRAJE →',
    },
    cta: {
      eyebrow: 'BRAK SALONU W POBLIŻU?',
      heading: 'Nie możesz znaleźć salonu w pobliżu?',
      subtext: 'Powiedz nam, gdzie cumujesz. Połączymy cię z najbliższym oficjalnym dealerem — i przyjedziemy do ciebie, gdy to ważne.',
      ctaLabel: 'Porozmawiaj z doradcą →',
    },
    countryPage: {
      breadcrumb: 'NASZA SIEĆ',
      locationCount: '{n} OFICJALNE LOKALIZACJE · {b} MARKI',
      enquireCta: 'Zapytaj →',
      enquireInCountry: 'Zapytaj w {country} →',
      brandsCarried: 'DOSTĘPNE MARKI',
      seaTrials: 'REJSY PRÓBNE NA ŻYCZENIE',
      mapLabel: 'MAPA ZASIĘGU',
      backToNetwork: '← Wróć do sieci',
    },
    mapAria: {
      containerLabel: 'Mapa sieci dealerów',
      closePanel: 'Zamknij panel salonu',
      useLocation: 'Użyj mojej lokalizacji',
      locating: 'Lokalizowanie…',
      located: 'Znaleziono · {country}',
      denied: 'Lokalizacja wyłączona',
      tapToExplore: 'DOTKNIJ, ABY EKSPLOROWAĆ MAPĘ',
      jumpToCountry: 'PRZEJDŹ DO KRAJU',
      enquireAtShowroom: 'Zapytaj w tym salonie →',
      seaTrialsNote: 'REJSY PRÓBNE NA ŻYCZENIE',
    },
  },
};

const es: Translations = {
  meta: {
    title: 'Herev — Representación Premium de Yates',
    description:
      'Representación autorizada de Galeon, Parker, Saxdor, De Antonio y Chris-Craft. Encuentra tu yate en nuestra red de concesionarios.',
  },
  nav: {
    yachts: 'Yates',
    brands: 'Marcas',
    services: 'Servicios',
    network: 'Nuestra Red',
    blog: 'Blog',
    enquire: 'Consultar',
    call: 'Llamar',
  },
  hero: {
    eyebrow: 'REPRESENTACIÓN AUTORIZADA · CINCO ATELIERS',
    heading: 'El mar, en tus términos.',
    subtext:
      'Representamos a cinco de los constructores de yates más reflexivos del mundo — cada uno elegido por una razón diferente, todos compartiendo un estándar de acabado poco común.',
    cta1: 'Explorar por marca',
    cta2: 'Buscar por eslora',
  },
  intro: {
    eyebrow: 'SOBRE HEREV',
    heading: 'Cinco ateliers. Un estándar exigente.',
    body: 'Representamos cinco de los ateliers de yates a motor más reflexivos del mundo — cada uno elegido por una razón diferente, todos mantenidos según un mismo estándar de construcción. Sin ruido de mercado; una única introducción de confianza al barco que es tuyo.',
    statLabels: { ateliers: 'ATELIERS', years: 'AÑOS', relationship: 'RELACIÓN' },
  },
  fleet: {
    eyebrow: 'FLOTA DESTACADA · MMXXVI',
    heading: 'Una selección breve y deliberada.',
    subheading:
      'Cinco constructores. Un estándar. Cada embarcación elegida porque nada más cumple su función igual de bien.',
    viewAll: 'VER TODOS LOS MODELOS →',
    enquire: 'Consultar →',
  },
  categories: {
    flybridge: 'CRUCERO FLYBRIDGE',
    hardtop: 'CRUCERO HARDTOP',
    open: 'CUBIERTA ABIERTA',
    weekender: 'WEEKENDER · FUERA BORDA',
    day: 'EMBARCACIÓN DE DÍA',
    'grand-tourer': 'GRAN TURISMO',
    runabout: 'RUNABOUT CLÁSICO',
  },
  advisory: {
    eyebrow: 'CÓMO TE AYUDA HEREV A COMPRAR',
    heading: 'No un marketplace. Una introducción reflexiva.',
    steps: [
      {
        number: '01',
        title: 'Una breve conversación',
        body: 'Primero escuchamos: tus hábitos en el agua, el tipo de fondeo que buscas, las personas que llevas. Todo lo demás se deduce de ahí.',
      },
      {
        number: '02',
        title: 'Una propuesta curada',
        body: 'De cinco ateliers — Galeon, Parker, Saxdor, De Antonio, Chris-Craft — proponemos los dos o tres modelos que realmente encajan. Sin catálogo, sin ruido.',
      },
      {
        number: '03',
        title: 'Una introducción personal',
        body: 'Organizamos una prueba de mar con la marca adecuada, en el puerto adecuado. Conoces al constructor; permanecemos a tu lado hasta que las llaves estén en tu mano.',
      },
    ],
  },
  lead: {
    eyebrow: 'UNA INTRODUCCIÓN CORDIAL · SIN COMPROMISO',
    heading: 'Habla con un asesor.',
    subtext:
      'Cuéntanos un poco sobre lo que tienes en mente. Te responderemos en un día hábil — sin llamadas de ventas, sin presión.',
    cta: 'Enviar consulta →',
    namePlaceholder: 'Tu nombre',
    contactPlaceholder: 'Email o teléfono',
    modelPlaceholder: 'Modelo de interés (opcional)',
    messagePlaceholder: 'Unas palabras sobre tus planes en el agua…',
    orCall: 'o llámanos directamente',
    fallbackContact: 'info@herev.com',
  },
  network: {
    eyebrow: 'NUESTRA RED',
    heading: 'Presencia autorizada en aguas de navegación clave.',
    body: 'Nuestros concesionarios están donde se usan los yates, no solo donde se venden. Cada ubicación es un punto de servicio autorizado para las marcas que representa.',
    locations: 'UBICACIONES',
    brands: 'MARCAS',
    countries: 'PAÍSES',
    berths: 'AMARRES',
    years: 'AÑOS',
    linkLabel: 'VER RED COMPLETA →',
    imageCaption: 'VARSOVIA · GDYNIA · PALMA',
  },
  footer: {
    legal: '© MMXXVI HEREV · AVISO LEGAL · PRIVACIDAD · COOKIES',
  },
  brandsPage: {
    heading: 'Cinco ateliers. Un estándar.',
    subheading:
      'Cada marca elegida por una razón distinta — juntas cubren cada categoría seria de la propiedad moderna de yates.',
    viewLabel: 'Ver colección →',
  },
  brandPage: {
    fleetHeading: 'La gama.',
    fleetSubheading: 'Todos los modelos de nuestra selección actual.',
    enquireCta: 'Consultar',
    viewAllLabel: 'VER TODOS LOS MODELOS →',
  },
  yachtsPage: {
    heading: 'La colección completa.',
    subheading:
      'Todas las embarcaciones que representamos — cinco constructores, un estándar reflexivo.',
    filter: {
      refine: 'FILTRAR',
      typeLabel: 'TIPO',
      marqueLabel: 'MARCA',
      lengthLabel: 'ESLORA TOTAL',
      searchPlaceholder: 'Buscar modelo — p.ej. 500 FLY',
      yachts: 'yates',
      cabins: 'cabinas',
      sortLengthLong: 'Eslora · más larga primero',
      sortLengthShort: 'Eslora · más corta primero',
      viewLabel: 'Ver →',
      noResults: 'Ningún yate coincide con los filtros.',
    },
  },
  yachtPage: {
    enquireCta: 'Consultar sobre este yate →',
    bookViewingCta: 'Reservar una visita privada',
    keyNumbers: {
      length: 'ESLORA TOTAL',
      cabins: 'CABINAS',
      speed: 'VELOCIDAD MÁX.',
      engines: 'MOTORES',
    },
    anchorNav: {
      overview: 'Resumen',
      gallery: 'Galería',
      deckPlans: 'Planos de cubierta',
      specs: 'Especificación',
      financing: 'Financiación',
    },
    overviewLabel: 'PARA QUIÉN',
    galleryHeading: 'GALERÍA',
    galleryTitle: 'A bordo del',
    deckPlansHeading: 'PLANOS DE CUBIERTA',
    deckPlansSubtitle: 'Tres cubiertas, diseñadas para la vida real',
    specsSubtitle: 'La medida completa',
    recommendedHeading: 'También puede considerar',
    financing: {
      eyebrow: 'LEASING · CRÉDITO · INVERSIÓN EN CHARTER',
      copy: 'Hay varias formas razonables de poseer este yate — desde el leasing marítimo hasta la gestión de chárter que la pone a trabajar cuando usted está en tierra. Le guiaremos por las opciones que se adaptan.',
      cta: 'Preguntar sobre financiación →',
    },
    enquireHeadingPrefix: 'Consultar sobre el',
    mobileCta: { enquire: 'Consultar' },
    recommendedEyebrow: 'TAMBIÉN PUEDE CONSIDERAR',
    viewAllLabel: 'VER TODOS LOS YATES →',
    leadEyebrow: 'SIN COMPROMISO',
    financingCheckbox: 'Estoy interesado en opciones de financiación',
    privacyCheckbox: 'Acepto ser contactado por Herev sobre esta consulta y acepto la política de privacidad.',
    emailPlaceholder: 'Email',
    phonePlaceholder: 'Teléfono',
    sendEnquiry: 'Enviar consulta →',
    specsGroups: {
      dimensions: 'DIMENSIONES',
      accommodation: 'ALOJAMIENTO',
      performance: 'RENDIMIENTO',
    },
    specs: {
      length: 'Eslora',
      beam: 'Manga',
      draft: 'Calado',
      cabins: 'Cabinas',
      berths: 'Literas',
      speed: 'Velocidad máx.',
      year: 'Año del modelo',
      brand: 'Marca',
      category: 'Categoría',
      engines: 'Motores',
    },
  },
  servicesPage: {
    hero: {
      eyebrow: 'REPRESENTACIÓN PRIVADA DE YATES',
      heading: 'Desde la primera consulta hasta la prueba de mar.',
      subtext:
        'Somos el único punto de contacto para cinco de los constructores de yates más reflexivos del mundo — traduciendo decisiones complejas en elecciones claras.',
    },
    advisory: {
      eyebrow: 'LO QUE HACEMOS',
      heading: 'Una introducción completa a la propiedad.',
    },
    steps: [
      {
        number: '01',
        title: 'Presentaciones de marca',
        body: 'Te presentamos cada atelier en sus propios términos — la historia, la filosofía de ingeniería y los modelos que los definen. Sin presión de ventas; solo contexto.',
      },
      {
        number: '02',
        title: 'Visitas privadas',
        body: 'Organizamos el acceso a las embarcaciones en nuestros concesionarios de Varsovia, Gdynia y Palma. Las pruebas de mar se coordinan directamente con el equipo de entrega del constructor.',
      },
      {
        number: '03',
        title: 'Apoyo en la adquisición',
        body: 'Desde la revisión de especificaciones hasta la logística de entrega, permanecemos involucrados hasta que la embarcación esté en tus manos. Introducción al servicio postventa incluida en cada compra.',
      },
      {
        number: '04',
        title: 'Atención postventa',
        body: 'Mantenemos la relación después de la entrega — conectándote con la red de servicio del constructor y señalando actualizaciones o mejoras de modelos relevantes a medida que estén disponibles.',
      },
    ],
    cta: {
      heading: 'Comienza la conversación.',
    },
  },
  notFound: {
    heading: 'Página no encontrada.',
    subtext: 'La página que busca no existe o ha sido movida.',
    backToHome: 'Volver al inicio',
  },
  blogPage: {
    eyebrow: 'EL DIARIO HEREV',
    heading: 'El Diario.',
    subheading: 'Escritura reflexiva sobre la propiedad de yates, la vida en el mar y los constructores que representamos.',
    readMore: 'Leer →',
    publishedLabel: 'PUBLICADO',
    backToBlog: '← Volver al diario',
    comingSoon: 'Nuevos artículos próximamente.',
  },
  networkPage: {
    hero: {
      eyebrow: 'REPRESENTACIÓN AUTORIZADA · MUNDIAL',
      heading: 'Nuestra Red',
      subtext: 'Donde quiera que fondees, ya hay un concesionario oficial cerca. Una relación, cinco marcas, presencia en todo el mundo.',
    },
    strip: {
      neutral: 'Una red global de concesionarios oficiales',
      neutralCta: 'Explorar directorio →',
    },
    howItWorks: {
      eyebrow: 'CÓMO FUNCIONA LA RED',
      heading: 'Una consulta. El concesionario oficial correcto. Respuesta en el día.',
      steps: [
        { no: '01', title: 'Envía tu consulta', body: 'Envía una consulta a través de Herev — sobre un modelo, o simplemente para saber quién está más cerca de tu fondeadero.' },
        { no: '02', title: 'Te dirigimos al concesionario oficial', body: 'Tu consulta va al concesionario autorizado para tu país y marca — nunca a un call centre, nunca revendido.' },
        { no: '03', title: 'Contacto en 24 horas', body: 'Un especialista responde personalmente, generalmente el mismo día, para organizar una visita o prueba de mar.' },
      ],
    },
    directory: {
      eyebrow: 'DIRECTORIO',
      heading: 'Encuentra la red por país',
      viewAll: 'VER TODOS LOS PAÍSES →',
    },
    cta: {
      eyebrow: '¿SIN CONCESIONARIO CERCA?',
      heading: '¿No encuentras un concesionario cerca?',
      subtext: 'Dinos dónde fondeas. Te conectaremos con el concesionario oficial más cercano — y viajamos a ti cuando importa.',
      ctaLabel: 'Hablar con un asesor →',
    },
    countryPage: {
      breadcrumb: 'NUESTRA RED',
      locationCount: '{n} UBICACIONES OFICIALES · {b} MARCAS',
      enquireCta: 'Consultar →',
      enquireInCountry: 'Consultar en {country} →',
      brandsCarried: 'MARCAS DISPONIBLES',
      seaTrials: 'PRUEBAS DE MAR BAJO PETICIÓN',
      mapLabel: 'MAPA DE COBERTURA',
      backToNetwork: '← Volver a la red',
    },
    mapAria: {
      containerLabel: 'Mapa de la red de concesionarios',
      closePanel: 'Cerrar panel de concesionario',
      useLocation: 'Usar mi ubicación',
      locating: 'Localizando…',
      located: 'Ubicado · {country}',
      denied: 'Ubicación desactivada',
      tapToExplore: 'TOCA PARA EXPLORAR EL MAPA',
      jumpToCountry: 'IR A PAÍS',
      enquireAtShowroom: 'Consultar en este concesionario →',
      seaTrialsNote: 'PRUEBAS DE MAR BAJO PETICIÓN',
    },
  },
};

const it: Translations = {
  meta: {
    title: 'Herev — Rappresentanza Premium di Yacht',
    description:
      'Rappresentanza autorizzata di Galeon, Parker, Saxdor, De Antonio e Chris-Craft. Trova il tuo yacht nella nostra rete di concessionari.',
  },
  nav: {
    yachts: 'Yacht',
    brands: 'Marchi',
    services: 'Servizi',
    network: 'La Nostra Rete',
    blog: 'Blog',
    enquire: 'Richiedi',
    call: 'Chiama',
  },
  hero: {
    eyebrow: 'RAPPRESENTANZA AUTORIZZATA · CINQUE ATELIER',
    heading: 'Il mare, a modo tuo.',
    subtext:
      'Rappresentiamo cinque dei costruttori di yacht più attenti al mondo — ognuno scelto per una ragione diversa, tutti accomunati da uno standard di finitura fuori dal comune.',
    cta1: 'Esplora per marchio',
    cta2: 'Cerca per lunghezza',
  },
  intro: {
    eyebrow: 'CHI SIAMO',
    heading: 'Cinque atelier. Uno standard esigente.',
    body: "Rappresentiamo cinque dei più attenti atelier di yacht a motore al mondo — ciascuno scelto per una ragione diversa, tutti tenuti a uno standard costruttivo. Nessun rumore di mercato; un'unica, affidabile introduzione all'imbarcazione che è tua.",
    statLabels: { ateliers: 'ATELIER', years: 'ANNI', relationship: 'RELAZIONE' },
  },
  fleet: {
    eyebrow: 'FLOTTA IN EVIDENZA · MMXXVI',
    heading: 'Una selezione breve e deliberata.',
    subheading:
      'Cinque costruttori. Uno standard. Ogni imbarcazione scelta perché nient\'altro svolge il suo ruolo altrettanto bene.',
    viewAll: 'TUTTI I MODELLI →',
    enquire: 'Richiedi →',
  },
  categories: {
    flybridge: 'CRUISER FLYBRIDGE',
    hardtop: 'CRUISER HARDTOP',
    open: 'COPERTA APERTA',
    weekender: 'WEEKENDER · FUORIBORDO',
    day: 'IMBARCAZIONE DA GIORNO',
    'grand-tourer': 'GRAN TURISMO',
    runabout: 'RUNABOUT CLASSICO',
  },
  advisory: {
    eyebrow: 'COME HEREV TI AIUTA AD ACQUISTARE',
    heading: 'Non un marketplace. Un\'introduzione ponderata.',
    steps: [
      {
        number: '01',
        title: 'Una breve conversazione',
        body: 'Prima ascoltiamo: le tue abitudini in acqua, il tipo di ancoraggio che cerchi, le persone che porti con te. Tutto il resto ne deriva.',
      },
      {
        number: '02',
        title: 'Una proposta curata',
        body: 'Da cinque atelier — Galeon, Parker, Saxdor, De Antonio, Chris-Craft — proponiamo i due o tre modelli che si adattano davvero. Nessun catalogo, nessun rumore.',
      },
      {
        number: '03',
        title: 'Un\'introduzione personale',
        body: 'Organizziamo una prova in mare con il marchio giusto, nel porto giusto. Incontri il costruttore; restiamo al tuo fianco finché le chiavi non sono nelle tue mani.',
      },
    ],
  },
  lead: {
    eyebrow: 'UN APPROCCIO CORDIALE · NESSUN OBBLIGO',
    heading: 'Parla con un consulente.',
    subtext:
      'Raccontaci un po\' di quello che hai in mente. Ti risponderemo entro un giorno lavorativo — nessuna chiamata commerciale, nessuna pressione.',
    cta: 'Invia richiesta →',
    namePlaceholder: 'Il tuo nome',
    contactPlaceholder: 'Email o telefono',
    modelPlaceholder: 'Modello di interesse (opzionale)',
    messagePlaceholder: 'Qualche parola sui tuoi piani in acqua…',
    orCall: 'oppure chiamaci direttamente',
    fallbackContact: 'info@herev.com',
  },
  network: {
    eyebrow: 'LA NOSTRA RETE',
    heading: 'Presenza autorizzata nelle principali acque di navigazione.',
    body: 'I nostri showroom si trovano dove gli yacht vengono utilizzati, non solo venduti. Ogni sede è un punto di assistenza autorizzato per i marchi che rappresenta.',
    locations: 'SEDI',
    brands: 'MARCHI',
    countries: 'PAESI',
    berths: 'ORMEGGI',
    years: 'ANNI',
    linkLabel: 'VEDI RETE COMPLETA →',
    imageCaption: 'VARSAVIA · DANZICA · PALMA',
  },
  footer: {
    legal: '© MMXXVI HEREV · NOTE LEGALI · PRIVACY · COOKIE',
  },
  brandsPage: {
    heading: 'Cinque atelier. Uno standard.',
    subheading:
      'Ogni marchio scelto per una ragione distinta — insieme coprono ogni categoria seria della moderna proprietà di yacht.',
    viewLabel: 'Vedi collezione →',
  },
  brandPage: {
    fleetHeading: 'La gamma.',
    fleetSubheading: 'Tutti i modelli della nostra selezione attuale.',
    enquireCta: 'Richiedi',
    viewAllLabel: 'TUTTI I MODELLI →',
  },
  yachtsPage: {
    heading: 'La collezione completa.',
    subheading:
      'Ogni imbarcazione che rappresentiamo — cinque costruttori, uno standard ponderato.',
    filter: {
      refine: 'FILTRA',
      typeLabel: 'TIPO',
      marqueLabel: 'MARCA',
      lengthLabel: 'LUNGHEZZA TOTALE',
      searchPlaceholder: 'Cerca modello — es. 500 FLY',
      yachts: 'yacht',
      cabins: 'cabine',
      sortLengthLong: 'Lunghezza · più lungo prima',
      sortLengthShort: 'Lunghezza · più corto prima',
      viewLabel: 'Vedi →',
      noResults: 'Nessuno yacht corrisponde ai filtri.',
    },
  },
  yachtPage: {
    enquireCta: 'Richiedi informazioni su questo yacht →',
    bookViewingCta: 'Prenota una visione privata',
    keyNumbers: {
      length: 'LUNGHEZZA TOTALE',
      cabins: 'CABINE',
      speed: 'VELOCITÀ MAX.',
      engines: 'MOTORI',
    },
    anchorNav: {
      overview: 'Panoramica',
      gallery: 'Galleria',
      deckPlans: 'Piani di coperta',
      specs: 'Specifiche',
      financing: 'Finanziamento',
    },
    overviewLabel: 'PER CHI',
    galleryHeading: 'GALLERIA',
    galleryTitle: 'A bordo del',
    deckPlansHeading: 'PIANI DI COPERTA',
    deckPlansSubtitle: 'Tre ponti, pensati per la vita reale',
    specsSubtitle: 'La misura completa',
    recommendedHeading: 'Potresti anche considerare',
    financing: {
      eyebrow: 'LEASING · CREDITO · INVESTIMENTO IN CHARTER',
      copy: 'Ci sono diversi modi sensati per possedere questo yacht — dal leasing marittimo alla gestione charter che la mette al lavoro quando sei a terra. Ti guideremo attraverso le opzioni più adatte.',
      cta: 'Chiedi informazioni sul finanziamento →',
    },
    enquireHeadingPrefix: 'Richiedi informazioni su',
    mobileCta: { enquire: 'Richiedi' },
    recommendedEyebrow: 'POTRESTI ANCHE CONSIDERARE',
    viewAllLabel: 'TUTTI GLI YACHT →',
    leadEyebrow: 'NESSUN OBBLIGO',
    financingCheckbox: 'Sono interessato alle opzioni di finanziamento',
    privacyCheckbox: 'Accetto di essere contattato da Herev riguardo a questa richiesta e accetto la politica sulla privacy.',
    emailPlaceholder: 'Email',
    phonePlaceholder: 'Telefono',
    sendEnquiry: 'Invia richiesta →',
    specsGroups: {
      dimensions: 'DIMENSIONI',
      accommodation: 'ALLOGGIO',
      performance: 'PRESTAZIONI',
    },
    specs: {
      length: 'Lunghezza',
      beam: 'Larghezza',
      draft: 'Pescaggio',
      cabins: 'Cabine',
      berths: 'Cuccette',
      speed: 'Velocità max.',
      year: 'Anno modello',
      brand: 'Marchio',
      category: 'Categoria',
      engines: 'Motori',
    },
  },
  servicesPage: {
    hero: {
      eyebrow: 'RAPPRESENTANZA PRIVATA DI YACHT',
      heading: 'Dalla prima richiesta alla prova in mare.',
      subtext:
        'Siamo l\'unico punto di contatto per cinque dei costruttori di yacht più attenti al mondo — traducendo decisioni complesse in scelte chiare.',
    },
    advisory: {
      eyebrow: 'COSA FACCIAMO',
      heading: 'Un\'introduzione completa alla proprietà.',
    },
    steps: [
      {
        number: '01',
        title: 'Presentazioni di marchio',
        body: 'Ti presentiamo ogni atelier nei suoi propri termini — la storia, la filosofia ingegneristica e i modelli che li definiscono. Nessuna pressione di vendita; solo contesto.',
      },
      {
        number: '02',
        title: 'Visioni private',
        body: 'Organizziamo l\'accesso alle imbarcazioni nei nostri showroom a Varsavia, Gdynia e Palma. Le prove in mare sono coordinate direttamente con il team di consegna del costruttore.',
      },
      {
        number: '03',
        title: 'Supporto all\'acquisto',
        body: 'Dalla revisione delle specifiche alla logistica di consegna, restiamo coinvolti fino a quando l\'imbarcazione è nelle tue mani. Introduzione all\'assistenza post-vendita inclusa con ogni acquisto.',
      },
      {
        number: '04',
        title: 'Assistenza post-vendita',
        body: 'Manteniamo il rapporto dopo la consegna — collegandoti alla rete di assistenza del costruttore e segnalando aggiornamenti o miglioramenti di modelli rilevanti man mano che diventano disponibili.',
      },
    ],
    cta: {
      heading: 'Inizia la conversazione.',
    },
  },
  notFound: {
    heading: 'Pagina non trovata.',
    subtext: 'La pagina che stai cercando non esiste o è stata spostata.',
    backToHome: 'Torna alla home',
  },
  blogPage: {
    eyebrow: 'IL GIORNALE HEREV',
    heading: 'Il Giornale.',
    subheading: 'Scrittura ponderata sulla proprietà di yacht, la vita in mare e i costruttori che rappresentiamo.',
    readMore: 'Leggi →',
    publishedLabel: 'PUBBLICATO',
    backToBlog: '← Torna al giornale',
    comingSoon: 'Nuovi articoli in arrivo.',
  },
  networkPage: {
    hero: {
      eyebrow: 'RAPPRESENTANZA AUTORIZZATA · MONDIALE',
      heading: 'La Nostra Rete',
      subtext: 'Ovunque tu attracci, un concessionario ufficiale è già vicino. Una relazione, cinque marchi, una presenza che copre il globo.',
    },
    strip: {
      neutral: 'Una rete globale di concessionari ufficiali',
      neutralCta: 'Sfoglia il catalogo →',
    },
    howItWorks: {
      eyebrow: 'COME FUNZIONA LA RETE',
      heading: 'Una richiesta. Il concessionario ufficiale giusto. Una risposta entro la giornata.',
      steps: [
        { no: '01', title: 'Invia la tua richiesta', body: 'Invia una richiesta attraverso Herev — su un modello, o semplicemente per trovare chi è più vicino al tuo ormeggio.' },
        { no: '02', title: 'Ti indirizziamo al concessionario ufficiale', body: 'La tua richiesta va al concessionario autorizzato per il tuo paese e marchio — mai a un call centre, mai rivenduta.' },
        { no: '03', title: 'Contatto entro 24 ore', body: 'Uno specialista risponde personalmente, di solito il giorno stesso, per organizzare una visione o una prova in mare.' },
      ],
    },
    directory: {
      eyebrow: 'CATALOGO',
      heading: 'Trova la rete per paese',
      viewAll: 'VEDI TUTTI I PAESI →',
    },
    cta: {
      eyebrow: 'NESSUNO SHOWROOM VICINO?',
      heading: 'Non riesci a trovare uno showroom vicino?',
      subtext: 'Dicci dove ormeggiai. Ti metteremo in contatto con il concessionario ufficiale più vicino — e ci spostiamo da te quando è importante.',
      ctaLabel: 'Parla con un consulente →',
    },
    countryPage: {
      breadcrumb: 'LA NOSTRA RETE',
      locationCount: '{n} SEDI UFFICIALI · {b} MARCHI',
      enquireCta: 'Richiedi →',
      enquireInCountry: 'Richiedi in {country} →',
      brandsCarried: 'MARCHI DISPONIBILI',
      seaTrials: 'PROVE IN MARE SU RICHIESTA',
      mapLabel: 'MAPPA DI COPERTURA',
      backToNetwork: '← Torna alla rete',
    },
    mapAria: {
      containerLabel: 'Mappa della rete di concessionari',
      closePanel: 'Chiudi il pannello dello showroom',
      useLocation: 'Usa la mia posizione',
      locating: 'Localizzazione…',
      located: 'Trovato · {country}',
      denied: 'Posizione disattivata',
      tapToExplore: 'TOCCA PER ESPLORARE LA MAPPA',
      jumpToCountry: 'VAI AL PAESE',
      enquireAtShowroom: 'Richiedi in questo showroom →',
      seaTrialsNote: 'PROVE IN MARE SU RICHIESTA',
    },
  },
};

const translations: Record<Locale, Translations> = { en, pl, es, it };

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}
