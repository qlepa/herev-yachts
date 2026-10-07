import { stegaClean } from '@sanity/client/stega';
import type { SanityImage } from '../../sanityImage';
import type { Locale } from '../../i18n';
import { client, loadQuery } from './client';

export type { SanityImage };

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  /** Last meaningful content update: the editor-set date, else the last save. */
  updatedAt: string;
  /** First (primary) category. */
  category?: string;
  author?: string;
  locale: Locale;
  /** _id of the English version this post is a translation of. Undefined for the English version itself. */
  translationOf?: string;
  image?: SanityImage;
}

export interface BlogPost extends BlogPostSummary {
  body: unknown[];
  seo?: { title?: string; description?: string };
  /** Every published language version of this post, itself included. */
  translations: Array<{ locale: Locale; slug: string }>;
}

const SUMMARY_FIELDS = `
  "id": _id,
  "slug": slug.current,
  title,
  excerpt,
  publishedAt,
  "updatedAt": coalesce(modifiedAt, _updatedAt),
  "category": categories[0],
  author,
  locale,
  "translationOf": translationOf._ref,
  image`;

/**
 * Strips stega markers from values used in logic (URLs, dates, ids,
 * locale). Display strings keep them so the preview can map text to fields.
 */
export function cleanSummary<T extends BlogPostSummary>(post: T): T {
  return {
    ...post,
    id: stegaClean(post.id),
    slug: stegaClean(post.slug),
    locale: stegaClean(post.locale),
    translationOf: stegaClean(post.translationOf),
    publishedAt: stegaClean(post.publishedAt),
    updatedAt: stegaClean(post.updatedAt),
  };
}

export async function listBlogPosts(locale: Locale, draftMode: boolean): Promise<BlogPostSummary[]> {
  const posts = await loadQuery<BlogPostSummary[]>(
    `*[_type == "post" && locale == $locale] | order(publishedAt desc) {${SUMMARY_FIELDS}}`,
    { locale },
    draftMode,
  );
  return posts.map(cleanSummary);
}

/** Route params of every published post — for getStaticPaths in the production build. */
export async function listBlogPostParams(): Promise<Array<{ lang: Locale; slug: string }>> {
  return client.fetch(`*[_type == "post"] { "lang": locale, "slug": slug.current }`);
}

export async function getBlogPost(
  locale: Locale,
  slug: string,
  draftMode: boolean,
): Promise<BlogPost | null> {
  const post = await loadQuery<BlogPost | null>(
    `*[_type == "post" && locale == $locale && slug.current == $slug][0] {
      ${SUMMARY_FIELDS},
      body,
      seo,
      "translations": *[_type == "post"
        && coalesce(translationOf._ref, _id) == coalesce(^.translationOf._ref, ^._id)] {
        locale,
        "slug": slug.current
      }
    }`,
    { locale, slug },
    draftMode,
  );
  if (!post) return null;
  return { ...cleanSummary(post), translations: stegaClean(post.translations) };
}
