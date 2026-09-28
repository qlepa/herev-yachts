import type { ImageMetadata } from 'astro';
import { GALLERY_CATEGORIES, type GalleryCategory } from './yacht-enums';

type HeroLoader = () => Promise<{ default: ImageMetadata }>;

export function createImageHelper(
  heroes: Record<string, HeroLoader>,
  baseDir: 'yachts' | 'stock' = 'yachts',
) {
  return async function getHero(
    translationKey: string,
    draft = false,
  ): Promise<ImageMetadata | null> {
    if (draft) return null;
    const prefix = `/src/assets/${baseDir}/${translationKey}/hero.`;
    const key = Object.keys(heroes).find((k) => k.startsWith(prefix));
    if (!key) {
      throw new Error(
        `[herev] Missing hero image for published yacht "${translationKey}". ` +
          `Add src/assets/${baseDir}/${translationKey}/hero.{jpg,jpeg,avif,webp} or keep draft: true.`,
      );
    }
    return (await heroes[key]()).default;
  };
}

const yachtHeroes = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/yachts/*/hero.*',
);

export const getYachtHero = createImageHelper(yachtHeroes);

const stockHeroes = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/stock/*/hero.*',
);

export const getStockHero = createImageHelper(stockHeroes, 'stock');

const brandHeroes = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/brands/*/hero.*',
);

export async function getBrandHero(brandKey: string): Promise<ImageMetadata | null> {
  const prefix = `/src/assets/brands/${brandKey}/hero.`;
  const key = Object.keys(brandHeroes).find((k) => k.startsWith(prefix));
  if (!key) return null;
  return (await brandHeroes[key]()).default;
}

// ---------------------------------------------------------------------------
// Yacht page image series
// ---------------------------------------------------------------------------

type ImageLoader = () => Promise<{ default: ImageMetadata }>;

/**
 * Parses a gallery filename into its category + order.
 * Accepts `gallery-<category>-NN.ext` and legacy `gallery-NN.ext`
 * (category undefined). Returns null for non-gallery files.
 */
export function parseGalleryName(
  file: string,
  categories: readonly string[],
): { category?: string; order: number } | null {
  const m = /^gallery-(?:([a-z]+)-)?(\d+)\.[a-z0-9]+$/i.exec(file);
  if (!m) return null;
  const [, cat, num] = m;
  if (cat && !categories.includes(cat)) {
    throw new Error(
      `[herev] Unknown gallery category "${cat}" in "${file}". ` +
        `Use one of: ${categories.join(', ')} — or gallery-NN.jpg for uncategorised.`,
    );
  }
  return { category: cat, order: Number(num) };
}

export interface GalleryImage {
  src: ImageMetadata;
  category?: GalleryCategory;
}

/** Sorted by number first (author-controlled order), then category name. */
export function createGalleryHelper(loaders: Record<string, ImageLoader>, baseDir = 'yachts') {
  return async function getGallery(translationKey: string): Promise<GalleryImage[]> {
    const dir = `/src/assets/${baseDir}/${translationKey}/`;
    const entries: Array<{ key: string; category?: string; order: number }> = [];
    for (const key of Object.keys(loaders)) {
      if (!key.startsWith(dir)) continue;
      const meta = parseGalleryName(key.slice(dir.length), GALLERY_CATEGORIES);
      if (meta) entries.push({ key, ...meta });
    }
    entries.sort(
      (a, b) => a.order - b.order || (a.category ?? '').localeCompare(b.category ?? ''),
    );
    return Promise.all(
      entries.map(async (e) => ({
        src: (await loaders[e.key]()).default,
        category: e.category as GalleryCategory | undefined,
      })),
    );
  };
}

/** Loads `<prefix>-NN.*` files from a yacht folder, sorted by filename. */
export function createSeriesHelper(
  loaders: Record<string, ImageLoader>,
  prefix: string,
  baseDir = 'yachts',
) {
  return async function getSeries(translationKey: string): Promise<ImageMetadata[]> {
    const p = `/src/assets/${baseDir}/${translationKey}/${prefix}-`;
    return Promise.all(
      Object.keys(loaders)
        .filter((k) => k.startsWith(p))
        .sort()
        .map(async (k) => (await loaders[k]()).default),
    );
  };
}

const yachtGallery = import.meta.glob<{ default: ImageMetadata }>('/src/assets/yachts/*/gallery-*.*');
const yachtLayouts = import.meta.glob<{ default: ImageMetadata }>('/src/assets/yachts/*/layout-*.*');
const yachtFeatures = import.meta.glob<{ default: ImageMetadata }>('/src/assets/yachts/*/feature-*.*');
const yachtSpaces = import.meta.glob<{ default: ImageMetadata }>('/src/assets/yachts/*/space-*.*');
const stockGallery = import.meta.glob<{ default: ImageMetadata }>('/src/assets/stock/*/gallery-*.*');

export const getYachtGallery = createGalleryHelper(yachtGallery);
export const getYachtLayouts = createSeriesHelper(yachtLayouts, 'layout');
export const getYachtFeatureImages = createSeriesHelper(yachtFeatures, 'feature');
export const getYachtSpaceImages = createSeriesHelper(yachtSpaces, 'space');
export const getStockGallery = createGalleryHelper(stockGallery, 'stock');

// Brochure PDF: one file per yacht, shared by all locales. Resolved to a
// hashed asset URL at build time; undefined when the file is absent.
const yachtBrochures = import.meta.glob<string>('/src/assets/yachts/*/brochure.pdf', {
  query: '?url',
  import: 'default',
});

export async function getYachtBrochure(translationKey: string): Promise<string | undefined> {
  const loader = yachtBrochures[`/src/assets/yachts/${translationKey}/brochure.pdf`];
  return loader ? loader() : undefined;
}
