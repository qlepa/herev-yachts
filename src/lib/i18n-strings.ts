import type { Locale } from './i18n';
import type { CategoryKey } from '../content.config';

export interface NavStrings {
  fleet: string;
  brands: string;
  compare: string;
  network: string;
  journal: string;
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
  fleet: {
    eyebrow: string;
    heading: string;
    subheading: string;
    viewAll: string;
    enquire: string;
    priceOnRequest: string;
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
    linkLabel: string;
    imageCaption: string;
  };
  footer: {
    tagline: string;
    explore: string;
    company: string;
    language: string;
    links: {
      fleet: string;
      brands: string;
      compare: string;
      journal: string;
      network: string;
      about: string;
      trials: string;
      contact: string;
    };
    legal: string;
  };
}

const en: Translations = {
  meta: {
    title: 'Herev — Premium Yacht Representation',
    description:
      'Authorised representation for Galeon, Parker, Saxdor, De Antonio and Chris-Craft. Find your yacht across our network of showrooms.',
  },
  nav: {
    fleet: 'Fleet',
    brands: 'Brands',
    compare: 'Compare',
    network: 'Our Network',
    journal: 'Journal',
    enquire: 'Enquire',
    call: 'Call',
  },
  hero: {
    eyebrow: 'AUTHORISED REPRESENTATION · FIVE ATELIERS',
    heading: 'The sea, on your terms.',
    subtext:
      "We represent five of the world's most considered yacht builders — each chosen for a different reason, all sharing an uncommon standard of finish.",
    cta1: 'Explore by brand',
    cta2: 'Find by length & price',
  },
  fleet: {
    eyebrow: 'FEATURED FLEET · MMXXVI',
    heading: 'A short, deliberate selection.',
    subheading:
      'Five builders. One standard. Every vessel chosen because nothing else performs its role as well.',
    viewAll: 'VIEW ALL MODELS →',
    enquire: 'Enquire →',
    priceOnRequest: 'Price on request',
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
    linkLabel: 'VIEW FULL NETWORK →',
    imageCaption: 'WARSAW · GDYNIA · PALMA',
  },
  footer: {
    tagline: 'Premium yacht representation across European waters.',
    explore: 'EXPLORE',
    company: 'COMPANY',
    language: 'LANGUAGE',
    links: {
      fleet: 'Fleet',
      brands: 'Brands',
      compare: 'Compare',
      journal: 'Journal',
      network: 'Our Network',
      about: 'About Herev',
      trials: 'Sea Trials',
      contact: 'Contact',
    },
    legal: '© MMXXVI HEREV · LEGAL · PRIVACY · COOKIES',
  },
};

const pl: Translations = {
  meta: {
    title: 'Herev — Reprezentacja Premium Jachtów',
    description:
      'Autoryzowana reprezentacja Galeon, Parker, Saxdor, De Antonio i Chris-Craft. Znajdź swój jacht w naszej sieci salonów.',
  },
  nav: {
    fleet: 'Flota',
    brands: 'Marki',
    compare: 'Porównaj',
    network: 'Nasza Sieć',
    journal: 'Aktualności',
    enquire: 'Zapytaj',
    call: 'Zadzwoń',
  },
  hero: {
    eyebrow: 'AUTORYZOWANA REPREZENTACJA · PIĘĆ ATELIER',
    heading: 'Morze, na Twoich zasadach.',
    subtext:
      'Reprezentujemy pięciu najbardziej przemyślanych producentów jachtów na świecie — każdego z innego powodu, wszystkich łączy wyjątkowy standard wykończenia.',
    cta1: 'Odkryj według marki',
    cta2: 'Szukaj według długości i ceny',
  },
  fleet: {
    eyebrow: 'WYBRANA FLOTA · MMXXVI',
    heading: 'Krótka, przemyślana selekcja.',
    subheading:
      'Pięciu producentów. Jeden standard. Każda jednostka wybrana dlatego, że nic innego nie spełnia swojej roli równie dobrze.',
    viewAll: 'WSZYSTKIE MODELE →',
    enquire: 'Zapytaj →',
    priceOnRequest: 'Cena na zapytanie',
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
    linkLabel: 'PEŁNA SIEĆ →',
    imageCaption: 'WARSZAWA · GDYNIA · PALMA',
  },
  footer: {
    tagline: 'Reprezentacja premium jachtów na europejskich wodach.',
    explore: 'ODKRYJ',
    company: 'FIRMA',
    language: 'JĘZYK',
    links: {
      fleet: 'Flota',
      brands: 'Marki',
      compare: 'Porównaj',
      journal: 'Aktualności',
      network: 'Nasza Sieć',
      about: 'O Herev',
      trials: 'Rejsy Próbne',
      contact: 'Kontakt',
    },
    legal: '© MMXXVI HEREV · INFORMACJE PRAWNE · PRYWATNOŚĆ · COOKIES',
  },
};

