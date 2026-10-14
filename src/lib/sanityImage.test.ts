import { describe, expect, test } from 'vitest';
import { cmsImageSrcset, toCmsImage } from './sanityImage';

const asset = { _type: 'reference' as const, _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x1000-jpg' };

describe('toCmsImage', () => {
  test('uncropped image keeps its size and has no focal point', () => {
    const image = toCmsImage({ asset }, 'Alt');
    expect(image).toMatchObject({ width: 2000, height: 1000, alt: 'Alt', objectPosition: undefined });
    expect(image.url).toContain('Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x1000.jpg');
  });

  test('crop shrinks the image; the hotspot is placed relative to the crop', () => {
    const image = toCmsImage(
      {
        asset,
        crop: { top: 0, bottom: 0.5, left: 0.25, right: 0.25 },
        hotspot: { x: 0.5, y: 0.25 },
      },
      'Alt',
    );
    expect(image).toMatchObject({ width: 1000, height: 500, objectPosition: '50% 50%' });
    expect(image.url).toContain('rect=500,0,1000,500');
  });
});

describe('cmsImageSrcset', () => {
  test('one CDN size per width, keeping the crop', () => {
    expect(cmsImageSrcset('https://cdn.sanity.io/images/p/d/a-2000x1000.jpg?rect=0,0,10,10', [480, 960])).toBe(
      'https://cdn.sanity.io/images/p/d/a-2000x1000.jpg?rect=0%2C0%2C10%2C10&w=480&auto=format 480w, ' +
        'https://cdn.sanity.io/images/p/d/a-2000x1000.jpg?rect=0%2C0%2C10%2C10&w=960&auto=format 960w',
    );
  });
});
