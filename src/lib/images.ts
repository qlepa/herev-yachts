import type { ImageMetadata } from 'astro';

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
