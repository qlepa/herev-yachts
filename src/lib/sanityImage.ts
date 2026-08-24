import imageUrlBuilder from '@sanity/image-url';
import { getImageDimensions } from '@sanity/asset-utils';

export interface SanityImage {
  asset: { _ref: string; _type: 'reference' };
  alt?: string;
}

const builder = imageUrlBuilder({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,
});

export function urlForImage(image: SanityImage) {
  return builder.image(image);
}

export function imageDimensions(image: SanityImage) {
  return getImageDimensions(image.asset._ref);
}

/** Widths used to build a responsive srcset for blog cover images. */
export const BLOG_IMAGE_WIDTHS = [480, 768, 1024, 1440, 1920] as const;

export function srcsetForImage(image: SanityImage): string {
  return BLOG_IMAGE_WIDTHS.map(
    (w) => `${builder.image(image).width(w).auto('format').url()} ${w}w`,
  ).join(', ');
}
