// Enums shared by the content schema (content.config.ts) and plain
// helpers/tests that must not import 'astro:content'.

// Gallery images are categorised by filename: gallery-<category>-NN.jpg.
// Legacy gallery-NN.jpg (no category) still works and shows under "All".
export const GALLERY_CATEGORIES = ['exterior', 'interior', 'cockpit', 'cabins', 'lifestyle'] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

// Icon set for lifestyle pillars — rendered as inline SVG in YachtLifestyle.
export const LIFESTYLE_ICONS = ['sun', 'family', 'palm', 'anchor', 'wave', 'compass'] as const;
export type LifestyleIcon = (typeof LIFESTYLE_ICONS)[number];
