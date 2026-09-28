import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { GALLERY_CATEGORIES, LIFESTYLE_ICONS } from './lib/yacht-enums';

export { GALLERY_CATEGORIES, LIFESTYLE_ICONS };
export type { GalleryCategory, LifestyleIcon } from './lib/yacht-enums';

export const BRAND_KEYS = ['galeon', 'parker', 'saxdor', 'de-antonio', 'chris-craft'] as const;
export type BrandKey = (typeof BRAND_KEYS)[number];

const seoSchema = z.object({
  title: z.string().max(60).optional(),
  description: z.string().max(160).optional(),
});

export const CATEGORY_KEYS = [
  'flybridge',
  'hardtop',
  'open',
  'weekender',
  'day',
  'grand-tourer',
  'runabout',
] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

/**
 * Yacht model page. Technical fields are identical across locales; text
 * fields (tagline, features, lifestyle, spaces, layouts, video caption)
 * are translated per file. The markdown body is the "Why choose" section:
 * `## heading`, paragraph(s) and a `-` list rendered as a benefit checklist.
 * Every optional section is simply not rendered when its data is absent.
 */
const yachts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/yachts' }),
  schema: z.object({
    translationKey: z.string(),
    name: z.string(),
    brand: z.enum(BRAND_KEYS),
    /** One-line hero subline, e.g. "Sport cruiser outside. Flybridge yacht inside." */
    tagline: z.string().max(140).optional(),
    year: z.number().int(),
    lengthM: z.number(),
    cabins: z.number().int(),
    beamM: z.number().optional(),
    draftM: z.number().optional(),
    berths: z.number().int().optional(),
    maxSpeedKn: z.number().optional(),
    cruiseSpeedKn: z.number().optional(),
    fuelL: z.number().optional(),
    waterL: z.number().optional(),
    engines: z.string().optional(),
    /** CE design category, e.g. "B" */
    ceCategory: z.string().max(4).optional(),
    muxPlaybackId: z.string().optional(),
    category: z.enum(CATEGORY_KEYS).optional(),
    /** Signature features — up to 6 cards; optional images feature-NN.jpg match by index */
    features: z
      .array(z.object({ title: z.string().max(40), body: z.string().max(160) }))
      .max(6)
      .optional(),
    /** Lifestyle pillars over a full-width image */
    lifestyle: z
      .object({
        heading: z.string().max(120).optional(),
        pillars: z
          .array(
            z.object({
              icon: z.enum(LIFESTYLE_ICONS).optional(),
              title: z.string().max(40),
              body: z.string().max(160),
            }),
          )
          .min(1)
          .max(3),
      })
      .optional(),
    /** Interior spaces shown as tabs; image space-NN.jpg matches by index */
    spaces: z
      .array(
        z.object({
          title: z.string().max(40),
          heading: z.string().max(80),
          body: z.string().max(500),
          highlights: z.array(z.string().max(60)).max(6).optional(),
        }),
      )
      .max(6)
      .optional(),
    /** YouTube or Vimeo page URL — embedded click-to-play */
    video: z
      .object({ url: z.string().url(), caption: z.string().max(120).optional() })
      .optional(),
    /** Deck plan titles in layout-NN order, e.g. ["Main deck", "Lower deck"] */
    layouts: z.array(z.string().max(40)).max(6).optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(true),
    seo: seoSchema.optional(),
  }),
});

const brands = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/brands' }),
  schema: z.object({
    brandKey: z.enum(BRAND_KEYS),
    name: z.string(),
    tagline: z.string().max(120),
    website: z.string().url().optional(),
    muxPlaybackId: z.string().optional(),
    defaultDealer: z.string(),
    order: z.number().int(),
    seo: seoSchema.optional(),
  }),
});

const dealers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/dealers' }),
  schema: z.object({
    dealerId: z.string(),
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    brands: z.array(z.enum(BRAND_KEYS)),
    pipedriveOptionLabel: z.string(),
  }),
});

// Stock = individual units available for immediate delivery (typically
// pre-owned). The ONLY place a price is published on the site — catalogue
// yachts keep priceEur internal.
export const CURRENCY_KEYS = ['EUR', 'GBP', 'PLN'] as const;
export type CurrencyKey = (typeof CURRENCY_KEYS)[number];
export const TAX_STATUS_KEYS = ['ex-tax', 'tax-paid'] as const;
export type TaxStatusKey = (typeof TAX_STATUS_KEYS)[number];

const stock = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stock' }),
  schema: z.object({
    translationKey: z.string(),
    name: z.string(),
    brand: z.enum(BRAND_KEYS),
    /** translationKey of the catalogue model, when one exists */
    modelKey: z.string().optional(),
    year: z.number().int(),
    lengthM: z.number(),
    cabins: z.number().int(),
    price: z.number().positive(),
    currency: z.enum(CURRENCY_KEYS),
    taxStatus: z.enum(TAX_STATUS_KEYS),
    condition: z.enum(['new', 'used']).default('used'),
    engineHours: z.number().int().nonnegative().optional(),
    location: z.string().optional(),
    beamM: z.number().optional(),
    draftM: z.number().optional(),
    berths: z.number().int().optional(),
    maxSpeedKn: z.number().optional(),
    engines: z.string().optional(),
    category: z.enum(CATEGORY_KEYS).optional(),
    sold: z.boolean().default(false),
    draft: z.boolean().default(true),
    seo: seoSchema.optional(),
  }),
});

export const collections = { yachts, brands, dealers, stock };
