import { describe, expect, test } from 'vitest';
import { createImageHelper } from './images';
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
