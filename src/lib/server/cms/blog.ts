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

export const POSTS_PER_PAGE = 12;

/** Listing pages for `total` posts — always at least one (the empty "coming soon" page). */
export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
}

/** One page of the blog listing, newest first. Pages are 1-based. */
export async function listBlogPage(
  locale: Locale,
  page: number,
  draftMode: boolean,
): Promise<{ posts: BlogPostSummary[]; totalPages: number }> {
  const start = (page - 1) * POSTS_PER_PAGE;
  const result = await loadQuery<{ posts: BlogPostSummary[]; total: number }>(
    `{
      "posts": *[_type == "post" && locale == $locale] | order(publishedAt desc, _id asc) [$start...$end] {${SUMMARY_FIELDS}},
      "total": count(*[_type == "post" && locale == $locale])
    }`,
    { locale, start, end: start + POSTS_PER_PAGE },
    draftMode,
  );
  return { posts: result.posts.map(cleanSummary), totalPages: pageCount(result.total) };
}

/** Number of listing pages in each language. */
export async function blogPageCounts(draftMode: boolean): Promise<Record<Locale, number>> {
  const totals = await loadQuery<Record<Locale, number>>(
    `{
      "en": count(*[_type == "post" && locale == "en"]),
      "pl": count(*[_type == "post" && locale == "pl"]),
      "es": count(*[_type == "post" && locale == "es"]),
      "it": count(*[_type == "post" && locale == "it"])
    }`,
    {},
    draftMode,
  );
  return {
    en: pageCount(totals.en),
    pl: pageCount(totals.pl),
    es: pageCount(totals.es),
    it: pageCount(totals.it),
  };
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