const es: Translations = {
  meta: {
    title: 'Herev — Representación Premium de Yates',
    description:
      'Representación autorizada de Galeon, Parker, Saxdor, De Antonio y Chris-Craft. Encuentra tu yate en nuestra red de concesionarios.',
  },
  nav: {
    fleet: 'Flota',
    brands: 'Marcas',
    compare: 'Comparar',
    network: 'Nuestra Red',
    journal: 'Diario',
    enquire: 'Consultar',
    call: 'Llamar',
  },
  hero: {
    eyebrow: 'REPRESENTACIÓN AUTORIZADA · CINCO ATELIERS',
    heading: 'El mar, en tus términos.',
    subtext:
      'Representamos a cinco de los constructores de yates más reflexivos del mundo — cada uno elegido por una razón diferente, todos compartiendo un estándar de acabado poco común.',
    cta1: 'Explorar por marca',
    cta2: 'Buscar por eslora y precio',
  },
  fleet: {
    eyebrow: 'FLOTA DESTACADA · MMXXVI',
    heading: 'Una selección breve y deliberada.',
    subheading:
      'Cinco constructores. Un estándar. Cada embarcación elegida porque nada más cumple su función igual de bien.',
    viewAll: 'VER TODOS LOS MODELOS →',
    enquire: 'Consultar →',
    priceOnRequest: 'Precio a consultar',
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
    linkLabel: 'VER RED COMPLETA →',
    imageCaption: 'VARSOVIA · GDYNIA · PALMA',
  },
  footer: {
    tagline: 'Representación premium de yates en aguas europeas.',
    explore: 'EXPLORAR',
    company: 'EMPRESA',
    language: 'IDIOMA',
    links: {
      fleet: 'Flota',
      brands: 'Marcas',
      compare: 'Comparar',
      journal: 'Diario',
      network: 'Nuestra Red',
      about: 'Sobre Herev',
      trials: 'Pruebas de Mar',
      contact: 'Contacto',
    },
    legal: '© MMXXVI HEREV · AVISO LEGAL · PRIVACIDAD · COOKIES',
  },
};

const it: Translations = {
  meta: {
    title: 'Herev — Rappresentanza Premium di Yacht',
    description:
      'Rappresentanza autorizzata di Galeon, Parker, Saxdor, De Antonio e Chris-Craft. Trova il tuo yacht nella nostra rete di concessionari.',
  },
  nav: {
    fleet: 'Flotta',
    brands: 'Marchi',
    compare: 'Confronta',
    network: 'La Nostra Rete',
    journal: 'Rivista',
    enquire: 'Richiedi',
    call: 'Chiama',
  },
  hero: {
    eyebrow: 'RAPPRESENTANZA AUTORIZZATA · CINQUE ATELIER',
    heading: 'Il mare, a modo tuo.',
    subtext:
      'Rappresentiamo cinque dei costruttori di yacht più attenti al mondo — ognuno scelto per una ragione diversa, tutti accomunati da uno standard di finitura fuori dal comune.',
    cta1: 'Esplora per marchio',
    cta2: 'Cerca per lunghezza e prezzo',
  },
  fleet: {
    eyebrow: 'FLOTTA IN EVIDENZA · MMXXVI',
    heading: 'Una selezione breve e deliberata.',
    subheading:
      'Cinque costruttori. Uno standard. Ogni imbarcazione scelta perché nient\'altro svolge il suo ruolo altrettanto bene.',
    viewAll: 'TUTTI I MODELLI →',
    enquire: 'Richiedi →',
    priceOnRequest: 'Prezzo su richiesta',
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
    linkLabel: 'VEDI RETE COMPLETA →',
    imageCaption: 'VARSAVIA · DANZICA · PALMA',
  },
  footer: {
    tagline: 'Rappresentanza premium di yacht nelle acque europee.',
    explore: 'ESPLORA',
    company: 'AZIENDA',
    language: 'LINGUA',
    links: {
      fleet: 'Flotta',
      brands: 'Marchi',
      compare: 'Confronta',
      journal: 'Rivista',
      network: 'La Nostra Rete',
      about: 'Chi Siamo',
      trials: 'Prove in Mare',
      contact: 'Contatti',
    },
    legal: '© MMXXVI HEREV · NOTE LEGALI · PRIVACY · COOKIE',
  },
};

// TODO: translate to Russian — using English stubs until content team delivers copy
const ru: Translations = { ...en };

const translations: Record<Locale, Translations> = { en, pl, es, it, ru };

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}
