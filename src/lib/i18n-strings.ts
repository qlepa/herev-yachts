import type { Locale } from './i18n';
import type { CategoryKey } from '../content.config';
import type { GalleryCategory } from './yacht-enums';
import type { RegionKey } from './regions';

/** Strings for the NetworkDirectory island (map + filters + dealer list) */
export interface DirectoryStrings {
  filters: {
    title: string;
    reset: string;
    brands: string;
    allBrands: string;
    region: string;
    allRegions: string;
    viewList: string; // "View list ({n})"
  };
  list: {
    title: string;
    found: string; // "{n} dealers found"
    sortBy: string;
    sortCountry: string;
    sortName: string;
    sortNearest: string;
    authorised: string;
    viewDetails: string;
    loadMore: string;
    noResults: string;
  };
  map: {
    containerLabel: string;
    useLocation: string;
    locating: string;
    located: string; // "Located · {country}"
    denied: string;
    tapToExplore: string;
    zoomIn: string;
    zoomOut: string;
  };
}

export interface NavStrings {
  yachts: string;
  brands: string;
  services: string;
  network: string;
  blog: string;
  enquire: string;
}

export interface Translations {
  meta: { title: string; description: string };
  nav: NavStrings;
  hero: {
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
    enquire: string;
  };
  categories: Record<CategoryKey, string>;
  advisory: {
    advise: { heading: string; bullets: Array<{ lead: string; rest: string }> };
    represent: { heading: string; bullets: Array<{ lead: string; rest: string }> };
  };
  stock: {
    eyebrow: string;
    heading: string;
    subheading: string;
    viewAll: string;
    enquire: string;
    moreInfo: string;
    exTax: string;
    taxPaid: string;
    page: {
      eyebrow: string;
      heading: string;
      subheading: string;
      backToList: string;
      keyNumbers: { price: string; year: string; length: string; hours: string; location: string };
      enquireHeadingPrefix: string;
      brandLine: string;
      overviewLabel: string;
    };
  };
  guide: { heading: string; body: string; emailPlaceholder: string; cta: string };
  shipyards: { eyebrow: string; heading: string; body: string };
  statement: { headingLine1: string; headingLine2: string; body: string };
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
    countries: string;
    berths: string;
    models: string;
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
    brochureCta: string;
    keyNumbers: { length: string; cabins: string; guests: string; speed: string };
    /** "{name}" is replaced with the model name, "{brand}" with the brand */
    whyLabel: string;
    features: { eyebrow: string; heading: string };
    lifestyle: { eyebrow: string; heading: string };
    spacesEyebrow: string;
    video: { eyebrow: string; heading: string; play: string };
    galleryHeading: string;
    galleryTitle: string;
    galleryAll: string;
    galleryImages: string;
    galleryCategories: Record<GalleryCategory, string>;
    deckPlansHeading: string;
    deckPlansSubtitle: string;
    deckFallback: string;
    viewFullSize: string;
    specsEyebrow: string;
    specsSubtitle: string;
    specsGroups: { dimensions: string; accommodation: string; performance: string; capacities: string };
    specs: {
      length: string;
      beam: string;
      draft: string;
      cabins: string;
      berths: string;
      engines: string;
      speed: string;
      cruiseSpeed: string;
      fuel: string;
      water: string;
      ceCategory: string;
      year: string;
    };
    compare: { eyebrow: string; heading: string; model: string; length: string; cabins: string; guests: string; speed: string; current: string };
    recommendedEyebrow: string;
    recommendedHeading: string;
    viewAllLabel: string;
    financing: { eyebrow: string; copy: string; cta: string };
    readyHeading: string;
    leadEyebrow: string;
    mobileCta: { enquire: string };
    financingCheckbox: string;
    privacyCheckbox: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
    sendEnquiry: string;
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
    pagination: { label: string; newer: string; older: string; page: string };
  };
  networkPage: {
    hero: { breadcrumbHome: string; eyebrow: string; heading: string; subtext: string };
    stats: { brands: string; dealers: string; countries: string; continents: string };
    regions: Record<RegionKey, string>;
    explorer: DirectoryStrings;
    directory: { eyebrow: string; heading: string };
    brandsStrip: { title: string };
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
  },
  hero: {
    heading: 'Helping you find the perfect yacht.',
    subtext:
      'Independent advice for yacht buyers, from first consideration to final acquisition.',
    cta1: 'Speak with advisor',
    cta2: 'Explore yachts',
  },
  intro: {
    eyebrow: 'HEREV PARTNERS',
    heading: 'Yacht advisory. Buyer representation. Deal negotiation.',
    body: 'We are the leading yacht buyer advisor in Central Europe, providing end-to-end support from yacht selection to dealer negotiations, insurance and ownership solutions.',
    statLabels: { ateliers: 'ATELIERS', years: 'YEARS', relationship: 'RELATIONSHIP' },
  },
  fleet: {
    enquire: 'Enquire →',
  },
  stock: {
    eyebrow: 'IMMEDIATE DELIVERY',
    heading: 'Yachts available now',
    subheading:
      'For clients where time matters, we offer a handpicked selection of yachts available for immediate delivery this season.',
    viewAll: 'VIEW ALL AVAILABLE →',
    enquire: 'Enquire',
    moreInfo: 'More info →',
    exTax: 'EX TAX',
    taxPaid: 'TAX PAID',
    page: {
      eyebrow: 'AVAILABLE NOW',
      heading: 'Yachts available for immediate delivery.',
      subheading: 'Individual units ready this season — inspected, priced and ready to hand over.',
      backToList: '← All available yachts',
      keyNumbers: { price: 'PRICE', year: 'YEAR', length: 'LENGTH OVERALL', hours: 'ENGINE HOURS', location: 'LOCATION' },
      enquireHeadingPrefix: 'Enquire about this',
      brandLine: 'AVAILABLE FOR IMMEDIATE DELIVERY',
      overviewLabel: 'ABOUT THIS UNIT',
    },
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
    advise: {
      heading: 'We advise buyers throughout the purchase of a new yacht:',
      bullets: [
        { lead: 'Define the right fit', rest: 'through buyer needs analysis, model comparison and shortlist creation.' },
        { lead: 'Secure better terms', rest: 'with pricing benchmarks, discount guidance and support in dealer negotiations.' },
        { lead: 'Optimize specification', rest: 'across engines, layout and equipment to match real use and budget.' },
        { lead: 'Oversee the full process', rest: 'from purchase structure and registration to handover & delivery' },
      ],
    },
    represent: {
      heading: 'Already chosen your yacht and know exactly what you want? Let us represent you.',
      bullets: [
        { lead: 'Leverage our experience', rest: 'and direct relationships with yacht builders across Europe.' },
        { lead: 'Inspect the yacht in person', rest: 'through one of our trusted partner marinas.' },
        { lead: 'Review your decision', rest: 'with our advisor and make sure nothing important has been overlooked.' },
        { lead: 'Buy with confidence', rest: '— the wrong yacht is an expensive mistake.' },
      ],
    },
  },
  guide: {
    heading: 'THE YACHT BUYER’S GUIDE',
    body: 'Avoid costly mistakes and make a smarter buying decision with our practical guide for new yacht buyers.',
    emailPlaceholder: 'Enter your email address',
    cta: 'Get Your Copy',
  },
  shipyards: {
    eyebrow: 'WE WORK WITH',
    heading: 'THE EUROPE’S LEADING SHIPYARDS',
    body: 'As independent advisors, we present a curated selection of brands and models we know well and regularly recommend to our clients.',
  },
  statement: {
    headingLine1: 'WE DON’T SELL YACHTS',
    headingLine2: 'WE HELP YOU BUY THE RIGHT ONE',
    body: 'Buying a yacht is complex. We simplify the process by representing your interests at every stage — sourcing the right opportunities, navigating the market and ensuring a smooth acquisition',
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
    countries: 'COUNTRIES',
    berths: 'BERTHS',
    models: 'MODELS',
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
    enquireCta: 'Request an offer →',
    bookViewingCta: 'Schedule a viewing',
    brochureCta: 'Download brochure',
    keyNumbers: {
      length: 'LENGTH OVERALL',
      cabins: 'CABINS',
      guests: 'GUESTS',
      speed: 'MAX SPEED',
    },
    whyLabel: 'WHY CHOOSE THE {name}',
    features: {
      eyebrow: 'SIGNATURE FEATURES',
      heading: 'What sets her apart',
    },
    lifestyle: {
      eyebrow: 'THE {name} LIFESTYLE',
      heading: 'Designed around the way you actually use a yacht',
    },
    spacesEyebrow: 'INTERIOR EXPERIENCE',
    video: {
      eyebrow: 'IN ACTION',
      heading: 'See the {name} in action',
      play: 'Play video',
    },
    galleryHeading: 'GALLERY',
    galleryTitle: 'Aboard the',
    galleryAll: 'All',
    galleryImages: 'images',
    galleryCategories: {
      exterior: 'Exterior',
      interior: 'Interior',
      cockpit: 'Cockpit',
      cabins: 'Cabins',
      lifestyle: 'Lifestyle',
    },
    deckPlansHeading: 'DECK PLANS & LAYOUTS',
    deckPlansSubtitle: 'Every deck, arranged for real life',
    deckFallback: 'Deck',
    viewFullSize: 'View full size',
    specsEyebrow: 'TECHNICAL SPECIFICATIONS',
    specsSubtitle: 'The full measure',
    specsGroups: {
      dimensions: 'DIMENSIONS',
      accommodation: 'ACCOMMODATION',
      performance: 'PERFORMANCE',
      capacities: 'CAPACITIES',
    },
    specs: {
      length: 'Length overall',
      beam: 'Beam',
      draft: 'Draft',
      cabins: 'Cabins',
      berths: 'Guests',
      engines: 'Engines',
      speed: 'Max speed',
      cruiseSpeed: 'Cruise speed',
      fuel: 'Fuel capacity',
      water: 'Water capacity',
      ceCategory: 'CE category',
      year: 'Model year',
    },
    compare: {
      eyebrow: 'COMPARE THE RANGE',
      heading: 'How she sits in the {brand} range',
      model: 'Model',
      length: 'Length',
      cabins: 'Cabins',
      guests: 'Guests',
      speed: 'Max speed',
      current: 'This model',
    },
    recommendedEyebrow: 'YOU MIGHT ALSO CONSIDER',
    recommendedHeading: 'You might also consider',
    viewAllLabel: 'VIEW ALL YACHTS →',
    financing: {
      eyebrow: 'LEASING · CREDIT · CHARTER INVESTMENT',
      copy: 'There are several sensible ways to own this yacht — from marine leasing to charter-management that puts her to work when you\'re ashore. We\'ll walk you through the options that fit.',
      cta: 'Ask about financing →',
    },
    readyHeading: 'Ready to experience the {name}?',
    leadEyebrow: 'NO OBLIGATION',
    mobileCta: {
      enquire: 'Enquire',
    },
    financingCheckbox: 'I\'m interested in financing options',
    privacyCheckbox: 'I agree to be contacted by Herev regarding this enquiry and accept the privacy policy.',
    emailPlaceholder: 'Email',
    phonePlaceholder: 'Phone',
    sendEnquiry: 'Send enquiry →',
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
    pagination: { label: 'Journal pages', newer: '← Newer', older: 'Older →', page: 'Page' },
  },
  networkPage: {
    hero: {
      breadcrumbHome: 'Home',
      eyebrow: 'AUTHORISED REPRESENTATION · WORLDWIDE',
      heading: 'Global Dealer Network',
      subtext: "Find authorised dealers and service partners for the world's leading yacht brands. Our global network ensures you receive the highest level of expertise and support, wherever you are.",
    },
    stats: { brands: 'YACHT BRANDS', dealers: 'DEALERS', countries: 'COUNTRIES', continents: 'CONTINENTS' },
    regions: {
      europe: 'Europe',
      'north-america': 'North America',
      'south-america': 'South America',
      asia: 'Asia & Middle East',
      africa: 'Africa',
      oceania: 'Oceania',
      other: 'Other',
    },
    explorer: {
      filters: {
        title: 'Filter dealers',
        reset: 'Reset all',
        brands: 'BRAND',
        allBrands: 'All brands',
        region: 'REGION',
        allRegions: 'All regions',
        viewList: 'View list ({n})',
      },
      list: {
        title: 'Dealer list',
        found: '{n} dealers found',
        sortBy: 'Sort by',
        sortCountry: 'Country',
        sortName: 'Name',
        sortNearest: 'Nearest',
        authorised: 'AUTHORISED DEALER',
        viewDetails: 'View details',
        loadMore: 'Load more dealers',
        noResults: 'No dealers match these filters.',
      },
      map: {
        containerLabel: 'Dealer network map',
        useLocation: 'Use my location',
        locating: 'Locating…',
        located: 'Located · {country}',
        denied: 'Location off',
        tapToExplore: 'Tap to explore the map',
        zoomIn: 'Zoom in',
        zoomOut: 'Zoom out',
      },
    },
    directory: {
      eyebrow: 'DIRECTORY',
      heading: 'Browse the network by country',
    },
    brandsStrip: { title: 'OUR BRANDS' },
    cta: {
      eyebrow: 'NO DEALER NEARBY?',
      heading: 'Looking for a dealer in your area?',
      subtext: "Can't find what you're looking for? Contact us and we'll connect you with the right partner.",
      ctaLabel: 'Contact us',
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
  },
  hero: {
    heading: 'Pomagamy znaleźć idealny jacht.',
    subtext:
      'Niezależne doradztwo dla kupujących jachty — od pierwszej myśli do finalizacji zakupu.',
    cta1: 'Porozmawiaj z doradcą',
    cta2: 'Zobacz jachty',
  },
  intro: {
    eyebrow: 'HEREV PARTNERS',
    heading: 'Doradztwo jachtowe. Reprezentacja kupującego. Negocjacje.',
    body: 'Jesteśmy wiodącym doradcą kupujących jachty w Europie Środkowej, zapewniając kompleksowe wsparcie — od wyboru jachtu, przez negocjacje z dealerami, po ubezpieczenie i rozwiązania własnościowe.',
    statLabels: { ateliers: 'ATELIER', years: 'LAT', relationship: 'RELACJA' },
  },
  fleet: {
    enquire: 'Zapytaj →',
  },
  stock: {
    eyebrow: 'DOSTĘPNE OD RĘKI',
    heading: 'Jachty dostępne teraz',
    subheading:
      'Dla klientów, dla których liczy się czas, oferujemy starannie wybrane jachty dostępne do natychmiastowego odbioru w tym sezonie.',
    viewAll: 'WSZYSTKIE DOSTĘPNE →',
    enquire: 'Zapytaj',
    moreInfo: 'Więcej →',
    exTax: 'NETTO',
    taxPaid: 'Z VAT',
    page: {
      eyebrow: 'DOSTĘPNE TERAZ',
      heading: 'Jachty dostępne do natychmiastowego odbioru.',
      subheading: 'Konkretne egzemplarze gotowe na ten sezon — sprawdzone, wycenione i gotowe do przekazania.',
      backToList: '← Wszystkie dostępne jachty',
      keyNumbers: { price: 'CENA', year: 'ROCZNIK', length: 'DŁUGOŚĆ', hours: 'MOTOGODZINY', location: 'LOKALIZACJA' },
      enquireHeadingPrefix: 'Zapytaj o ten',
      brandLine: 'DOSTĘPNY DO NATYCHMIASTOWEGO ODBIORU',
      overviewLabel: 'O TYM EGZEMPLARZU',
    },
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
    advise: {
      heading: 'Doradzamy kupującym na każdym etapie zakupu nowego jachtu:',
      bullets: [
        { lead: 'Określamy właściwy wybór', rest: 'poprzez analizę potrzeb, porównanie modeli i stworzenie krótkiej listy.' },
        { lead: 'Zapewniamy lepsze warunki', rest: 'dzięki benchmarkom cenowym, wiedzy o rabatach i wsparciu w negocjacjach z dealerem.' },
        { lead: 'Optymalizujemy specyfikację', rest: 'silników, układu i wyposażenia pod realne użytkowanie i budżet.' },
        { lead: 'Nadzorujemy cały proces', rest: 'od struktury zakupu i rejestracji po przekazanie i dostawę' },
      ],
    },
    represent: {
      heading: 'Masz już wybrany jacht i dokładnie wiesz, czego chcesz? Pozwól nam Cię reprezentować.',
      bullets: [
        { lead: 'Skorzystaj z naszego doświadczenia', rest: 'i bezpośrednich relacji ze stoczniami w całej Europie.' },
        { lead: 'Obejrzyj jacht osobiście', rest: 'w jednej z naszych zaufanych marin partnerskich.' },
        { lead: 'Zweryfikuj decyzję', rest: 'z naszym doradcą i upewnij się, że nic ważnego nie zostało pominięte.' },
        { lead: 'Kupuj z pewnością', rest: '— niewłaściwy jacht to kosztowny błąd.' },
      ],
    },
  },
  guide: {
    heading: 'PRZEWODNIK KUPUJĄCEGO JACHT',
    body: 'Uniknij kosztownych błędów i podejmij mądrzejszą decyzję dzięki naszemu praktycznemu przewodnikowi dla nowych nabywców jachtów.',
    emailPlaceholder: 'Podaj swój adres e-mail',
    cta: 'Pobierz egzemplarz',
  },
  shipyards: {
    eyebrow: 'WSPÓŁPRACUJEMY Z',
    heading: 'WIODĄCYMI STOCZNIAMI EUROPY',
    body: 'Jako niezależni doradcy prezentujemy starannie wybrane marki i modele, które dobrze znamy i regularnie polecamy naszym klientom.',
  },
  statement: {
    headingLine1: 'NIE SPRZEDAJEMY JACHTÓW',
    headingLine2: 'POMAGAMY KUPIĆ TEN WŁAŚCIWY',
    body: 'Zakup jachtu jest złożony. Upraszczamy ten proces, reprezentując Twoje interesy na każdym etapie — od znalezienia właściwych okazji, przez poruszanie się po rynku, po sprawne sfinalizowanie zakupu',
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
    countries: 'KRAJE',
    berths: 'MIEJSCA CUMOWANIA',
    models: 'MODELI',
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
    enquireCta: 'Zapytaj o ofertę →',
    bookViewingCta: 'Umów oglądanie',
    brochureCta: 'Pobierz broszurę',
    keyNumbers: {
      length: 'DŁUGOŚĆ CAŁKOWITA',
      cabins: 'KABINY',
      guests: 'GOŚCI',
      speed: 'MAKS. PRĘDKOŚĆ',
    },
    whyLabel: 'DLACZEGO {name}',
    features: {
      eyebrow: 'CECHY CHARAKTERYSTYCZNE',
      heading: 'Co ją wyróżnia',
    },
    lifestyle: {
      eyebrow: 'STYL ŻYCIA Z {name}',
      heading: 'Zaprojektowana wokół tego, jak naprawdę używasz jachtu',
    },
    spacesEyebrow: 'WNĘTRZA',
    video: {
      eyebrow: 'W AKCJI',
      heading: 'Zobacz {name} w akcji',
      play: 'Odtwórz wideo',
    },
    galleryHeading: 'GALERIA',
    galleryTitle: 'Na pokładzie',
    galleryAll: 'Wszystkie',
    galleryImages: 'zdjęć',
    galleryCategories: {
      exterior: 'Zewnątrz',
      interior: 'Wnętrze',
      cockpit: 'Kokpit',
      cabins: 'Kabiny',
      lifestyle: 'Styl życia',
    },
    deckPlansHeading: 'PLANY POKŁADÓW',
    deckPlansSubtitle: 'Każdy pokład zaplanowany na prawdziwe życie',
    deckFallback: 'Pokład',
    viewFullSize: 'Zobacz w pełnym rozmiarze',
    specsEyebrow: 'SPECYFIKACJA TECHNICZNA',
    specsSubtitle: 'Pełny wymiar',
    specsGroups: {
      dimensions: 'WYMIARY',
      accommodation: 'ZAKWATEROWANIE',
      performance: 'OSIĄGI',
      capacities: 'POJEMNOŚCI',
    },
    specs: {
      length: 'Długość całkowita',
      beam: 'Szerokość',
      draft: 'Zanurzenie',
      cabins: 'Kabiny',
      berths: 'Gości',
      engines: 'Silniki',
      speed: 'Maks. prędkość',
      cruiseSpeed: 'Prędkość rejsowa',
      fuel: 'Zbiornik paliwa',
      water: 'Zbiornik wody',
      ceCategory: 'Kategoria CE',
      year: 'Rok modelowy',
    },
    compare: {
      eyebrow: 'PORÓWNAJ GAMĘ',
      heading: 'Miejsce w gamie {brand}',
      model: 'Model',
      length: 'Długość',
      cabins: 'Kabiny',
      guests: 'Gości',
      speed: 'Maks. prędkość',
      current: 'Ten model',
    },
    recommendedEyebrow: 'MOŻE CIĘ ZAINTERESOWAĆ',
    recommendedHeading: 'Możesz również rozważyć',
    viewAllLabel: 'WSZYSTKIE JACHTY →',
    financing: {
      eyebrow: 'LEASING · KREDYT · INWESTYCJA CZARTEROWA',
      copy: 'Jest kilka rozsądnych sposobów na posiadanie tego jachtu — od leasingu morskiego po zarządzanie czarterowe, które sprawia, że pracuje, gdy ty jesteś na lądzie. Przeprowadzimy cię przez opcje, które pasują.',
      cta: 'Zapytaj o finansowanie →',
    },
    readyHeading: 'Gotowy poznać {name}?',
    leadEyebrow: 'BEZ ZOBOWIĄZAŃ',
    mobileCta: {
      enquire: 'Zapytaj',
    },
    financingCheckbox: 'Interesuje mnie finansowanie',
    privacyCheckbox: 'Wyrażam zgodę na kontakt ze strony Herev w sprawie tego zapytania i akceptuję politykę prywatności.',
    emailPlaceholder: 'Email',
    phonePlaceholder: 'Telefon',
    sendEnquiry: 'Wyślij zapytanie →',
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
    pagination: { label: 'Strony dziennika', newer: '← Nowsze', older: 'Starsze →', page: 'Strona' },
  },
  networkPage: {
    hero: {
      breadcrumbHome: 'Strona główna',
      eyebrow: 'AUTORYZOWANA REPREZENTACJA · ŚWIAT',
      heading: 'Globalna sieć dealerów',
      subtext: 'Znajdź autoryzowanych dealerów i partnerów serwisowych wiodących marek jachtowych. Nasza globalna sieć zapewnia najwyższy poziom wiedzy i wsparcia, gdziekolwiek jesteś.',
    },
    stats: { brands: 'MARKI JACHTÓW', dealers: 'DEALERÓW', countries: 'KRAJÓW', continents: 'KONTYNENTÓW' },
    regions: {
      europe: 'Europa',
      'north-america': 'Ameryka Północna',
      'south-america': 'Ameryka Południowa',
      asia: 'Azja i Bliski Wschód',
      africa: 'Afryka',
      oceania: 'Oceania',
      other: 'Inne',
    },
    explorer: {
      filters: {
        title: 'Filtruj dealerów',
        reset: 'Wyczyść',
        brands: 'MARKA',
        allBrands: 'Wszystkie marki',
        region: 'REGION',
        allRegions: 'Wszystkie regiony',
        viewList: 'Zobacz listę ({n})',
      },
      list: {
        title: 'Lista dealerów',
        found: 'Znaleziono dealerów: {n}',
        sortBy: 'Sortuj',
        sortCountry: 'Kraj',
        sortName: 'Nazwa',
        sortNearest: 'Najbliżej',
        authorised: 'AUTORYZOWANY DEALER',
        viewDetails: 'Zobacz szczegóły',
        loadMore: 'Pokaż więcej dealerów',
        noResults: 'Brak dealerów spełniających te kryteria.',
      },
      map: {
        containerLabel: 'Mapa sieci dealerów',
        useLocation: 'Użyj mojej lokalizacji',
        locating: 'Lokalizowanie…',
        located: 'Znaleziono · {country}',
        denied: 'Lokalizacja wyłączona',
        tapToExplore: 'Dotknij, aby eksplorować mapę',
        zoomIn: 'Przybliż',
        zoomOut: 'Oddal',
      },
    },
    directory: {
      eyebrow: 'KATALOG',
      heading: 'Przeglądaj sieć według kraju',
    },
    brandsStrip: { title: 'NASZE MARKI' },
    cta: {
      eyebrow: 'BRAK DEALERA W POBLIŻU?',
      heading: 'Szukasz dealera w swojej okolicy?',
      subtext: 'Nie znalazłeś tego, czego szukasz? Skontaktuj się z nami — połączymy Cię z właściwym partnerem.',
      ctaLabel: 'Skontaktuj się',
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
  },
  hero: {
    heading: 'Te ayudamos a encontrar el yate perfecto.',
    subtext:
      'Asesoramiento independiente para compradores de yates, desde la primera idea hasta la adquisición final.',
    cta1: 'Habla con un asesor',
    cta2: 'Explorar yates',
  },
  intro: {
    eyebrow: 'HEREV PARTNERS',
    heading: 'Asesoría náutica. Representación del comprador. Negociación.',
    body: 'Somos el principal asesor de compradores de yates en Europa Central, ofreciendo apoyo integral desde la selección del yate hasta la negociación con concesionarios, el seguro y las soluciones de propiedad.',
    statLabels: { ateliers: 'ATELIERS', years: 'AÑOS', relationship: 'RELACIÓN' },
  },
  fleet: {
    enquire: 'Consultar →',
  },
  stock: {
    eyebrow: 'ENTREGA INMEDIATA',
    heading: 'Yates disponibles ahora',
    subheading:
      'Para clientes para quienes el tiempo importa, ofrecemos una selección de yates disponibles para entrega inmediata esta temporada.',
    viewAll: 'VER TODOS LOS DISPONIBLES →',
    enquire: 'Consultar',
    moreInfo: 'Más información →',
    exTax: 'SIN IMPUESTOS',
    taxPaid: 'IMPUESTOS PAGADOS',
    page: {
      eyebrow: 'DISPONIBLES AHORA',
      heading: 'Yates disponibles para entrega inmediata.',
      subheading: 'Unidades concretas listas para esta temporada — inspeccionadas, con precio y listas para entregar.',
      backToList: '← Todos los yates disponibles',
      keyNumbers: { price: 'PRECIO', year: 'AÑO', length: 'ESLORA', hours: 'HORAS DE MOTOR', location: 'UBICACIÓN' },
      enquireHeadingPrefix: 'Consultar sobre este',
      brandLine: 'DISPONIBLE PARA ENTREGA INMEDIATA',
      overviewLabel: 'SOBRE ESTA UNIDAD',
    },
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
    advise: {
      heading: 'Asesoramos a los compradores durante toda la compra de un yate nuevo:',
      bullets: [
        { lead: 'Definir la opción adecuada', rest: 'mediante el análisis de necesidades, la comparación de modelos y la creación de una lista corta.' },
        { lead: 'Conseguir mejores condiciones', rest: 'con referencias de precios, orientación sobre descuentos y apoyo en la negociación con concesionarios.' },
        { lead: 'Optimizar la especificación', rest: 'de motores, distribución y equipamiento según el uso real y el presupuesto.' },
        { lead: 'Supervisar todo el proceso', rest: 'desde la estructura de compra y el registro hasta la entrega' },
      ],
    },
    represent: {
      heading: '¿Ya has elegido tu yate y sabes exactamente lo que quieres? Deja que te representemos.',
      bullets: [
        { lead: 'Aprovecha nuestra experiencia', rest: 'y nuestras relaciones directas con astilleros de toda Europa.' },
        { lead: 'Inspecciona el yate en persona', rest: 'en uno de nuestros puertos deportivos asociados de confianza.' },
        { lead: 'Revisa tu decisión', rest: 'con nuestro asesor y asegúrate de que nada importante se ha pasado por alto.' },
        { lead: 'Compra con confianza', rest: '— el yate equivocado es un error costoso.' },
      ],
    },
  },
  guide: {
    heading: 'LA GUÍA DEL COMPRADOR DE YATES',
    body: 'Evita errores costosos y toma una decisión de compra más inteligente con nuestra guía práctica para nuevos compradores de yates.',
    emailPlaceholder: 'Introduce tu correo electrónico',
    cta: 'Recibir mi copia',
  },
  shipyards: {
    eyebrow: 'TRABAJAMOS CON',
    heading: 'LOS PRINCIPALES ASTILLEROS DE EUROPA',
    body: 'Como asesores independientes, presentamos una selección de marcas y modelos que conocemos bien y recomendamos habitualmente a nuestros clientes.',
  },
  statement: {
    headingLine1: 'NO VENDEMOS YATES',
    headingLine2: 'TE AYUDAMOS A COMPRAR EL ADECUADO',
    body: 'Comprar un yate es complejo. Simplificamos el proceso representando tus intereses en cada etapa — buscando las oportunidades adecuadas, navegando el mercado y asegurando una adquisición sin sobresaltos',
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
    countries: 'PAÍSES',
    berths: 'AMARRES',
    models: 'MODELOS',
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
    enquireCta: 'Solicitar oferta →',
    bookViewingCta: 'Programar una visita',
    brochureCta: 'Descargar folleto',
    keyNumbers: {
      length: 'ESLORA TOTAL',
      cabins: 'CABINAS',
      guests: 'INVITADOS',
      speed: 'VELOCIDAD MÁX.',
    },
    whyLabel: 'POR QUÉ ELEGIR EL {name}',
    features: {
      eyebrow: 'CARACTERÍSTICAS DISTINTIVAS',
      heading: 'Lo que la distingue',
    },
    lifestyle: {
      eyebrow: 'EL ESTILO DE VIDA {name}',
      heading: 'Diseñado en torno a cómo realmente usa un yate',
    },
    spacesEyebrow: 'EXPERIENCIA INTERIOR',
    video: {
      eyebrow: 'EN ACCIÓN',
      heading: 'Vea el {name} en acción',
      play: 'Reproducir vídeo',
    },
    galleryHeading: 'GALERÍA',
    galleryTitle: 'A bordo del',
    galleryAll: 'Todas',
    galleryImages: 'imágenes',
    galleryCategories: {
      exterior: 'Exterior',
      interior: 'Interior',
      cockpit: 'Bañera',
      cabins: 'Cabinas',
      lifestyle: 'Estilo de vida',
    },
    deckPlansHeading: 'PLANOS DE CUBIERTA',
    deckPlansSubtitle: 'Cada cubierta, diseñada para la vida real',
    deckFallback: 'Cubierta',
    viewFullSize: 'Ver a tamaño completo',
    specsEyebrow: 'ESPECIFICACIONES TÉCNICAS',
    specsSubtitle: 'La medida completa',
    specsGroups: {
      dimensions: 'DIMENSIONES',
      accommodation: 'ALOJAMIENTO',
      performance: 'RENDIMIENTO',
      capacities: 'CAPACIDADES',
    },
    specs: {
      length: 'Eslora total',
      beam: 'Manga',
      draft: 'Calado',
      cabins: 'Cabinas',
      berths: 'Invitados',
      engines: 'Motores',
      speed: 'Velocidad máx.',
      cruiseSpeed: 'Velocidad de crucero',
      fuel: 'Capacidad de combustible',
      water: 'Capacidad de agua',
      ceCategory: 'Categoría CE',
      year: 'Año del modelo',
    },
    compare: {
      eyebrow: 'COMPARE LA GAMA',
      heading: 'Su lugar en la gama {brand}',
      model: 'Modelo',
      length: 'Eslora',
      cabins: 'Cabinas',
      guests: 'Invitados',
      speed: 'Velocidad máx.',
      current: 'Este modelo',
    },
    recommendedEyebrow: 'TAMBIÉN PUEDE CONSIDERAR',
    recommendedHeading: 'También puede considerar',
    viewAllLabel: 'VER TODOS LOS YATES →',
    financing: {
      eyebrow: 'LEASING · CRÉDITO · INVERSIÓN EN CHARTER',
      copy: 'Hay varias formas razonables de poseer este yate — desde el leasing marítimo hasta la gestión de chárter que la pone a trabajar cuando usted está en tierra. Le guiaremos por las opciones que se adaptan.',
      cta: 'Preguntar sobre financiación →',
    },
    readyHeading: '¿Listo para vivir el {name}?',
    leadEyebrow: 'SIN COMPROMISO',
    mobileCta: {
      enquire: 'Consultar',
    },
    financingCheckbox: 'Estoy interesado en opciones de financiación',
    privacyCheckbox: 'Acepto ser contactado por Herev sobre esta consulta y acepto la política de privacidad.',
    emailPlaceholder: 'Email',
    phonePlaceholder: 'Teléfono',
    sendEnquiry: 'Enviar consulta →',
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
    pagination: { label: 'Páginas del diario', newer: '← Más recientes', older: 'Anteriores →', page: 'Página' },
  },
  networkPage: {
    hero: {
      breadcrumbHome: 'Inicio',
      eyebrow: 'REPRESENTACIÓN AUTORIZADA · MUNDIAL',
      heading: 'Red global de concesionarios',
      subtext: 'Encuentra concesionarios autorizados y socios de servicio de las principales marcas de yates del mundo. Nuestra red global te garantiza el máximo nivel de experiencia y soporte, estés donde estés.',
    },
    stats: { brands: 'MARCAS', dealers: 'CONCESIONARIOS', countries: 'PAÍSES', continents: 'CONTINENTES' },
    regions: {
      europe: 'Europa',
      'north-america': 'América del Norte',
      'south-america': 'América del Sur',
      asia: 'Asia y Oriente Medio',
      africa: 'África',
      oceania: 'Oceanía',
      other: 'Otros',
    },
    explorer: {
      filters: {
        title: 'Filtrar concesionarios',
        reset: 'Restablecer',
        brands: 'MARCA',
        allBrands: 'Todas las marcas',
        region: 'REGIÓN',
        allRegions: 'Todas las regiones',
        viewList: 'Ver lista ({n})',
      },
      list: {
        title: 'Lista de concesionarios',
        found: '{n} concesionarios encontrados',
        sortBy: 'Ordenar por',
        sortCountry: 'País',
        sortName: 'Nombre',
        sortNearest: 'Más cercano',
        authorised: 'CONCESIONARIO AUTORIZADO',
        viewDetails: 'Ver detalles',
        loadMore: 'Cargar más concesionarios',
        noResults: 'Ningún concesionario coincide con estos filtros.',
      },
      map: {
        containerLabel: 'Mapa de la red de concesionarios',
        useLocation: 'Usar mi ubicación',
        locating: 'Localizando…',
        located: 'Ubicado · {country}',
        denied: 'Ubicación desactivada',
        tapToExplore: 'Toca para explorar el mapa',
        zoomIn: 'Acercar',
        zoomOut: 'Alejar',
      },
    },
    directory: {
      eyebrow: 'DIRECTORIO',
      heading: 'Explora la red por país',
    },
    brandsStrip: { title: 'NUESTRAS MARCAS' },
    cta: {
      eyebrow: '¿SIN CONCESIONARIO CERCA?',
      heading: '¿Buscas un concesionario en tu zona?',
      subtext: '¿No encuentras lo que buscas? Contáctanos y te pondremos en contacto con el socio adecuado.',
      ctaLabel: 'Contáctanos',
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
  },
  hero: {
    heading: 'Ti aiutiamo a trovare lo yacht perfetto.',
    subtext:
      "Consulenza indipendente per acquirenti di yacht, dalla prima valutazione all'acquisto finale.",
    cta1: 'Parla con un consulente',
    cta2: 'Esplora gli yacht',
  },
  intro: {
    eyebrow: 'HEREV PARTNERS',
    heading: "Consulenza nautica. Rappresentanza dell'acquirente. Negoziazione.",
    body: "Siamo il principale consulente per acquirenti di yacht nell'Europa centrale, con un supporto completo dalla scelta dello yacht alle trattative con i concessionari, fino ad assicurazione e soluzioni di proprietà.",
    statLabels: { ateliers: 'ATELIER', years: 'ANNI', relationship: 'RELAZIONE' },
  },
  fleet: {
    enquire: 'Richiedi →',
  },
  stock: {
    eyebrow: 'CONSEGNA IMMEDIATA',
    heading: 'Yacht disponibili ora',
    subheading:
      'Per i clienti per cui il tempo conta, offriamo una selezione di yacht disponibili per consegna immediata in questa stagione.',
    viewAll: 'TUTTI I DISPONIBILI →',
    enquire: 'Richiedi',
    moreInfo: 'Maggiori info →',
    exTax: 'IVA ESCLUSA',
    taxPaid: 'IVA PAGATA',
    page: {
      eyebrow: 'DISPONIBILI ORA',
      heading: 'Yacht disponibili per consegna immediata.',
      subheading: 'Unità concrete pronte per questa stagione — ispezionate, prezzate e pronte alla consegna.',
      backToList: '← Tutti gli yacht disponibili',
      keyNumbers: { price: 'PREZZO', year: 'ANNO', length: 'LUNGHEZZA', hours: 'ORE MOTORE', location: 'UBICAZIONE' },
      enquireHeadingPrefix: 'Richiedi informazioni su questo',
      brandLine: 'DISPONIBILE PER CONSEGNA IMMEDIATA',
      overviewLabel: 'SU QUESTA UNITÀ',
    },
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
    advise: {
      heading: 'Affianchiamo gli acquirenti in tutto il percorso di acquisto di uno yacht nuovo:',
      bullets: [
        { lead: 'Definire la scelta giusta', rest: "attraverso l'analisi delle esigenze, il confronto dei modelli e la creazione di una shortlist." },
        { lead: 'Ottenere condizioni migliori', rest: 'con benchmark di prezzo, indicazioni sugli sconti e supporto nelle trattative con il concessionario.' },
        { lead: 'Ottimizzare la specifica', rest: "di motori, layout ed equipaggiamento in base all'uso reale e al budget." },
        { lead: "Supervisionare l'intero processo", rest: "dalla struttura dell'acquisto e l'immatricolazione fino alla consegna" },
      ],
    },
    represent: {
      heading: 'Hai già scelto il tuo yacht e sai esattamente cosa vuoi? Lascia che ti rappresentiamo.',
      bullets: [
        { lead: 'Sfrutta la nostra esperienza', rest: 'e i rapporti diretti con i cantieri di tutta Europa.' },
        { lead: 'Ispeziona lo yacht di persona', rest: 'in uno dei nostri marina partner di fiducia.' },
        { lead: 'Verifica la tua decisione', rest: 'con il nostro consulente e assicurati che nulla di importante sia stato trascurato.' },
        { lead: 'Acquista con fiducia', rest: '— lo yacht sbagliato è un errore costoso.' },
      ],
    },
  },
  guide: {
    heading: "LA GUIDA DELL'ACQUIRENTE DI YACHT",
    body: "Evita errori costosi e prendi una decisione d'acquisto più consapevole con la nostra guida pratica per chi compra il primo yacht.",
    emailPlaceholder: 'Inserisci il tuo indirizzo email',
    cta: 'Ricevi la tua copia',
  },
  shipyards: {
    eyebrow: 'LAVORIAMO CON',
    heading: "I PRINCIPALI CANTIERI D'EUROPA",
    body: 'Come consulenti indipendenti, presentiamo una selezione curata di marchi e modelli che conosciamo bene e raccomandiamo regolarmente ai nostri clienti.',
  },
  statement: {
    headingLine1: 'NON VENDIAMO YACHT',
    headingLine2: 'TI AIUTIAMO A COMPRARE QUELLO GIUSTO',
    body: 'Acquistare uno yacht è complesso. Semplifichiamo il processo rappresentando i tuoi interessi in ogni fase — individuando le opportunità giuste, orientandoci nel mercato e garantendo un acquisto senza intoppi',
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
    countries: 'PAESI',
    berths: 'ORMEGGI',
    models: 'MODELLI',
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
    enquireCta: 'Richiedi un\'offerta →',
    bookViewingCta: 'Prenota una visita',
    brochureCta: 'Scarica la brochure',
    keyNumbers: {
      length: 'LUNGHEZZA TOTALE',
      cabins: 'CABINE',
      guests: 'OSPITI',
      speed: 'VELOCITÀ MAX.',
    },
    whyLabel: 'PERCHÉ SCEGLIERE IL {name}',
    features: {
      eyebrow: 'CARATTERISTICHE DISTINTIVE',
      heading: 'Ciò che la distingue',
    },
    lifestyle: {
      eyebrow: 'LO STILE DI VITA {name}',
      heading: 'Progettata attorno al modo in cui usi davvero uno yacht',
    },
    spacesEyebrow: 'ESPERIENZA DEGLI INTERNI',
    video: {
      eyebrow: 'IN AZIONE',
      heading: 'Guarda il {name} in azione',
      play: 'Riproduci video',
    },
    galleryHeading: 'GALLERIA',
    galleryTitle: 'A bordo del',
    galleryAll: 'Tutte',
    galleryImages: 'immagini',
    galleryCategories: {
      exterior: 'Esterni',
      interior: 'Interni',
      cockpit: 'Pozzetto',
      cabins: 'Cabine',
      lifestyle: 'Stile di vita',
    },
    deckPlansHeading: 'PIANI DI COPERTA',
    deckPlansSubtitle: 'Ogni ponte, pensato per la vita reale',
    deckFallback: 'Ponte',
    viewFullSize: 'Vedi a grandezza naturale',
    specsEyebrow: 'SPECIFICHE TECNICHE',
    specsSubtitle: 'La misura completa',
    specsGroups: {
      dimensions: 'DIMENSIONI',
      accommodation: 'ALLOGGIO',
      performance: 'PRESTAZIONI',
      capacities: 'CAPACITÀ',
    },
    specs: {
      length: 'Lunghezza totale',
      beam: 'Larghezza',
      draft: 'Pescaggio',
      cabins: 'Cabine',
      berths: 'Ospiti',
      engines: 'Motori',
      speed: 'Velocità max.',
      cruiseSpeed: 'Velocità di crociera',
      fuel: 'Capacità carburante',
      water: 'Capacità acqua',
      ceCategory: 'Categoria CE',
      year: 'Anno modello',
    },
    compare: {
      eyebrow: 'CONFRONTA LA GAMMA',
      heading: 'La sua posizione nella gamma {brand}',
      model: 'Modello',
      length: 'Lunghezza',
      cabins: 'Cabine',
      guests: 'Ospiti',
      speed: 'Velocità max.',
      current: 'Questo modello',
    },
    recommendedEyebrow: 'POTRESTI ANCHE CONSIDERARE',
    recommendedHeading: 'Potresti anche considerare',
    viewAllLabel: 'TUTTI GLI YACHT →',
    financing: {
      eyebrow: 'LEASING · CREDITO · INVESTIMENTO IN CHARTER',
      copy: 'Ci sono diversi modi sensati per possedere questo yacht — dal leasing marittimo alla gestione charter che la mette al lavoro quando sei a terra. Ti guideremo attraverso le opzioni più adatte.',
      cta: 'Chiedi informazioni sul finanziamento →',
    },
    readyHeading: 'Pronto a vivere il {name}?',
    leadEyebrow: 'NESSUN OBBLIGO',
    mobileCta: {
      enquire: 'Richiedi',
    },
    financingCheckbox: 'Sono interessato alle opzioni di finanziamento',
    privacyCheckbox: 'Accetto di essere contattato da Herev riguardo a questa richiesta e accetto la politica sulla privacy.',
    emailPlaceholder: 'Email',
    phonePlaceholder: 'Telefono',
    sendEnquiry: 'Invia richiesta →',
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
    pagination: { label: 'Pagine del giornale', newer: '← Più recenti', older: 'Meno recenti →', page: 'Pagina' },
  },
  networkPage: {
    hero: {
      breadcrumbHome: 'Home',
      eyebrow: 'RAPPRESENTANZA AUTORIZZATA · MONDIALE',
      heading: 'Rete globale di concessionari',
      subtext: 'Trova concessionari autorizzati e partner di assistenza dei principali marchi nautici del mondo. La nostra rete globale ti garantisce il massimo livello di competenza e supporto, ovunque tu sia.',
    },
    stats: { brands: 'MARCHI', dealers: 'CONCESSIONARI', countries: 'PAESI', continents: 'CONTINENTI' },
    regions: {
      europe: 'Europa',
      'north-america': 'America del Nord',
      'south-america': 'America del Sud',
      asia: 'Asia e Medio Oriente',
      africa: 'Africa',
      oceania: 'Oceania',
      other: 'Altro',
    },
    explorer: {
      filters: {
        title: 'Filtra concessionari',
        reset: 'Azzera',
        brands: 'MARCHIO',
        allBrands: 'Tutti i marchi',
        region: 'REGIONE',
        allRegions: 'Tutte le regioni',
        viewList: 'Vedi elenco ({n})',
      },
      list: {
        title: 'Elenco concessionari',
        found: '{n} concessionari trovati',
        sortBy: 'Ordina per',
        sortCountry: 'Paese',
        sortName: 'Nome',
        sortNearest: 'Più vicino',
        authorised: 'CONCESSIONARIO AUTORIZZATO',
        viewDetails: 'Vedi dettagli',
        loadMore: 'Carica altri concessionari',
        noResults: 'Nessun concessionario corrisponde a questi filtri.',
      },
      map: {
        containerLabel: 'Mappa della rete di concessionari',
        useLocation: 'Usa la mia posizione',
        locating: 'Localizzazione…',
        located: 'Trovato · {country}',
        denied: 'Posizione disattivata',
        tapToExplore: 'Tocca per esplorare la mappa',
        zoomIn: 'Ingrandisci',
        zoomOut: 'Riduci',
      },
    },
    directory: {
      eyebrow: 'CATALOGO',
      heading: 'Esplora la rete per paese',
    },
    brandsStrip: { title: 'I NOSTRI MARCHI' },
    cta: {
      eyebrow: 'NESSUN CONCESSIONARIO VICINO?',
      heading: 'Cerchi un concessionario nella tua zona?',
      subtext: 'Non trovi quello che cerchi? Contattaci e ti metteremo in contatto con il partner giusto.',
      ctaLabel: 'Contattaci',
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
  },
};

const translations: Record<Locale, Translations> = { en, pl, es, it };

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}
