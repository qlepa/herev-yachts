import { createClient } from '@sanity/client';
import type { SanityImage } from '../sanityImage';
import type { Locale } from '../i18n';

export type { SanityImage };

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  category?: string;
  locale: Locale;
  /** _id of the English version this post is a translation of. Undefined for the English version itself. */
  translationOf?: string;
  image?: SanityImage;
}

export interface BlogPost extends BlogPostSummary {
  body: unknown[];
  seo?: { title?: string; description?: string };
}

/** Groups a post with its translations: the English post's own id, or the id it's a translation of. */
export function translationGroupId(post: BlogPostSummary): string {
  return post.translationOf ?? post.id;
}

const client = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,
  apiVersion: '2026-08-24',
  useCdn: true,
  token: import.meta.env.SANITY_API_READ_TOKEN,
});

const SUMMARY_PROJECTION = `{
  "id": _id,
  "slug": slug.current,
  title,
  excerpt,
  publishedAt,
  "updatedAt": _updatedAt,
  category,
  locale,
  "translationOf": translationOf._ref,
  image
}`;

const FULL_PROJECTION = `{
  "id": _id,
  "slug": slug.current,
  title,
  excerpt,
  publishedAt,
  "updatedAt": _updatedAt,
  category,
  locale,
  "translationOf": translationOf._ref,
  image,
  body,
  seo
}`;

export async function listBlogPosts(locale: Locale): Promise<BlogPostSummary[]> {
  return client.fetch(
    `*[_type == "post" && locale == $locale && draft != true] | order(publishedAt desc) ${SUMMARY_PROJECTION}`,
    { locale },
  );
}

export async function listAllBlogPosts(): Promise<BlogPost[]> {
  return client.fetch(
    `*[_type == "post" && draft != true] | order(publishedAt desc) ${FULL_PROJECTION}`,
  );
}
