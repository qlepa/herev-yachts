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

/** An image placed in the Studio: cropped and with a focal point (hotspot). */
export interface SanityPlacedImage extends SanityImage {
  crop?: { top: number; bottom: number; left: number; right: number };
  hotspot?: { x: number; y: number };
}

/** A CMS image ready to render (`CmsImage` component). */
export interface CmsImageData {
  /** Full-size image with the crop applied; empty when a draft has no image. */
  url: string;
  width: number;
  height: number;
  alt: string;
  /** CSS `object-position` keeping the hotspot in frame when the image is cut by `object-cover`. */
  objectPosition?: string;
  /** `data-sanity` attribute: clicking the image in the preview opens its field. */
  dataSanity?: string;
}

export function toCmsImage(image: SanityPlacedImage, alt: string): CmsImageData {
  const full = imageDimensions(image);
  const crop = image.crop ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const cropWidth = 1 - crop.left - crop.right;
  const cropHeight = 1 - crop.top - crop.bottom;
  const percent = (n: number) => `${Math.round(Math.min(1, Math.max(0, n)) * 1000) / 10}%`;
  return {
    url: builder.image(image).url(),
    width: Math.round(full.width * cropWidth),
    height: Math.round(full.height * cropHeight),
    alt,
    objectPosition: image.hotspot
      ? `${percent((image.hotspot.x - crop.left) / cropWidth)} ${percent((image.hotspot.y - crop.top) / cropHeight)}`
      : undefined,
  };
}

/** Responsive srcset straight from the Sanity CDN (CMS preview). */
export function cmsImageSrcset(url: string, widths: number[]): string {
  return widths
    .map((w) => {
      const sized = new URL(url);
      sized.searchParams.set('w', String(w));
      sized.searchParams.set('auto', 'format');
      return `${sized.href} ${w}w`;
    })
    .join(', ');
}
