import { describe, expect, test } from 'vitest';
import { createImageHelper, createGalleryHelper, parseGalleryName } from './images';
import type { ImageMetadata } from 'astro';

const stubMeta: ImageMetadata = {
  src: '/src/assets/yachts/aurora-42/hero.jpg',
  width: 2400,
  height: 1350,
  format: 'jpg',
};

const helper = createImageHelper({
  '/src/assets/yachts/aurora-42/hero.jpg': async () => ({ default: stubMeta }),
});

describe('getYachtHero', () => {
  test('returns ImageMetadata for a published yacht that has a hero', async () => {
    const result = await helper('aurora-42', false);
    expect(result).toBe(stubMeta);
  });

  test('throws a build-time error for a published yacht missing a hero image', async () => {
    await expect(helper('ghost-yacht', false)).rejects.toThrow(
      '[herev] Missing hero image for published yacht "ghost-yacht"',
    );
  });

  test('returns null for a draft yacht without throwing, even if hero.jpg is absent', async () => {
    await expect(helper('ghost-yacht', true)).resolves.toBeNull();
  });
});

describe('parseGalleryName', () => {
  const cats = ['exterior', 'interior'];
  test('categorised filename', () => {
    expect(parseGalleryName('gallery-exterior-02.avif', cats)).toEqual({ category: 'exterior', order: 2 });
  });
  test('legacy uncategorised filename', () => {
    expect(parseGalleryName('gallery-07.jpg', cats)).toEqual({ category: undefined, order: 7 });
  });
  test('non-gallery file is ignored', () => {
    expect(parseGalleryName('hero.jpg', cats)).toBeNull();
  });
  test('unknown category is a build error, not a silent fallback', () => {
    expect(() => parseGalleryName('gallery-engine-01.jpg', cats)).toThrow(
      'Unknown gallery category "engine"',
    );
  });
});

describe('createGalleryHelper', () => {
  const loader = async () => ({ default: stubMeta });
  const getGallery = createGalleryHelper({
    '/src/assets/yachts/a/gallery-interior-01.jpg': loader,
    '/src/assets/yachts/a/gallery-exterior-01.jpg': loader,
    '/src/assets/yachts/a/gallery-02.jpg': loader,
    '/src/assets/yachts/a/hero.jpg': loader,
    '/src/assets/yachts/b/gallery-exterior-01.jpg': loader,
  });
  test('scopes to the yacht folder, orders by number then category', async () => {
    const g = await getGallery('a');
    expect(g.map((i) => i.category)).toEqual(['exterior', 'interior', undefined]);
  });
});
