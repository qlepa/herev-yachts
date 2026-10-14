import { stegaClean } from '@sanity/client/stega';
import { createDataAttribute } from '@sanity/visual-editing/create-data-attribute';
import type { Locale } from '../../i18n';
import { toCmsImage, type CmsImageData, type SanityPlacedImage } from '../../sanityImage';
import { HOME_PAGE_ID } from '../../../sanity/documentIds';
import { loadQuery } from './client';
import { localize } from './localize';

export interface Stat {
  value: string;
  label: string;
}

export interface AdvisoryBlock {
  heading: string;
  bullets: Array<{ lead: string; rest: string }>;
  image: CmsImageData;
}

export interface HomePage {
  seo: { title: string; description: string };
  hero: { heading: string; subtext: string; cta1: string; cta2: string; video?: string; image: CmsImageData };
  intro: { eyebrow: string; heading: string; body: string; stats: Stat[] };
  advisory: { advise: AdvisoryBlock; represent: AdvisoryBlock };
  guide: { heading: string; body: string; emailPlaceholder: string; cta: string };
  shipyards: { eyebrow: string; heading: string; body: string; image: CmsImageData };
  statement: { headingLine1: string; headingLine2: string; body: string };
  network: {
    eyebrow: string;
    heading: string;
    body: string;
    countriesLabel: string;
    stats: Stat[];
    linkLabel: string;
    image: CmsImageData;
    imageCaption: string;
  };
}

type Doc = Record<string, unknown>;

/**
 * Maps the `homePage` document to one language. Published content must be
 * complete — the build fails on a missing text or image; a draft in the
 * preview renders blanks instead (the Studio shows what is missing).
 */
export function toHomePage(doc: unknown, locale: Locale, draftMode: boolean): HomePage {
  if (!doc) throw new Error(`Sanity: document ${HOME_PAGE_ID} (Strona główna) does not exist`);
  const missing: string[] = [];
  const d = localize(doc, locale, missing) as Doc;

  const at = (path: string): unknown =>
    path.split('.').reduce<unknown>((node, key) => (node as Doc | undefined)?.[key], d);
  const text = (path: string): string => {
    const value = at(path);
    if (typeof value === 'string' && value.trim()) return value;
    if (!missing.includes(path)) missing.push(path);
    return '';
  };
  const image = (path: string): CmsImageData => {
    const value = at(path) as (SanityPlacedImage & { alt?: string }) | undefined;
    if (!value?.asset) {
      missing.push(path);
      return { url: '', width: 1, height: 1, alt: '' };
    }
    return {
      ...toCmsImage(value, text(`${path}.alt`)),
      dataSanity: draftMode
        ? createDataAttribute({ baseUrl: '/admin', id: HOME_PAGE_ID, type: 'homePage', path }).toString()
        : undefined,
    };
  };
  const stats = (path: string, count: number): Stat[] =>
    Array.from({ length: count }, (_, i) => ({
      value: text(`${path}.${i}.value`),
      label: text(`${path}.${i}.label`),
    }));
  const advisoryBlock = (path: string): AdvisoryBlock => ({
    heading: text(`${path}.heading`),
    bullets: ((at(`${path}.bullets`) as unknown[] | undefined) ?? []).map((_, i) => ({
      lead: text(`${path}.bullets.${i}.lead`),
      rest: text(`${path}.bullets.${i}.rest`),
    })),
    image: image(`${path}.image`),
  });

  const page: HomePage = {
    seo: { title: text('seo.title'), description: text('seo.description') },
    hero: {
      heading: text('hero.heading'),
      subtext: text('hero.subtext'),
      cta1: text('hero.cta1'),
      cta2: text('hero.cta2'),
      // Ends up in <source src> — no stega there.
      video: stegaClean(at('hero.video') as string | undefined) || undefined,
      image: image('hero.image'),
    },
    intro: {
      eyebrow: text('intro.eyebrow'),
      heading: text('intro.heading'),
      body: text('intro.body'),
      stats: stats('intro.stats', 3),
    },
    advisory: { advise: advisoryBlock('advisory.advise'), represent: advisoryBlock('advisory.represent') },
    guide: {
      heading: text('guide.heading'),
      body: text('guide.body'),
      emailPlaceholder: text('guide.emailPlaceholder'),
      cta: text('guide.cta'),
    },
    shipyards: {
      eyebrow: text('shipyards.eyebrow'),
      heading: text('shipyards.heading'),
      body: text('shipyards.body'),
      image: image('shipyards.image'),
    },
    statement: {
      headingLine1: text('statement.headingLine1'),
      headingLine2: text('statement.headingLine2'),
      body: text('statement.body'),
    },
    network: {
      eyebrow: text('network.eyebrow'),
      heading: text('network.heading'),
      body: text('network.body'),
      countriesLabel: text('network.countriesLabel'),
      stats: stats('network.stats', 2),
      linkLabel: text('network.linkLabel'),
      image: image('network.image'),
      imageCaption: text('network.imageCaption'),
    },
  };
  if (missing.length && !draftMode) {
    throw new Error(`Sanity: ${HOME_PAGE_ID} (${locale}) is missing: ${[...new Set(missing)].join(', ')}`);
  }
  return page;
}

let buildCache: Promise<unknown> | undefined;

/** Homepage content in one language; one query for the whole build, per request on the CMS. */
export async function loadHomePage(
  locale: Locale,
  page: { isPrerendered: boolean; locals: App.Locals },
): Promise<HomePage> {
  const draftMode = page.locals.draftMode === true;
  const fetch = (draft: boolean) => loadQuery<unknown>('*[_id == $id][0]', { id: HOME_PAGE_ID }, draft);
  const doc = page.isPrerendered ? await (buildCache ??= fetch(false)) : await fetch(draftMode);
  return toHomePage(doc, locale, draftMode);
}
