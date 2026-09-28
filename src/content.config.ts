import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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

const yachts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/yachts' }),
  schema: z.object({
    translationKey: z.string(),
    name: z.string(),
    brand: z.enum(BRAND_KEYS),
    year: z.number().int(),
    lengthM: z.number(),
    cabins: z.number().int(),
    beamM: z.number().optional(),
    draftM: z.number().optional(),
    berths: z.number().int().optional(),
    maxSpeedKn: z.number().optional(),
    engines: z.string().optional(),
    muxPlaybackId: z.string().optional(),
    category: z.enum(CATEGORY_KEYS).optional(),
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
