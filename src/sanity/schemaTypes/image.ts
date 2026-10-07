import { getImageDimensions } from '@sanity/asset-utils';
import type { ImageRule } from 'sanity';

/**
 * Warning (does not block publishing) when an image is narrower than
 * `minWidth` — it would look blurry on large screens.
 */
export function recommendMinWidth(minWidth: number) {
  return (Rule: ImageRule) =>
    Rule.custom((value) => {
      const ref = (value as { asset?: { _ref?: string } } | undefined)?.asset?._ref;
      if (!ref) return true;
      const { width } = getImageDimensions(ref);
      return width >= minWidth
        ? true
        : `Zdjęcie ma tylko ${width} px szerokości — zalecane co najmniej ${minWidth} px, inaczej będzie nieostre na dużych ekranach.`;
    }).warning();
}

/** Shared wording for the alt text field of every image. */
export const ALT_FIELD_DESCRIPTION =
  'Co widać na zdjęciu — czyta to Google i osoby niewidome, np. „Galeon 500 Fly na kotwicy w zatoce”.';
export const ALT_REQUIRED = 'Dodaj opis zdjęcia (alt)';
